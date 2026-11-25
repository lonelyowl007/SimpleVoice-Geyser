/**
 * Same-origin session handoff for the pop-out window.
 *
 * Password never goes in the URL. A random id is placed in the URL fragment
 * (#handoff=…); credentials live briefly in localStorage and/or travel over
 * BroadcastChannel between opener and pop-out.
 */

const CHANNEL = "svg.session.handoff.v1";
const STORAGE_PREFIX = "svg.handoff.";
const TTL_MS = 30_000;

/**
 * @returns {string}
 */
function newHandoffId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Store credentials for a pop-out and return the handoff id for the URL fragment.
 * @param {{ username?: string, password?: string }} credentials
 * @returns {string|null}
 */
export function createHandoffPayload(credentials) {
    const username = String(credentials?.username || "").trim();
    if (!username) {
        return null;
    }
    const password = String(credentials?.password || "");
    const id = newHandoffId();
    const payload = {
        username,
        password,
        exp: Date.now() + TTL_MS
    };

    try {
        localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(payload));
    } catch {
        // BroadcastChannel-only path may still work.
    }

    try {
        const bc = new BroadcastChannel(CHANNEL);
        /** @param {MessageEvent} ev */
        const onMsg = (ev) => {
            const data = ev.data;
            if (!data || data.id !== id) {
                return;
            }
            if (data.type === "ready") {
                bc.postMessage({
                    type: "creds",
                    id,
                    username,
                    password
                });
            }
            if (data.type === "ack") {
                bc.removeEventListener("message", onMsg);
                try {
                    bc.close();
                } catch {
                    // ignore
                }
            }
        };
        bc.addEventListener("message", onMsg);
        setTimeout(() => {
            try {
                bc.removeEventListener("message", onMsg);
                bc.close();
            } catch {
                // ignore
            }
            try {
                localStorage.removeItem(STORAGE_PREFIX + id);
            } catch {
                // ignore
            }
        }, TTL_MS);
    } catch {
        // ignore — localStorage path remains
    }

    return id;
}

/**
 * @returns {string|null}
 */
export function peekHandoffIdFromLocation() {
    try {
        const hash = String(window.location.hash || "").replace(/^#/, "");
        if (!hash) {
            return null;
        }
        const params = new URLSearchParams(hash);
        return params.get("handoff");
    } catch {
        return null;
    }
}

export function clearHandoffHash() {
    try {
        const url = new URL(window.location.href);
        if (!url.hash || !url.hash.includes("handoff")) {
            return;
        }
        history.replaceState(null, "", `${url.pathname}${url.search}`);
    } catch {
        // ignore
    }
}

/**
 * @param {string} id
 * @returns {{ username: string, password: string }|null}
 */
function takeStoragePayload(id) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + id);
        localStorage.removeItem(STORAGE_PREFIX + id);
        if (!raw) {
            return null;
        }
        const data = JSON.parse(raw);
        if (!data || typeof data !== "object") {
            return null;
        }
        if (Number(data.exp) < Date.now()) {
            return null;
        }
        const username = String(data.username || "").trim();
        if (!username) {
            return null;
        }
        return {
            username,
            password: String(data.password || "")
        };
    } catch {
        return null;
    }
}

/**
 * Consume a pending handoff (pop-out on load). Clears the fragment.
 * @param {number} [timeoutMs]
 * @returns {Promise<{ username: string, password: string }|null>}
 */
export function takeHandoffCredentials(timeoutMs = 8000) {
    const id = peekHandoffIdFromLocation();
    clearHandoffHash();
    if (!id) {
        return Promise.resolve(null);
    }

    const fromStorage = takeStoragePayload(id);
    if (fromStorage) {
        try {
            const bc = new BroadcastChannel(CHANNEL);
            bc.postMessage({ type: "ack", id });
            bc.close();
        } catch {
            // ignore
        }
        return Promise.resolve(fromStorage);
    }

    return new Promise((resolve) => {
        let settled = false;
        /** @type {BroadcastChannel|null} */
        let bc = null;

        const done = (creds) => {
            if (settled) {
                return;
            }
            settled = true;
            try {
                bc?.close();
            } catch {
                // ignore
            }
            resolve(creds);
        };

        const timer = setTimeout(() => done(null), timeoutMs);

        try {
            bc = new BroadcastChannel(CHANNEL);
            bc.addEventListener("message", (ev) => {
                const data = ev.data;
                if (!data || data.id !== id || data.type !== "creds") {
                    return;
                }
                clearTimeout(timer);
                const username = String(data.username || "").trim();
                if (!username) {
                    done(null);
                    return;
                }
                try {
                    bc?.postMessage({ type: "ack", id });
                } catch {
                    // ignore
                }
                done({
                    username,
                    password: String(data.password || "")
                });
            });
            bc.postMessage({ type: "ready", id });
        } catch {
            clearTimeout(timer);
            done(null);
        }
    });
}
