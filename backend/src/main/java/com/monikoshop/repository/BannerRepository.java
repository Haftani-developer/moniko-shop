package com.monikoshop.repository;

import com.monikoshop.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByActiveTrueOrderByPositionAscSortOrderAscIdAsc();
    List<Banner> findAllByOrderByPositionAscSortOrderAscIdAsc();
}
