---
title: Installation
layout: projects
project: simplevoicegeyser
---

# Installation

Follow these steps on one server and your players can use voice chat from a browser or the Svg-App.

- Running several servers behind Velocity? Do this page first, then follow [Velocity Proxy Setup]({% project_link velocity %}).
- Using a Minecraft hosting provider? See [Hosting Guides]({% project_link guides %}).

> Simple Voice Geyser depends on Simple Voice Chat and does not work without it.

---

## What you need

### Paper, Purpur and Spigot

* Minecraft **1.20.1 through 26.3**
* Simple Voice Chat 2.6.x or newer (2.6.24 or newer on Minecraft 26.3)
* GeyserMC 2.10.1-SNAPSHOT or newer, for Bedrock players
* Floodgate (optional, recommended)

### Fabric

* Minecraft 26.1 or newer, with a matching Fabric Loader
* Fabric API
* Simple Voice Chat 2.6.x or newer
* GeyserMC 2.10.1-SNAPSHOT or newer, for Bedrock players
* LuckPerms and Floodgate (optional)

The exact versions are in [Compatibility]({% project_link install/compatibility %}).

---

## Step 1: Install

1. Download the latest release from [Modrinth](https://modrinth.com/plugin/simplevoice-geyser) or [GitHub](https://github.com/TheodoreMeyer/SimpleVoice-Geyser/releases).
2. Put the `.jar` in `plugins/` (Paper, Purpur, Spigot) or `mods/` (Fabric).
3. Make sure Simple Voice Chat is installed. Add GeyserMC if you have Bedrock players.
4. Start or restart the server.
5. Check the console: no errors, and Simple Voice Chat loaded.

---

## Step 2: Open the ports

Players need to reach two things. Allow both in your firewall and port forwarding.

   # default: 60
   # Seconds to wait after a valid web password for the player to join Minecraft
   # (and Simple Voice Chat) before rejecting the pending join.
   vctimeout: 60

   web:
     # default: en
     # Default UI language when the visitor has no saved preference (en, nl, pl, it, es).
     default-language: en

     # default: Simple Voice Chat
     # Display name on the join page / browser title.
     server-name: "Simple Voice Chat"

     # default: empty
     # Optional short subtitle under the server name.
     tagline: ""

   # default: 2
   # idle websocket timeout in minutes
   idletimeout: 2

   # default: false
   # Only allow bedrock players to join the chat
   requireBedrock: false

   join-message:

     #default: true
     # Enables join messages for web clients.
     enabled: true

     # Default: provided below
     # The text svg sends when a player joins
     text:
       - "This Server Uses SimpleVoice-Geyser."
       - "To set it up, run /svg pswd [password],"
       - "Then join Via the server's SVG website."

   # default: true
   # Allows for the bedrock client to open a menu just by opening the emotes menu
   # WARNING: Make sure you have off-hand-emote turned off in geyser or there may
   #          be conflict
   useEmoteForSVG: true

  # default: true
  # Allows players using web-chat to chat in-game
   web-chat-enabled: true
   
updatechecker:
  enable: true

server:

   group:

      # Settings for the default group for Svg players.
      default:

         # default: true
         # This decides whether the Svg group is created for players who use the website
         enabled: true

         # default: 1a2b
         # This control's the default groups's password.
         password: 1a2b

   # default: 8080
   # port server will run on.
   port: 8080

   # default: 0.0.0.0
   # Address server binds to, use 127.0.0.1 to only connect from host device.
   # This is suggested to be changed only if you are running a proxy on the same network/device as the server to allow https/wss.
   bind-address: 0.0.0.0
   
   # default: /
   # This is the context-path, or where the root of the server will be generated.
   # Example: /svg will generate the server at https://yourdomain.com/svg/
   context-path: /
   
   security:
     
     # default: 5
     # This is the number of failed login attempts before the server will block the user for auth-lock-duration.
     max-auth-failures: 5
     
     # default: 3
     # How long each failure is saved for in minutes. 
     # Example: if set to 3, and max-auth-failures is 5, auth can fail 4 times in 3 minutes before being locked out.
     auth-fail-duration: 3

     # default: 8
     # This is the lockout in minutes when max-auth-failures has been reached.
     auth-lock-duration: 8
   
   # See more at https://theodoremeyer.github.io/projects/simplevoicegeyser/install/audio-transport/
   audio:
     
     # default: svg-v2
     # options: legacy, svg-v2
     # This is the audio transport mode, deciding how to send audio to client.
     # legacy: uses the legacy audio transport mode, which is compatible with all clients.
     # svg-v2: uses the new svg-v2 audio transport mode, which is only compatible with clients that support it.
     # WARNING: This has been deprecated, and will be changed or removed in future releases.
     transport-mode: auto
     
     # default: true
     # Whether legacy mode is supported on your server.
     # If transport-mode is set to svg-v2, can legacy still be used.
     allow-legacy-fallback: true
     

# default: false
# Debug logs
# Do NOT use this in production. This will very quickly fill up your server logs.
debug: false
# default: 0.1.3
# Version of server associated with config
# DO NOT CHANGE, or config may be reset/messed up
config-version: 0.1.3
```

### Important Notes

* `vctimeout` controls how long a pending web join waits for the player to appear in Minecraft (default 60 seconds)
* `useEmoteForSVG` may conflict with Geyser’s off-hand emote setting
* `bind-address` controls network exposure:

   * `0.0.0.0` → accessible externally
   * `127.0.0.1` → local only

---

## Step 3: Give players the address

Players need the address of the voice page. The plugin cannot know your public address, so tell them, or put it in the join message ([how]({% project_link install/config %})).

- Browsers only allow the microphone on HTTPS pages. For anything beyond your own computer, put HTTPS in front of the page. See [HTTPS and Reverse Proxies]({% project_link install/proxy %}).
- On a Velocity network, the proxy hosts the page. See [Velocity Proxy Setup]({% project_link velocity %}).

---

## Step 4: Test it

1. Join the server and run `/svg pswd <password>` (8 to 32 characters). On Paper, Purpur and Spigot, end the command with `confirm`.
2. Open the voice page, type your Minecraft name and that password, and click **Join**. Allow the microphone.
3. Ask a second player to join the same way, or a Java player with the Simple Voice Chat mod, and talk both ways.

If something fails, see [Troubleshooting]({% project_link troubleshooting %}).

---

## After setup

* Change a setting, such as who may join or the default group password: [Configuration]({% project_link install/config %}).
* Lock the setup down: [Security]({% project_link install/security %}).
* Update to a newer version: [Upgrading]({% project_link install/upgrading %}).

Players who run the Simple Voice Chat mod use the mod, not this page. Versions marked `-DEV` are not ready for production.
