package com.monikoshop.repository;

import com.monikoshop.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByActiveTrueOrderBySortOrderAscIdAsc();
    List<Brand> findAllByOrderBySortOrderAscIdAsc();
}
