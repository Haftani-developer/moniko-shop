package com.monikoshop.controller;

import com.monikoshop.dto.StorefrontDtos.HomeResponse;
import com.monikoshop.service.StorefrontService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

/** API عمومی صفحه اصلی: بنرها، برندها، تنظیمات، حراج روزانه و منتخب‌ها. */
@RestController
@RequiredArgsConstructor
public class StorefrontController {

    private final StorefrontService service;

    @GetMapping("/api/home")
    public ResponseEntity<HomeResponse> home() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePublic())
                .body(service.home());
    }

    @GetMapping("/api/banners/{id}/image")
    public ResponseEntity<byte[]> bannerImage(@PathVariable Long id) {
        var b = service.getBanner(id);
        return image(b.getContentType(), b.getData());
    }

    @GetMapping("/api/brands/{id}/logo")
    public ResponseEntity<byte[]> brandLogo(@PathVariable Long id) {
        var b = service.getBrand(id);
        return image(b.getContentType(), b.getData());
    }

    private static ResponseEntity<byte[]> image(String contentType, byte[] data) {
        MediaType type = MediaType.APPLICATION_OCTET_STREAM;
        try {
            type = MediaType.parseMediaType(contentType);
        } catch (Exception ignored) { }
        return ResponseEntity.ok()
                .contentType(type)
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic().immutable())
                .body(data);
    }
}
