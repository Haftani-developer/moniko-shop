package com.monikoshop.dto;

import java.time.LocalDate;
import java.util.List;

public record VisitStatsResponse(
        Online online,
        Day today,
        List<Day> history
) {
    /** افرادی که همین الان (در ۶۰ ثانیه‌ی اخیر) سایت را باز دارند. */
    public record Online(long total, long users, long guests) {}

    public record Day(LocalDate date, long total, long users, long guests) {}
}
