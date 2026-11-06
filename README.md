# 🎬 Cine Media Player (Desktop & Web)

<div align="center">

```
  ██████╗██╗███╗   ██╗███████╗    ███╗   ███╗███████╗██████╗ ██╗ █████╗ 
 ██╔════╝██║████╗  ██║██╔════╝    ████╗ ████║██╔════╝██╔══██╗██║██╔══██╗
 ██║     ██║██╔██╗ ██║█████╗      ██╔████╔██║█████╗  ██║  ██║██║███████║
 ██║     ██║██║╚██╗██║██╔══╝      ██║╚██╔╝██║██╔══╝  ██║  ██║██║██╔══██║
 ╚██████╗██║██║ ╚████║███████╗    ██║ ╚═╝ ██║███████╗██████╔╝██║██║  ██║
  ╚═════╝╚═╝╚═╝  ╚═══╝╚══════╝    ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝╚═╝  ╚═╝
```

### ⚡ *Next-Gen Cinematic Media Player Engine for Web & Desktop* ⚡

<p align="center">
  <img src="https://img.shields.io/badge/CINE-MEDIA%20PLAYER%20v2.4-00F0FF?style=for-the-badge&logo=film&logoColor=black" alt="Cine Banner"/>
</p>

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-43.4-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-10--Band_DSP-FFA000?style=for-the-badge&logo=soundcharts&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Offline-00E676?style=for-the-badge&logo=shield&logoColor=white)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-FAD02C?style=for-the-badge&logo=open-source-initiative&logoColor=black)](./LICENSE)

<p align="center">
  <strong>A modern, high-performance, cinematic desktop & web media player inspired by VLC and MPV, crafted with React 19, TypeScript, Electron, and Tailwind CSS.</strong>
</p>

