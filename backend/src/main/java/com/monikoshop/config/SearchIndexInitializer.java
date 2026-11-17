package com.monikoshop.config;

import com.monikoshop.repository.ProductSearchRepository;
import com.monikoshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * محصولاتی که قبل از مهاجرت V2 ساخته شده‌اند هنوز search_text ندارند؛
 * یک بار در شروع برنامه ایندکس آن‌ها ساخته می‌شود. اگر خطا بدهد برنامه بالا می‌آید و فقط لاگ می‌شود.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SearchIndexInitializer implements ApplicationRunner {

    private final ProductSearchRepository searchRepository;
    private final ProductService productService;

    @Override
    public void run(ApplicationArguments args) {
        try {
            long missing = searchRepository.countMissingSearchText();
            if (missing > 0) {
                int n = productService.reindexAllSearchText();
                log.info("Search index rebuilt for {} products ({} were missing)", n, missing);
            }
        } catch (Exception e) {
            log.warn("Could not rebuild the product search index at startup: {}", e.toString());
        }
    }
}
