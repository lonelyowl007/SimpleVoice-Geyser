# Simple Voice Geyser (fork)

> **Fork of** [TheodoreMeyer/SimpleVoice-Geyser](https://github.com/TheodoreMeyer/SimpleVoice-Geyser)  
> Maintained by [lonelyowl007](https://github.com/lonelyowl007/SimpleVoice-Geyser)  
> **Fork version:** `0.1.20-fork` (upstream base `0.1.4` + voice/Folia/mic/UI + volumes + proximity/multi-talk + SVC UI + web Groups + reload web restart)  
> **Download prebuilt jars:** [Releases](https://github.com/lonelyowl007/SimpleVoice-Geyser/releases) (use `Svg-Spigot-*.jar` for Paper / Purpur / Folia)

## What this fork changes

### 1) Robotic / distorted WAN voice fix

**Goal:** Fix robotic / distorted voice audio for Bedrock players using the web client over the internet (WAN).

**Source:** Port of the core idea from upstream [PR #52](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/52) (`paper-the-best`). That PR could not be merged cleanly (conflicts, ~181 commits behind `dev`, author unresponsive). We applied only the voice-quality fix on top of the latest upstream `dev` branch.

| File | Change |
|------|--------|
| `core/web/js/audio/audio.js` | In `getUserMedia` mic constraints, set `noiseSuppression`, `echoCancellation`, and `autoGainControl` to `false` |

**Why:** The browser’s built-in noise suppression, echo cancellation, and auto-gain often warp the mic signal when voice is sent over WAN, which sounds “robotic”. Disabling those constraints keeps a cleaner raw capture for remote listeners.

**Browser AGC stays off** (to avoid the robot-voice regression). Soft speech / quieter mics are handled with the software sliders below instead.

### 2) Mic sensitivity + input volume (web UI)

**Goal:** Let players tune Voice Activation and how loud others hear them, without turning browser AGC back on.

**Source:** Ideas from PR #52 (Discord-style sensitivity meter + worklet thresholds), reimplemented on the current v2 AudioWorklet / 960-sample framing.

| Control | What it does |
|---------|----------------|
| **Input Sensitivity** | Adjusts VAD start/stop thresholds; energy bar + threshold marker show when speech triggers |
| **Mic Volume** | Software input gain (**50%–600%**, default 100%) so others can hear quiet mics after AGC is disabled |

Settings persist in `localStorage`. Defaults match the previous hardcoded thresholds and gain `1.0` (no behavior change until you move a slider).

**0.1.12-fork loudness fix:** Earlier builds applied gain only inside the AudioWorklet via `postMessage`. That path was easy to miss / too weak (max 2×) with AGC off, so the other side often heard **no real volume change**. Mic volume now uses a real Web Audio **`GainNode`** before the worklet (reliable TX loudness), soft-limits with `tanh`, and the slider goes up to **600%** (6×). Raise **Mic Volume** until the green energy bar moves clearly when you speak — that same signal is what others hear.

| File | Change |
|------|--------|
| `core/web/js/audio/microphone.js` | VAD thresholds, soft `tanh` limiter, framing / `energy` |
| `core/web/js/audio/audio.js` | `GainNode` mic boost + `setVadThreshold` / `setInputGain` / energy callback |
| `core/web/index.html` + `v2.css` + `ui.js` + `lang.js` | Connected-section sliders + meter UI |

### 3) Paper / Purpur support through Minecraft 26.3

**Goal:** Fully declare Paper, Purpur, and Spigot support for the entire Minecraft **26.x** line up to **26.3** (previously badges stopped at 26.1.2).

| File | Change |
|------|--------|
| `README.md` | Support badges: Paper / Purpur / Spigot → `1.20.1–26.3` |
| `docs/install/compatibility.md` | Bukkit requirements clarified: Minecraft `1.20.1` through `26.3` |
| `spigot/build.gradle` | `runServer` target + download plugins aligned to Paper `26.3` (SVC `2.6.24`, ViaVersion for 26.3) |

### 4) Real Folia support (1.21.x – 26.3)

**Goal:** Run correctly on Folia — not only `folia-supported: true`, but region-safe threading for Jetty auth/chat and spatial audio.

| File | Change |
|------|--------|
| `spigot/.../BukkitPlayer.java` | Replaced `Bukkit.getScheduler()` with **EntityScheduler**; `hasPermission` / `isOnline` / messages hop onto the player region |
| `spigot/.../SvgListener.java` | Starts/stops per-player spatial yaw cache on join/quit |
| `core/.../SvgAudioListener.java` | Uses cached look yaw; **no** `Player#getLocation` from the audio thread |
| `spigot/plugin.yml` | `folia-supported: true` |
| `spigot/build.gradle` | Compiles against **Paper API** (Folia schedulers) |
| `docs/install/compatibility.md` | Folia row + requirements |

**Requires:** Simple Voice Chat **2.6.24+** (Folia-related fixes), matching Folia build for your MC version. Geyser is typically reverse-proxied / soft-depend.

### 5) Blank web UI text behind reverse proxy (NPM)

**Goal:** Fix empty Username/Password/Join labels when the UI is served through Nginx Proxy Manager (or similar).

**Cause:** Only a partial whitelist of web files was extracted on startup (`v2.js` but not `js/utils/lang.js`, etc.), so ES-module imports 404’d and translations never applied.

| File | Change |
|------|--------|
| `core/.../FileManager.java` | Extract the **full** `/web/` tree from the JAR |
| `core/.../ResourceServlet.java` | `no-cache` for `.js` / `.mjs` / `.html` (avoid stale proxy 404s) |
| `core/web/index.html` | English fallback text inside `svg-lang` elements |

**After upgrading:** stop the server, delete `plugins/<SimpleVoice-Geyser>/web/`, start again, then hard-refresh the browser (Ctrl+F5). Enable Websockets on the NPM proxy host.

If the browser loops on **“Update required. Reloading page.”**, the HTML `BUILD_ID` does not match the running jar. Common causes: stale `web/`, proxy cache, or (fixed in `0.1.14-fork`) a jar built with mismatched IDs after a git commit because Gradle skipped re-filtering HTML. Delete `web/`, install a freshly built jar, restart, Ctrl+F5.

### 12) SVC-like multi-screen connected UI (0.1.15-fork)

**Goal:** After join, the web client matches Simple Voice Chat’s menu flow — a compact hub with big buttons and icons — instead of one long scrolling page of every control.

| Screen | Contents |
|--------|----------|
| **Hub** | Title “Voice Chat”; **Settings** + **Groups**; mute + volumes icons; PTT when mode is PTT; chat under the hub (Leave = top-left) |
| **Settings** | Voice Chat Volume (master), Mic Volume, Input Sensitivity, Voice/PTT, device pickers |
| **Select Microphone / Speaker** | Dark list rows with checkmark on the selected device |
| **Groups** | Join or Create Group list, password join, leave, Create Group screen |
| **Adjust Volumes** | Per-player panel only (via volumes icon on hub) |

Browser noise suppression / AGC stay off. Join-page branding is unchanged. Creating groups remains via `/svg cgroup` or Geyser forms (not in the web UI).

| File | Change |
|------|--------|
| `core/web/index.html` | Connected multi-screen shell |
| `core/web/js/screens.js` | Screen router + Back stack |
| `core/web/css/v2.css` | `.svcPanel` / list / icon styling |
| `core/web/js/ui.js` + `lang.js` | Device lists, Leave, i18n (`en`/`nl`/`pl`/`it`/`es`) |

**After upgrading:** delete `plugins/<SimpleVoice-Geyser>/web/`, restart, hard-refresh (`Ctrl+F5`).

### 13) Web Groups list + join (0.1.16-fork)

**Goal:** Bedrock/web players can see existing Simple Voice Chat groups and join them (with password when set), like the SVC Group menu — without auto-forcing everyone into the shared `Svg` lobby.

| Piece | Details |
|-------|---------|
| Server → client `groups` | `{ name, type, hasPassword }` + `current` membership (never sends passwords) |
| Client → server | `join_group` / `leave_group` via existing `GroupManager` |
| UI | Hub **Groups** button → list, password field, Leave Group |
| Permission | `svg.vc.group.join` (default true, child of `svg.vc.group`) |

**After upgrading:** delete `plugins/<SimpleVoice-Geyser>/web/`, restart, hard-refresh (`Ctrl+F5`).

### 14) UI polish + web Create Group (0.1.17-fork)

**Goal:** Match SVC menus more closely and fix layout bugs from the multi-screen hub.

| Fix | Details |
|-----|---------|
| Leave | Single top-left Leave (connected Join button); hub Leave removed |
| Sliders | Mic / Voice Chat Volume labels sit **above** the track (no text through the bar) |
| Settings | **Voice Chat Volume** (master receive) moved here; Adjust Volumes = players only |
| Groups | Clean list (lock/public icon, no Java type garbage); Create Group screen (name + optional password) |
| Protocol | `create_group` `{ name, password? }` → `GroupManager.createGroup` (`svg.vc.group.create`) |

**After upgrading:** delete `plugins/<SimpleVoice-Geyser>/web/`, restart, hard-refresh (`Ctrl+F5`).

### 15) In-group menu (0.1.18-fork)

**Goal:** Clicking a group opens an SVC-style group screen (title `Name (Open)`, member list with **You** badge, Leave Group) instead of a vague checkbox selection.

| Piece | Details |
|-------|---------|
| List | `Joined` / `Open` / `Locked` badges; lock icon only when password; green “checkbox” removed |
| Menu | Members from server (`groups.members`); auto-opens after create/join |
| Shortcut | “Open group: …” button when already joined |

**After upgrading:** delete `plugins/<SimpleVoice-Geyser>/web/`, restart, hard-refresh (`Ctrl+F5`).

### 16) Group password only when locked (0.1.19-fork)

The groups list no longer shows a password field. Clicking a **Locked** group opens an SVC-style **Enter Group Password** screen with Join Group; open groups join immediately.

**After upgrading:** delete `plugins/<SimpleVoice-Geyser>/web/`, restart, hard-refresh (`Ctrl+F5`).

### 6) Join grace — web login before Minecraft join

**Goal:** Bedrock players often get kicked when switching apps. They could not open the SVG web UI first, because auth required an online Minecraft session immediately.

**Fix:** After a valid password, the server holds the WebSocket and waits up to `client.vctimeout` seconds (default **60**) for the player to appear online + Simple Voice Chat ready. UI shows *Waiting for you to join Minecraft…*.

| Config | Meaning |
|--------|---------|
| `client.vctimeout` | Max seconds to wait (default `60`) |

Password / rate-limit / bedrock checks still run first. Voice is not registered until the wait succeeds.

### 7) Android Svg-App version allowlist

**Problem:** Upstream Svg-App APKs send `clientType.serverVersion` like `0.1.3` / `0.1.4`. This fork’s plugin version string is an exact match gate, so APKs were rejected with `app_protocol_unsupported`.

**Fix:** Config `client.accepted-app-server-versions` (default `0.1.3`, `0.1.4`) plus the current plugin version. Web clients still require a matching `serverBuild`.

**Note:** There is **no Android/Flutter source in this repo** — the APK cannot be rebuilt here. Prefer the **mobile browser** for this fork; older Svg-App builds may work via the allowlist when legacy audio fallback is enabled.

### 8) Web UI polish, Dutch, branding config, alert auto-dismiss

**Goal:** Make the Blocky join page clearer (labels were clipped), add **Dutch**, let owners brand the page from `config.yml`, and auto-hide error banners.

**Why not merge upstream UI PRs?** PR [#52](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/52) only inspired the mic sensitivity meter (already in §2). Open PR [#87](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/87) is a huge modernization (~78k LOC) that conflicts with this fork’s Folia/mic/join-grace work — we polished Blocky instead.

| Feature | Details |
|---------|---------|
| Layout polish | Stacked join fields, padding, focus rings; server name + tagline hero |
| Languages | `en`, `nl`, `pl`, `it`, `es` (NL flag + full JS strings) |
| Config | `client.web.default-language`, `client.web.server-name`, `client.web.tagline` via `GET /svg-web-config.json` |
| Alerts | Error/fatal banner auto-hides after **60 seconds** (X still works) |

First visit uses `default-language` when `localStorage.preferredLanguage` is unset; the language picker still saves a preference.

### 9) Per-player receive volumes (Adjust Volumes)

**Goal:** SVC-style **Adjust Volumes** in the web client — master / Other / per-player amplification and mute, persisted in browser `localStorage`.

**Why protocol changes?** Incoming audio is mixed into one speaker buffer; svg-v2 frames previously had pan/gain only. Per-player mute/boost needs the sender UUID on the wire plus a player roster for names.

| Piece | Details |
|-------|---------|
| `FLAG_HAS_SENDER` (`0x08`) | 16-byte big-endian UUID after the svg-v2 header |
| `voice_players` JSON | Roster push on web auth + Minecraft join/leave |
| UI | Overall / Other / players, search, 0–200% sliders, mute; avatars via mc-heads |
| Prefs | `localStorage` key `svgReceiveVolumes_v1` (client-only) |

**After upgrading:** delete `plugins/<SimpleVoice-Geyser>/web/`, restart, hard-refresh. New jar + new web client are required for per-player control; legacy PCM remains master-only.

### 10) Louder mic gain fix (0.1.12-fork)

**Problem:** With browser AGC off, **Mic Volume at 200%** often changed nothing for listeners — gain lived only in the worklet message path and capped at 2×.

**Fix:** Web Audio `GainNode` before the mic worklet, soft `tanh` limiter, slider **50%–600%**. Documented under §2 above.

### 11) Proximity by default + multi-talk robot fix (0.1.13-fork)

**Problem A — everyone in group `Svg`:** On web join the plugin auto-created one shared SVC **OPEN** group named `Svg` (`server.group.default.enabled` defaulted to `true`). All SVG users heard each other like a party line, not normal proximity.

**Fix A:** Default is now **`server.group.default.enabled: false`**. Web clients use normal Simple Voice Chat proximity. Set `enabled: true` only if you want a shared SVG lobby. **Existing servers** that already have `enabled: true` in `config.yml` must set it to `false` manually (config merge keeps old values).

**Problem B — multi-talk sounds robotic:** One Opus decoder was reused for every speaker (server legacy + client svg-v2). Opus is stateful per stream, so interleaved A/B packets turn metallic. The speaker worklet also **appended** PCM instead of mixing concurrent voices.

**Fix B:**
| Layer | Change |
|-------|--------|
| Server legacy | Per-sender `OpusDecoder` map in `SvgAudioListener` |
| Client svg-v2 | Per-sender WASM Opus decoder pool (keyed by `FLAG_HAS_SENDER` UUID) |
| Speaker worklet | Per-voice queues summed in `process()` + soft clamp |
| WebSocket RX | Binary frames decoded/played one-at-a-time (no overlap) |

Upstream [PR #52](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/52) only covers mic AGC/NS/AEC (already in §1) — it does **not** fix multi-talk decode/mix.

**Note:** Fabric support badges are unchanged (`1.21.11–26.1.2`) in this fork update.

**Base:** Latest upstream `dev` (includes later work such as Opus/WebCodecs mic encoding, spatial audio, UI updates, etc.).

**Upstream PRs:**
- Voice + 26.3 docs: https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/104
- Folia support: https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/105

---

# Simple Voice Geyser
[![GitHub release](https://img.shields.io/github/v/release/TheodoreMeyer/SimpleVoice-Geyser?include_prereleases)](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/releases)
[![License](https://img.shields.io/github/license/TheodoreMeyer/SimpleVoice-Geyser)](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/blob/master/LICENSE)
[Contributors](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/blob/master/Contributors.md)

**Supports:**
- [![Spigot](https://img.shields.io/badge/Spigot-1.20.1–26.3-orange?logo=spigotmc&logoColor=white)](https://www.spigotmc.org/resources/132386)

- <a href="https://papermc.io/">
    <img src="https://assets.papermc.io/brand/papermc_logo.min.svg" height="22"/>
    <img src="https://img.shields.io/badge/Paper-1.20.1–26.3-3b82f6"/>
  </a>
- <a href="https://purpurmc.org/">
    <img src="https://purpurmc.org/docs/images/purpur-small.png" height="22"/>
    <img src="https://img.shields.io/badge/Purpur-1.20.1–26.3-7c3aed"/>
  </a>
- <a href="https://papermc.io/software/folia">
    <img src="https://img.shields.io/badge/Folia-1.21.x–26.3-00a86b"/>
  </a>
- <a href="https://fabricmc.net/">
    <img src="https://fabricmc.net/assets/logo.png" height="22"/>
    <img src="https://img.shields.io/badge/Fabric-1.21.11–26.1.2-1f2937"/>
  </a>

A Geyser Extension to allow Bedrock Clients to connect with Simple voice Chat.

## What can the Plugin/extension do?
- Allow Bedrock Players to voice chat with Java Players through a web interface.
- Configured to also allow Java Players without the SVC Mod to join the chat.
- Configurable texting through a chatbox to allow the bedrock players to chat in-game.

## Using this Plugin
- Set the '.jar' file into your server's plugin directory.
- Configure it to connect with your server's SimpleVoice chat. See [Installation](https://theodoremeyer.github.io/projects/simplevoicegeyser/install)

### Updating
- Replacing the old jar with the new one.
     - I plan on making config options auto update.

## Documentation
- Our [wiki](https://theodoremeyer.github.io/projects/simplevoicegeyser/) can help!
- Release-focused docs for current development changes are available in [docs](docs/README.md).

- old wiki: [wiki](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/wiki).

## Coming Soon
- Dev Release (v 0.1.4-Dev)
- Initial Release (v 1.0.0)

## Features to be worked on
- External Webserver (you host the vc connection at your website)
- Support
  - Velocity
- More Web browser support.

## Suggestions?
Reach out through issues!

## Dependencies used
- [Geysermc.org](https://geysermc.org)
- [Jetty.org](https://jetty.org)
- SimpleVoiceChat: [ModRepo.de](https://modrepo.de/minecraft/voicechat/overview)
- Bcrypt: [Mindrot.org](https://www.mindrot.org/projects/jBCrypt/)

## Important Notes
- Simple Voice Chat 2.6.0 or compatible is required to work, It must run on the server.
- GeyserMC 2.10.0-SNAPSHOT
- Java 25 or newer is required to build this project from source.

- Microphone/Speaker options may or may not work, depending on your browser, as this was built for Google Chrome.

## Developer Notes
- Please see the contributing.md before contributing to this project.
