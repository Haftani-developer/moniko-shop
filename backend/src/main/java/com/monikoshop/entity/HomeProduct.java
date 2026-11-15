package com.monikoshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

/** محصولی که مدیر برای یکی از بخش‌های صفحه اصلی انتخاب کرده (حراج روزانه / منتخب). */
@Entity
@Table(name = "home_products", indexes = @Index(name = "idx_home_products_type", columnList = "type"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HomeProduct {

    public enum Type { DAILY_DEAL, FEATURED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type type;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Product product;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /** فقط برای DAILY_DEAL: پایان حراج. بعد از این زمان محصول از نوار حراج حذف می‌شود. */
    @Column(name = "ends_at")
    private Instant endsAt;
}
