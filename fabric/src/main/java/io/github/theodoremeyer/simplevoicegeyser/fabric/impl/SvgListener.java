package io.github.theodoremeyer.simplevoicegeyser.fabric.impl;

import io.github.theodoremeyer.simplevoicegeyser.core.SvgCore;
import io.github.theodoremeyer.simplevoicegeyser.core.server.packets.ChatBroadcaster;
import io.github.theodoremeyer.simplevoicegeyser.fabric.impl.sender.FabricPlayer;
import net.fabricmc.fabric.api.message.v1.ServerMessageEvents;
import net.fabricmc.fabric.api.networking.v1.ServerPlayConnectionEvents;
import net.minecraft.network.chat.Component;
import net.minecraft.server.level.ServerPlayer;

import java.util.UUID;

public class SvgListener {

    public SvgListener() {
        register();
    }

    public void register() {

        // JOIN
        ServerPlayConnectionEvents.JOIN.register((handler, sender, server) -> {

            ServerPlayer player = handler.player;

            FabricPlayer fabricPlayer = new FabricPlayer(player);
            SvgCore.getPlayerManager().addPlayer(fabricPlayer);
            SvgCore.getJoinMessageHandler().sendJoinMessage(fabricPlayer)
                    .exceptionally(throwable -> {
                        SvgCore.getLogger().error("Error sending join message for player " + player.getName().getString(), throwable);
                        return null;
                    });
        });

        // LEAVE
        ServerPlayConnectionEvents.DISCONNECT.register((handler, server) -> {

            UUID uuid = handler.player.getUUID();

            FabricPlayer player = (FabricPlayer) SvgCore.getPlayerManager().getPlayer(uuid);

            if (player != null) {
                player.isOnline = false;
                SvgCore.getPlayerManager().removePlayer(player)
                        .exceptionally(throwable -> {
                            SvgCore.getLogger().error("Error removing player " + player.getName() + " from player manager", throwable);
                            return null;
                        });
            }
        });

        // Public chat → web clients (prefer display name so rank prefixes keep colors when present)
        ServerMessageEvents.CHAT_MESSAGE.register((message, sender, params) -> {
            if (sender == null || message == null) {
                return;
            }
            Component content = message.decoratedContent();
            String plain = content == null ? "" : content.getString();
            if (plain.isBlank()) {
                return;
            }
            Component display = sender.getDisplayName();
            String displayName = display == null ? sender.getScoreboardName() : display.getString();
            if (displayName == null || displayName.isBlank()) {
                displayName = sender.getScoreboardName();
            }
            ChatBroadcaster.onMinecraftChat(displayName, sender.getUUID(), plain);
        });
    }
}
