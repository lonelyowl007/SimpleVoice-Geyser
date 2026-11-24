/**
 * Light / dark theme + compact pop-out window for the web UI.
 *
 * Priority: localStorage (svg.ui.theme) → server defaultTheme → dark
 */

const THEME_KEY = "svg.ui.theme";
const POPOUT_NAME = "svg-voice-popout";

/** @type {"dark"|"light"} */
let currentTheme = "dark";

/**
 * @param {unknown} value
 * @returns {"dark"|"light"|null}
 */
function normalizeTheme(value) {
    const t = String(value || "").trim().toLowerCase();
    if (t === "dark" || t === "light") {
        return t;
    }
    return null;
}

/**
 * @returns {"dark"|"light"|null}
 */
function readStoredTheme() {
    try {
        return normalizeTheme(localStorage.getItem(THEME_KEY));
    } catch {
        return null;
    }
}

/**
 * @param {"dark"|"light"} theme
 * @param {boolean} [persist]
 */
export function applyTheme(theme, persist = true) {
    const next = normalizeTheme(theme) || "dark";
    currentTheme = next;
    document.documentElement.setAttribute("data-theme", next);
    if (persist) {
        try {
            localStorage.setItem(THEME_KEY, next);
        } catch {
            // ignore quota / private mode
        }
    }
    syncThemeToggleButton();
}

export function getTheme() {
    return currentTheme;
}

export function toggleTheme() {
    applyTheme(currentTheme === "dark" ? "light" : "dark", true);
}

function syncThemeToggleButton() {
    const btn = document.getElementById("themeToggleBtn");
    if (!btn) {
        return;
    }
    const isDark = currentTheme === "dark";
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    btn.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );
    btn.title = isDark ? "Light mode" : "Dark mode";
    btn.dataset.theme = currentTheme;
}

/**
 * Open (or focus) a compact detached window sized for the voice UI.
 */
export function openPopoutWindow() {
    try {
        if (window.name === POPOUT_NAME || document.documentElement.classList.contains("svg-popout")) {
            return;
        }
        const url = new URL(window.location.href);
        url.searchParams.set("popout", "1");
        // Prefer a tall narrow window so it sits beside Discord / game.
        const width = Math.min(520, Math.max(380, window.screen.availWidth || 520));
        const height = Math.min(820, Math.max(640, Math.floor((window.screen.availHeight || 900) * 0.85)));
        const left = Math.max(0, Math.floor(((window.screen.availWidth || width) - width) / 2));
        const top = Math.max(0, Math.floor(((window.screen.availHeight || height) - height) / 2));
        const features = [
            `width=${width}`,
            `height=${height}`,
            `left=${left}`,
            `top=${top}`,
            "menubar=no",
            "toolbar=no",
            "location=no",
            "status=no",
            "resizable=yes",
            "scrollbars=yes"
        ].join(",");
        const popup = window.open(url.href, POPOUT_NAME, features);
        if (popup) {
            try {
                popup.focus();
            } catch {
                // ignore
            }
        }
    } catch (e) {
        console.warn("Pop-out window blocked or failed", e);
    }
}

export function isPopoutMode() {
    try {
        if (window.name === POPOUT_NAME) {
            return true;
        }
        const url = new URL(window.location.href);
        return url.searchParams.get("popout") === "1";
    } catch {
        return false;
    }
}

export function applyPopoutChrome() {
    if (!isPopoutMode()) {
        return;
    }
    document.documentElement.classList.add("svg-popout");
    document.body.classList.add("svg-popout");
    // Clean the address bar a bit (keep popout=1 so refresh stays compact).
    try {
        document.title = (document.title || "Simple Voice Chat") + " — Pop-out";
    } catch {
        // ignore
    }
}

/**
 * @param {{ defaultTheme?: string }} branding
 */
export function initTheme(branding) {
    applyPopoutChrome();

    const stored = readStoredTheme();
    const serverDefault = normalizeTheme(branding?.defaultTheme) || "dark";
    applyTheme(stored || serverDefault, !!stored);

    const themeBtn = document.getElementById("themeToggleBtn");
    themeBtn?.addEventListener("click", () => toggleTheme());

    const popoutBtn = document.getElementById("popoutBtn");
    if (popoutBtn) {
        if (isPopoutMode()) {
            popoutBtn.classList.add("dev-hidden");
            popoutBtn.setAttribute("aria-hidden", "true");
        } else {
            popoutBtn.addEventListener("click", () => openPopoutWindow());
        }
    }

    window.addEventListener("storage", (event) => {
        if (event.key !== THEME_KEY) {
            return;
        }
        const next = normalizeTheme(event.newValue) || serverDefault;
        applyTheme(next, false);
    });
}
