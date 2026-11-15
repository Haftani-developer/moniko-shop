package com.monikoshop.controller;

import com.monikoshop.dto.StorefrontDtos.*;
import com.monikoshop.entity.HomeProduct;
import com.monikoshop.exception.ApiException;
import com.monikoshop.service.StorefrontService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/** مدیریت محتوای صفحه اصلی (فقط ادمین؛ مسیر /api/admin/** در SecurityConfig محافظت شده). */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminStorefrontController {

    private final StorefrontService service;

    // ---- Banners ----

    @GetMapping("/banners")
    public List<BannerDto> banners() {
        return service.listBanners();
    }

    @PostMapping(value = "/banners", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BannerDto createBanner(@RequestParam String position,
                                  @RequestParam(required = false) String title,
                                  @RequestParam(required = false) String linkUrl,
                                  @RequestParam(required = false) Integer sortOrder,
                                  @RequestParam(required = false) Boolean active,
                                  @RequestParam(required = false) MultipartFile image) {
        return service.saveBanner(null, position, title, linkUrl, sortOrder, active, image);
    }

    @PutMapping(value = "/banners/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BannerDto updateBanner(@PathVariable Long id, @RequestParam String position,
                                  @RequestParam(required = false) String title,
                                  @RequestParam(required = false) String linkUrl,
                                  @RequestParam(required = false) Integer sortOrder,
                                  @RequestParam(required = false) Boolean active,
                                  @RequestParam(required = false) MultipartFile image) {
        return service.saveBanner(id, position, title, linkUrl, sortOrder, active, image);
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        service.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Brands ----

    @GetMapping("/brands")
    public List<BrandDto> brands() {
        return service.listBrands();
    }

    @PostMapping(value = "/brands", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BrandDto createBrand(@RequestParam String name,
                                @RequestParam(required = false) String linkUrl,
                                @RequestParam(required = false) Integer sortOrder,
                                @RequestParam(required = false) Boolean active,
                                @RequestParam(required = false) MultipartFile image) {
        return service.saveBrand(null, name, linkUrl, sortOrder, active, image);
    }

    @PutMapping(value = "/brands/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BrandDto updateBrand(@PathVariable Long id, @RequestParam String name,
                                @RequestParam(required = false) String linkUrl,
                                @RequestParam(required = false) Integer sortOrder,
                                @RequestParam(required = false) Boolean active,
                                @RequestParam(required = false) MultipartFile image) {
        return service.saveBrand(id, name, linkUrl, sortOrder, active, image);
    }

    @DeleteMapping("/brands/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        service.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Settings ----

    @GetMapping("/settings")
    public Map<String, String> settings() {
        return service.settings();
    }

    @PutMapping("/settings")
    public Map<String, String> saveSettings(@RequestBody Map<String, String> body) {
        return service.saveSettings(body);
    }

    // ---- Home products (حراج روزانه / منتخب) ----

    @GetMapping("/home-products/{type}")
    public List<HomeProductItem> homeProducts(@PathVariable String type) {
        return service.homeProducts(parse(type));
    }

    @PutMapping("/home-products/{type}")
    public List<HomeProductItem> saveHomeProducts(@PathVariable String type, @RequestBody HomeProductsRequest body) {
        return service.saveHomeProducts(parse(type), body);
    }

    private static HomeProduct.Type parse(String type) {
        try {
            return HomeProduct.Type.valueOf(type.toUpperCase().replace('-', '_'));
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "نوع نامعتبر است");
        }
    }
}
