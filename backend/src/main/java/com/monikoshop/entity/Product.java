package com.monikoshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    /** Optional secondary title (e.g. English name), shown under the title like on Digikala. */
    @Column(length = 255)
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    private BigDecimal discountPrice;

    /**
     * Legacy external image URL of old products. New products use {@link ProductImage}
     * (1..5 uploaded images); this field is only a display fallback and is cleared on upload.
     */
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String brand;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    /** "مشخصات" table rows, in display order. */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_specs", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "sort_order")
    @BatchSize(size = 50)
    @Builder.Default
    private List<ProductSpec> specs = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
