package io.github.theodoremeyer.simplevoicegeyser.core.server.packets;

import io.github.theodoremeyer.simplevoicegeyser.core.SvgCore;
import io.github.theodoremeyer.simplevoicegeyser.core.api.chat.MinecraftChatHtml;
import io.github.theodoremeyer.simplevoicegeyser.core.api.chat.SvgColor;
import io.github.theodoremeyer.simplevoicegeyser.core.server.connection.SvgConnection;

import java.util.UUID;

/**
 * Mirrors Minecraft (and peer web) chat lines to authenticated web clients.
 * Preserves legacy / MiniMessage colors on display names (ranks) for the web panel.
 */
public final class ChatBroadcaster {

    private ChatBroadcaster() {}

    /**
     * Broadcast a chat line to every authenticated websocket (optionally excluding one UUID).
     *
     * @param playerName display name of the speaker (may include § / MiniMessage rank colors)
     * @param message    message body
     * @param excludeUuid connection to skip (e.g. web sender who already has a local echo)
     */
    public static void broadcast(String playerName, String message, UUID excludeUuid) {
        if (!Boolean.TRUE.equals(SvgCore.getConfig().WEB_CHAT_ENABLED.get())) {
            return;
        }
        if (SvgCore.getConnectionManager() == null) {
            return;
        }

        String nameRaw = playerName == null ? "" : playerName;
        String bodyRaw = message == null ? "" : message;

        // Keep formatting on the name (ranks); sanitize the body for safety.
        ChatSanitize.SanitizedChat body = ChatSanitize.sanitize(SvgColor.strip(bodyRaw));
        if (body.sanitized().isEmpty() && SvgColor.strip(nameRaw).isBlank()) {
            return;
        }

        String safeBody = body.sanitized().isEmpty() ? SvgColor.strip(bodyRaw).trim() : body.sanitized();
        if (safeBody.isEmpty()) {
            return;
        }

        MinecraftChatHtml.FormattedChat line = MinecraftChatHtml.formatChatLine(nameRaw, safeBody);
        if (line.plain().isBlank()) {
            return;
        }

        for (SvgConnection connection : SvgCore.getConnectionManager().getAll()) {
            if (connection == null || !connection.isAuthenticated()) {
                continue;
            }
            if (excludeUuid != null && excludeUuid.equals(connection.getUuid())) {
                continue;
            }
            try {
                connection.sendChat(line.plain(), line.html());
            } catch (Exception e) {
                SvgCore.getLogger().debug(
                        "ChatBroadcaster: failed to send chat to " + connection.getUuid(),
                        e
                );
            }
        }
    }

    /**
     * Broadcast a pre-formatted Minecraft chat line (format string already applied).
     * Used when the server chat format already includes rank prefixes and colors.
     *
     * @param formattedLine full line as players see in-game (may include § / MiniMessage)
     * @param excludeUuid   connection to skip, or null
     */
    public static void broadcastFormattedLine(String formattedLine, UUID excludeUuid) {
        if (!Boolean.TRUE.equals(SvgCore.getConfig().WEB_CHAT_ENABLED.get())) {
            return;
        }
        if (SvgCore.getConnectionManager() == null) {
            return;
        }
        if (formattedLine == null || formattedLine.isBlank()) {
            return;
        }

        MinecraftChatHtml.FormattedChat line = MinecraftChatHtml.format(formattedLine);
        String plain = line.plain().trim();
        if (plain.isEmpty()) {
            return;
        }

        for (SvgConnection connection : SvgCore.getConnectionManager().getAll()) {
            if (connection == null || !connection.isAuthenticated()) {
                continue;
            }
            if (excludeUuid != null && excludeUuid.equals(connection.getUuid())) {
                continue;
            }
            try {
                connection.sendChat(plain, line.html());
            } catch (Exception e) {
                SvgCore.getLogger().debug(
                        "ChatBroadcaster: failed to send formatted chat to " + connection.getUuid(),
                        e
                );
            }
        }
    }

    /**
     * Handle a Minecraft public chat message (may be a web-forwarded {@code [Web Chat]:} line).
     */
    public static void onMinecraftChat(String playerName, UUID playerUuid, String message) {
        if (!Boolean.TRUE.equals(SvgCore.getConfig().WEB_CHAT_ENABLED.get())) {
            return;
        }
        String stripped = ChatSanitize.stripWebChatPrefix(message);
        if (stripped != null) {
            broadcast(playerName, stripped, playerUuid);
            return;
        }
        broadcast(playerName, message, null);
    }

    /**
     * Handle Minecraft chat when the platform already produced a formatted display line.
     *
     * @param playerName     fallback / raw name
     * @param playerUuid     speaker uuid
     * @param message        raw message body
     * @param formattedLine  optional full in-game formatted line (ranks + colors); may be null
     */
    public static void onMinecraftChat(
            String playerName,
            UUID playerUuid,
            String message,
            String formattedLine
    ) {
        if (!Boolean.TRUE.equals(SvgCore.getConfig().WEB_CHAT_ENABLED.get())) {
            return;
        }
        String stripped = ChatSanitize.stripWebChatPrefix(message);
        if (stripped != null) {
            broadcast(playerName, stripped, playerUuid);
            return;
        }
        if (formattedLine != null && !formattedLine.isBlank()) {
            broadcastFormattedLine(formattedLine, null);
            return;
        }
        broadcast(playerName, message, null);
    }
}
