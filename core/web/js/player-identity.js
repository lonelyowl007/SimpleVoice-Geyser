/**
 * Connected-player identity: compact MC head chip + optional full-skin sidebar.
 * Default = head chip; toggle expands a full-body panel beside the main UI.
 */

import { SvgLang } from "./utils/lang.js";

const VIEW_KEY = "svg.ui.skinView";
const FALLBACK_HEAD = "images/v2/mic.png";

/** @type {string} */
let currentName = "";
/** @type {string|null} */
let currentUuid = null;
/** @type {"head"|"full"} */
let viewMode = "head";

/**
 * @returns {"head"|"full"}
 */
function readStoredView() {
    try {
        const v = localStorage.getItem(VIEW_KEY);
        return v === "full" ? "full" : "head";
    } catch {
        return "head";
    }
}

/**
 * @param {"head"|"full"} mode
 */
function persistView(mode) {
    try {
        localStorage.setItem(VIEW_KEY, mode);
    } catch {
        // ignore
    }
}

/**
 * @param {string} name
 * @param {string|null|undefined} uuid
 * @param {"avatar"|"body"} kind
 * @param {number} size
 */
function skinUrl(name, uuid, kind, size) {
    const key = (uuid && String(uuid).trim()) || String(name || "").trim();
    if (!key) {
        return FALLBACK_HEAD;
    }
    const enc = encodeURIComponent(key);
    if (kind === "body") {
        return `https://mc-heads.net/body/${enc}/${size}`;
    }
    return `https://mc-heads.net/avatar/${enc}/${size}`;
}

/**
 * @param {HTMLImageElement|null} img
 * @param {string} url
 */
function setSkinImage(img, url) {
    if (!img) {
        return;
    }
    img.onerror = () => {
        img.onerror = null;
        img.src = FALLBACK_HEAD;
    };
    img.src = url;
}

function els() {
    return {
        chip: document.getElementById("playerIdentityChip"),
        head: /** @type {HTMLImageElement|null} */ (document.getElementById("playerIdentityHead")),
        chipName: document.getElementById("playerIdentityChipName"),
        chipPrefix: document.getElementById("playerIdentityChipPrefix"),
        statusLabel: document.querySelector('[data-svg="form.status"]'),
        sidebar: document.getElementById("playerSkinSidebar"),
        sidebarName: document.getElementById("playerSkinSidebarName"),
        sidebarPrefix: document.getElementById("playerSkinSidebarPrefix"),
        bodyImg: /** @type {HTMLImageElement|null} */ (document.getElementById("playerSkinBody")),
        stage: document.getElementById("mainStage"),
        closeBtn: document.getElementById("playerSkinSidebarClose")
    };
}

function refreshLabels() {
    const { chip, chipPrefix, sidebarPrefix, chipName, sidebarName } = els();
    const prefix = SvgLang.string("statusConnectedAsPrefix") || "Connected as";
    if (chipPrefix) {
        chipPrefix.textContent = prefix;
    }
    if (sidebarPrefix) {
        sidebarPrefix.textContent = `${prefix}:`;
    }
    if (chipName && currentName) {
        chipName.textContent = currentName;
    }
    if (sidebarName && currentName) {
        sidebarName.textContent = currentName;
    }
    if (chip) {
        chip.title = SvgLang.string("playerIdentityToggleTitle") || "Toggle full skin view";
    }
}

function refreshSkins() {
    const { head, bodyImg } = els();
    setSkinImage(head, skinUrl(currentName, currentUuid, "avatar", 48));
    setSkinImage(bodyImg, skinUrl(currentName, currentUuid, "body", 220));
}

/**
 * @param {"head"|"full"} mode
 * @param {{ animate?: boolean }} [opts]
 */
function applyView(mode, opts = {}) {
    viewMode = mode === "full" ? "full" : "head";
    persistView(viewMode);
    const { chip, sidebar, stage } = els();
    const full = viewMode === "full";
    document.body.classList.toggle("skin-sidebar-open", full);
    stage?.classList.toggle("skin-sidebar-open", full);
    sidebar?.classList.toggle("is-open", full);
    sidebar?.setAttribute("aria-hidden", full ? "false" : "true");
    chip?.setAttribute("aria-expanded", full ? "true" : "false");
    chip?.classList.toggle("is-expanded", full);
    if (!opts.animate && sidebar) {
        sidebar.classList.add("no-anim");
        requestAnimationFrame(() => sidebar.classList.remove("no-anim"));
    }
}

function toggleView() {
    applyView(viewMode === "full" ? "head" : "full", { animate: true });
}

/**
 * @param {string} username
 * @param {string|null|undefined} [uuid]
 */
export function showPlayerIdentity(username, uuid) {
    currentName = String(username || "").trim();
    if (uuid) {
        currentUuid = String(uuid).trim();
    }
    const { chip, statusLabel } = els();
    refreshLabels();
    refreshSkins();
    statusLabel?.classList.add("player-identity-hidden");
    if (chip) {
        chip.hidden = false;
        chip.classList.remove("dev-hidden");
    }
    applyView(readStoredView(), { animate: false });
}

export function hidePlayerIdentity() {
    currentName = "";
    currentUuid = null;
    const { chip, statusLabel, sidebar, stage } = els();
    if (chip) {
        chip.hidden = true;
    }
    statusLabel?.classList.remove("player-identity-hidden");
    document.body.classList.remove("skin-sidebar-open");
    stage?.classList.remove("skin-sidebar-open");
    sidebar?.classList.remove("is-open");
    sidebar?.setAttribute("aria-hidden", "true");
    viewMode = "head";
}

/**
 * Prefer UUID when groups/roster later reveals the local player.
 * @param {string|null|undefined} uuid
 */
export function setPlayerIdentityUuid(uuid) {
    const next = String(uuid || "").trim();
    if (!next || next === currentUuid) {
        return;
    }
    currentUuid = next;
    if (currentName) {
        refreshSkins();
    }
}

export function initPlayerIdentity() {
    viewMode = readStoredView();
    const { chip, closeBtn } = els();
    chip?.addEventListener("click", () => {
        if (!currentName) {
            return;
        }
        toggleView();
    });
    closeBtn?.addEventListener("click", () => applyView("head", { animate: true }));

    // Collapse on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && viewMode === "full") {
            applyView("head", { animate: true });
        }
    });
}
