package com.monikoshop.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class StorefrontDtos {
    private StorefrontDtos() { }

    public record BannerDto(Long id, String position, String title, String linkUrl, String imageUrl,
                            int sortOrder, boolean active) { }

    public record BrandDto(Long id, String name, String linkUrl, String imageUrl, int sortOrder, boolean active) { }

    public record Deal(Instant endsAt, List<ProductResponse> products) { }

    public record HomeResponse(List<BannerDto> banners, List<BrandDto> brands, Map<String, String> settings,
                               Deal dailyDeal, List<ProductResponse> featured) { }

    public record HomeProductItem(Long productId, String productName, Instant endsAt) { }

    public record HomeProductsRequest(List<Item> items) {
        public record Item(Long productId, Instant endsAt) { }
    }
}