[✨ Core Capabilities](#-core-capabilities) •
[🚀 Quick Start](#-quick-start--installation) •
[📦 Build & Packaging](#-building-desktop-binaries) •
[🧠 Architecture & Signal Chain](#-architecture--dsp-signal-chain) •
[🔌 IPC API Reference](#-electron-ipc-api-reference) •
[⌨️ Complete Hotkeys](#-keyboard-shortcuts--hotkeys) •
[🛠️ Troubleshooting & FAQ](#-troubleshooting--faq) •
[📄 License](#-license)

</div>

---

## 🏷️ Badges & Project Stickers

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  🎬 Cine Media Player Pro       │  ⚡ 4K / 8K Hardware Accelerated Video Decoding         │
│  🎧 10-Band EQ + 200% Gain      │  📌 Frameless Acrylic Always-on-Top Floating Window    │
│  💬 Universal Subtitle Engine   │  📁 Zero-Copy `media://` Byte-Range Streaming          │
│  🔋 Display Sleep Inhibit API   │  🛡️ 100% Offline, Zero Cloud Telemetry, Pure Local     │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Capabilities

### 🎞️ 1. Ultra-Low Latency Media Engine
- **Custom `media://` Chunk Protocol**: Custom native Electron protocol with HTTP `206 Partial Content` streaming, enabling instant multi-gigabyte video scrubbing without loading entire files into RAM.
- **Universal Format Support**: Plays **MKV, MP4, WebM, MOV, AVI, M4V, TS, OGG, and MP3** files with hardware-accelerated video rendering.
- **Frame-by-Frame Precision**: Surgical stepping controls (`.` for forward frame, `,` for previous frame) with sub-second accuracy.
- **Pitch-Corrected Time Stretch**: Variable playback speed from `0.25x` to `3.0x` with Web Audio pitch preservation.
- **Dynamic Aspect Ratio Transformer**: Seamlessly toggle between **Native Source, 16:9 Cinema, 4:3 Vintage, 21:9 Ultra-Wide, and Fill/Stretch**.

### 🎧 2. Studio-Grade 10-Band Equalizer & Gain Booster
- **Web Audio API DSP Pipeline**: Intercepts video audio through real-time `BiquadFilterNode` cascades.
- **Frequencies**: `32Hz`, `64Hz`, `125Hz`, `250Hz`, `500Hz`, `1kHz`, `2kHz`, `4kHz`, `8kHz`, `16kHz`.
- **Pre-Amplifier Volume Boost**: Boost quiet audio tracks up to **200% (+6dB)** with soft clipping prevention.
- **Built-in Presets**:
  - 🎸 **Rock**: Boosted lows (64Hz) and sharp presence (4kHz–8kHz)
  - 🎷 **Pop**: Punchy upper bass and crisp vocal clarity
  - 🎻 **Classical**: Extended dynamic range with warm mid-lows
  - 🔊 **Bass Boost**: Aggressive sub-bass shelf below 125Hz
  - 🗣️ **Vocal Clarity**: Attenuated mud frequencies (250Hz) and boosted speech bands (1kHz–4kHz)
  - 🌙 **Night Mode**: Compressed dynamic range for late-night viewing

### 💬 3. Universal Subtitle Engine & Live Sync
- **Format Support**: External and embedded `.srt`, `.vtt`, `.ass`, `.ssa`, and `.sub` parsing.
- **Real-Time Timing Offset**: Calibrate desynchronized subtitle files with micro-step shortcut hotkeys (`[` for -50ms, `]` for +50ms).
- **Typography & Styling**: Customize subtitle font size, color palette, background backdrop opacity, edge outline thickness, and screen positioning (bottom, center, top).

### 📁 4. Native OS Desktop Integration
- **Frameless Acrylic Titlebar**: Custom drag-region titlebar with minimize, maximize/restore, and close buttons.
- **Power Save Blocker**: Interacts with the OS kernel via Electron `powerSaveBlocker` to inhibit screen sleep and screensaver timeouts during video playback.
- **Always-on-Top Floating Mode**: Keeps Cine Player pinned above IDEs, spreadsheets, or browser windows.
- **Media Library Folders**: Save whole movie and series folders on your filesystem with recursive scanner support.
- **Smart Watch History & Resume Point**: Records exact video playback timestamps locally; prompts to resume upon reopening.
- **Timestamp Bookmarking**: Tag key scenes with colorful pins and jump across them on the interactive timeline.

---

---

## 🚀 Installation & Setup Guide

### 📋 Prerequisites & System Requirements
| Requirement | Minimum | Recommended |
| :--- | :--- | :--- |
| **Node.js** | `v20.0.0` (LTS) | `v22.0.0+` |
| **Package Manager** | `npm` v9+ or `yarn` / `pnpm` / `bun` | `npm` v10+ |
| **Linux Build Tools** (for packaging `.deb`) | `dpkg`, `fakeroot`, `binutils` | Standard `build-essential` |
| **RAM** | 2 GB | 8 GB+ (for 4K HDR playback & packaging) |
| **OS** | Linux (Ubuntu/Debian/Mint/Fedora/Arch), Windows 10/11, macOS 11+ | 64-bit Linux / Windows / macOS |

#### Linux Build Dependencies (Ubuntu / Debian / Linux Mint):
To build native Linux packages (`.deb`, `AppImage`), ensure the standard utilities are installed:
```bash
sudo apt update
sudo apt install -y build-essential libnotify4 libxtst6 libnss3 libasound2 libgbm1
```

---

### 💻 Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cine-media-player.git
cd cine-media-player
```

#### 2. Install Project Dependencies
```bash
npm install
```

#### 3. Run in Web Development Mode (Vite Preview)
To test and develop the player interface in your web browser:
```bash
npm run dev
```
> The development server will launch at **`http://localhost:3000`**.

#### 4. Run Desktop Application (Electron Live Mode)
To launch the native desktop player window locally:
```bash
# Step A: Build frontend & main/preload Electron bundles
npm run build:electron

# Step B: Start the Electron desktop app
npm run electron
```

---

## 🏗️ How to Build & Create `.deb` / Executable Packages

Cine Media Player is powered by **`esbuild`** for sub-second TypeScript compilation and **`electron-builder`** for production desktop binary packaging.

### 🐧 Creating a Debian / Ubuntu `.deb` Package

To generate a ready-to-distribute `.deb` installer for Debian, Ubuntu, Linux Mint, Pop!_OS, and Kali:

#### Option 1: Fast One-Step Build & Package
Run the dedicated `.deb` distribution script:
```bash
npm run dist:deb
```

#### Option 2: Step-by-Step Manual Execution
If you prefer building each stage individually:
```bash
# 1. Compile the React + Vite frontend and Electron processes
npm run build:electron

# 2. Package specifically for Debian .deb
npx electron-builder --linux deb
```

#### 🎯 Output Location:
The generated `.deb` package will be placed in the `release/` directory:
```
release/
├── cine-media-player_0.0.0_amd64.deb    <-- Debian package installer
├── linux-unpacked/                      <-- Unpacked binary directory
└── builder-effective-config.yaml
```

#### 📥 How to Install the Generated `.deb` on Ubuntu / Debian:

Once built, you can install Cine Media Player system-wide using `apt` or `dpkg`:

```bash
# Method A: Using apt (recommended, automatically resolves dependencies)
sudo apt install ./release/cine-media-player_*_amd64.deb

# Method B: Using dpkg
sudo dpkg -i ./release/cine-media-player_*_amd64.deb
sudo apt install -f   # Fix any missing dependencies if needed
```

#### 🚀 Launching the Installed App:
- From application menu: Search for **"Cine Media Player"** in your desktop environment (GNOME, KDE, XFCE).
- From terminal:
  ```bash
  cine-media-player
  ```

#### 🗑️ Uninstalling the `.deb`:
```bash
sudo apt remove cine-media-player
```

---

### 📦 Building for Other Formats and Operating Systems

| Target | Command | Output File |
| :--- | :--- | :--- |
| **Linux `.deb` Package** | `npm run dist:deb` | `release/*.deb` |
| **Linux `AppImage` (Portable)** | `npm run dist:appimage` | `release/*.AppImage` |
| **All Linux Formats** (`.deb` + `AppImage` + `.tar.gz`) | `npm run dist:linux` | `release/*` |
| **Windows Installer** (`.exe` NSIS) | `npm run dist:win` | `release/*.exe` |
| **macOS Package** (`.dmg` Universal) | `npm run dist:mac` | `release/*.dmg` |
| **All Default Platforms** | `npm run dist` | `release/*` |

#### Specific Architecture Target (e.g. ARM64 / Raspberry Pi / Apple Silicon):
```bash
# Build .deb for ARM64:
npx electron-builder --linux deb --arm64

# Build .deb for x86_64 / amd64:
npx electron-builder --linux deb --x64
```

---

## 🧠 Architecture & DSP Signal Chain

### High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RENDERER PROCESS (Vite / React)                 │
│                                                                        │
│   ┌──────────────┐    ┌──────────────┐    ┌────────────────────────┐   │
│   │ VideoPlayer  │    │ SubtitleSync │    │ AudioEqualizer (10-Band│   │
│   │ (HTML5/Media)│    │ (SRT/VTT/ASS)│    │  BiquadFilter Pipeline)│   │
│   └──────┬───────┘    └──────┬───────┘    └───────────┬────────────┘   │
│          │                   │                        │                │
│          └───────────────────┴────────────────────────┘                │
│                                  │ (window.electronAPI)                │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │  ContextBridge IPC (ContextIsolated)
┌──────────────────────────────────┼─────────────────────────────────────┐
│                                  │                                     │
│                     PRELOAD BRIDGE (preload.cjs)                       │
│     Safely exposed typed methods & event subscriber unlisteners        │
│                                  │                                     │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │  IPC Channels (invoke / send)
┌──────────────────────────────────┼─────────────────────────────────────┐
│                     ELECTRON MAIN PROCESS (main.cjs)                   │
│                                                                        │
│   ┌────────────────────┐  ┌───────────────────┐  ┌─────────────────┐   │
│   │ media:// Protocol  │  │ Window Manager    │  │ PowerSaveBlocker│   │
│   │ (206 Byte Ranges)  │  │ (Frameless/Pin)   │  │ (Display Sleep) │   │
│   └─────────┬──────────┘  └─────────┬─────────┘  └────────┬────────┘   │
│             │                       │                     │            │
│   ┌─────────┴──────────┐  ┌─────────┴─────────┐  ┌────────┴────────┐   │
│   │ OS File Dialogs    │  │ Watch History JSON│  │ Tray & App Menu │   │
│   │ (Files / Folders)  │  │ Persistence Store │  │ (Native Events) │   │
│   └────────────────────┘  └───────────────────┘  └─────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Web Audio API Signal Chain

```
[ <video> HTML5 Media Source ]
              │
              ▼
    [ MediaElementSourceNode ]
              │
              ▼
    [ BiquadFilter 32 Hz ]  (Low Shelf)
              │
              ▼
    [ BiquadFilter 64 Hz ]  (Peaking)
              │
              ▼
    [ BiquadFilter 125 Hz ] (Peaking)
              │
              ▼
    [ BiquadFilter 250 Hz - 8 kHz ] (Peaking x 6)
              │
              ▼
    [ BiquadFilter 16 kHz ] (High Shelf)
              │
              ▼
    [ PreAmp GainNode ]     (0% – 200% Gain Multiplier)
              │
              ▼
 [ AudioDestinationNode (Speakers / Headphones) ]
```

---

## 🔌 Electron IPC API Reference

The renderer process securely communicates with the Electron main process via `window.electronAPI`:

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `openFileDialog(options?)` | `OpenDialogOptions` | `Promise<MediaFileInfo[]>` | Opens native OS file picker for media files. |
| `openFolderDialog()` | `none` | `Promise<FolderOpenResult>` | Opens native OS directory picker and recursively scans media. |
| `getFileInfo(filePath)` | `filePath: string` | `Promise<MediaFileInfo>` | Returns file size, MIME type, parsed name, and `media://` URL. |
| `minimizeWindow()` | `none` | `Promise<void>` | Minimizes the desktop window. |
| `maximizeWindow()` | `none` | `Promise<void>` | Toggles window maximize / unmaximize state. |
| `closeWindow()` | `none` | `Promise<void>` | Closes and terminates the player window. |
| `setAlwaysOnTop(flag)` | `flag: boolean` | `Promise<void>` | Pins/unpins window floating over other applications. |
| `getAlwaysOnTop()` | `none` | `Promise<boolean>` | Returns the current always-on-top state. |
| `setPowerSaveBlocker(active)` | `active: boolean` | `Promise<boolean>` | Inhibits OS display sleep during playback. |
| `saveWatchHistory(item)` | `WatchHistoryItem` | `Promise<void>` | Persists resume position, duration, and completion status. |
| `getWatchHistory()` | `none` | `Promise<WatchHistoryItem[]>` | Retrieves stored historical playback points. |
| `addLibraryFolder(path, name?)` | `string, string?` | `Promise<LibraryFolder>` | Registers a directory to persistent library. |
| `removeLibraryFolder(id)` | `id: string` | `Promise<void>` | Removes a registered directory from library. |
| `checkForUpdates()` | `none` | `Promise<UpdateStatus>` | Checks update server for new releases. |
| `onFileOpened(callback)` | `(filePath) => void` | `() => void` | Listens for OS double-click or CLI file open events. |
| `onMenuAction(callback)` | `(action) => void` | `() => void` | Subscribes to native application menu clicks. |

---

## ⌨️ Keyboard Shortcuts & Hotkeys

| Key | Context | Action Description |
| :---: | :---: | :--- |
| <kbd>Space</kbd> / <kbd>K</kbd> | Global | Toggle Play / Pause |
| <kbd>F</kbd> | Global | Toggle Fullscreen Mode |
| <kbd>M</kbd> | Global | Toggle Audio Mute |
| <kbd>←</kbd> / <kbd>→</kbd> | Global | Jump Backward / Forward 5 seconds |
| <kbd>J</kbd> / <kbd>L</kbd> | Global | Jump Backward / Forward 10 seconds |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Global | Volume Up / Down (+5% / -5%) |
| <kbd>[</kbd> / <kbd>]</kbd> | Subtitle | Subtitle Delay Sync Adjust (-50ms / +50ms) |
| <kbd>&lt;</kbd> / <kbd>&gt;</kbd> | Speed | Decrease / Increase Playback Speed (0.25x – 3x) |
| <kbd>0</kbd> – <kbd>9</kbd> | Timeline | Seek to percentage of video (0% to 90%) |
| <kbd>,</kbd> / <kbd>.</kbd> | Precision | Step Previous Frame / Next Frame |
| <kbd>C</kbd> | Subtitle | Toggle Subtitles On / Off |
| <kbd>A</kbd> | Display | Cycle Aspect Ratio (Original, 16:9, 4:3, 21:9, Stretch) |
| <kbd>B</kbd> | Bookmark | Add Bookmark Pin at current playback timestamp |
| <kbd>E</kbd> | Audio | Open 10-Band Equalizer & Gain Modal |
| <kbd>P</kbd> | Playlist | Toggle Playlist & Media Library Drawer |
| <kbd>T</kbd> | Window | Toggle Always-on-Top Mode (Desktop only) |
| <kbd>Esc</kbd> | UI | Exit Fullscreen / Dismiss Active Dialogs |

---

## 🛠️ Troubleshooting & FAQ

<details>
<summary><strong>1. Why is video audio silent on certain MKV files?</strong></summary>

Certain MKV video containers embed proprietary surround codecs such as **DTS, Dolby TrueHD, or AC-3**. Chromium's native decoder does not bundle proprietary decoders by default. Videos encoded with **AAC, AC3/EAC3 (supported in modern builds), MP3, Opus, FLAC, or Vorbis** play seamlessly.
</details>

<details>
<summary><strong>2. Why are subtitles not showing up?</strong></summary>

Make sure your subtitle file is in `.srt`, `.vtt`, or `.ass` format and UTF-8 encoded. If subtitles are desynchronized from the audio dialogue, press <kbd>[</kbd> or <kbd>]</kbd> to adjust the offset in 50ms increments.
</details>

<details>
<summary><strong>3. How does the Always-On-Top window mode work?</strong></summary>

Pressing <kbd>T</kbd> or toggling "Always On Top" in Settings > Desktop instructs Electron's native `BrowserWindow.setAlwaysOnTop(true, 'floating')` API to maintain Z-order priority over all other active desktop windows.
</details>

<details>
<summary><strong>4. Can I use this in standard web browsers without Electron?</strong></summary>

**Yes!** Cine Player has a built-in isomorphic abstraction layer. In web mode, drag-and-drop file ingestion, Web Audio EQ, local storage history, and HTML5 video streaming work out-of-the-box in Chrome, Firefox, Safari, and Edge.
</details>

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit your Changes**: `git commit -m 'feat: Add amazing feature'`
4. **Push to the Branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.

```
Copyright (c) 2026 Cine Media Player Contributors
```

<div align="center">
  <sub>Engineered with precision for movie enthusiasts, audio engineers, and developers.</sub>
</div>
