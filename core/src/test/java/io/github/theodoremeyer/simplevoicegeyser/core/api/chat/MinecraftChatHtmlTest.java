package io.github.theodoremeyer.simplevoicegeyser.core.api.chat;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MinecraftChatHtmlTest {

    @Test
    void legacyColorsBecomeHtmlSpans() {
        MinecraftChatHtml.FormattedChat out = MinecraftChatHtml.format("§6[VIP] §fPlayer");
        assertEquals("[VIP] Player", out.plain());
        assertTrue(out.html().contains("color:#FFAA00"));
        assertTrue(out.html().contains("[VIP]"));
        assertTrue(out.html().contains("color:#FFFFFF") || out.html().contains("Player"));
    }

    @Test
    void miniMessageNamedColorsWork() {
        MinecraftChatHtml.FormattedChat out = MinecraftChatHtml.format("<gold>[Admin]</gold> <white>Steve</white>");
        assertEquals("[Admin] Steve", out.plain());
        assertTrue(out.html().contains("color:#FFAA00"));
        assertFalse(out.html().contains("<gold>"));
    }

    @Test
    void hexMiniMessageWorks() {
        MinecraftChatHtml.FormattedChat out = MinecraftChatHtml.format("<#ab12cd>Rank</#ab12cd>");
        assertEquals("Rank", out.plain());
        assertTrue(out.html().toLowerCase().contains("color:#ab12cd"));
    }

    @Test
    void chatLineWrapsNameAndEscapesBody() {
        MinecraftChatHtml.FormattedChat out = MinecraftChatHtml.formatChatLine("§cAdmin", "<script>");
        assertEquals("<Admin> <script>", out.plain());
        assertTrue(out.html().contains("&lt;"));
        assertTrue(out.html().contains("&gt;"));
        assertFalse(out.html().contains("<script>"));
    }

    @Test
    void ampAndCodesTranslate() {
        MinecraftChatHtml.FormattedChat out = MinecraftChatHtml.format("&aHello");
        assertEquals("Hello", out.plain());
        assertTrue(out.html().contains("color:#55FF55"));
    }
}
