package com.monikoshop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Product as sent to the browser (never contains image bytes). */
public record ProductResponse(
        Long id,
        String name,
        String subtitle,
        String description,
        BigDecimal price,
        BigDecimal discountPrice,
        String brand,
        CategoryRef category,
        Integer stock,
        boolean active,
        LocalDateTime createdAt,
        /** URL of the main image (first of {@code images}); legacy external URL as fallback. */
        String imageUrl,
        List<Image> images,
        List<ProductSpecDto> specs
) {
    public record Image(Long id, String url) { }

    public record CategoryRef(Long id, String name, String slug, Long parentId) { }
}
