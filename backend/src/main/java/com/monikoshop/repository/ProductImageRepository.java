package com.monikoshop.repository;

import com.monikoshop.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    /** Only ids (no image bytes) - rows are {productId, imageId}. */
    @Query("select i.product.id, i.id from ProductImage i where i.product.id in :ids order by i.sortOrder, i.id")
    List<Object[]> findIdsByProductIds(@Param("ids") Collection<Long> ids);

    @Query("select i.id from ProductImage i where i.product.id = :pid order by i.sortOrder, i.id")
    List<Long> findIdsByProductId(@Param("pid") Long productId);

    Optional<ProductImage> findByIdAndProductId(Long id, Long productId);

    Optional<ProductImage> findFirstByProductIdOrderBySortOrderAscIdAsc(Long productId);

    @Modifying(flushAutomatically = true)
    @Query("update ProductImage i set i.sortOrder = :sort where i.id = :id")
    void updateSortOrder(@Param("id") Long id, @Param("sort") int sort);

    @Modifying(flushAutomatically = true)
    @Query("delete from ProductImage i where i.product.id = :pid")
    void deleteAllByProductId(@Param("pid") Long productId);

    @Modifying(flushAutomatically = true)
    @Query("delete from ProductImage i where i.product.id = :pid and i.id not in :keep")
    void deleteByProductIdExcept(@Param("pid") Long productId, @Param("keep") Collection<Long> keep);
}
