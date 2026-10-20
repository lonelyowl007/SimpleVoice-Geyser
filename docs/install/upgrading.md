---
title: Upgrading
layout: projects
project: simplevoicegeyser
---

# Upgrading

This page documents version upgrade behavior and breaking changes.

---

## General Rules

- Upgrading to newer versions is supported unless stated otherwise
- Downgrading is **not supported**
- Always back up your server before upgrading

---

## Version-Specific Notes

### Upgrade to 0.0.3-DEV

- Password storage behavior changed
- Passwords are no longer persisted in plaintext
- Users must reset passwords after upgrading

#### Impact

- Existing users will lose access until passwords are reconfigured
- Improves overall security

### Upgrade to 0.1.1

- Password storage behavior changed
- Users must reset passwords after upgrading

#### Impact

- Existing users will lose access until passwords are reconfigured
- This removes redundancy and increases performance.

---

### Upgrade to 0.1.6-fork (web UI / reverse proxy)

If the join page shows empty labels/buttons (Username, Password, Join) behind Nginx Proxy Manager or another reverse proxy:

1. Stop the server
2. Delete the plugin web override folder: `plugins/<SimpleVoice-Geyser>/web/`
3. Replace the plugin JAR with `0.1.6-fork` (or newer)
4. Start the server (full `/web/` tree is re-extracted, including `js/utils/lang.js`)
5. Hard-refresh the browser (`Ctrl+F5`)
6. Confirm NPM/proxy has **Websockets** enabled and is not caching `/js/` aggressively

---

### Upgrade to 0.1.7-fork (mic sensitivity / volume)

Adds **Input Sensitivity** and **Mic Volume** sliders in the connected web UI (Voice Activation + software gain; browser AGC stays off).

1. Replace the plugin JAR with `0.1.7-fork`
2. If you use a web override folder, delete `plugins/<SimpleVoice-Geyser>/web/` so the new JS/CSS/HTML is extracted
3. Hard-refresh the browser (`Ctrl+F5`)
4. After join, use the sliders under Mute; preferences are stored in the browser (`localStorage`)

---

### Upgrade to 0.1.8-fork (join grace + Svg-App allowlist)

- **Join grace:** after a valid web password, SVG waits up to `client.vctimeout` (default 60s) for you to join Minecraft — useful when Bedrock kicks you for app-switching.
- **Svg-App:** older Android APKs targeting `0.1.3` / `0.1.4` are accepted via `client.accepted-app-server-versions` (no APK rebuild in this repo).

1. Replace the plugin JAR with `0.1.8-fork`
2. Delete `plugins/<SimpleVoice-Geyser>/web/` if you use overrides; let new defaults merge into `config.yml`
3. Hard-refresh the browser (`Ctrl+F5`)
4. Optional: tune `client.vctimeout` and `client.accepted-app-server-versions`

---

### Upgrade to 0.1.9-fork (web UI polish / NL / branding)

- Polished Blocky join layout (no clipped mic/speaker labels)
- **Dutch** language option (+ fuller JS strings for pl/it)
- Config branding: `client.web.default-language`, `client.web.server-name`, `client.web.tagline` (served at `/svg-web-config.json`)
- Error banners auto-dismiss after 60 seconds

1. Replace the plugin JAR with `0.1.9-fork`
2. Delete `plugins/<SimpleVoice-Geyser>/web/` if you use overrides
3. Start server (new config keys merge) and hard-refresh (`Ctrl+F5`)
4. Set `client.web.*` as desired (e.g. `default-language: nl`)

---

### Upgrade to 0.1.10-fork (pending-join wait UI)

Clearer **Waiting for Minecraft** panel with countdown while join grace holds the WebSocket open.

1. Replace the plugin JAR with `0.1.10-fork` (or newer)
2. Delete `plugins/<SimpleVoice-Geyser>/web/` if you use overrides
3. Hard-refresh the browser (`Ctrl+F5`)

---

### Upgrade to 0.1.11-fork (per-player Adjust Volumes)

Adds **Adjust Volumes** (Overall / Other / per-player amplification + mute) in the connected web UI. Requires the new jar (svg-v2 sender UUID + `voice_players` roster) and a refreshed web client.

1. Replace the plugin JAR with `0.1.11-fork`
2. Delete `plugins/<SimpleVoice-Geyser>/web/` so new JS/CSS/HTML is extracted
3. Hard-refresh the browser (`Ctrl+F5`)
4. After join, use **Adjust Volumes** under the mic settings; prefs stay in browser `localStorage` (`svgReceiveVolumes_v1`)

Legacy PCM sessions remain master-volume only. Old clients against a new jar ignore unknown flags safely but will not get per-player control until updated.

---

### Upgrade to 0.1.12-fork (louder mic volume)

Fixes **Mic Volume** having little/no effect for listeners when browser AGC is off. Gain now uses a Web Audio `GainNode` (up to **600%**).

1. Replace the plugin JAR with `0.1.12-fork`
2. Delete `plugins/<SimpleVoice-Geyser>/web/`
3. Hard-refresh (`Ctrl+F5`)
4. After join, raise **Mic Volume** until the energy bar reacts when you speak — others hear that louder signal

---

### Upgrade to 0.1.13-fork (proximity default + multi-talk audio)

- **Default group off:** new installs no longer auto-join the shared `Svg` OPEN group. For proximity, set in live `config.yml`:

```yaml
server:
  group:
    default:
      enabled: false
```

  (Existing configs that already have `enabled: true` keep that value until you change it.)

- **Multi-talk fix:** per-sender Opus decoders (server legacy + client svg-v2) and per-voice mixing in the speaker worklet so several people talking no longer sounds robotic.

1. Replace the plugin JAR with `0.1.13-fork`
2. Set `server.group.default.enabled: false` if you still see everyone in group `Svg`
3. Delete `plugins/<SimpleVoice-Geyser>/web/`
4. Restart + hard-refresh (`Ctrl+F5`)

---

### Upgrade to 0.1.14-fork (Update required loop)

If the browser keeps showing **Update required. Reloading page.**:

1. Stop the server
2. Delete `plugins/<SimpleVoice-Geyser>/web/` (stale `index.html` BUILD_ID)
3. Install `0.1.14-fork` (always refreshes `index.html` / `legacy.html` from the jar; client only auto-reloads once)
4. Start + hard-refresh (`Ctrl+F5`); clear NPM/browser cache if needed

---

### Upgrade to 0.1.15-fork (SVC-like multi-screen UI)

Connected web UI is now hub → Settings / Adjust Volumes / device lists (not one long page).

1. Stop the server
2. Delete `plugins/<SimpleVoice-Geyser>/web/` (required — new `index.html`, `screens.js`, CSS)
3. Install `0.1.15-fork`
4. Start + hard-refresh (`Ctrl+F5`); clear NPM/browser cache if needed

---

### Upgrade to 0.1.16-fork (Web Groups list + join)

Web clients can list SVC groups and join with a password (hub **Groups** button). Adjust Volumes stays on the volumes icon.

1. Stop the server
2. Delete `plugins/<SimpleVoice-Geyser>/web/` (required — new Groups UI + protocol)
3. Install `0.1.16-fork`
4. Start + hard-refresh (`Ctrl+F5`); clear NPM/browser cache if needed

Ensure players have `svg.vc.group.join` (included under `svg.vc.group` by default).

---

## Best Practices

- Test upgrades in a staging environment
- Read changelogs before updating
- Avoid upgrading production servers blindly

---

## DEV Builds

- `-DEV` versions are experimental
- Expect breaking changes
- Not recommended for production use