import CDP from 'chrome-remote-interface';
import { spawn, execSync } from 'child_process';
import http from 'http';

export type MarkerResult = 'success' | 'no_stream' | 'error';

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function isPortOpen(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${port}/json/version`, (res) => {
            res.on('data', () => {});
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

function killBrowserProcess(executablePath: string) {
    try {
        const pathParts = executablePath.split(/[\/\\]/);
        const processName = pathParts[pathParts.length - 1];
        if (processName) {
            if (process.platform === 'win32') {
                execSync(`taskkill /IM "${processName}" /F`, { stdio: 'ignore' });
            } else {
                execSync(`pkill -f "${processName}"`, { stdio: 'ignore' });
            }
        }
    } catch (e) {
        // Ignored, might not be running or no permission
    }
}

export async function insertStreamMarker(executablePath: string, port: number = 9222, forceKill: boolean = false): Promise<MarkerResult> {
    try {
        let isOpen = await isPortOpen(port);

        if (!isOpen) {
            if (forceKill && executablePath) {
                killBrowserProcess(executablePath);
                await delay(1000); // Give it time to close
            }

            if (!executablePath) {
                console.error("Browser executable path is not configured.");
                return 'error';
            }

            spawn(executablePath, [`--remote-debugging-port=${port}`], {
                detached: true,
                stdio: 'ignore'
            }).unref();

            // Wait for browser to start CDP
            let retries = 10;
            while (retries > 0 && !isOpen) {
                await delay(500);
                isOpen = await isPortOpen(port);
                retries--;
            }

            if (!isOpen) {
                console.error("Failed to start browser with CDP");
                return 'error';
            }
        }

        const targets = await CDP.List({ host: '127.0.0.1', port });
        const streamTab = targets.find((t: any) => t.url && t.url.includes('studio.youtube.com') && t.url.includes('livestreaming'));

        if (!streamTab) {
            // Open YT Studio if not found
            await CDP.New({ host: '127.0.0.1', port, url: 'https://studio.youtube.com' });
            return 'no_stream';
        }

        const client = await CDP({ target: streamTab, host: '127.0.0.1', port });
        try {
            const { Runtime } = client;
            await Runtime.enable();

            const expression = `
                (() => {
                    // Primary invariant: ID selector
                    let markerBtn = document.querySelector('#insert-marker-button');

                    // Fallback: Check all buttons for the exact SVG path or i18n text
                    if (!markerBtn) {
                        const buttons = Array.from(document.querySelectorAll('div[role="button"], ytcp-button, button, ytcp-icon-button'));
                        markerBtn = buttons.find(b => {
                            const pathEl = b.querySelector('path');
                            if (pathEl) {
                                const d = pathEl.getAttribute('d');
                                // Check for the bookmark marker path
                                if (d && d.startsWith('M19 2H5a2 2 0 00-2 2v16.887')) {
                                    return true;
                                }
                            }
                            
                            const aria = (b.getAttribute('aria-label') || '').toLowerCase();
                            const text = (b.textContent || '').toLowerCase();
                            return (aria.includes('marker') || aria.includes('marcador')) ||
                                   (text.includes('marker') || text.includes('marcador'));
                        });
                    }

                    if (markerBtn) {
                        markerBtn.click();
                        return true;
                    }
                    return false;
                })();
            `;
            
            const result = await Runtime.evaluate({ expression, awaitPromise: true, returnByValue: true });
            
            if (result.result.value) {
                return 'success';
            } else {
                console.error("Marker button not found on page.");
                return 'error';
            }
        } finally {
            await client.close();
        }

    } catch (e) {
        console.error("Error inserting marker", e);
        return 'error';
    }
}
