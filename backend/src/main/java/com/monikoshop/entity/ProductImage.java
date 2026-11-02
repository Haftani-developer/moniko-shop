package com.monikoshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/** One picture of a product (a product has 1..5 of them). Bytes are stored in PostgreSQL BYTEA. */
@Entity
@Table(name = "product_images", indexes = @Index(name = "idx_product_images_product", columnList = "product_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Product product;

    @Column(name = "data", nullable = false, columnDefinition = "BYTEA")
    private byte[] data;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    /** 0 = main image. */
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
