package io.github.theodoremeyer.simplevoicegeyser.core.server.packets;

import de.maxhenkel.voicechat.api.Group;
import io.github.theodoremeyer.simplevoicegeyser.core.SvgCore;
import io.github.theodoremeyer.simplevoicegeyser.core.api.sender.SvgPlayer;
import io.github.theodoremeyer.simplevoicegeyser.core.managers.GroupManager;
import io.github.theodoremeyer.simplevoicegeyser.core.server.connection.SvgConnection;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Locale;

/**
 * Broadcasts the SVC group list so web clients can join/leave groups.
 */
public final class GroupsBroadcaster {

    private GroupsBroadcaster() {}

    /**
     * Send a personalized {@code groups} packet to every authenticated websocket.
     */
    public static void broadcast() {
        GroupManager manager = SvgCore.getGroupManager();
        if (manager == null || SvgCore.getConnectionManager() == null) {
            return;
        }
        for (SvgConnection connection : SvgCore.getConnectionManager().getAll()) {
            sendTo(connection);
        }
    }

    /**
     * Send the current group list to one connection (with that client's membership).
     */
    public static void sendTo(SvgConnection connection) {
        if (connection == null || !connection.isAuthenticated()) {
            return;
        }
        connection.sendJson(buildPacket(connection.getPlayer()));
    }

    static JSONObject buildPacket(SvgPlayer player) {
        GroupManager manager = SvgCore.getGroupManager();
        JSONArray groups = new JSONArray();

        if (manager != null) {
            for (Group group : manager.getGroups()) {
                if (group == null || group.getName() == null) {
                    continue;
                }
                JSONObject entry = new JSONObject();
                entry.put("name", group.getName());
                entry.put("type", typeName(group));
                entry.put("hasPassword", manager.hasPassword(group));
                groups.put(entry);
            }
        }

        JSONObject packet = new JSONObject();
        packet.put("type", "groups");
        packet.put("groups", groups);

        String current = null;
        if (manager != null && player != null) {
            current = manager.getJoinedGroupName(player).orElse(null);
        }
        packet.put("current", current != null ? current : JSONObject.NULL);
        return packet;
    }

    private static String typeName(Group group) {
        if (group.getType() == null) {
            return "OPEN";
        }
        return String.valueOf(group.getType()).toUpperCase(Locale.ROOT);
    }
}
