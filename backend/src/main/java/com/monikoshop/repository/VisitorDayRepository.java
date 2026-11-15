package com.monikoshop.repository;

import com.monikoshop.entity.VisitorDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitorDayRepository extends JpaRepository<VisitorDay, Long> {

    Optional<VisitorDay> findByVisitDateAndVisitorId(LocalDate visitDate, String visitorId);

    long countByVisitDate(LocalDate visitDate);

    long countByVisitDateAndUserIdIsNotNull(LocalDate visitDate);

    /** روزهایی (قبل از today) که داده دارند. */
    @Query("select distinct v.visitDate from VisitorDay v where v.visitDate < :today")
    List<LocalDate> findDistinctDatesBefore(@Param("today") LocalDate today);

    @Modifying
    @Transactional
    @Query("delete from VisitorDay v where v.visitDate < :cutoff")
    int deleteOlderThan(@Param("cutoff") LocalDate cutoff);
}
