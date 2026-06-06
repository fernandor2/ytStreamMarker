# YouTube Stream Marker - Elgato Stream Deck Plugin

A Stream Deck plugin that allows you to seamlessly insert Stream Markers in YouTube Studio while livestreaming with a single button press.

## 🚀 The Problem & Motivation
Currently, YouTube does not provide a public API endpoint or a native global hotkey to insert stream markers during a live broadcast. For content creators, this means having to manually switch windows, locate the YouTube Studio tab, and click the "Add stream marker" button—which is tedious, distracting, and ruins the flow while live.

This plugin solves that problem by using the **Chrome DevTools Protocol (CDP)**. It connects directly to your Chromium-based browser under the hood, locates your YouTube Studio livestreaming dashboard, and triggers the marker button programmatically. You never have to leave your game or main window.

## ⚙️ Actions & Features

The plugin provides two simple actions for your Stream Deck:

### 1. Open Browser
A convenient action to launch your preferred Chromium-based browser (e.g., Google Chrome, Edge, Brave) with the necessary `--remote-debugging-port` flag enabled. This step is required to ensure the browser is ready to receive commands from the plugin. 

### 2. Insert Marker
The core action. When pressed, it:
- Connects to the browser via CDP on your local network.
- Finds the active YouTube Studio tab (`studio.youtube.com/*/livestreaming`).
- Dynamically interacts with the web interface using a robust DOM inspection mechanism (matching the exact `#insert-marker-button` ID, with safe fallbacks checking exact SVG paths and i18n accessibility labels).
- Provides **dynamic visual feedback** directly on the Stream Deck key (green for success, red for error, yellow if the stream tab is not found).

## 🛠️ Configuration & Setup

Both actions share the same **Global Settings**, meaning you only need to configure them once in the Stream Deck Property Inspector.

1. **Browser:** Select your preferred Chromium browser from the dropdown. The plugin automatically locates the correct executable path on Windows and macOS.
2. **Port:** The Chrome DevTools Protocol port. The default is `9222`.
3. **Profile:** `(Recommended) Isolate session` automatically creates an independent, dedicated browser profile specifically for streaming, preventing conflicts with your daily tabs.
4. **Restart:** `Kill browser if running without CDP` forcefully closes any existing background instances of the browser before launching it to ensure the debugging port connects successfully.

## 💻 Tech Stack & Development
- **Node.js & TypeScript:** Built using the official `@elgato/streamdeck` SDK (v2).
- **chrome-remote-interface:** To interface with the browser via the Chrome DevTools Protocol.
- **Rollup:** For bundling the TypeScript code, JSON schemas, and dependencies into a lightweight, standalone Node.js executable.

### Development Setup

If you want to compile or modify the plugin yourself, you will need **Node.js (v20+)**:

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Build the plugin into the `.streamDeckPlugin` directory:
   ```bash
   npm run build
   ```
3. (Optional) Run the watch compiler for active development:
   ```bash
   npm run watch
   ```
