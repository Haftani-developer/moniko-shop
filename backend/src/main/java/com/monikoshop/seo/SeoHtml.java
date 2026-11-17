package com.monikoshop.seo;

import java.util.List;

/**
 * سازنده‌ی HTML ساده برای خزنده‌ها و پیش‌نمایش لینک (گوگل، تلگرام، واتس‌اپ ...).
 * کاربران عادی همچنان اپ React را می‌بینند؛ فقط درخواست‌های خزنده به این صفحات هدایت می‌شود.
 * همه‌ی متن‌ها escape می‌شوند.
 */
public final class SeoHtml {

    private SeoHtml() { }

    public record Link(String href, String text) { }

    public static String esc(String s) {
        if (s == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder(s.length() + 16);
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '&' -> sb.append("&amp;");
                case '<' -> sb.append("&lt;");
                case '>' -> sb.append("&gt;");
                case '"' -> sb.append("&quot;");
                case '\'' -> sb.append("&#39;");
                default -> sb.append(c);
            }
        }
        return sb.toString();
    }

    /** JSON داخل &lt;script&gt; نباید بتواند تگ را ببندد. */
    public static String safeJsonForScript(String json) {
        return json == null ? "" : json.replace("</", "<\\/").replace("<!--", "<\\!--");
    }

    public static String linkList(List<Link> links) {
        if (links == null || links.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder("<ul>");
        for (Link l : links) {
            sb.append("<li><a href=\"").append(esc(l.href())).append("\">").append(esc(l.text())).append("</a></li>");
        }
        return sb.append("</ul>").toString();
    }

    /**
     * @param bodyHtml HTML آماده (قبلاً escape شده)
     * @param jsonLd   رشته‌ی JSON-LD یا null
     */
    public static String page(String siteName, String title, String description, String canonicalUrl,
                              String imageUrl, String ogType, String jsonLd, String heading, String bodyHtml) {
        StringBuilder sb = new StringBuilder(2048);
        sb.append("<!doctype html>\n<html lang=\"fa\" dir=\"rtl\">\n<head>\n<meta charset=\"utf-8\">\n");
        sb.append("<title>").append(esc(title)).append("</title>\n");
        sb.append("<meta name=\"description\" content=\"").append(esc(description)).append("\">\n");
        sb.append("<link rel=\"canonical\" href=\"").append(esc(canonicalUrl)).append("\">\n");
        sb.append("<meta property=\"og:site_name\" content=\"").append(esc(siteName)).append("\">\n");
        sb.append("<meta property=\"og:locale\" content=\"fa_IR\">\n");
        sb.append("<meta property=\"og:type\" content=\"").append(esc(ogType)).append("\">\n");
        sb.append("<meta property=\"og:title\" content=\"").append(esc(title)).append("\">\n");
        sb.append("<meta property=\"og:description\" content=\"").append(esc(description)).append("\">\n");
        sb.append("<meta property=\"og:url\" content=\"").append(esc(canonicalUrl)).append("\">\n");
        if (imageUrl != null && !imageUrl.isBlank()) {
            sb.append("<meta property=\"og:image\" content=\"").append(esc(imageUrl)).append("\">\n");
            sb.append("<meta name=\"twitter:card\" content=\"summary_large_image\">\n");
        }
        if (jsonLd != null && !jsonLd.isBlank()) {
            sb.append("<script type=\"application/ld+json\">").append(safeJsonForScript(jsonLd)).append("</script>\n");
        }
        sb.append("</head>\n<body>\n<h1>").append(esc(heading)).append("</h1>\n");
        sb.append(bodyHtml == null ? "" : bodyHtml);
        sb.append("\n</body>\n</html>\n");
        return sb.toString();
    }

    /** sitemap.xml از لیست آدرس‌ها. */
    public static String sitemap(List<String> urls) {
        StringBuilder sb = new StringBuilder(urls.size() * 80 + 128);
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (String u : urls) {
            sb.append("  <url><loc>").append(esc(u)).append("</loc></url>\n");
        }
        return sb.append("</urlset>\n").toString();
    }
}
