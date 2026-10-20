# Simple Voice Geyser (fork)

> **Fork of** [TheodoreMeyer/SimpleVoice-Geyser](https://github.com/TheodoreMeyer/SimpleVoice-Geyser)  
> Maintained by [lonelyowl007](https://github.com/lonelyowl007/SimpleVoice-Geyser)  
> **Fork version:** `0.1.21-fork` (upstream base `0.1.4`)  
> **Download prebuilt jars:** [Releases](https://github.com/lonelyowl007/SimpleVoice-Geyser/releases) (use `Svg-Spigot-*.jar` for Paper / Purpur / Folia)

## What this fork changes

### 1) Robotic / distorted WAN voice

Disables browser `noiseSuppression` / `echoCancellation` / `autoGainControl` in the web mic path so WAN voice stays clear (idea from upstream [PR #52](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/52); AGC stays off).

### 2) Mic sensitivity + Mic Volume (web)

Input Sensitivity (VAD meter) and Mic Volume (**50%–600%**) with a real Web Audio `GainNode` before the worklet (`0.1.12-fork`), so quiet mics are heard without turning AGC back on. Settings persist in `localStorage`.

### 3) Paper / Purpur / Spigot through Minecraft 26.3

Support badges and docs cover **1.20.1–26.3**; `runServer` / plugin downloads aligned to Paper 26.3 + SVC 2.6.24.

### 4) Real Folia support (1.21.x – 26.3)

Region-safe EntityScheduler usage, spatial yaw cache, `folia-supported: true`, Paper API compile. Needs Simple Voice Chat **2.6.24+**.

### 5) Blank web UI behind reverse proxy + Update required loop

Full `/web/` extract from the jar, `no-cache` for HTML/JS, and jar `BUILD_ID` kept in sync with `BuildInfo` (`0.1.14-fork`). After upgrades: delete `plugins/<SimpleVoice-Geyser>/web/`, restart, Ctrl+F5; enable Websockets on the proxy.

### 6) Join grace — web login before Minecraft join

After a valid password, the server waits up to `client.vctimeout` seconds (default **60**) for the player to be online + SVC-ready. UI shows *Waiting for you to join Minecraft…*.

### 7) Android Svg-App version allowlist

`client.accepted-app-server-versions` (default `0.1.3`, `0.1.4`) plus the **current** plugin version. Only for legacy Svg-App APKs — **not** a list of fork versions. Web clients still match `serverBuild` / `BUILD_ID`. Prefer the mobile browser for this fork.

### 8) Join-page polish, Dutch, branding, alerts

Clearer Blocky join layout; languages `en` / `nl` / `pl` / `it` / `es`; `client.web.default-language`, `server-name`, `tagline` via `/svg-web-config.json`; error banners auto-hide after 60s.

### 9) Per-player Adjust Volumes

`FLAG_HAS_SENDER` + `voice_players` roster; master / Other / per-player receive volume + mute in `localStorage` (`svgReceiveVolumes_v1`). Master volume lives in Settings; the volumes icon lists players.

### 10) Proximity by default + multi-talk audio fix (`0.1.13-fork`)

- Default `server.group.default.enabled: false` (no shared party-line `Svg` group). Existing configs with `true` must set `false` manually.
- Per-sender Opus decode + speaker worklet mix so multiple talkers do not sound robotic.

### 11) SVC-like multi-screen web UI (`0.1.15-fork`+)

Connected UI is a hub (Settings + Groups, mute / volumes icons, chat) with separate screens for Settings, devices, Adjust Volumes, and Groups — not one long page. Leave is the top-left connected Join button.

### 12) Web Groups (`0.1.16`–`0.1.19-fork`)

List / join / leave / create SVC groups over WebSocket (`groups`, `join_group`, `leave_group`, `create_group`). Clicking a group opens an in-group member menu; locked groups open **Enter Group Password** only when needed. Permissions: `svg.vc.group.join`, `svg.vc.group.create`.

### 13) `/svg reload` restarts the web server (`0.1.20-fork`)

Reload applies bind/port/context-path/idle-timeout and related web settings by restarting Jetty. Connected web clients are disconnected and must rejoin.

### 14) Clean address bar (`0.1.21-fork`)

Temporary `?_svg=…` cache-bust query from “Update required” reloads is stripped from the URL after load.

---

**Base:** Latest upstream `dev` (Opus/WebCodecs mic, spatial audio, etc.). Fabric badges remain `1.21.11–26.1.2` in this fork line.

**Upstream PRs (related):**
- Voice + 26.3 docs: https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/104
- Folia support: https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/105

**After most web upgrades:** delete `plugins/<SimpleVoice-Geyser>/web/`, restart, hard-refresh (`Ctrl+F5`). Details: [`docs/install/upgrading.md`](docs/install/upgrading.md).

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
