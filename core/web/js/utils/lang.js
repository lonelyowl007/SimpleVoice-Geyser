// When adding a new translation, head to https://flagicons.lipis.dev/,
// Press "Download Flags", open the downloaded folder, go to flags/1x1,
// then copy the <xx>.svg country flag representing the language
// of the translation to core/src/web/css/images/flags-1x1
// and rename the file to <language code>.svg instead of <country code>.svg
// E.g. gb.svg -> en.svg
//
// Also edit core/src/main/.../server/servlets/FileManager.java
//
// extractResource(
//     "/web/images/flags-1x1/<xx>.svg",
//     "images/flags-1x1/<xx>.svg"
// );
//
// Add the above piece of code to the function "void ExtractAssets()",
// beneath all the other extractResource(...) calls.
//
// Thank You!

import {Logger} from "./logger.js";

export class SvgLang {
    static #htmlTranslation = {
        "en": {
            "joinLabel": "Join Simple Voice Chat",
            "usernameInput": "Username",
            "passwordInput": "Password",
            "micSelect": "Select Microphone",
            "speakSelect": "Select Speaker",
            "micLoad": "Loading Microphones...",
            "speakLoad": "Loading Speakers...",
            "joinBtnText": "Join",
            "joinWait": "Waiting to join...",
            "joinWaitMinecraft": "Waiting for you to join Minecraft...",
            "msgText": "Message",
            "sendBtnText": "Send",
            "transmitModeLabel": "Transmit Mode",
            "micSLabel": "Microphone",
            "muteBtnText": "Mute",
            "inputSensitivityLabel": "Input Sensitivity",
            "sensitivitySensitiveLabel": "Sensitive",
            "sensitivityLessLabel": "Less Sensitive",
            "micVolumeLabel": "Mic Volume",
            "voiceActivityText": "Voice Activation",
            "pushToTalkText": "Push-To-Talk",
            "pttBindingLabel": "PTT Binding",
            "bindPttBtnText": "Bind Push-to-Talk",
            "clearPttBtnText": "Clear Binding",
            "pttBindingDescription": "No binding set. Use the hold button or add a binding.",
            "allowBackgroundPttText": "Allow background controller PTT",
            "pttLabel": "Push-to-Talk",
            "pushToTalkBtnText": "Hold to Talk",
            "fullscreenPttBtnText": "Fullscreen PTT",
            "debugAudioLabel": "Debug Audio",
            "testSoundBtnText": "Test Sound",
            "colorEditorLabel": "Color Customization",
            "pushToTalkFullscreenBtnText": "Hold to Talk",
            "exitFullscreenPttBtnText": "Exit Fullscreen",
            "devToolsLabel": "Developer Tools"
        },
        "pl": {
            "joinLabel": "Dołącz do Simple Voice Chat",
            "usernameInput": "Nazwa użytkownika",
            "passwordInput": "Hasło",
            "micSelect": "Wybierz mikrofon",
            "speakSelect": "Wybierz głośnik",
            "micLoad": "Ładowanie mikrofonów...",
            "speakLoad": "Ładowanie głośników...",
            "joinBtnText": "Dołącz",
            "joinWait": "Oczekiwanie na połączenie...",
            "joinWaitMinecraft": "Czekam, aż dołączysz do Minecraft...",
            "msgText": "Wiadomość",
            "sendBtnText": "Wyślij",
            "transmitModeLabel": "Tryb nadawania",
            "micSLabel": "Mikrofon",
            "muteBtnText": "Wycisz",
            "inputSensitivityLabel": "Czułość wejścia",
            "sensitivitySensitiveLabel": "Czułe",
            "sensitivityLessLabel": "Mniej czułe",
            "micVolumeLabel": "Głośność mikrofonu",
            "voiceActivityText": "Aktywacja głosem",
            "pushToTalkText": "Naciśnij i mów (PTT)",
            "pttBindingLabel": "Przypisanie klawisza PTT",
            "bindPttBtnText": "Przypisz klawisz Push-to-Talk",
            "clearPttBtnText": "Usuń przypisanie klawisza",
            "pttBindingDescription": "Brak przypisanego klawisza. Użyj przycisku ekranowego lub przypisz klawisz.",
            "allowBackgroundPttText": "Zezwól na PTT na kontrolerze w tle",
            "pttLabel": "Naciśnij i mów",
            "pushToTalkBtnText": "Przytrzymaj, aby mówić",
            "fullscreenPttBtnText": "Tryb pełnoekranowy PTT",
            "debugAudioLabel": "Diagnostyka dźwięku",
            "testSoundBtnText": "Test dźwięku",
            "colorEditorLabel": "Personalizacja kolorów",
            "pushToTalkFullscreenBtnText": "Przytrzymaj, aby mówić",
            "exitFullscreenPttBtnText": "Zamknij pełny ekran",
            "devToolsLabel": "Narzędzia deweloperskie"
        },
        "it": {
            "joinLabel": "Unisciti a Simple Voice Chat",
            "usernameInput": "Nome utente",
            "passwordInput": "Password",
            "micSelect": "Seleziona microfono",
            "speakSelect": "Seleziona altoparlante",
            "micLoad": "Caricamento microfoni...",
            "speakLoad": "Caricamento altoparlanti...",
            "joinBtnText": "Connettiti",
            "joinWait": "In attesa di connessione...",
            "joinWaitMinecraft": "In attesa che entri in Minecraft...",
            "msgText": "Messaggio",
            "sendBtnText": "Invia",
            "transmitModeLabel": "Modalità di trasmissione",
            "micSLabel": "Microfono",
            "muteBtnText": "Silenzia",
            "inputSensitivityLabel": "Sensibilità ingresso",
            "sensitivitySensitiveLabel": "Sensibile",
            "sensitivityLessLabel": "Meno sensibile",
            "micVolumeLabel": "Volume microfono",
            "voiceActivityText": "Attivazione vocale",
            "pushToTalkText": "Premere per parlare (PTT)",
            "pttBindingLabel": "Assegnazione tasto PTT",
            "bindPttBtnText": "Assegna tasto Push-to-Talk",
            "clearPttBtnText": "Rimuovi assegnazione tasto",
            "pttBindingDescription": "Nessun tasto assegnato. Usa il pulsante a schermo o assegna un tasto.",
            "allowBackgroundPttText": "Consenti PTT tramite controller in background",
            "pttLabel": "Premere per parlare",
            "pushToTalkBtnText": "Tieni premuto per parlare",
            "fullscreenPttBtnText": "PTT a schermo intero",
            "debugAudioLabel": "Diagnostica audio",
            "testSoundBtnText": "Test audio",
            "colorEditorLabel": "Personalizzazione colori",
            "pushToTalkFullscreenBtnText": "Tieni premuto per parlare",
            "exitFullscreenPttBtnText": "Esci da schermo intero",
            "devToolsLabel": "Strumenti per sviluppatori"
        },
        "es": {
            "joinLabel": "Unirse Simple Voice Chat",
            "usernameInput": "Nombre de Usuario",
            "passwordInput": "Contraseña",
            "micSelect": "Elegir Micrófono",
            "speakSelect": "Elegir Altavoces",
            "micLoad": "Cargando micrófonos...",
            "speakLoad": "Cargando Altavoces...",
            "joinBtnText": "Unirse",
            "joinWait": "Esperando a unirse...",
            "joinWaitMinecraft": "Esperando a que entres a Minecraft...",
            "msgText": "Mensaje",
            "sendBtnText": "Enviar",
            "transmitModeLabel": "Modo de transmisión",
            "micSLabel": "Micrófono",
            "muteBtnText": "Silenciar",
            "inputSensitivityLabel": "Sensibilidad de entrada",
            "sensitivitySensitiveLabel": "Sensible",
            "sensitivityLessLabel": "Menos sensible",
            "micVolumeLabel": "Volumen del micrófono",
            "voiceActivityText": "Activación por voz",
            "pushToTalkText": "Pulsar para hablar",
            "pttBindingLabel": "Asignar tecla",
            "bindPttBtnText": "Asignar pulsar para hablar",
            "clearPttBtnText": "Limpiar asignación",
            "pttBindingDescription": "No se ha asignado tecla. Mantén presionado el botón o añade una tecla.",
            "allowBackgroundPttText": "Controlar pulsar para hablar en 2do plano",
            "pttLabel": "Pulsar para hablar",
            "pushToTalkBtnText": "Mantén pulsado para hablar",
            "fullscreenPttBtnText": "Pulsar para hablar",
            "debugAudioLabel": "Depurar Audio",
            "testSoundBtnText": "Probar Audio",
            "colorEditorLabel": "Personalizar Color",
            "pushToTalkFullscreenBtnText": "Mantén pulsado para hablar",
            "exitFullscreenPttBtnText": "Salir de pantalla completa",
            "devToolsLabel": "Herramientas de desarrollo"
        },
        "nl": {
            "joinLabel": "Deelnemen aan Simple Voice Chat",
            "usernameInput": "Gebruikersnaam",
            "passwordInput": "Wachtwoord",
            "micSelect": "Selecteer microfoon",
            "speakSelect": "Selecteer luidspreker",
            "micLoad": "Microfoons laden...",
            "speakLoad": "Luidsprekers laden...",
            "joinBtnText": "Deelnemen",
            "joinWait": "Wachten om deel te nemen...",
            "joinWaitMinecraft": "Wachten tot je Minecraft joint...",
            "msgText": "Bericht",
            "sendBtnText": "Versturen",
            "transmitModeLabel": "Zendmodus",
            "micSLabel": "Microfoon",
            "muteBtnText": "Dempen",
            "inputSensitivityLabel": "Ingangsgevoeligheid",
            "sensitivitySensitiveLabel": "Gevoelig",
            "sensitivityLessLabel": "Minder gevoelig",
            "micVolumeLabel": "Microfoonvolume",
            "voiceActivityText": "Spraakactivering",
            "pushToTalkText": "Push-to-Talk",
            "pttBindingLabel": "PTT-toewijzing",
            "bindPttBtnText": "Push-to-Talk binden",
            "clearPttBtnText": "Binding wissen",
            "pttBindingDescription": "Geen binding ingesteld. Gebruik de knop of voeg een binding toe.",
            "allowBackgroundPttText": "Controller-PTT op achtergrond toestaan",
            "pttLabel": "Push-to-Talk",
            "pushToTalkBtnText": "Vasthouden om te praten",
            "fullscreenPttBtnText": "Volledig scherm PTT",
            "debugAudioLabel": "Audio debuggen",
            "testSoundBtnText": "Testgeluid",
            "colorEditorLabel": "Kleuren aanpassen",
            "pushToTalkFullscreenBtnText": "Vasthouden om te praten",
            "exitFullscreenPttBtnText": "Volledig scherm verlaten",
            "devToolsLabel": "Ontwikkelaarshulpmiddelen"
        }
    };
    static #jsTranslation = {
        "en": {
            "audioFallbackDefaultReason": "Audio device APIs are unavailable.",
            "microphoneUnavailableLabel": "Microphone unavailable",
            "speakerUnavailableLabel": "Speaker unavailable",
            "microphoneIndexPrefix": "Microphone",
            "speakerIndexPrefix": "Speaker",
            "noMicrophoneDetectedLabel": "No microphones detected",
            "noSpeakerDetectedLabel": "No speakers detected",
            "joinBtnUnconnectedLabel": "Join",
            "joinBtnConnectedLabel": "Leave",
            "statusConnectedAsPrefix": "Connected as",
            "statusDisconnectedLabel": "Disconnected",
            "muteBtnUnmuteLabel": "Unmute",
            "muteBtnMuteLabel": "Mute",
            "pttBindingPrompt": "Press a key, mouse button, or controller button...",
            "pttBindingWaiting": "Waiting for input... press Escape to cancel.",
            "pttBoundTo": "Bound to {binding}",
            "pttTalkingLabel": "Talking...",
            "chatInputPlaceholder": "Type a message...",
            "alertOutdatedClient": "Outdated client. Reloading...",
            "alertFatalDisconnect": "Fatal disconnect. Reconnect disabled.",
            "alertServerShutdownPrefix": "Server shutdown:",
            "alertJoinWaitExpired": "You did not join Minecraft in time. Join the game, then try again.",
            "alertNotReconnecting": "Not reconnecting.",
            "alertUnparseable": "Unparseable, check console for more information."
        },
        "nl": {
            "audioFallbackDefaultReason": "Audio-apparaat-API's zijn niet beschikbaar.",
            "microphoneUnavailableLabel": "Microfoon niet beschikbaar",
            "speakerUnavailableLabel": "Luidspreker niet beschikbaar",
            "microphoneIndexPrefix": "Microfoon",
            "speakerIndexPrefix": "Luidspreker",
            "noMicrophoneDetectedLabel": "Geen microfoons gevonden",
            "noSpeakerDetectedLabel": "Geen luidsprekers gevonden",
            "joinBtnUnconnectedLabel": "Deelnemen",
            "joinBtnConnectedLabel": "Verlaten",
            "statusConnectedAsPrefix": "Verbonden als",
            "statusDisconnectedLabel": "Verbroken",
            "muteBtnUnmuteLabel": "Dempen opheffen",
            "muteBtnMuteLabel": "Dempen",
            "pttBindingPrompt": "Druk op een toets, muisknop of controllerknop...",
            "pttBindingWaiting": "Wachten op invoer... Escape om te annuleren.",
            "pttBoundTo": "Gebonden aan {binding}",
            "pttTalkingLabel": "Aan het praten...",
            "chatInputPlaceholder": "Typ een bericht...",
            "alertOutdatedClient": "Verouderde client. Pagina wordt herladen...",
            "alertFatalDisconnect": "Fatale verbreking. Opnieuw verbinden uitgeschakeld.",
            "alertServerShutdownPrefix": "Server uitgeschakeld:",
            "alertJoinWaitExpired": "Je bent niet op tijd Minecraft gejoined. Join de game en probeer opnieuw.",
            "alertNotReconnecting": "Er wordt niet opnieuw verbonden.",
            "alertUnparseable": "Niet te lezen, bekijk de console voor meer info."
        },
        "pl": {
            "audioFallbackDefaultReason": "API urządzeń audio są niedostępne.",
            "microphoneUnavailableLabel": "Mikrofon niedostępny",
            "speakerUnavailableLabel": "Głośnik niedostępny",
            "microphoneIndexPrefix": "Mikrofon",
            "speakerIndexPrefix": "Głośnik",
            "noMicrophoneDetectedLabel": "Nie wykryto mikrofonów",
            "noSpeakerDetectedLabel": "Nie wykryto głośników",
            "joinBtnUnconnectedLabel": "Dołącz",
            "joinBtnConnectedLabel": "Opuść",
            "statusConnectedAsPrefix": "Połączono jako",
            "statusDisconnectedLabel": "Rozłączono",
            "muteBtnUnmuteLabel": "Włącz mikrofon",
            "muteBtnMuteLabel": "Wycisz",
            "pttBindingPrompt": "Naciśnij klawisz, przycisk myszy lub kontrolera...",
            "pttBindingWaiting": "Oczekiwanie na wejście... Escape aby anulować.",
            "pttBoundTo": "Przypisano do {binding}",
            "pttTalkingLabel": "Mówisz...",
            "chatInputPlaceholder": "Wpisz wiadomość...",
            "alertOutdatedClient": "Nieaktualny klient. Przeładowywanie...",
            "alertFatalDisconnect": "Krytyczne rozłączenie. Ponowne łączenie wyłączone.",
            "alertServerShutdownPrefix": "Serwer wyłączony:",
            "alertJoinWaitExpired": "Nie dołączyłeś do Minecraft na czas. Wejdź do gry i spróbuj ponownie.",
            "alertNotReconnecting": "Brak ponownego łączenia.",
            "alertUnparseable": "Nieczytelne, sprawdź konsolę."
        },
        "it": {
            "audioFallbackDefaultReason": "Le API dei dispositivi audio non sono disponibili.",
            "microphoneUnavailableLabel": "Microfono non disponibile",
            "speakerUnavailableLabel": "Altoparlante non disponibile",
            "microphoneIndexPrefix": "Microfono",
            "speakerIndexPrefix": "Altoparlante",
            "noMicrophoneDetectedLabel": "Nessun microfono rilevato",
            "noSpeakerDetectedLabel": "Nessun altoparlante rilevato",
            "joinBtnUnconnectedLabel": "Connettiti",
            "joinBtnConnectedLabel": "Esci",
            "statusConnectedAsPrefix": "Connesso come",
            "statusDisconnectedLabel": "Disconnesso",
            "muteBtnUnmuteLabel": "Riattiva",
            "muteBtnMuteLabel": "Silenzia",
            "pttBindingPrompt": "Premi un tasto, pulsante del mouse o controller...",
            "pttBindingWaiting": "In attesa di input... Escape per annullare.",
            "pttBoundTo": "Assegnato a {binding}",
            "pttTalkingLabel": "Stai parlando...",
            "chatInputPlaceholder": "Scrivi un messaggio...",
            "alertOutdatedClient": "Client obsoleto. Ricaricamento...",
            "alertFatalDisconnect": "Disconnessione fatale. Riconnessione disabilitata.",
            "alertServerShutdownPrefix": "Server spento:",
            "alertJoinWaitExpired": "Non sei entrato in Minecraft in tempo. Entra nel gioco e riprova.",
            "alertNotReconnecting": "Riconnessione interrotta.",
            "alertUnparseable": "Non leggibile, controlla la console."
        },
        "es": {
            "audioFallbackDefaultReason": "Las APIs de dispositivos de audio no están disponibles.",
            "microphoneUnavailableLabel": "El micrófono no está disponible",
            "speakerUnavailableLabel": "Los altavoces no están disponibles",
            "microphoneIndexPrefix": "Micrófono",
            "speakerIndexPrefix": "Altavoces",
            "noMicrophoneDetectedLabel": "No se ha detectado un micrófono",
            "noSpeakerDetectedLabel": "No se ha detectado un altavoz",
            "joinBtnUnconnectedLabel": "Unirse",
            "joinBtnConnectedLabel": "Abandonar",
            "statusConnectedAsPrefix": "Conectado como",
            "statusDisconnectedLabel": "Desconectado",
            "muteBtnUnmuteLabel": "Hablar",
            "muteBtnMuteLabel": "Silenciar",
            "pttBindingPrompt": "Presiona una tecla, botón de mouse o botón de control.",
            "pttBindingWaiting": "Esperando una entrada... Presiona Esc para cancelar",
            "pttBoundTo": "Asignado a \"{binding}\"",
            "pttTalkingLabel": "Hablando...",
            "chatInputPlaceholder": "Escribe un mensaje...",
            "alertOutdatedClient": "Cliente desactualizado. Recargando...",
            "alertFatalDisconnect": "Desconexión fatal. Reconexión desactivada.",
            "alertServerShutdownPrefix": "Servidor apagado:",
            "alertJoinWaitExpired": "No entraste a Minecraft a tiempo. Entra al juego e inténtalo de nuevo.",
            "alertNotReconnecting": "No se volverá a conectar.",
            "alertUnparseable": "No se puede leer; revisa la consola."
        }
    };
    static availableLanguages = Object.keys(SvgLang.#htmlTranslation);

    static #currentLanguage;
    static get currentLanguage() {
        return SvgLang.#currentLanguage;
    }

    /** Server default from /svg-web-config.json (before localStorage / navigator). */
    static serverDefaultLanguage = null;
    static webBranding = {
        serverName: "Simple Voice Chat",
        tagline: ""
    };

    static #jsElementMap = new Map();

    /**
     * Loads public branding / default language from the plugin.
     */
    static async loadWebConfig() {
        try {
            const url = new URL("svg-web-config.json", window.location.href);
            const response = await fetch(url.href, { cache: "no-store" });
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            if (typeof data.defaultLanguage === "string" && data.defaultLanguage.trim()) {
                SvgLang.serverDefaultLanguage = data.defaultLanguage.trim().toLowerCase().slice(0, 2);
            }
            if (typeof data.serverName === "string" && data.serverName.trim()) {
                SvgLang.webBranding.serverName = data.serverName.trim();
            }
            if (typeof data.tagline === "string") {
                SvgLang.webBranding.tagline = data.tagline.trim();
            }
        } catch (error) {
            Logger.debug("Web config fetch failed; using defaults.");
        }
    }

    /**
     * Applies server name / tagline / document title to the join hero.
     */
    static applyBranding() {
        const nameEl = document.getElementById("serverNameDisplay");
        const tagEl = document.getElementById("serverTaglineDisplay");
        const name = SvgLang.webBranding.serverName || "Simple Voice Chat";
        if (nameEl) {
            nameEl.textContent = name;
        }
        if (tagEl) {
            const tagline = SvgLang.webBranding.tagline || "";
            tagEl.textContent = tagline;
            tagEl.classList.toggle("dev-hidden", !tagline);
        }
        document.title = name;
    }

    static detectLanguage() {
        let langCode = localStorage.getItem("preferredLanguage");
        if (langCode === null) {
            langCode = SvgLang.serverDefaultLanguage
                || (navigator.language || navigator.userLanguage || "en");
            langCode = String(langCode).slice(0, 2);
            SvgLang.changeLanguage(langCode, false);
            return;
        }

        SvgLang.changeLanguage(langCode, false);
    }

    static string(key) {
        return SvgLang.#jsTranslation[SvgLang.#currentLanguage]?.[key]
            ?? SvgLang.#htmlTranslation[SvgLang.#currentLanguage]?.[key]
            ?? SvgLang.#jsTranslation["en"][key]
            ?? SvgLang.#htmlTranslation["en"][key]
            ?? null;
    }

    static #setElementText(element, content) {
        if (typeof content === "string") {
            element.textContent = SvgLang.string(content);
        } else if (typeof content === "function") {
            element.textContent = content();
        } else {
            throw new TypeError("SvgLang.setElement content must be of type 'string | (() => string)'");
        }
    }

    /**
     * Set an element with some textContent involving translations.
     *
     * It automatically recomputes the text when required.
     *
     * Use it as a replacement for `element.textContent = someText`.
     *
     * @param {HTMLElement} element
     * @param {string|(() => string)} content JS translation key or no-arg string factory JS Translation Key or No-Param String-Returning Factory
     *
     * @example
     * SvgLang.setElement(el, "jsTranslationLabel");
     *
     * SvgLang.setElement(el, () =>
     *     `A factory that uses ${SvgLang.string("jsTranslationLabel")}, useful for computed strings`
     * );
     */
    static setElement(element, content) {
        SvgLang.#jsElementMap.set(element, content);
        SvgLang.#setElementText(element, content);
    }

    /**
     * @param {string} langCode
     * @param {boolean} [persist=true] write preferredLanguage to localStorage
     */
    static changeLanguage(langCode, persist = true) {
        if (!SvgLang.availableLanguages.includes(langCode)) {
            Logger.log(`Translation for country code ${langCode} unavailable... defaulting to English.`)
            langCode = "en";
        }
        SvgLang.#currentLanguage = langCode;
        if (persist) {
            localStorage.setItem("preferredLanguage", langCode);
        }

        const translation = SvgLang.#htmlTranslation[langCode];

        document.querySelectorAll("[svg-lang]").forEach(element => {
            const key = element.getAttribute("svg-lang");

            if (key in translation) {
                element.textContent = translation[key];
            }
        });

        document.querySelectorAll("[svg-lang-placeholder]").forEach(element => {
            element.setAttribute("placeholder", SvgLang.string(element.getAttribute("svg-lang-placeholder")));
        });

        for (const [element, content] of SvgLang.#jsElementMap) {
            if (!element.isConnected) {
                SvgLang.#jsElementMap.delete(element);
                continue;
            }
            SvgLang.#setElementText(element, content);
        }

        document.documentElement.lang = langCode;
    }
}
