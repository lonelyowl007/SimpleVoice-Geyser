package io.github.theodoremeyer.simplevoicegeyser.spigotmc.impl;

import io.github.theodoremeyer.simplevoicegeyser.core.SvgCore;
import io.github.theodoremeyer.simplevoicegeyser.core.api.sender.SvgPlayer;
import io.github.theodoremeyer.simplevoicegeyser.core.server.packets.ChatBroadcaster;
import io.github.theodoremeyer.simplevoicegeyser.core.server.packets.ChatSanitize;
import io.github.theodoremeyer.simplevoicegeyser.spigotmc.impl.sender.BukkitPlayer;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;

import java.util.UUID;

public class SvgListener implements Listener {

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        // Spigot/Paper PlayerManager always stores BukkitPlayer instances.
        BukkitPlayer bukkitPlayer = new BukkitPlayer(player);
        bukkitPlayer.startSpatialCache();
        SvgCore.getPlayerManager().addPlayer(bukkitPlayer);
        SvgCore.getJoinMessageHandler().sendJoinMessage(bukkitPlayer)
                .exceptionally(throwable -> {
                    SvgCore.getLogger().error("Error sending join message for player " + player.getName(), throwable);
                    return null;
                });
    }

    @EventHandler
    public void onLeave(PlayerQuitEvent event) {
        UUID playerUuid = event.getPlayer().getUniqueId();
        SvgPlayer player = SvgCore.getPlayerManager().getPlayer(playerUuid);
        if (player instanceof BukkitPlayer bukkitPlayer) {
            bukkitPlayer.cancelSpatialCache();
        }
        if (player != null) {
            SvgCore.getPlayerManager().removePlayer(player)
                    .exceptionally(throwable -> {
                        SvgCore.getLogger().error("Error removing player " + player.getName() + " from player manager", throwable);
                        return null;
                    });
        }
    }

    /**
     * Mirror public Minecraft chat into authenticated web clients.
     * Runs MONITOR so cancelled chat (mute plugins, etc.) is not forwarded.
     * Uses the server chat format + display name so LuckPerms / MiniMessage ranks keep their colors.
     */
    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onChat(AsyncPlayerChatEvent event) {
        Player player = event.getPlayer();
        if (player == null) {
            return;
        }
        String message = event.getMessage();
        if (message == null || message.isBlank()) {
            return;
        }

        String displayName = player.getDisplayName();
        if (displayName == null || displayName.isBlank()) {
            displayName = player.getName();
        }

        String formattedLine = null;
        String stripped = ChatSanitize.stripWebChatPrefix(message);
        if (stripped == null) {
            try {
                // Same line Java players see: includes rank prefixes from chat plugins.
                formattedLine = String.format(event.getFormat(), displayName, message);
            } catch (Exception ignored) {
                formattedLine = null;
            }
        }

        ChatBroadcaster.onMinecraftChat(
                displayName,
                player.getUniqueId(),
                message,
                formattedLine
        );
    }
}
