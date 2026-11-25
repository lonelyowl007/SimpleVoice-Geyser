/**
 * mc-heads skin URLs with Floodgate / Bedrock support.
 *
 * Bedrock names (Floodgate prefix, usually ".") are not Mojang usernames —
 * looking them up by name yields Steve. Prefer UUID (Floodgate form) or
 * resolve via the GeyserMC global API first.
 */

export const SKIN_FALLBACK = "images/v2/mic.png";

/** @type {Map<string, string>} */
const bedrockUuidCache = new Map();

/**
 * @param {string|null|undefined} name
 * @returns {boolean}
 */
export function isBedrockUsername(name) {
    const n = String(name || "");
    // Floodgate default prefix is "."; also accept "*" used by some setups.
    return n.length > 1 && (n.charAt(0) === "." || n.charAt(0) === "*");
}

/**
 * @param {string|null|undefined} uuid
 * @returns {boolean}
 */
export function isFloodgateUuid(uuid) {
    return /^00000000-0000-0000-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(uuid || "").trim());
}

/**
 * @param {string|null|undefined} id dashed or undashed
 * @returns {string|null}
 */
export function toDashedUuid(id) {
    const hex = String(id || "").replace(/-/g, "").toLowerCase();
    if (!/^[0-9a-f]{32}$/.test(hex)) {
        return null;
    }
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Resolve the best mc-heads identifier for a player.
 * @param {string|null|undefined} name
 * @param {string|null|undefined} uuid
 * @returns {Promise<string>}
 */
export async function resolveSkinIdentifier(name, uuid) {
    const rawUuid = String(uuid || "").trim();
    if (rawUuid) {
        return toDashedUuid(rawUuid) || rawUuid;
    }

    const n = String(name || "").trim();
    if (!n) {
        return "";
    }
    if (!isBedrockUsername(n)) {
        return n;
    }

    const cacheKey = n.toLowerCase();
    if (bedrockUuidCache.has(cacheKey)) {
        return bedrockUuidCache.get(cacheKey) || n;
    }

    try {
        const prefix = n.charAt(0);
        const url =
            "https://api.geysermc.org/v2/utils/uuid/bedrock_or_java/"
            + `${encodeURIComponent(n)}?prefix=${encodeURIComponent(prefix)}`;
        const res = await fetch(url);
        if (!res.ok) {
            bedrockUuidCache.set(cacheKey, n);
            return n;
        }
        const data = await res.json();
        const dashed = toDashedUuid(data?.id);
        const key = dashed || n;
        bedrockUuidCache.set(cacheKey, key);
        return key;
    } catch {
        return n;
    }
}

/**
 * @param {string} identifier
 * @param {"avatar"|"body"} kind
 * @param {number} size
 * @returns {string}
 */
export function mcHeadsUrl(identifier, kind, size) {
    const key = String(identifier || "").trim();
    if (!key) {
        return SKIN_FALLBACK;
    }
    const enc = encodeURIComponent(key);
    if (kind === "body") {
        return `https://mc-heads.net/body/${enc}/${size}`;
    }
    return `https://mc-heads.net/avatar/${enc}/${size}`;
}
