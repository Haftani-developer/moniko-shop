package com.monikoshop.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * One-time, idempotent migration: older versions stored ONE image directly in products.image_data.
 * Move it into product_images so existing products keep their picture. On a fresh database the old
 * column does not exist and this simply does nothing.
 */
@Component
@Order(1)
public class LegacyImageMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(LegacyImageMigration.class);

    private final JdbcTemplate jdbc;

    public LegacyImageMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        try {
            int moved = jdbc.update(
                    "INSERT INTO product_images (product_id, data, content_type, sort_order) "
                            + "SELECT p.id, p.image_data, COALESCE(p.image_content_type, 'image/jpeg'), 0 "
                            + "FROM products p WHERE p.image_data IS NOT NULL "
                            + "AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id)");
            int cleaned = jdbc.update(
                    "UPDATE products p SET image_data = NULL, image_content_type = NULL "
                            + "WHERE p.image_data IS NOT NULL "
                            + "AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id)");
            if (moved > 0 || cleaned > 0) {
                log.info("Legacy product images migrated: {} moved, {} old columns cleared", moved, cleaned);
            }
        } catch (Exception e) {
            log.debug("Legacy image migration skipped: {}", e.getMessage());
        }
    }
}
