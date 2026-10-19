package io.github.theodoremeyer.simplevoicegeyser.spigotmc.impl.sender;

import io.github.theodoremeyer.simplevoicegeyser.core.SvgCore;
import io.github.theodoremeyer.simplevoicegeyser.core.api.sender.SvgPlayer;
import io.github.theodoremeyer.simplevoicegeyser.spigotmc.SvgPlugin;
import io.papermc.paper.threadedregions.scheduler.ScheduledTask;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.plugin.Plugin;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;

/**
 * Bukkit/Paper/Folia player wrapper.
 * All Bukkit {@link Player} access from off-region threads (Jetty, audio) is hopped
 * onto the player's {@link org.bukkit.entity.Entity#getScheduler() EntityScheduler}.
 */
public class BukkitPlayer extends SvgPlayer {

    private static final long SPATIAL_CACHE_PERIOD_TICKS = 2L;
    private static final long ENTITY_CALL_TIMEOUT_SECONDS = 3L;

    private final Player player;
    private final AtomicReference<Double> cachedLookYaw = new AtomicReference<>();
    private volatile ScheduledTask spatialTask;

    public BukkitPlayer(Player player) {
        this.player = player;
    }

    /**
     * Start periodic spatial cache updates on the entity scheduler (Folia-safe).
     */
    public void startSpatialCache() {
        Plugin plugin = plugin();
        if (plugin == null || !player.isOnline()) {
            return;
        }
        cancelSpatialCache();
        refreshSpatialCacheOnCurrentThread();
        spatialTask = player.getScheduler().runAtFixedRate(
                plugin,
                task -> refreshSpatialCacheOnCurrentThread(),
                null,
                1L,
                SPATIAL_CACHE_PERIOD_TICKS
        );
    }

    /**
     * Stop spatial cache updates (call on quit).
     */
    public void cancelSpatialCache() {
        ScheduledTask task = spatialTask;
        spatialTask = null;
        if (task != null) {
            task.cancel();
        }
        cachedLookYaw.set(null);
    }

    @Override
    public UUID getUniqueId() {
        return player.getUniqueId();
    }

    @Override
    public String getName() {
        return player.getName();
    }

    @Override
    public boolean hasPermission(String permission) {
        try {
            return supplyOnEntityThread(() -> player.hasPermission(permission));
        } catch (Exception e) {
            SvgCore.getLogger().error(
                    "[Permissions] Unable to determine permission for '" + permission
                            + "' on entity thread, defaulting to true.",
                    e
            );
            return true;
        }
    }

    @Override
    public void chat(String message) {
        runOnEntityThread(() -> player.chat(message));
    }

    @Override
    public boolean isOnline() {
        try {
            return supplyOnEntityThread(player::isOnline);
        } catch (Exception e) {
            return player.isOnline();
        }
    }

    @Override
    public Object getPlayer() {
        return player;
    }

    @Override
    public void sendMessage(String message) {
        runOnEntityThread(() -> player.sendMessage(translate(message)));
    }

    @Override
    public Double getCachedLookYaw() {
        return cachedLookYaw.get();
    }

    private void refreshSpatialCacheOnCurrentThread() {
        if (!player.isOnline()) {
            cachedLookYaw.set(null);
            return;
        }
        cachedLookYaw.set((double) player.getLocation().getYaw());
    }

    private void runOnEntityThread(Runnable task) {
        if (!player.isOnline()) {
            return;
        }
        Plugin plugin = plugin();
        if (plugin == null) {
            return;
        }
        if (Bukkit.isOwnedByCurrentRegion(player)) {
            task.run();
            return;
        }
        player.getScheduler().run(plugin, scheduled -> task.run(), null);
    }

    private <T> T supplyOnEntityThread(Supplier<T> supplier) throws Exception {
        if (!player.isOnline()) {
            return supplier.get();
        }
        if (Bukkit.isOwnedByCurrentRegion(player)) {
            return supplier.get();
        }
        Plugin plugin = plugin();
        if (plugin == null) {
            return supplier.get();
        }
        CompletableFuture<T> future = new CompletableFuture<>();
        player.getScheduler().run(plugin, scheduled -> {
            try {
                future.complete(supplier.get());
            } catch (Throwable t) {
                future.completeExceptionally(t);
            }
        }, () -> future.completeExceptionally(new IllegalStateException("Player retired before entity task ran")));
        return future.get(ENTITY_CALL_TIMEOUT_SECONDS, TimeUnit.SECONDS);
    }

    private Plugin plugin() {
        try {
            return SvgPlugin.getPlugin(SvgPlugin.class);
        } catch (Exception e) {
            return null;
        }
    }

    private String translate(String message) {
        return ChatColor.translateAlternateColorCodes('&', message);
    }
}
