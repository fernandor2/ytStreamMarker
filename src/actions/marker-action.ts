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

        const svg = `data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144"><rect width="144" height="144" fill="${color}" /><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif" dy=".3em">Marker</text></svg>`;
        
        await actionInstance.setImage(svg);
    }
}
