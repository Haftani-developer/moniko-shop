package com.monikoshop.entity;

import jakarta.persistence.*;
import lombok.*;

/** تنظیمات ساده‌ی سایت (کلید/مقدار): تلفن، شبکه‌های اجتماعی، متن فوتر و ... */
@Entity
@Table(name = "site_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SiteSetting {

    @Id
    @Column(name = "setting_key", length = 60)
    private String key;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;
}
