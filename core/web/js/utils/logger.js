/**
 * @import {ChatElements} from "./types.js"
 */

export class Logger {

    static handler = console.log;

    /**
     * @param {(msg: string, html?: string|null) => void} handler
     */
    static setHandler(handler) {
        Logger.handler = handler;
    }

    /**
     * @param {string} msg
     * @param {string} [html]
     */
    static log(msg, html) {
        Logger.handler(msg, html);
    }

    /**
     * @param {string} msg
     */
    static debug(msg) {
        console.log(`[DEBUG]: ` + msg);
    }
}

const TIMESTAMPS_KEY = "svg.chat.showTimestamps";

export class ChatLogger {

    /** @type {ChatElements} */
    options;

    /**
     * @param {ChatElements} options
     * @param {*} webSocketController
     */
    constructor(
        options,
        webSocketController
    ) {

        this.options = options;
        this.webSocketController =
            webSocketController;
        this.showTimestamps = this.#loadTimestampsPref();
    }

    init() {

        Logger.setHandler(
            this.handleMessage.bind(this)
        );

        this.options.logEl.replaceChildren();
        this.#applyTimestampsClass();

        const toggle = this.options.timestampsToggle;
        if (toggle) {
            toggle.checked = this.showTimestamps;
            toggle.addEventListener("change", () => {
                this.showTimestamps = !!toggle.checked;
                localStorage.setItem(TIMESTAMPS_KEY, this.showTimestamps ? "1" : "0");
                this.#applyTimestampsClass();
            });
        }

        this.options.sendBtn.addEventListener(
            "click",
            () => {

                const msg =
                    this.options.inputEl.value.trim();

                if (!msg) {
                    return;
                }

                this.webSocketController.sendChat(
                    msg
                );

                Logger.log(
                    "[You] " + msg
                );

                this.options.inputEl.value = "";
            }
        );
    }

    /**
     * @param {string} msg
     * @param {string} [html]
     */
    handleMessage(msg, html) {
        const line = document.createElement("div");
        line.className = "chatLine";

        const time = document.createElement("span");
        time.className = "chatTime";
        time.textContent = `[${new Date().toLocaleTimeString()}] `;

        const body = document.createElement("span");
        body.className = "chatBody";
        if (html) {
            body.innerHTML = html;
        } else {
            body.textContent = msg;
        }

        line.append(time, body);
        this.options.logEl.appendChild(line);
        this.options.logEl.scrollTop =
            this.options.logEl.scrollHeight;
    }

    #loadTimestampsPref() {
        const saved = localStorage.getItem(TIMESTAMPS_KEY);
        if (saved === null) {
            return true;
        }
        return saved === "1" || saved === "true";
    }

    #applyTimestampsClass() {
        this.options.logEl.classList.toggle(
            "hide-chat-timestamps",
            !this.showTimestamps
        );
    }
}
