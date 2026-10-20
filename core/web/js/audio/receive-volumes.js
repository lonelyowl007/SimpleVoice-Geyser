/**
 * Per-player / master receive volume prefs (localStorage) + roster merge for Adjust Volumes UI.
 */

const STORAGE_KEY = "svgReceiveVolumes_v1";

/** @typedef {{ percent: number, muted: boolean }} VolumeEntry */
/** @typedef {{ master: number, other: VolumeEntry, players: Record<string, VolumeEntry> }} VolumePrefs */
/** @typedef {{ uuid: string, name: string }} RosterPlayer */

/** @type {VolumePrefs} */
let prefs = loadPrefs();

/** @type {Map<string, string>} uuid -> name from server roster */
const rosterNames = new Map();

/** @type {Map<string, string>} uuid -> name from recently heard frames (fallback label) */
const heardNames = new Map();

/** @type {Set<() => void>} */
const changeListeners = new Set();

function defaultPrefs() {
    return {
        master: 100,
        other: { percent: 100, muted: false },
        players: {}
    };
}

function clampPercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return 100;
    }
    return Math.max(0, Math.min(200, Math.round(n)));
}

function normalizeEntry(raw) {
    if (!raw || typeof raw !== "object") {
        return { percent: 100, muted: false };
    }
    return {
        percent: clampPercent(raw.percent),
        muted: !!raw.muted
    };
}

/** @returns {VolumePrefs} */
function loadPrefs() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return defaultPrefs();
        }
        const parsed = JSON.parse(raw);
        const players = {};
        if (parsed?.players && typeof parsed.players === "object") {
            for (const [uuid, entry] of Object.entries(parsed.players)) {
                players[String(uuid)] = normalizeEntry(entry);
            }
        }
        return {
            master: clampPercent(parsed?.master ?? 100),
            other: normalizeEntry(parsed?.other),
            players
        };
    } catch {
        return defaultPrefs();
    }
}

/** @param {boolean} [notify] */
function persist(notify = true) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        // quota / private mode — ignore
    }
    if (!notify) {
        return;
    }
    for (const listener of changeListeners) {
        try {
            listener();
        } catch {
            // ignore UI listener errors
        }
    }
}

/**
 * @param {string|null|undefined} uuid
 * @returns {number} linear gain multiplier (0 when muted)
 */
export function getEffectiveGain(uuid) {
    const master = clampPercent(prefs.master) / 100;
    /** @type {VolumeEntry} */
    let entry;
    if (uuid && prefs.players[uuid]) {
        entry = prefs.players[uuid];
    } else {
        entry = prefs.other;
    }
    if (entry.muted) {
        return 0;
    }
    return master * (clampPercent(entry.percent) / 100);
}

/**
 * Multiply samples in-place by user receive gain.
 * @param {Float32Array} samples
 * @param {string|null|undefined} uuid null = Other bucket (svg-v2 without sender)
 * @returns {Float32Array}
 */
export function applyUserGain(samples, uuid) {
    return multiplySamples(samples, getEffectiveGain(uuid));
}

/**
 * Legacy PCM path: master volume only (no per-player / Other).
 * @param {Float32Array} samples
 * @returns {Float32Array}
 */
export function applyMasterGainOnly(samples) {
    return multiplySamples(samples, clampPercent(prefs.master) / 100);
}

/** @param {Float32Array} samples @param {number} gain */
function multiplySamples(samples, gain) {
    if (!samples || samples.length === 0) {
        return samples;
    }
    if (gain === 1) {
        return samples;
    }
    if (gain === 0) {
        samples.fill(0);
        return samples;
    }
    for (let i = 0; i < samples.length; i++) {
        samples[i] *= gain;
    }
    return samples;
}

/** @returns {VolumePrefs} */
export function getPrefs() {
    return {
        master: prefs.master,
        other: { ...prefs.other },
        players: { ...prefs.players }
    };
}

/**
 * @param {number} percent
 * @param {{ notify?: boolean }} [opts] notify=false avoids full UI re-render while dragging
 */
export function setMaster(percent, opts = {}) {
    prefs.master = clampPercent(percent);
    persist(opts.notify !== false);
}

/**
 * @param {number} percent
 * @param {boolean} [muted]
 * @param {{ notify?: boolean }} [opts]
 */
export function setOther(percent, muted, opts = {}) {
    prefs.other = {
        percent: clampPercent(percent),
        muted: muted === undefined ? prefs.other.muted : !!muted
    };
    persist(opts.notify !== false);
}

/**
 * @param {string} uuid
 * @param {number} percent
 * @param {boolean} [muted]
 * @param {{ notify?: boolean }} [opts]
 */
export function setPlayer(uuid, percent, muted, opts = {}) {
    if (!uuid) {
        return;
    }
    const prev = prefs.players[uuid] || { percent: 100, muted: false };
    prefs.players[uuid] = {
        percent: clampPercent(percent === undefined ? prev.percent : percent),
        muted: muted === undefined ? prev.muted : !!muted
    };
    persist(opts.notify !== false);
}

/** @param {string} uuid @param {boolean} muted */
export function setPlayerMuted(uuid, muted) {
    if (!uuid) {
        setOther(prefs.other.percent, muted);
        return;
    }
    const prev = prefs.players[uuid] || { percent: 100, muted: false };
    prefs.players[uuid] = { percent: prev.percent, muted: !!muted };
    persist();
}

/** @param {boolean} muted */
export function setOtherMuted(muted) {
    prefs.other = { percent: prefs.other.percent, muted: !!muted };
    persist();
}

/**
 * @param {Array<{uuid?: string, name?: string}>|null|undefined} players
 */
export function setRoster(players) {
    rosterNames.clear();
    if (!Array.isArray(players)) {
        notifyUiOnly();
        return;
    }
    for (const p of players) {
        const uuid = String(p?.uuid || "").trim();
        if (!uuid) {
            continue;
        }
        const name = String(p?.name || uuid).trim() || uuid;
        rosterNames.set(uuid, name);
    }
    notifyUiOnly();
}

/**
 * @param {string|null|undefined} uuid
 * @param {string} [fallbackName]
 */
export function noteHeard(uuid, fallbackName) {
    if (!uuid) {
        return;
    }
    if (!heardNames.has(uuid)) {
        heardNames.set(uuid, fallbackName || uuid.slice(0, 8));
        notifyUiOnly();
    }
}

/**
 * Rows for the Adjust Volumes list: Overall + Other + merged players.
 * @returns {Array<{ key: string, kind: 'master'|'other'|'player', uuid: string|null, name: string }>}
 */
export function getVolumeRows() {
    /** @type {Array<{ key: string, kind: 'master'|'other'|'player', uuid: string|null, name: string }>} */
    const players = [];
    const seen = new Set();
    for (const [uuid, name] of rosterNames) {
        seen.add(uuid);
        players.push({ key: uuid, kind: "player", uuid, name });
    }
    for (const [uuid, name] of heardNames) {
        if (seen.has(uuid)) {
            continue;
        }
        players.push({ key: uuid, kind: "player", uuid, name });
    }
    players.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    // Master (Voice Chat Volume) lives in Settings; Other stays in prefs without a UI row.
    return players;
}

/** @param {() => void} listener */
export function onVolumesChange(listener) {
    changeListeners.add(listener);
    return () => changeListeners.delete(listener);
}

function notifyUiOnly() {
    for (const listener of changeListeners) {
        try {
            listener();
        } catch {
            // ignore
        }
    }
}
