package io.github.theodoremeyer.simplevoicegeyser.core.api.chat;

import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Converts Minecraft legacy (§ / &amp;) and a useful MiniMessage subset into safe HTML for the web chat panel.
 * <p>
 * Supported MiniMessage-ish tags: named colors, {@code <#RRGGBB>}, {@code <color:#RRGGBB>},
 * {@code <bold>}/{@code <b>}, {@code <italic>}/{@code <i>}, {@code <underlined>}/{@code <u>},
 * {@code <strikethrough>}/{@code <st>}, {@code <reset>}/{@code <r>}, closing tags, and the first
 * stop of {@code <gradient:...>}. Unknown tags are shown as escaped text.
 */
public final class MinecraftChatHtml {

    private static final Pattern HEX_LEGACY = Pattern.compile("§x(§[0-9a-fA-F]){6}");
    private static final Pattern MINI_TAG = Pattern.compile(
            "<(/?)([#a-zA-Z0-9_-]+)(?::([^>]*))?>"
    );

    private static final Map<Character, String> LEGACY_COLORS = Map.ofEntries(
            Map.entry('0', "#000000"),
            Map.entry('1', "#0000AA"),
            Map.entry('2', "#00AA00"),
            Map.entry('3', "#00AAAA"),
            Map.entry('4', "#AA0000"),
            Map.entry('5', "#AA00AA"),
            Map.entry('6', "#FFAA00"),
            Map.entry('7', "#AAAAAA"),
            Map.entry('8', "#555555"),
            Map.entry('9', "#5555FF"),
            Map.entry('a', "#55FF55"),
            Map.entry('b', "#55FFFF"),
            Map.entry('c', "#FF5555"),
            Map.entry('d', "#FF55FF"),
            Map.entry('e', "#FFFF55"),
            Map.entry('f', "#FFFFFF")
    );

    private static final Map<String, String> NAMED_COLORS = Map.ofEntries(
            Map.entry("black", "#000000"),
            Map.entry("dark_blue", "#0000AA"),
            Map.entry("dark_green", "#00AA00"),
            Map.entry("dark_aqua", "#00AAAA"),
            Map.entry("dark_red", "#AA0000"),
            Map.entry("dark_purple", "#AA00AA"),
            Map.entry("gold", "#FFAA00"),
            Map.entry("gray", "#AAAAAA"),
            Map.entry("grey", "#AAAAAA"),
            Map.entry("dark_gray", "#555555"),
            Map.entry("dark_grey", "#555555"),
            Map.entry("blue", "#5555FF"),
            Map.entry("green", "#55FF55"),
            Map.entry("aqua", "#55FFFF"),
            Map.entry("red", "#FF5555"),
            Map.entry("light_purple", "#FF55FF"),
            Map.entry("yellow", "#FFFF55"),
            Map.entry("white", "#FFFFFF")
    );

    private MinecraftChatHtml() {}

    /**
     * @param plain text with formatting codes stripped
     * @param html  escaped HTML with inline styles for colors / decorations
     */
    public record FormattedChat(String plain, String html) {}

    /**
     * Convert Minecraft-formatted text to plain + safe HTML.
     */
    public static FormattedChat format(String input) {
        if (input == null || input.isEmpty()) {
            return new FormattedChat("", "");
        }

        String text = SvgColor.translateAltColorCodes('&', input);
        text = expandHexLegacy(text);
        text = miniMessageToMarkers(text);

        StringBuilder plain = new StringBuilder(text.length());
        StringBuilder html = new StringBuilder(text.length() + 32);

        String color = null;
        boolean bold = false;
        boolean italic = false;
        boolean underline = false;
        boolean strike = false;
        boolean spanOpen = false;

        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);

            // Custom hex color marker: \u0001RRGGBB\u0002
            if (ch == '\u0001' && i + 8 < text.length() && text.charAt(i + 7) == '\u0002') {
                String hex = text.substring(i + 1, i + 7);
                if (hex.chars().allMatch(c -> "0123456789abcdefABCDEF".indexOf(c) >= 0)) {
                    if (spanOpen) {
                        html.append("</span>");
                        spanOpen = false;
                    }
                    color = "#" + hex.toUpperCase(Locale.ROOT);
                    bold = italic = underline = strike = false;
                    i += 7;
                    continue;
                }
            }

            if (ch == '§' && i + 1 < text.length()) {
                char code = Character.toLowerCase(text.charAt(++i));
                if (LEGACY_COLORS.containsKey(code)) {
                    if (spanOpen) {
                        html.append("</span>");
                        spanOpen = false;
                    }
                    color = LEGACY_COLORS.get(code);
                    bold = italic = underline = strike = false;
                    continue;
                }
                switch (code) {
                    case 'l' -> bold = true;
                    case 'o' -> italic = true;
                    case 'n' -> underline = true;
                    case 'm' -> strike = true;
                    case 'r' -> {
                        if (spanOpen) {
                            html.append("</span>");
                            spanOpen = false;
                        }
                        color = null;
                        bold = italic = underline = strike = false;
                    }
                    default -> { /* obfuscated / unknown */ }
                }
                continue;
            }

            if (ch == '\r' || ch == '\n' || ch == '\t') {
                ch = ' ';
            }
            if (ch < 0x20 || ch == 0x7F) {
                continue;
            }

            plain.append(ch);

            boolean styled = color != null || bold || italic || underline || strike;
            if (styled && !spanOpen) {
                html.append("<span style=\"");
                if (color != null) {
                    html.append("color:").append(color).append(';');
                }
                if (bold) {
                    html.append("font-weight:700;");
                }
                if (italic) {
                    html.append("font-style:italic;");
                }
                if (underline || strike) {
                    html.append("text-decoration:");
                    if (underline) {
                        html.append("underline");
                    }
                    if (underline && strike) {
                        html.append(' ');
                    }
                    if (strike) {
                        html.append("line-through");
                    }
                    html.append(';');
                }
                html.append("\">");
                spanOpen = true;
            }

            html.append(escapeHtmlChar(ch));
        }

        if (spanOpen) {
            html.append("</span>");
        }

        return new FormattedChat(plain.toString(), html.toString());
    }

    /**
     * Build a {@code <Name> message} line with optional colored / ranked display name.
     */
    public static FormattedChat formatChatLine(String displayNameFormatted, String messageBody) {
        FormattedChat name = format(displayNameFormatted == null ? "Player" : displayNameFormatted);
        FormattedChat body = format(messageBody == null ? "" : messageBody);
        String plainName = name.plain().isBlank() ? "Player" : name.plain().trim();
        String plain = "<" + plainName + "> " + body.plain();
        String htmlName = name.html().isBlank() ? escapeHtml(plainName) : name.html();
        String html = "&lt;" + htmlName + "&gt; " + body.html();
        return new FormattedChat(plain, html);
    }

    public static String escapeHtml(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        StringBuilder out = new StringBuilder(text.length() + 8);
        for (int i = 0; i < text.length(); i++) {
            out.append(escapeHtmlChar(text.charAt(i)));
        }
        return out.toString();
    }

    private static String escapeHtmlChar(char ch) {
        return switch (ch) {
            case '&' -> "&amp;";
            case '<' -> "&lt;";
            case '>' -> "&gt;";
            case '"' -> "&quot;";
            case '\'' -> "&#39;";
            default -> String.valueOf(ch);
        };
    }

    private static String expandHexLegacy(String input) {
        Matcher matcher = HEX_LEGACY.matcher(input);
        StringBuilder sb = new StringBuilder();
        int last = 0;
        while (matcher.find()) {
            sb.append(input, last, matcher.start());
            last = matcher.end();
            String raw = matcher.group();
            StringBuilder hex = new StringBuilder(6);
            for (int i = 0; i < raw.length(); i++) {
                if (raw.charAt(i) == '§' && i + 1 < raw.length()) {
                    char h = raw.charAt(i + 1);
                    if (h != 'x' && h != 'X') {
                        hex.append(h);
                    }
                }
            }
            if (hex.length() == 6) {
                sb.append('\u0001').append(hex).append('\u0002');
            }
        }
        sb.append(input, last, input.length());
        return sb.toString();
    }

    private static String miniMessageToMarkers(String input) {
        Matcher matcher = MINI_TAG.matcher(input);
        StringBuilder out = new StringBuilder(input.length());
        int last = 0;

        while (matcher.find()) {
            out.append(input, last, matcher.start());
            last = matcher.end();

            boolean closing = !matcher.group(1).isEmpty();
            String name = matcher.group(2).toLowerCase(Locale.ROOT);
            String args = matcher.group(3);

            if (closing) {
                out.append('§').append('r');
                continue;
            }

            if (name.equals("reset") || name.equals("r")) {
                out.append('§').append('r');
                continue;
            }

            if (name.startsWith("#") && name.length() == 7 && isHex6(name.substring(1))) {
                out.append('\u0001').append(name.substring(1)).append('\u0002');
                continue;
            }

            String named = NAMED_COLORS.get(name);
            if (named != null) {
                out.append('\u0001').append(named.substring(1)).append('\u0002');
                continue;
            }

            switch (name) {
                case "bold", "b" -> out.append('§').append('l');
                case "italic", "i", "em" -> out.append('§').append('o');
                case "underlined", "underline", "u" -> out.append('§').append('n');
                case "strikethrough", "st" -> out.append('§').append('m');
                case "color" -> appendColorArg(out, args);
                case "gradient", "rainbow", "transition" -> {
                    if (args != null && !args.isBlank()) {
                        appendColorArg(out, args.split(":")[0]);
                    }
                }
                default -> out.append(matcher.group()); // left for escape as text later
            }
        }
        out.append(input, last, input.length());
        return out.toString();
    }

    private static void appendColorArg(StringBuilder out, String args) {
        if (args == null || args.isBlank()) {
            return;
        }
        String arg = args.trim().toLowerCase(Locale.ROOT);
        if (arg.startsWith("#") && arg.length() == 7 && isHex6(arg.substring(1))) {
            out.append('\u0001').append(arg.substring(1)).append('\u0002');
            return;
        }
        String named = NAMED_COLORS.get(arg);
        if (named != null) {
            out.append('\u0001').append(named.substring(1)).append('\u0002');
        }
    }

    private static boolean isHex6(String s) {
        return s.length() == 6 && s.chars().allMatch(c -> "0123456789abcdefABCDEF".indexOf(c) >= 0);
    }
}
