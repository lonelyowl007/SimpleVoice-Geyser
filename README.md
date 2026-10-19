# Simple Voice Geyser (fork)

> **Fork of** [TheodoreMeyer/SimpleVoice-Geyser](https://github.com/TheodoreMeyer/SimpleVoice-Geyser)  
> Maintained by [lonelyowl007](https://github.com/lonelyowl007/SimpleVoice-Geyser)

## What this fork changes

### 1) Robotic / distorted WAN voice fix

**Goal:** Fix robotic / distorted voice audio for Bedrock players using the web client over the internet (WAN).

**Source:** Port of the core idea from upstream [PR #52](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/pull/52) (`paper-the-best`). That PR could not be merged cleanly (conflicts, ~181 commits behind `dev`, author unresponsive). We applied only the voice-quality fix on top of the latest upstream `dev` branch.

| File | Change |
|------|--------|
| `core/web/js/audio/audio.js` | In `getUserMedia` mic constraints, set `noiseSuppression`, `echoCancellation`, and `autoGainControl` to `false` |

**Why:** The browser’s built-in noise suppression, echo cancellation, and auto-gain often warp the mic signal when voice is sent over WAN, which sounds “robotic”. Disabling those constraints keeps a cleaner raw capture for remote listeners.

**Not included from PR #52:** The experimental Discord-style VAD / input-sensitivity meter (UI bugs + outdated after the newer web/audio rewrite).

### 2) Paper / Purpur support through Minecraft 26.3

**Goal:** Fully declare Paper, Purpur, and Spigot support for the entire Minecraft **26.x** line up to **26.3** (previously badges stopped at 26.1.2).

| File | Change |
|------|--------|
| `README.md` | Support badges: Paper / Purpur / Spigot → `1.20.1–26.3` |
| `docs/install/compatibility.md` | Bukkit requirements clarified: Minecraft `1.20.1` through `26.3` |
| `spigot/build.gradle` | `runServer` target + download plugins aligned to Paper `26.3` (SVC `2.6.24`, ViaVersion for 26.3) |

### 3) Real Folia support (1.21.x – 26.3)

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
