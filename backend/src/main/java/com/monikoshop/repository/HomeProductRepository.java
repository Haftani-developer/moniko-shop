package com.monikoshop.repository;

import com.monikoshop.entity.HomeProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface HomeProductRepository extends JpaRepository<HomeProduct, Long> {

    @Query("select h from HomeProduct h join fetch h.product where h.type = :type order by h.sortOrder asc, h.id asc")
    List<HomeProduct> findByTypeWithProduct(@Param("type") HomeProduct.Type type);

    @Modifying
    @Transactional
    @Query("delete from HomeProduct h where h.type = :type")
    void deleteByType(@Param("type") HomeProduct.Type type);
}
