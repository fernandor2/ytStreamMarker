import * as fs from 'fs';
import * as path from 'path';

export function resolveBrowserPath(browserType: string, customPath?: string): string {
    if (browserType === 'custom' && customPath) {
        return customPath;
    }

    const platform = process.platform;
    const pathsToCheck: string[] = [];

    if (platform === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || '';
        const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
        const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';

        if (browserType === 'chrome' || !browserType) {
            pathsToCheck.push(
                path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
                path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
                path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe')
            );
        } else if (browserType === 'edge') {
            pathsToCheck.push(
                path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
                path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
            );
        } else if (browserType === 'brave') {
            pathsToCheck.push(
                path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
                path.join(programFilesX86, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
                path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe')
            );
        } else if (browserType === 'opera') {
            pathsToCheck.push(
                path.join(localAppData, 'Programs', 'Opera', 'launcher.exe')
            );
        } else if (browserType === 'operagx') {
            pathsToCheck.push(
                path.join(localAppData, 'Programs', 'Opera GX', 'launcher.exe')
            );
        } else if (browserType === 'vivaldi') {
            pathsToCheck.push(
                path.join(localAppData, 'Vivaldi', 'Application', 'vivaldi.exe'),
                path.join(programFiles, 'Vivaldi', 'Application', 'vivaldi.exe'),
                path.join(programFilesX86, 'Vivaldi', 'Application', 'vivaldi.exe')
            );
        }
    } else if (platform === 'darwin') {
        if (browserType === 'chrome' || !browserType) {
            pathsToCheck.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
        } else if (browserType === 'edge') {
            pathsToCheck.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
        } else if (browserType === 'brave') {
            pathsToCheck.push('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser');
        } else if (browserType === 'opera') {
            pathsToCheck.push('/Applications/Opera.app/Contents/MacOS/Opera');
        } else if (browserType === 'operagx') {
            pathsToCheck.push('/Applications/Opera GX.app/Contents/MacOS/Opera');
        } else if (browserType === 'vivaldi') {
            pathsToCheck.push('/Applications/Vivaldi.app/Contents/MacOS/Vivaldi');
        }
    }

    for (const p of pathsToCheck) {
        if (fs.existsSync(p)) {
            return p;
        }
    }

    return '';
}

import { spawn } from 'child_process';
import * as os from 'os';

export function launchBrowser(executablePath: string, port: number, isolateSession: boolean) {
    if (!executablePath) return;

    const args = [`--remote-debugging-port=${port}`];
    
    if (isolateSession) {
        const profileDir = path.join(os.homedir(), '.ytstreammarker', 'browser_profile');
        args.push(`--user-data-dir=${profileDir}`);
    }

    try {
        spawn(executablePath, args, {
            detached: true,
            stdio: 'ignore'
        }).unref();
    } catch (e) {
        console.error("Failed to spawn browser:", e);
    }
}
