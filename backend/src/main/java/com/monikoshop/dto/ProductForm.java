package com.monikoshop.dto;

import java.math.BigDecimal;

/** Text fields of the admin create/update product form (images arrive separately). */
public record ProductForm(
        String name,
        String subtitle,
        String description,
        BigDecimal price,
        BigDecimal discountPrice,
        String brand,
        Long categoryId,
        Integer stock,
        Boolean active,
        /** JSON array: [{"key":"...","value":"..."}] */
        String specsJson
) { }
