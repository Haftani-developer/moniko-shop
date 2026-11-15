package com.monikoshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

/** عدد نهایی آمار هر روز؛ آخر روز (بعد از نیمه‌شب) یک بار ذخیره می‌شود. */
@Entity
@Table(name = "daily_visit_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyVisitStat {

    @Id
    @Column(name = "stat_date")
    private LocalDate statDate;

    @Column(name = "total_visitors", nullable = false)
    private long totalVisitors;

    @Column(name = "user_visitors", nullable = false)
    private long userVisitors;

    @Column(name = "guest_visitors", nullable = false)
    private long guestVisitors;

    @Column(name = "saved_at", nullable = false)
    private Instant savedAt;
}
