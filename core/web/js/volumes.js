import {SvgLang} from "./utils/lang.js";
import {
    getPrefs,
    getVolumeRows,
    onVolumesChange,
    setMaster,
    setOther,
    setOtherMuted,
    setPlayer,
    setPlayerMuted
} from "./audio/receive-volumes.js";

const DEFAULT_AVATAR = "images/v2/mic.png";

/**
 * SVC-style Adjust Volumes panel (Overall / Other / players).
 */
export class AdjustVolumesUI {
    /**
     * @param {{
     *   root: HTMLElement,
     *   listEl: HTMLElement,
     *   searchInput: HTMLInputElement
     * }} els
     */
    constructor(els) {
        this.root = els.root;
        this.listEl = els.listEl;
        this.searchInput = els.searchInput;
        this._search = "";
        this._unsub = null;
    }

    init() {
        this.searchInput.addEventListener("input", () => {
            this._search = String(this.searchInput.value || "").trim().toLowerCase();
            this.render();
        });
        this._unsub = onVolumesChange(() => this.render());
        this.render();
    }

    destroy() {
        if (this._unsub) {
            this._unsub();
            this._unsub = null;
        }
    }

    render() {
        const prefs = getPrefs();
        const rows = getVolumeRows().filter((row) => {
            if (row.kind !== "player") {
                return true;
            }
            if (!this._search) {
                return true;
            }
            return row.name.toLowerCase().includes(this._search);
        });

        this.listEl.replaceChildren();

        for (const row of rows) {
            this.listEl.appendChild(this.#buildRow(row, prefs));
        }
    }

    /**
     * @param {{ key: string, kind: string, uuid: string|null, name: string }} row
     * @param {import("./audio/receive-volumes.js").VolumePrefs|ReturnType<typeof getPrefs>} prefs
     */
    #buildRow(row, prefs) {
        const entry = row.kind === "master"
            ? { percent: prefs.master, muted: false }
            : row.kind === "other"
                ? prefs.other
                : (prefs.players[row.uuid] || { percent: 100, muted: false });

        const rowEl = document.createElement("div");
        rowEl.className = "volumeRow flexRowContainer fullWidth";
        rowEl.dataset.volumeKey = row.key;

        const avatar = document.createElement("img");
        avatar.className = "volumeAvatar";
        avatar.alt = "";
        avatar.width = 32;
        avatar.height = 32;
        if (row.kind === "player" && row.uuid) {
            avatar.src = `https://mc-heads.net/avatar/${row.uuid}/32`;
            avatar.onerror = () => {
                avatar.onerror = null;
                avatar.src = DEFAULT_AVATAR;
            };
        } else if (row.kind === "other") {
            avatar.src = DEFAULT_AVATAR;
            avatar.classList.add("volumeAvatarOther");
        } else {
            avatar.src = DEFAULT_AVATAR;
            avatar.classList.add("volumeAvatarMaster");
        }
        rowEl.appendChild(avatar);

        const body = document.createElement("div");
        body.className = "volumeRowBody fullWidth";

        const nameEl = document.createElement("span");
        nameEl.className = "mcTextStyle1 volumeName textAlignLeft";
        if (row.kind === "master") {
            SvgLang.setElement(nameEl, "volumeOverallLabel");
        } else if (row.kind === "other") {
            SvgLang.setElement(nameEl, "volumeOtherLabel");
        } else {
            nameEl.textContent = row.name;
        }
        body.appendChild(nameEl);

        const ampLabel = document.createElement("span");
        ampLabel.className = "mcTextStyle1 volumeAmpLabel textAlignLeft";
        const percent = entry.percent;
        const updateAmpLabel = (p) => {
            SvgLang.setElement(ampLabel, () =>
                `${SvgLang.string("volumeAmplificationPrefix")}${Math.round(p)}%`
            );
        };
        updateAmpLabel(percent);
        body.appendChild(ampLabel);

        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "micRangeSlider volumeSlider";
        slider.min = "0";
        slider.max = "200";
        slider.value = String(percent);
        slider.disabled = !!entry.muted && row.kind !== "master";
        slider.setAttribute(
            "aria-label",
            row.kind === "master"
                ? "Overall volume"
                : row.kind === "other"
                    ? "Other volume"
                    : `Volume ${row.name}`
        );
        slider.addEventListener("input", () => {
            const value = Number(slider.value) || 0;
            updateAmpLabel(value);
            const silent = { notify: false };
            if (row.kind === "master") {
                setMaster(value, silent);
            } else if (row.kind === "other") {
                setOther(value, prefs.other.muted, silent);
            } else {
                setPlayer(row.uuid, value, entry.muted, silent);
            }
        });
        body.appendChild(slider);
        rowEl.appendChild(body);

        if (row.kind !== "master") {
            const muteBtn = document.createElement("button");
            muteBtn.type = "button";
            muteBtn.className = "mcButtonStyleInner mcTextStyle2 volumeMuteBtn";
            muteBtn.classList.toggle("muted", !!entry.muted);
            SvgLang.setElement(muteBtn, () =>
                entry.muted
                    ? SvgLang.string("volumeUnmuteBtn")
                    : SvgLang.string("volumeMuteBtn")
            );
            muteBtn.addEventListener("click", () => {
                const next = !entry.muted;
                if (row.kind === "other") {
                    setOtherMuted(next);
                } else {
                    setPlayerMuted(row.uuid, next);
                }
            });
            const muteWrap = document.createElement("div");
            muteWrap.className = "mcButtonStyle volumeMuteWrap";
            muteWrap.appendChild(muteBtn);
            rowEl.appendChild(muteWrap);
        }

        return rowEl;
    }
}
