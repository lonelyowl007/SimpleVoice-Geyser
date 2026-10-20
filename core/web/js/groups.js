import {SvgLang} from "./utils/lang.js";

/**
 * SVC-style Groups list + create UI for the web client.
 */
export class GroupsUI {
    /**
     * @param {{
     *   listEl: HTMLElement,
     *   currentEl: HTMLElement,
     *   passwordInput: HTMLInputElement,
     *   leaveBtn: HTMLButtonElement,
     *   createNameInput?: HTMLInputElement,
     *   createPasswordInput?: HTMLInputElement,
     *   createSubmitBtn?: HTMLButtonElement,
     *   joinGroup: (name: string, password: string) => void,
     *   leaveGroup: () => void,
     *   createGroup: (name: string, password: string) => void,
     *   onCreated?: () => void
     * }} options
     */
    constructor(options) {
        this.listEl = options.listEl;
        this.currentEl = options.currentEl;
        this.passwordInput = options.passwordInput;
        this.leaveBtn = options.leaveBtn;
        this.createNameInput = options.createNameInput || null;
        this.createPasswordInput = options.createPasswordInput || null;
        this.createSubmitBtn = options.createSubmitBtn || null;
        this.joinGroup = options.joinGroup;
        this.leaveGroup = options.leaveGroup;
        this.createGroup = options.createGroup;
        this.onCreated = options.onCreated || null;
        /** @type {{ name: string, type?: string, hasPassword?: boolean }[]} */
        this.groups = [];
        /** @type {string|null} */
        this.current = null;
        /** @type {string|null} */
        this.selectedName = null;
    }

    init() {
        this.leaveBtn?.addEventListener("click", () => {
            this.leaveGroup();
        });
        this.createSubmitBtn?.addEventListener("click", () => {
            const name = String(this.createNameInput?.value || "").trim();
            if (!name) {
                this.createNameInput?.focus();
                return;
            }
            const password = String(this.createPasswordInput?.value || "");
            this.createGroup(name, password);
            if (this.createNameInput) {
                this.createNameInput.value = "";
            }
            if (this.createPasswordInput) {
                this.createPasswordInput.value = "";
            }
            this.onCreated?.();
        });
        this.render();
    }

    /**
     * @param {{ groups?: any[], current?: string|null }} data
     */
    update(data) {
        const prev = this.current;
        this.groups = Array.isArray(data?.groups) ? data.groups : [];
        const cur = data?.current;
        this.current = cur && cur !== "null" ? String(cur) : null;
        if (this.selectedName && !this.groups.some((g) => g.name === this.selectedName)) {
            this.selectedName = null;
        }
        if (this.current !== prev && this.passwordInput) {
            this.passwordInput.value = "";
        }
        this.render();
    }

    reset() {
        this.groups = [];
        this.current = null;
        this.selectedName = null;
        if (this.passwordInput) {
            this.passwordInput.value = "";
        }
        if (this.createNameInput) {
            this.createNameInput.value = "";
        }
        if (this.createPasswordInput) {
            this.createPasswordInput.value = "";
        }
        this.render();
    }

    render() {
        if (this.currentEl) {
            if (this.current) {
                SvgLang.setElement(this.currentEl, () =>
                    `${SvgLang.string("groupCurrentPrefix") || "Current:"} ${this.current}`
                );
            } else {
                SvgLang.setElement(this.currentEl, "groupNoneLabel");
            }
        }

        if (this.leaveBtn) {
            this.leaveBtn.disabled = !this.current;
            this.leaveBtn.classList.toggle("dev-hidden", !this.current);
        }

        if (!this.listEl) {
            return;
        }

        this.listEl.replaceChildren();

        if (this.groups.length === 0) {
            const empty = document.createElement("div");
            empty.className = "svcListRow svcListRowStatic";
            SvgLang.setElement(empty, "groupsEmptyLabel");
            this.listEl.appendChild(empty);
            return;
        }

        for (const group of this.groups) {
            if (!group?.name) {
                continue;
            }
            const row = document.createElement("button");
            row.type = "button";
            row.className = "svcListRow";
            if (group.name === this.current) {
                row.classList.add("selected");
            }
            if (group.name === this.selectedName) {
                row.classList.add("svcListRowFocus");
            }

            const iconWrap = document.createElement("span");
            iconWrap.className = "svcListIcon";
            const icon = document.createElement("span");
            icon.className = group.hasPassword ? "svcGroupLock" : "svcGroupOpen";
            icon.title = group.hasPassword
                ? (SvgLang.string("groupHasPasswordHint") || "Password required")
                : (SvgLang.string("groupPublicHint") || "Public");
            icon.setAttribute("aria-hidden", "true");
            iconWrap.appendChild(icon);

            const body = document.createElement("span");
            body.className = "svcListLabel mcTextStyle2";
            body.textContent = group.name;

            row.appendChild(iconWrap);
            row.appendChild(body);

            row.addEventListener("click", () => {
                this.selectedName = group.name;
                if (group.name === this.current) {
                    this.render();
                    return;
                }
                const password = this.passwordInput?.value || "";
                if (group.hasPassword && !password) {
                    this.passwordInput?.focus();
                    this.render();
                    return;
                }
                this.joinGroup(group.name, password);
            });

            this.listEl.appendChild(row);
        }
    }
}
