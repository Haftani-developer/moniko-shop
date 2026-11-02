package com.monikoshop.controller;

import com.monikoshop.dto.CategoryTreeResponse;
import com.monikoshop.dto.ProductResponse;
import com.monikoshop.entity.Category;
import com.monikoshop.repository.CategoryRepository;
import com.monikoshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.listActive());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return productService.findActive(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** لیست تخت همه دسته‌ها (سازگاری با قبل) */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryTreeResponse>> getAllCategories() {
        List<CategoryTreeResponse> list = categoryRepository.findAll().stream()
                .map(CategoryTreeResponse::flat)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /** درخت کامل دسته‌ها برای مگامنو (ریشه‌ها + children) */
    @GetMapping("/categories/tree")
    public ResponseEntity<List<CategoryTreeResponse>> getCategoryTree() {
        List<Category> roots = categoryRepository.findRootCategoriesWithChildren();
        List<CategoryTreeResponse> tree = roots.stream()
                .map(CategoryTreeResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tree);
    }

    @GetMapping("/categories/{slug}/products")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable String slug) {
        return categoryRepository.findBySlug(slug)
                .map(cat -> ResponseEntity.ok(productService.listActiveByCategory(cat.getId())))
                .orElse(ResponseEntity.notFound().build());
    }
}
