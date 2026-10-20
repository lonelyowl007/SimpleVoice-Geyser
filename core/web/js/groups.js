import {SvgLang} from "./utils/lang.js";

/**
 * SVC-style Groups list UI for the web client.
 */
export class GroupsUI {
    /**
     * @param {{
     *   listEl: HTMLElement,
     *   currentEl: HTMLElement,
     *   passwordInput: HTMLInputElement,
     *   leaveBtn: HTMLButtonElement,
     *   joinGroup: (name: string, password: string) => void,
     *   leaveGroup: () => void
     * }} options
     */
    constructor(options) {
        this.listEl = options.listEl;
        this.currentEl = options.currentEl;
        this.passwordInput = options.passwordInput;
        this.leaveBtn = options.leaveBtn;
        this.joinGroup = options.joinGroup;
        this.leaveGroup = options.leaveGroup;
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
            empty.className = "svcListRow";
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
            icon.setAttribute("aria-hidden", "true");
            const check = document.createElement("span");
            check.className = "svcListCheck";
            iconWrap.appendChild(icon);
            iconWrap.appendChild(check);

            const body = document.createElement("span");
            body.className = "svcListLabel mcTextStyle2";
            body.textContent = group.name;

            const type = document.createElement("span");
            type.className = "svcGroupType mcTextStyle1";
            type.textContent = String(group.type || "OPEN").toUpperCase();

            row.appendChild(iconWrap);
            row.appendChild(body);
            row.appendChild(type);

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
