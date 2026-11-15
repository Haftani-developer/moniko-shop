package com.monikoshop.tracking;

import com.monikoshop.dto.VisitStatsResponse;
import com.monikoshop.entity.DailyVisitStat;
import com.monikoshop.entity.VisitorDay;
import com.monikoshop.repository.DailyVisitStatRepository;
import com.monikoshop.repository.VisitorDayRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * شمارش بازدیدکنندگان:
 *  - «همین الان آنلاین»: در حافظه نگه داشته می‌شود (هر مرورگر هر ~۲۰ ثانیه heartbeat می‌فرستد)
 *  - «امروز»: هر بازدیدکننده‌ی یکتا یک ردیف در visitor_day (فقط بار اول هر روز نوشته می‌شود)
 *  - «آخر روز»: عدد نهایی هر روز در daily_visit_stats ذخیره می‌شود
 * مرز روز بر اساس منطقه‌ی زمانی TRACKING_ZONE است (پیش‌فرض Asia/Tehran).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VisitTrackingService {

    /** اگر در این بازه heartbeat نیامده باشد، کاربر آنلاین حساب نمی‌شود. */
    private static final long ONLINE_WINDOW_MS = 60_000L;
    private static final int MAX_ONLINE_KEYS = 100_000;
    private static final int HISTORY_DAYS = 30;
    /** ردیف‌های ریز visitor_day بعد از این مدت پاک می‌شوند (عدد نهایی روزها می‌ماند). */
    private static final int RAW_RETENTION_DAYS = 45;

    private final VisitorDayRepository visitorDayRepository;
    private final DailyVisitStatRepository statRepository;

    @Value("${tracking.zone:Asia/Tehran}")
    private String zoneId;

    private record Presence(long lastSeen, Long userId) {}

    private final Map<String, Presence> online = new ConcurrentHashMap<>();

    // کش امروز: visitorId -> userId (0 = مهمان). فقط برای جلوگیری از نوشتن/خواندن تکراری DB.
    private final Map<String, Long> recordedToday = new ConcurrentHashMap<>();
    private volatile LocalDate recordedDate;

    private ZoneId zone() {
        return ZoneId.of(zoneId);
    }

    private LocalDate today() {
        return LocalDate.now(zone());
    }

    /** با هر heartbeat صدا زده می‌شود. userId برای مهمان null است. */
    public void heartbeat(String visitorId, Long userId) {
        long now = System.currentTimeMillis();

        if (online.size() > MAX_ONLINE_KEYS) {
            online.entrySet().removeIf(e -> now - e.getValue().lastSeen() > ONLINE_WINDOW_MS);
        }
        online.put(visitorId, new Presence(now, userId));

        LocalDate day = today();
        if (!day.equals(recordedDate)) {
            synchronized (this) {
                if (!day.equals(recordedDate)) {
                    recordedToday.clear();
                    recordedDate = day;
                }
            }
        }

        long marker = userId == null ? 0L : userId;
        Long prev = recordedToday.get(visitorId);
        if (prev != null && (prev != 0L || marker == 0L)) {
            return; // قبلاً ثبت شده و چیز جدیدی نیست
        }
        persist(day, visitorId, userId);
        recordedToday.put(visitorId, marker);
    }

    private void persist(LocalDate day, String visitorId, Long userId) {
        try {
            VisitorDay row = visitorDayRepository.findByVisitDateAndVisitorId(day, visitorId).orElse(null);
            if (row == null) {
                visitorDayRepository.save(VisitorDay.builder()
                        .visitDate(day)
                        .visitorId(visitorId)
                        .userId(userId)
                        .firstSeen(Instant.now())
                        .build());
            } else if (row.getUserId() == null && userId != null) {
                row.setUserId(userId); // مهمانِ امروز، بعداً لاگین کرد → کاربر حساب می‌شود
                visitorDayRepository.save(row);
            }
        } catch (DataIntegrityViolationException ignored) {
            // دو درخواست هم‌زمان برای یک بازدیدکننده؛ مشکلی نیست
        } catch (Exception e) {
            log.warn("visit tracking write failed: {}", e.getMessage());
        }
    }

    public VisitStatsResponse stats() {
        long now = System.currentTimeMillis();
        long total = 0, users = 0;
        for (Presence p : online.values()) {
            if (now - p.lastSeen() <= ONLINE_WINDOW_MS) {
                total++;
                if (p.userId() != null) users++;
            }
        }
        var onlineNow = new VisitStatsResponse.Online(total, users, total - users);

        LocalDate today = today();
        long dayTotal = visitorDayRepository.countByVisitDate(today);
        long dayUsers = visitorDayRepository.countByVisitDateAndUserIdIsNotNull(today);
        var todayStats = new VisitStatsResponse.Day(today, dayTotal, dayUsers, dayTotal - dayUsers);

        List<VisitStatsResponse.Day> history = statRepository
                .findByStatDateGreaterThanEqualOrderByStatDateDesc(today.minusDays(HISTORY_DAYS))
                .stream()
                .map(s -> new VisitStatsResponse.Day(s.getStatDate(), s.getTotalVisitors(),
                        s.getUserVisitors(), s.getGuestVisitors()))
                .toList();

        return new VisitStatsResponse(onlineNow, todayStats, history);
    }

    // ---------- ذخیره‌ی عدد نهایی هر روز ----------

    /** هر شب ۰۰:۰۵ آمار دیروز (و هر روز ذخیره‌نشده‌ی قبلی) را در daily_visit_stats می‌نویسد. */
    @Scheduled(cron = "0 5 0 * * *", zone = "${tracking.zone:Asia/Tehran}")
    public void finalizePastDays() {
        LocalDate today = today();
        for (LocalDate day : visitorDayRepository.findDistinctDatesBefore(today)) {
            saveDayStat(day);
        }
        int deleted = visitorDayRepository.deleteOlderThan(today.minusDays(RAW_RETENTION_DAYS));
        if (deleted > 0) log.info("visit tracking: pruned {} old raw rows", deleted);
    }

    /** اگر سرور نیمه‌شب خاموش بوده، موقع بالا آمدن روزهای جاافتاده جبران می‌شوند. */
    @EventListener(ApplicationReadyEvent.class)
    public void catchUpOnStartup() {
        try {
            finalizePastDays();
        } catch (Exception e) {
            log.warn("visit stats catch-up failed: {}", e.getMessage());
        }
    }

    private void saveDayStat(LocalDate day) {
        long total = visitorDayRepository.countByVisitDate(day);
        long users = visitorDayRepository.countByVisitDateAndUserIdIsNotNull(day);
        DailyVisitStat stat = statRepository.findById(day).orElseGet(DailyVisitStat::new);
        stat.setStatDate(day);
        stat.setTotalVisitors(total);
        stat.setUserVisitors(users);
        stat.setGuestVisitors(total - users);
        stat.setSavedAt(Instant.now());
        statRepository.save(stat);
        log.info("visit stats saved for {}: total={}, users={}, guests={}", day, total, users, total - users);
    }
}
