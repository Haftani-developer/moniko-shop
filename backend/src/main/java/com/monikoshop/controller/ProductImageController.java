package com.monikoshop.controller;

import com.monikoshop.entity.ProductImage;
import com.monikoshop.repository.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageRepository imageRepository;

    /** A specific image. The id never points to different bytes, so it can be cached for a long time. */
    @GetMapping("/{id}/images/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id, @PathVariable Long imageId) {
        return imageRepository.findByIdAndProductId(imageId, id)
                .map(image -> respond(image, CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic().immutable()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Main image of the product (kept for old links such as /api/products/{id}/image). */
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getMainImage(@PathVariable Long id) {
        return imageRepository.findFirstByProductIdOrderBySortOrderAscIdAsc(id)
                .map(image -> respond(image, CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static ResponseEntity<byte[]> respond(ProductImage image, CacheControl cache) {
        MediaType type = MediaType.APPLICATION_OCTET_STREAM;
        try {
            type = MediaType.parseMediaType(image.getContentType());
        } catch (Exception ignored) { }
        return ResponseEntity.ok()
                .contentType(type)
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(cache)
                .body(image.getData());
    }
}
