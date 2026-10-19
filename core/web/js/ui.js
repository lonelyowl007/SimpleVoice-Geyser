import {Logger} from "./utils/logger.js";
import {SvgLang} from "./utils/lang.js";
import {PttController} from "./ptt.js";
import {SvgAudio} from "./audio/audio.js";
import {AdjustVolumesUI} from "./volumes.js";

/**
 * @import {SvgUIOptions} from "./utils/internal-types.js"
 * @import {PttElements} from "./utils/types.js"
 */

const VAD_SLIDER_KEY = "svgVadSensitivity";
const GAIN_SLIDER_KEY = "svgMicGainPercent";
/** Energy display reference (RMS²-ish scale via sqrt). */
const ENERGY_DISPLAY_REF = 0.0005;

export class SvgUI {

    /** @type {import("./utils/types.js").FormElements} */
    form;
    /** @type {import("./utils/types.js").AudioElements} */
    audio;

    /** @type {import("./utils/types.js").PttElements} */
    ptt;


    /**
     * @param {SvgUIOptions} options
     */
    constructor(options = {}) {
        this.webSocketController = options.webSocketController;
        this.audioRuntime = options.audioRuntime;
        this.audioController = options.audioController;

        this.form = options.form;
        this.audio = options.audio;
        this.ptt = options.ptt;

        this.pttController = null;
        this._lastVadStart = SvgAudio.DEFAULT_VAD_START;
    }

    /**
     * Map sensitivity slider (1=most sensitive … 100=least) to VAD thresholds.
     * Midpoint 50 keeps the historical defaults.
     * @param {number} slider
     * @returns {{start: number, stop: number}}
     */
    static sensitivityToThresholds(slider) {
        const clamped = Math.max(1, Math.min(100, Number(slider) || 50));
        const t = (clamped - 1) / 99;
        const mult = 0.25 * Math.pow(16, t); // 0.25 … 4
        const start = SvgAudio.DEFAULT_VAD_START * mult;
        const stop = start * 0.5;
        return { start, stop };
    }

    setSelectUnavailable(select, label) {
        select.innerHTML = "";

        const option = document.createElement("option");
        option.disabled = true;
        option.selected = true;
        SvgLang.setElement(option, label);

        select.appendChild(option);
        select.disabled = true;
    }

    async populateAudioDevices() {
        const { micSelect, speakerSelect } = this.audio;

        const {
            microphones,
            speakers,
            available,
            reason
        } = await this.audioController.getAudioDevices();

        micSelect.innerHTML = "";
        speakerSelect.innerHTML = "";

        if (!available) {
            const fallbackReason =
                reason || SvgLang.string("audioFallbackDefaultReason");

            this.setSelectUnavailable(
                micSelect,
                "microphoneUnavailableLabel"
            );

            this.setSelectUnavailable(
                speakerSelect,
                "speakerUnavailableLabel"
            );

            Logger.log(`[Audio] ${fallbackReason}`);
            return;
        }

        for (const mic of microphones) {
            const option = document.createElement("option");

            option.value = mic.deviceId;
            const micIndex = micSelect.options.length + 1;
            SvgLang.setElement(option,
                () => mic.label ||
                    `${SvgLang.string("microphoneIndexPrefix")} ${micIndex}`
            );

            micSelect.appendChild(option);
        }

        for (const speaker of speakers) {
            const option = document.createElement("option");

            option.value = speaker.deviceId;
            const speakerIndex = speakerSelect.options.length + 1;
            SvgLang.setElement(option,
                () => speaker.label ||
                    `${SvgLang.string("speakerIndexPrefix")} ${speakerIndex}`
            );

            speakerSelect.appendChild(option);
        }

        if (microphones.length === 0) {
            this.setSelectUnavailable(
                micSelect,
                "noMicrophoneDetectedLabel"
            );
        } else {
            micSelect.disabled = false;
        }

        if (speakers.length === 0) {
            this.setSelectUnavailable(
                speakerSelect,
                "noSpeakerDetectedLabel"
            );
        } else {
            speakerSelect.disabled = false;
        }

        const savedMic = localStorage.getItem("preferredMic");
        const savedSpeaker = localStorage.getItem("preferredSpeaker");

        if (savedMic &&
            microphones.some(d => d.deviceId === savedMic)
        ) {
            micSelect.value = savedMic;
        }

        if (savedSpeaker &&
            speakers.some(d => d.deviceId === savedSpeaker)
        ) {
            speakerSelect.value = savedSpeaker;

            await this.audioController.setOutputDevice(savedSpeaker);
        }
    }

