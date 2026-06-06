import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { GlobalSettings } from "../settings";
import { resolveBrowserPath, launchBrowser } from "../browser-resolver";

@action({ UUID: "com.fernandor.ytstreammarker.openbrowser" })
export class OpenBrowserAction extends SingletonAction {
    override async onWillAppear(ev: WillAppearEvent) {
        await this.updateState(ev.action, 'idle');
    }

    override async onKeyDown(ev: KeyDownEvent) {
        const settings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
        const path = resolveBrowserPath(settings.browserType || 'chrome', settings.browserPath);
        const port = settings.cdpPort || 9222;

        if (!path) {
            await this.updateState(ev.action, 'error');
            setTimeout(() => this.updateState(ev.action, 'idle'), 2000);
            return;
        }

        try {
            launchBrowser(path, port, settings.isolateSession || false);
            await this.updateState(ev.action, 'success');
        } catch (e) {
            console.error("Failed to start browser", e);
            await this.updateState(ev.action, 'error');
        }

        setTimeout(() => this.updateState(ev.action, 'idle'), 2000);
    }

    private async updateState(actionInstance: any, state: 'idle' | 'success' | 'error') {
        let color = '#333333';
        if (state === 'success') color = '#28a745';
        else if (state === 'error') color = '#dc3545';

        const svg = `data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144"><rect width="144" height="144" fill="${color}" /><circle cx="72" cy="72" r="40" fill="none" stroke="%23ffffff" stroke-width="8" /><path d="M 32 72 L 112 72 M 72 32 L 72 112 M 45 45 C 60 72 60 72 45 99 M 99 45 C 84 72 84 72 99 99" stroke="%23ffffff" stroke-width="6" fill="none" /></svg>`;
        await actionInstance.setImage(svg);
    }
}
