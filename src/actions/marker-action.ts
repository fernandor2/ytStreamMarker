import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { insertStreamMarker, MarkerResult } from "../browser-manager";
import { GlobalSettings } from "../settings";

@action({ UUID: "com.fernandor.ytstreammarker.addmarker" })
export class MarkerAction extends SingletonAction {

    override async onWillAppear(ev: WillAppearEvent) {
        await this.updateState(ev.action, 'idle');
    }

    override async onKeyDown(ev: KeyDownEvent) {
        const settings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
        
        const path = settings.browserPath || '';
        const port = settings.cdpPort || 9222;
        const forceKill = settings.forceKill || false;

        // Visual feedback that we are trying
        await this.updateState(ev.action, 'idle', true);

        const result = await insertStreamMarker(path, port, forceKill);
        await this.updateState(ev.action, result);

        // Reset state after 3 seconds
        setTimeout(() => {
            this.updateState(ev.action, 'idle');
        }, 3000);
    }

    private async updateState(actionInstance: any, state: MarkerResult | 'idle', isProcessing: boolean = false) {
        // Generate SVG colors: Gray (idle), Green (success), Yellow (no_stream), Red (error)
        let color = '#333333';
        if (isProcessing) color = '#555555';
        else if (state === 'success') color = '#28a745';
        else if (state === 'no_stream') color = '#ffc107';
        else if (state === 'error') color = '#dc3545';

        const svg = `data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144"><rect width="144" height="144" fill="${color}" /><path d="M 46 114 L 46 46 Q 46 34 58 34 L 86 34 Q 98 34 98 46 L 98 114 L 72 98 Z" fill="none" stroke="%23ffffff" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" /></svg>`;
        
        await actionInstance.setImage(svg);
    }
}
