/**
 * SVC-style screen router for the connected UI (hub / settings / volumes / devices).
 */
export class ScreenRouter {
    /**
     * @param {HTMLElement} root element with data-active-screen
     */
    constructor(root) {
        this.root = root;
        this.stack = ["hub"];
    }

    /** @returns {string} */
    current() {
        return this.stack[this.stack.length - 1] || "hub";
    }

    /**
     * @param {string} name
     * @param {{ push?: boolean }} [opts]
     */
    show(name, opts = {}) {
        const push = opts.push !== false;
        if (!name) {
            return;
        }
        if (push) {
            if (this.current() !== name) {
                this.stack.push(name);
            }
        } else {
            this.stack[this.stack.length - 1] = name;
        }
        this.root.dataset.activeScreen = name;
        this.root.querySelectorAll("[data-screen]").forEach((panel) => {
            const active = panel.getAttribute("data-screen") === name;
            panel.classList.toggle("svcScreenActive", active);
            panel.setAttribute("aria-hidden", active ? "false" : "true");
        });
    }

    back() {
        if (this.stack.length > 1) {
            this.stack.pop();
        }
        this.show(this.current(), { push: false });
    }

    reset() {
        this.stack = ["hub"];
        this.show("hub", { push: false });
    }

    /**
     * Wire open/back buttons inside root.
     * @param {{
     *   openSettings?: HTMLElement|null,
     *   openGroups?: HTMLElement|null,
     *   openCreateGroup?: HTMLElement|null,
     *   hubVolumesIcon?: HTMLElement|null,
     *   openMic?: HTMLElement|null,
     *   openSpeaker?: HTMLElement|null
     * }} buttons
     */
    bind(buttons = {}) {
        buttons.openSettings?.addEventListener("click", () => this.show("settings"));
        buttons.openGroups?.addEventListener("click", () => this.show("groups"));
        buttons.openCreateGroup?.addEventListener("click", () => this.show("create-group"));
        buttons.hubVolumesIcon?.addEventListener("click", () => this.show("volumes"));
        buttons.openMic?.addEventListener("click", () => this.show("mic"));
        buttons.openSpeaker?.addEventListener("click", () => this.show("speaker"));

        this.root.querySelectorAll("[data-screen-back]").forEach((btn) => {
            btn.addEventListener("click", () => this.back());
        });

        this.reset();
    }
}
