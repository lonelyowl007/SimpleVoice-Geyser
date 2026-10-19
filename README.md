# Simple Voice Geyser (fork)

> **Fork of** [TheodoreMeyer/SimpleVoice-Geyser](https://github.com/TheodoreMeyer/SimpleVoice-Geyser)  
> Maintained by [lonelyowl007](https://github.com/lonelyowl007/SimpleVoice-Geyser)  
> **Fork version:** `0.1.9-fork` (upstream base `0.1.4` + voice fix + Paper/Purpur 26.3 + Folia + mic UI + join grace + Svg-App allowlist + web UI polish / NL / branding)  
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
| **Mic Volume** | Software input gain (~50%–200%, default 100%) applied in the mic worklet before VAD/encode |

Settings persist in `localStorage`. Defaults match the previous hardcoded thresholds and gain `1.0` (no behavior change until you move a slider).

| File | Change |
|------|--------|
| `core/web/js/audio/microphone.js` | `setThreshold` / `setGain`, soft-clip gain, `energy` in mic messages |
| `core/web/js/audio/audio.js` | `setVadThreshold` / `setInputGain` / throttled energy callback (~5×/s) |
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
