# 🎬 Cine Media Player (Desktop & Web)

<div align="center">

![Cine Media Player Banner](https://img.shields.io/badge/CINE-MEDIA%20PLAYER-00F0FF?style=for-the-badge&logo=film&logoColor=black)

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-43.4-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Motion-12.2-FF4154?style=flat-square&logo=framer&logoColor=white)](https://motion.dev/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-4B32C3?style=flat-square)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local%20%26%20Offline-00E676?style=flat-square&logo=shield&logoColor=white)](https://github.com/)

<p align="center">
  <strong>A modern, high-performance, cinematic desktop & web media player inspired by VLC and MPV, crafted with React 19, TypeScript, Electron, and Tailwind CSS.</strong>
</p>

[Key Features](#-features) •
[Quick Start](#-quick-start) •
[Building Desktop Installers](#-building-desktop-installers) •
[Architecture](#-architecture--internals) •
[Keyboard Shortcuts](#-keyboard-shortcuts) •
[Troubleshooting](#-troubleshooting--faq)

</div>

---

## 🌟 Stickers & Badges

```
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║   ⚡ 4K / 8K Hardware Accelerated    🎧 10-Band EQ & 200% Boost     📌 Always-On-Top Mode ║
║   📁 Native Folder Media Library     💬 SRT / VTT / ASS Subtitles   🛡️ 100% Zero Telemetry║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## ✨ Features

### 🎞️ Playback & Engine
- **Cross-Platform Playback**: Plays **MKV, MP4, WebM, MOV, AVI, M4V, and TS** video formats.
- **Custom `media://` Streaming Protocol**: High-throughput chunk streaming with HTTP 206 byte-range requests for instant seeking in huge multi-gigabyte video files.
- **Hardware Display Sleep Blocker**: Uses Electron `powerSaveBlocker` to automatically prevent display dimming, screensavers, or system idle sleep during active video playback.
- **Always-On-Top Window Pinning**: Pin the player floating above your browser, code editor, or other apps while working.
- **Audio Boost up to 200% & 10-Band Equalizer**: Built with the Web Audio API (`AudioContext`, `BiquadFilterNode`, `GainNode`) featuring presets for Rock, Pop, Classical, Bass Boost, and Vocal Clarity.
- **Frame-by-Frame Stepping**: Step forward or backward frame-by-frame with surgical precision (`.` and `,` keys).
- **Pitch-Corrected Variable Playback Speed**: From 0.25x to 3.0x with smooth incremental adjustments.

### 💬 Subtitle Engine
- **Universal Formats**: Supports external and embedded `.srt`, `.vtt`, `.ass`, `.ssa`, and `.sub` subtitles.
- **Live Time Offset / Synchronization**: Easily sync out-of-time subtitles with `[` (-50ms) and `]` (+50ms) micro-adjustments or custom offsets.
- **Custom Typography & Placement**: Configurable font size, color, background opacity, outline styling, and vertical positioning (bottom, center, top).

### 📁 Library, Playlist & History
- **Native OS Dialogs**: Deep desktop integration for opening single/multiple video files or entire directories.
- **Persistent Media Library Folders**: Save frequently watched directories (Movies, TV Shows) and rescan them at any time.
- **Auto Watch History & Resume Prompt**: Automatically saves your exact timestamp and completion status locally, offering a "Resume from where you left off" dialog when re-opened.
- **Bookmarks & Annotations**: Place colored bookmark pins on specific timestamps and jump to them instantly from the interactive timeline or marks drawer.
- **Playlist Management**: Real-time search filter, drag-and-drop reordering, title renaming, and sample movie loader.

### 🎨 UI & Aesthetics
- **Cinematic Frameless Design**: Custom dark acrylic title bar with window controls (minimize, maximize/restore, close).
- **Smart Control Auto-Hide**: Controls smoothly fade away after inactivity during video playback and reappear on mouse movement.
- **Customizable Color Themes**: Electric Cyan, Emerald, Neon Violet, Amber Gold, and Crimson Red accent colors.
- **Picture-in-Picture (PiP)**: Standard HTML5 Picture-in-Picture support.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm`, `pnpm`, `bun`, or `yarn`

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/cine-media-player.git
cd cine-media-player

# Install dependencies
npm install
```

### 2. Run in Web Development Mode

To run the web application preview server on `http://localhost:3000`:

```bash
npm run dev
```

### 3. Run in Native Desktop Mode (Electron)

To compile the Electron main & preload bundles and launch the desktop window:

```bash
# Build main & preload processes
npm run build:electron:main
npm run build:electron:preload

# Launch Electron desktop application
npm run electron
```

---

## 📦 Building Desktop Installers

To compile and package native desktop binaries for Windows, macOS, or Linux using `electron-builder`:

### Build Full Bundle

```bash
# Compiles React client + Electron main + Preload
npm run build:electron
```

### Generate Platform-Specific Packages

```bash
# Windows (NSIS Installer .exe & Portable .exe)
npx electron-builder --win

# macOS (.dmg & .zip, Universal x64 + arm64 Apple Silicon)
npx electron-builder --mac

# Linux (AppImage & .deb)
npx electron-builder --linux
```

All built installation packages will be located in the `dist-electron/` and `release/` directories.

---

## 🏗️ Architecture & Internals

```
cine-media-player/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── main.ts              # App lifecycle, single-instance lock, window creation
│   │   ├── ipc/                 # IPC handlers (dialogs, fs, window, updater, power)
│   │   ├── protocols/           # Custom media:// byte-range streaming handler
│   │   ├── menus/               # Native application menus & system tray
│   │   └── services/            # Store & watch history filesystem manager
│   ├── preload/                 # Electron Preload Bridge
│   │   ├── preload.ts           # Secure contextBridge.exposeInMainWorld()
│   │   └── types.ts             # Typed Electron API interfaces
│   ├── shared/                  # Shared Types & IPC Channel Constants
│   │   ├── constants.ts         # IPC channel name definitions
│   │   └── types.ts             # Media file info, watch history & folder types
│   ├── components/              # React UI Components
│   │   ├── VideoPlayer/         # Core video element, gesture layer & keyboard loop
│   │   ├── PlayerControls/      # Timeline, playback buttons, time displays
│   │   ├── TitleBar/            # Custom frameless title bar & window buttons
│   │   ├── AudioEffects/        # 10-band Web Audio EQ & volume booster
│   │   ├── SubtitleMenu/        # Subtitle track selector & sync offset tool
│   │   ├── Bookmarks/           # Bookmark manager & timeline pin renderer
│   │   ├── Playlist/            # Playlist panel, media library folders & search
│   │   ├── Settings/            # Multi-tab settings modal (Desktop, Audio, Theme)
│   │   └── EmptyState/          # Zero-state drag-and-drop dropzone & recent files
│   ├── services/                # Web & Electron runtime abstractions
│   │   └── electronService.ts   # Unified API bridge with web fallback
│   ├── types/                   # Frontend TypeScript interfaces
│   ├── App.tsx                  # Root application state & event orchestrator
│   └── main.tsx                 # React DOM root entry
├── index.html                   # HTML5 document template
├── vite.config.ts               # Vite configuration with Tailwind CSS plugin
├── tsconfig.json                # Strict TypeScript configuration
└── package.json                 # Build scripts & dependencies
```

### Security Architecture
- `contextIsolation: true` is strictly enforced.
- `nodeIntegration: false` prevents renderer-side arbitrary code execution.
- Sensitive Node.js APIs (`fs`, `child_process`, `dialog`) are gated through strictly typed IPC handlers in `src/main/ipc/`.
- Local media access is granted strictly through a sanitized `media://` protocol handler that validates file paths.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> / <kbd>K</kbd> | Toggle Play / Pause |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>M</kbd> | Toggle Mute |
| <kbd>←</kbd> / <kbd>→</kbd> | Jump Backward / Forward 5 seconds |
| <kbd>J</kbd> / <kbd>L</kbd> | Jump Backward / Forward 10 seconds |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Adjust Volume (+5% / -5%) |
| <kbd>[</kbd> / <kbd>]</kbd> | Decrease / Increase Subtitle Offset (±50ms) |
| <kbd>&lt;</kbd> / <kbd>&gt;</kbd> | Decrease / Increase Playback Speed |
| <kbd>0</kbd> – <kbd>9</kbd> | Seek to 0% – 90% of the video duration |
| <kbd>C</kbd> | Toggle Subtitles On / Off |
| <kbd>A</kbd> | Cycle Aspect Ratio (Original, 16:9, 4:3, 21:9, Stretch) |
| <kbd>B</kbd> | Add Bookmark at current timestamp |
| <kbd>E</kbd> | Open Audio Equalizer |
| <kbd>P</kbd> | Toggle Playlist Drawer |
| <kbd>T</kbd> | Toggle Always-on-Top (Desktop) |
| <kbd>,</kbd> / <kbd>.</kbd> | Step Previous Frame / Next Frame |
| <kbd>Esc</kbd> | Exit Fullscreen / Close Drawers & Modals |

---

## ❓ Troubleshooting & FAQ

<details>
<summary><strong>Q: Why does my MKV file have video but no audio?</strong></summary>

Some MKV files use proprietary or non-standard audio codecs (e.g. AC-3 / DTS / EAC-3) that may not be supported by standard Chromium decoders without external ffmpeg transcoders. Standard formats with AAC, MP3, Opus, or Vorbis audio tracks will play with full hardware acceleration.
</details>

<details>
<summary><strong>Q: How do I open files by double-clicking them in Windows Explorer or macOS Finder?</strong></summary>

Once packaged with `electron-builder`, Cine Media Player registers file associations for `.mp4`, `.mkv`, `.webm`, `.mov`, `.avi`, `.m4v`, and `.ts`. The application handles initial launch arguments and the macOS `open-file` event automatically.
</details>

<details>
<summary><strong>Q: Is any video or telemetry data uploaded to the internet?</strong></summary>

**No.** Cine Media Player is 100% offline-first. All media decoding, subtitles, bookmarks, equalizers, and watch histories are processed and stored locally on your machine.
</details>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ for cinephiles and developers everywhere.</sub>
</div>
