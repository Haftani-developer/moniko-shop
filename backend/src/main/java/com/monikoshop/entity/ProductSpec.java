package com.monikoshop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One row of the product "مشخصات" table (title + value). */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSpec {

    @Column(name = "spec_key", nullable = false, length = 100)
    private String key;

    @Column(name = "spec_value", nullable = false, length = 500)
    private String value;
}
