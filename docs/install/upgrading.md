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

## Best Practices

- Test upgrades in a staging environment
- Read changelogs before updating
- Avoid upgrading production servers blindly

---

## DEV Builds

- `-DEV` versions are experimental
- Expect breaking changes
- Not recommended for production use