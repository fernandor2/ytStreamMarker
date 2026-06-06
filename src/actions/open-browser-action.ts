import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { spawn } from "child_process";
import { GlobalSettings } from "../settings";

@action({ UUID: "com.fernandor.ytstreammarker.openbrowser" })
export class OpenBrowserAction extends SingletonAction {
    override async onWillAppear(ev: WillAppearEvent) {
        await this.updateState(ev.action, 'idle');
    }

    override async onKeyDown(ev: KeyDownEvent) {
        const settings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
        const path = settings.browserPath;
        const port = settings.cdpPort || 9222;

        if (!path) {
            await this.updateState(ev.action, 'error');
            setTimeout(() => this.updateState(ev.action, 'idle'), 2000);
            return;
        }

        try {
            spawn(path, [`--remote-debugging-port=${port}`], {
                detached: true,
                stdio: 'ignore'
            }).unref();
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

        const svg = `data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144"><rect width="144" height="144" fill="${color}" /><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif" dy=".3em">Browser</text></svg>`;
        await actionInstance.setImage(svg);
    }
}
