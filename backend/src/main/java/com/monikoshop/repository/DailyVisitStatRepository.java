package com.monikoshop.repository;

import com.monikoshop.entity.DailyVisitStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyVisitStatRepository extends JpaRepository<DailyVisitStat, LocalDate> {
    List<DailyVisitStat> findByStatDateGreaterThanEqualOrderByStatDateDesc(LocalDate from);
}