    async init() {

        const {
            formEl,
            joinButton,
            statusEl,
            usernameInput,
            passwordInput
        } = this.form;

        const {
            speakerSelect,
            micSelect,
            muteBtn,
            micIndicator,
            vadEnergyBar,
            vadMarker,
            vadSlider,
            gainSlider,
            gainValueLabel,
            volumesRoot,
            volumesSearch,
            volumesList
        } = this.audio;

        const {
            micCard,
            transmitModeSelect,
            pttCard,
            pttBindingControls,
            bindPttBtn,
            clearPttBtn,
            pttBindingLabel,
            pttControls,
            pushToTalkBtn,
            fullscreenPttBtn,
            pttFullscreenOverlay,
            pushToTalkFullscreenBtn,
            exitFullscreenPttBtn,
            allowBackgroundPttCheckbox
        } = this.ptt;

        this.audioController.setMicIndicator(micIndicator);
        this.#initMicSettingsControls({
            vadEnergyBar,
            vadMarker,
            vadSlider,
            gainSlider,
            gainValueLabel
        });

        this.adjustVolumesUI = new AdjustVolumesUI({
            root: volumesRoot,
            listEl: volumesList,
            searchInput: volumesSearch
        });
        this.adjustVolumesUI.init();

        try {
            await this.populateAudioDevices();
            Logger.log("Audio devices loaded successfully.");
        } catch (error) {
            console.error(error);
            Logger.log("Failed to load audio devices.");
        }

        if (navigator.mediaDevices &&
            typeof navigator.mediaDevices.addEventListener === "function"
        ) {

            navigator.mediaDevices.addEventListener(
                "devicechange",
                async () => {

                    try {
                        await this.populateAudioDevices();

                        Logger.log(
                            "Audio device list refreshed."
                        );
                    } catch (error) {
                        console.error(error);

                        Logger.log(
                            "Failed to refresh audio devices."
                        );
                    }
                }
            );
        }

        this.pttController =
            new PttController( /** @type {PttElements} */{
                micCard: micCard,
                transmitModeSelect: transmitModeSelect,
                pttCard: pttCard,
                pttBindingControls: pttBindingControls,
                bindPttBtn: bindPttBtn,
                clearPttBtn: clearPttBtn,
                pttBindingLabel: pttBindingLabel,
                pttControls: pttControls,
                pushToTalkBtn: pushToTalkBtn,
                fullscreenPttBtn: fullscreenPttBtn,
                pttFullscreenOverlay: pttFullscreenOverlay,
                pushToTalkFullscreenBtn: pushToTalkFullscreenBtn,
                exitFullscreenPttBtn: exitFullscreenPttBtn,
                allowBackgroundPttCheckbox: allowBackgroundPttCheckbox
            });

        this.pttController.init();

        this.audioController.setTransmitModeProvider(
            () =>
                this.pttController.isPttMode()
                    ? "ptt"
                    : "voice"
        );

        this.audioController.setPttActiveProvider(
            () =>
                this.pttController.isPttActive()
        );

        formEl.addEventListener("submit", async e => {
                e.preventDefault();

                // During pending wait OR after full join: Join button cancels / leaves.
                if (this.webSocketController.isConnected()) {
                    this.webSocketController.disconnect();
                    this.audioController.stopMic();
                    this.pttController.reset();
                    document.body.classList.remove("pending-minecraft-join");
                    SvgLang.setElement(joinButton, "joinBtnUnconnectedLabel");
                    return;
                }

                this.webSocketController.connect(usernameInput.value,
                    passwordInput.value,

                    async (status) => {
                        if (status.waitingForMinecraft) {
                            document.body.classList.add("pending-minecraft-join");
                            document.body.classList.remove("connected");
                            SvgLang.setElement(statusEl, "joinWaitMinecraft");
                            statusEl.classList.remove("connected");
                            statusEl.classList.add("disconnected");
                            SvgLang.setElement(joinButton, "joinBtnCancelWaitLabel");
                            return;
                        }

                        if (status.connected) {
                            document.body.classList.remove("pending-minecraft-join");

                            SvgLang.setElement(statusEl,
                                () => `${SvgLang.string("statusConnectedAsPrefix")} ${status.username}`
                            );
                            statusEl.classList.remove("disconnected");
                            statusEl.classList.add("connected");
                            SvgLang.setElement(joinButton, "joinBtnConnectedLabel");
                            micSelect.disabled = true;
                            speakerSelect.disabled = true;
                            const runtime = this.audioController.getAudioRuntime();

                            if (runtime.canCaptureMic) {

                                try {
                                    await this.audioController.startMic(micSelect.value);
                                } catch (error) {
                                    console.error(error);

                                    Logger.log(
                                        "Failed to start microphone. Receive/chat still available."
                                    );
                                }
                            } else {

                                Logger.log(
                                    "[Audio] Mic capture unsupported in this browser/context. Joined in compatibility mode."
                                );
                            }
                        } else {
                            document.body.classList.remove("pending-minecraft-join");
                            SvgLang.setElement(statusEl, "statusDisconnectedLabel");
                            statusEl.classList.remove("connected");
                            statusEl.classList.add("disconnected");
                            micSelect.disabled = false;
                            speakerSelect.disabled = false;
                            this.pttController.reset();
                            SvgLang.setElement(joinButton, "joinBtnUnconnectedLabel");
                        }
                    }
                );
            }
        );

        muteBtn.addEventListener("click",
            () => {

                const muted = this.audioController.toggleMute();

                this.pttController.setMuted(muted);

                SvgLang.setElement(muteBtn,
                    () => muted
                        ? SvgLang.string("muteBtnUnmuteLabel")
                        : SvgLang.string("muteBtnMuteLabel")
                );

                muteBtn.classList.toggle("muted", muted);

                muteBtn.classList.toggle("unmuted", !muted);
            }
        );

        speakerSelect.addEventListener("change",
            async () => {

                localStorage.setItem(
                    "preferredSpeaker",
                    speakerSelect.value
                );

                await this.audioController.setOutputDevice(
                    speakerSelect.value
                );
            }
        );

        micSelect.addEventListener("change",
            async () => {

                localStorage.setItem("preferredMic", micSelect.value);

                if (this.webSocketController.isConnected()) {
                    const runtime = this.audioController.getAudioRuntime();

                    if (!runtime.canCaptureMic) {
                        Logger.debug(
                            "[Audio] Mic capture unavailable, cannot switch microphone."
                        );
                        return;
                    }

                    this.audioController.stopMic();

                    await this.audioController.startMic(
                        micSelect.value
                    );
                }
            }
        );

        const runtime =
            this.audioRuntime ||
            this.audioController.getAudioRuntime();

        if (runtime?.degradedReason) {
            Logger.log(
                `[Audio] ${runtime.degradedReason}`
            );
        }
    }

    /**
     * Wire sensitivity / mic-volume sliders, energy meter, and localStorage.
     * @param {{
     *   vadEnergyBar: HTMLElement,
     *   vadMarker: HTMLElement,
     *   vadSlider: HTMLInputElement,
     *   gainSlider: HTMLInputElement,
     *   gainValueLabel: HTMLElement
     * }} els
     */
    #initMicSettingsControls(els) {
        const {
            vadEnergyBar,
            vadMarker,
            vadSlider,
            gainSlider,
            gainValueLabel
        } = els;

        const savedSensitivity = Number(localStorage.getItem(VAD_SLIDER_KEY));
        vadSlider.value = String(
            Number.isFinite(savedSensitivity)
                ? Math.max(1, Math.min(100, savedSensitivity))
                : 50
        );

        const savedGainPercent = Number(localStorage.getItem(GAIN_SLIDER_KEY));
        gainSlider.value = String(
            Number.isFinite(savedGainPercent)
                ? Math.max(50, Math.min(200, savedGainPercent))
                : 100
        );

        const applySensitivity = () => {
            const { start, stop } = SvgUI.sensitivityToThresholds(Number(vadSlider.value));
            this._lastVadStart = start;
            this.audioController.setVadThreshold(start, stop);
            localStorage.setItem(VAD_SLIDER_KEY, vadSlider.value);
            this.#updateVadMarker(vadMarker, start);
        };

        const applyGain = () => {
            const percent = Number(gainSlider.value) || 100;
            gainValueLabel.textContent = `${Math.round(percent)}%`;
            this.audioController.setInputGain(percent / 100);
            localStorage.setItem(GAIN_SLIDER_KEY, String(Math.round(percent)));
        };

        vadSlider.addEventListener("input", applySensitivity);
        gainSlider.addEventListener("input", applyGain);

        applySensitivity();
        applyGain();

        this.audioController.setEnergyCallback((energy) => {
            this.#updateVadEnergyBar(vadEnergyBar, energy);
        });
    }

    /**
     * @param {HTMLElement} marker
     * @param {number} startThreshold
     */
    #updateVadMarker(marker, startThreshold) {
        const pct = Math.min(
            100,
            (Math.sqrt(Math.max(0, startThreshold)) / Math.sqrt(ENERGY_DISPLAY_REF)) * 100
        );
        marker.style.left = `${pct}%`;
    }

    /**
     * @param {HTMLElement} bar
     * @param {number} energy
     */
    #updateVadEnergyBar(bar, energy) {
        const pct = Math.min(
            100,
            (Math.sqrt(Math.max(0, energy)) / Math.sqrt(ENERGY_DISPLAY_REF)) * 100
        );
        bar.style.width = `${pct}%`;
        const over = energy >= this._lastVadStart;
        bar.style.background = over ? "#55c233" : "#8a8a8a";
    }
}