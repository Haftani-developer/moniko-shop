package com.monikoshop.search;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * یکسان‌سازی متن فارسی/عربی برای جستجو. باید با {@code normalizeFa} در فرانت‌اند
 * (frontend/src/utils/format.ts) هم‌رفتار باشد.
 *
 * <p>ی/ک عربی، همزه و الف‌ها، «ة»، کشیده، اعراب، نیم‌فاصله، ارقام فارسی/عربی و
 * علائم نگارشی یکسان می‌شوند تا مثلاً «۵۰ میلی‌لیتر» و «50 میلی لیتر» یکی شمرده شوند.
 */
public final class SearchTextNormalizer {

    /** سقف کاراکترهای توضیحات که وارد ایندکس می‌شود. */
    private static final int MAX_DESCRIPTION_CHARS = 3000;
    private static final Pattern NON_WORD = Pattern.compile("[^\\p{L}\\p{N}\\s]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private SearchTextNormalizer() { }

    public static String normalize(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder(input.length());
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (c == '\u064A' || c == '\u0649' || c == '\u0626') {            // ي ى ئ -> ی
                sb.append('\u06CC');
            } else if (c == '\u0643') {                                        // ك -> ک
                sb.append('\u06A9');
            } else if (c == '\u0623' || c == '\u0625' || c == '\u0622' || c == '\u0671') { // أ إ آ ٱ -> ا
                sb.append('\u0627');
            } else if (c == '\u0624') {                                        // ؤ -> و
                sb.append('\u0648');
            } else if (c == '\u0629' || c == '\u06C0') {                       // ة ۀ -> ه
                sb.append('\u0647');
            } else if (c >= '\u06F0' && c <= '\u06F9') {                       // ۰-۹ -> 0-9
                sb.append((char) ('0' + (c - '\u06F0')));
            } else if (c >= '\u0660' && c <= '\u0669') {                       // ٠-٩ -> 0-9
                sb.append((char) ('0' + (c - '\u0660')));
            } else if ((c >= '\u064B' && c <= '\u065F') || c == '\u0670' || c == '\u0640') {
                // اعراب و کشیده حذف می‌شوند
            } else if (c == '\u200C' || c == '\u200F' || c == '\u200E') {     // نیم‌فاصله و علائم جهت -> فاصله
                sb.append(' ');
            } else {
                sb.append(c);
            }
        }
        String s = NON_WORD.matcher(sb).replaceAll(" ");
        s = WHITESPACE.matcher(s).replaceAll(" ").trim();
        return s.toLowerCase(Locale.ROOT);
    }

    /** همان متن نرمال‌شده بدون هیچ فاصله‌ای («میلی‌لیتر» با «میلیلیتر» تطبیق کند). */
    public static String compact(String input) {
        return normalize(input).replace(" ", "");
    }

    /** عبارت جستجو را به کلمات نرمال‌شده تقسیم می‌کند (حداکثر {@code maxTerms} کلمه). */
    public static List<String> terms(String query, int maxTerms) {
        List<String> result = new ArrayList<>();
        String n = normalize(query);
        if (n.isEmpty()) {
            return result;
        }
        for (String t : n.split(" ")) {
            if (!t.isEmpty() && result.size() < maxTerms) {
                result.add(t.length() > 40 ? t.substring(0, 40) : t);
            }
        }
        return result;
    }

    /**
     * متن ایندکس یک محصول: اول نام (برای رتبه‌بندی)، سپس برند/زیرعنوان/دسته/توضیحات/مشخصات،
     * و در انتها همان متن بدون فاصله.
     */
    public static String buildIndexText(String name, String subtitle, String brand,
                                        String categoryName, String parentCategoryName,
                                        String description, List<String> specTexts) {
        StringBuilder raw = new StringBuilder();
        append(raw, name);
        append(raw, subtitle);
        append(raw, brand);
        append(raw, categoryName);
        append(raw, parentCategoryName);
        if (description != null) {
            append(raw, description.length() > MAX_DESCRIPTION_CHARS
                    ? description.substring(0, MAX_DESCRIPTION_CHARS) : description);
        }
        if (specTexts != null) {
            for (String s : specTexts) {
                append(raw, s);
            }
        }
        String spaced = normalize(raw.toString());
        return spaced + " " + spaced.replace(" ", "");
    }

    private static void append(StringBuilder sb, String s) {
        if (s != null && !s.isBlank()) {
            sb.append(s).append(' ');
        }
    }
}
