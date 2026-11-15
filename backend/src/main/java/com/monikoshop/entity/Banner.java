package com.monikoshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** بنر صفحه اصلی (اسلایدر اصلی و بنرهای میانی). تصویر داخل دیتابیس ذخیره می‌شود. */
@Entity
@Table(name = "banners")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Banner {

    public enum Position { HERO, MID1, MID2 }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Position position;

    @Column(length = 200)
    private String title;

    /** مسیر داخلی (/categories/x) یا آدرس کامل https */
    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "data", nullable = false, columnDefinition = "BYTEA")
    private byte[] data;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
