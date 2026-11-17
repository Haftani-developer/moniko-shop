package com.monikoshop.search;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SearchTextNormalizerTest {

    private static boolean matches(String indexText, String query) {
        List<String> terms = SearchTextNormalizer.terms(query, 8);
        return !terms.isEmpty() && terms.stream().allMatch(indexText::contains);
    }

    private final String index = SearchTextNormalizer.buildIndexText(
            "کرم مرطوب‌کننده نیوآ", "Nivea Cream", "NIVEA", "مراقبت پوست", "آرایشی",
            "کرم ۵۰ میلی‌لیتری مناسب پوست خشک", List.of("حجم ۵۰ میلی‌لیتر"));

    @Test
    void persianAndLatinDigitsAreEqual() {
        assertEquals("50", SearchTextNormalizer.normalize("۵۰"));
        assertEquals("50", SearchTextNormalizer.normalize("٥٠"));
        assertTrue(matches(index, "50 میلی"));
        assertTrue(matches(index, "۵۰"));
    }

    @Test
    void halfSpaceAndMissingSpaceBothMatch() {
        assertTrue(matches(index, "مرطوب‌کننده"));
        assertTrue(matches(index, "مرطوبکننده"));
        assertTrue(matches(index, "میلیلیتر"));
    }

    @Test
    void arabicLettersAndAlefVariantsAreUnified() {
        assertTrue(matches(index, "نیوا"));
        assertTrue(matches(index, "كرم"));
        assertEquals("ایران", SearchTextNormalizer.normalize("ايران"));
    }

    @Test
    void searchIsCaseInsensitiveAndFindsCategoryNames() {
        assertTrue(matches(index, "NIVEA"));
        assertTrue(matches(index, "آرایشی"));
        assertTrue(matches(index, "مراقبت پوست"));
    }

    @Test
    void allTermsMustMatch() {
        assertFalse(matches(index, "کرم شامپو"));
    }

    @Test
    void punctuationAndSqlWildcardsAreRemovedFromTerms() {
        assertEquals(List.of("a", "b", "c", "x"), SearchTextNormalizer.terms("  a%b_c  \\ x ", 8));
        assertTrue(SearchTextNormalizer.terms("%%%", 8).isEmpty());
    }

    @Test
    void termsAreCapped() {
        assertEquals(3, SearchTextNormalizer.terms("a b c d e f", 3).size());
        assertEquals(40, SearchTextNormalizer.terms("x".repeat(100), 8).get(0).length());
    }

    @Test
    void nullAndEmptyAreSafe() {
        assertEquals("", SearchTextNormalizer.normalize(null));
        assertEquals("", SearchTextNormalizer.compact(null));
        assertTrue(SearchTextNormalizer.terms(null, 8).isEmpty());
    }
}
