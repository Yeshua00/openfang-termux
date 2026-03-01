# OpenFang

[![Download APK](https://img.shields.io/badge/Download-APK-green?style=for-the-badge&logo=android)](https://github.com/RightNow-AI/openfang-termux/releases/latest)
[![Build Flutter APK & AAB](https://github.com/RightNow-AI/openfang-termux/actions/workflows/flutter-build.yml/badge.svg)](https://github.com/RightNow-AI/openfang-termux/actions/workflows/flutter-build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Rust](https://img.shields.io/badge/language-Rust-orange?style=flat-square)](https://www.rust-lang.org/)
[![Android](https://img.shields.io/badge/Android-10%2B-brightgreen?logo=android)](https://www.android.com/)
[![Flutter](https://img.shields.io/badge/Flutter-3.24-02569B?logo=flutter)](https://flutter.dev/)

<p align="center">
  <img src="assets/ic_launcher.png" alt="OpenFang App Mockup" width="700"/>
</p>

> **v2.0: OpenFang Transmutation** — Complete rebranding from OpenClaw to Rust-based Agent Operating System with ARM64-native builds and source compilation options.

> Run **OpenFang Agent Operating System** on Android — standalone Flutter app with built-in terminal, web dashboard, autonomous Hands, and one-tap setup. Also available as a Termux CLI package.

---

## Screenshots

<table align="center">
  <tr>
    <td align="center"><img src="assets/dashboard.png" alt="Dashboard" width="220"/><br/><b>Dashboard</b></td>
    <td align="center"><img src="assets/setupscreen.png" alt="Setup" width="220"/><br/><b>Setup Wizard</b></td>
    <td align="center"><img src="assets/onboardingscreen.png" alt="Onboarding" width="220"/><br/><b>Onboarding</b></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/websscreen.png" alt="Web Dashboard" width="220"/><br/><b>Web Dashboard</b></td>
    <td align="center"><img src="assets/logscreen.png" alt="Logs" width="220"/><br/><b>Logs</b></td>
    <td align="center"><img src="assets/settingsscreen.png" alt="Settings" width="220"/><br/><b>Settings</b></td>
  </tr>
</table>

---

## What is OpenFang?

OpenFang brings the [OpenFang](https://github.com/RightNow-AI/openfang) AI gateway to Android. It sets up a full Ubuntu environment via proot and provides a native Flutter UI to manage everything — no root required.

**v2.0 Update**: Complete transmutation from OpenClaw to OpenFang Agent Operating System with Rust backend, ARM64-native builds, and optional source compilation.

OpenFang brings the [OpenFang](https://github.com/RightNow-AI/openfang) AI gateway to Android. It sets up a full Ubuntu environment via proot and provides a native Flutter UI to manage everything — no root required.

### Two Ways to Use

| | **Flutter App** (Standalone) | **Termux CLI** |
|---|---|---|
| Install | Build APK or download release | `npm install -g openfang-termux` |
| Setup | Tap "Begin Setup" | `openfangx setup` |
| Daemon | Tap "Start" | `openfangx start` |
| Terminal | Built-in terminal emulator | Termux shell |
| Dashboard | Built-in WebView (80% zoom, locked) | Browser at `localhost:4200` |

---

## Features

### Flutter App
- **One-Tap Setup** — Downloads Ubuntu rootfs and OpenFang automatically
- **Built-in Terminal** — Full terminal emulator with extra keys toolbar, copy/paste, clickable URLs
- **Gateway Controls** — Start/stop daemon with status indicator and health checks
- **Node Device Capabilities** — Expose Android hardware to AI via WebSocket node protocol
- **Token URL Display** — Captures auth token, shows it with a copy button
- **Web Dashboard** — Embedded WebView (80% zoom, locked) loads the dashboard with auth token
- **View Logs** — Real-time gateway log viewer with search/filter
- **Initialization** — Configure API keys and binding directly in-app
- **Settings** — Auto-start, battery optimization, system info, re-run setup
- **Build from Source Toggle** — Option to build OpenFang locally instead of downloading
- **Foreground Service** — Keeps the daemon alive in the background with uptime tracking
- **Setup Notifications** — Progress bar notifications during environment setup
- **One-Tap Setup** — Downloads Ubuntu rootfs and OpenFang automatically
- **Built-in Terminal** — Full terminal emulator with extra keys toolbar, copy/paste, clickable URLs
- **Gateway Controls** — Start/stop daemon with status indicator and health checks
- **Node Device Capabilities** — Expose Android hardware to AI via WebSocket node protocol
- **Token URL Display** — Captures auth token, shows it with a copy button
- **Web Dashboard** — Embedded WebView (80% zoom, locked) loads the dashboard with auth token
- **View Logs** — Real-time gateway log viewer with search/filter
- **Initialization** — Configure API keys and binding directly in-app
- **Settings** — Auto-start, battery optimization, system info, re-run setup
- **Foreground Service** — Keeps the daemon alive in the background with uptime tracking
- **Setup Notifications** — Progress bar notifications during environment setup

### Termux CLI
- **One-Command Setup** — Installs proot-distro, Ubuntu, and OpenFang
- **Smart Loading** — Shows spinner until the daemon is ready
- **Pass-through Commands** — Run any OpenFang command via `openfangx`

---

## Quick Start

### Flutter App (Recommended)

1. Download the latest APK from [Releases](https://github.com/RightNow-AI/openfang-termux/releases)
2. Install the APK on your Android device
3. Open the app and tap **Begin Setup**
4. After setup completes, configure your API keys in **Initialization**
5. Tap **Start** on the dashboard

Or build from source:

```bash
cd flutter_app
flutter build apk --release
```

### Termux CLI

#### One-liner (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/RightNow-AI/openfang-termux/main/install.sh | bash
```

#### Or via npm

```bash
npm install -g openfang-termux
openfangx setup
```

---

## Requirements

| Requirement | Details |
|-------------|---------|
| **Android** | 10 or higher (API 29) |
| **Storage** | ~300MB for Ubuntu + OpenFang |
| **Architectures** | arm64-v8a, armeabi-v7a, x86_64 |
| **Termux** (CLI only) | From [F-Droid](https://f-droid.org/packages/com.termux/) (NOT Play Store) |

---

## CLI Usage

```bash
# First-time setup (installs proot + Ubuntu + OpenFang)
openfangx setup

# Check installation status
openfangx status

# Start OpenFang daemon
openfangx start

# Run initialization to configure API keys
openfangx init

# Enter Ubuntu shell
openfangx shell

# Any OpenFang command works directly
openfangx doctor
openfangx hand list
```

---

## Architecture

```
┌───────────────────────────────────────────────────┐
│                Flutter App (Dart)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐       │
│  │ Terminal │ │ Gateway  │ │ Web Dashboard│       │
│  │ Emulator │ │ Controls │ │   (WebView)  │       │
│  └─────┬────┘ └─────┬────┘ └──────┬───────┘       │
│        │            │             │               │
│  ┌─────┴────────────┴─────────────┴─────────────┐ │
│  │           Native Bridge (Kotlin)             │ │
│  └─────────────────┬────────────────────────────┘ │
│                    │                              │
│  ┌─────────────────┴────────────────────────────┐ │
│  │         Node Provider (WebSocket)            │ │
│  │  Camera · Flash · Location · Screen          │ │
│  │  Sensor · Haptic                             │ │
│  └─────────────────┬────────────────────────────┘ │
└────────────────────┼──────────────────────────────┘
                     │
┌────────────────────┼──────────────────────────────┐
│  proot-distro     │              Ubuntu          │
│  ┌─────────────────┴──────────────────────────┐   │
│  │   OpenFang Agent OS (Rust Binary)          │   │
│  │   ┌─────────────────────────────────────┐  │   │
│  │   │  OpenFang Daemon                    │  │   │
│  │   │  http://localhost:4200               │  │   │
│  │   │  ← Hands: Autonomous Agents          │  │   │
│  │   │  ← Skills: AI Capabilities            │  │   │
│  │   └─────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────┘
```

---

## OpenFang Hands (Autonomous Agents)

OpenFang includes **7 built-in Hands** — autonomous agents that work for you:

| Hand | What It Does |
|------|-------------|
| **Clip** | YouTube video download, highlights extraction, vertical shorts generation |
| **Lead** | Daily prospect discovery, enrichment, scoring, deduplication |
| **Collector** | OSINT intelligence, change detection, knowledge graphs |
| **Predictor** | Superforecasting with confidence intervals, Brier scores |
| **Researcher** | Autonomous deep research with APA citations |
| **Twitter** | Autonomous Twitter/X account management |
| **Browser** | Web automation with purchase approval gates |

---

## Dashboard

Access the web dashboard at the token URL shown in the app (e.g. `http://localhost:4200/#token=...`).

The Flutter app automatically loads the dashboard with your auth token via the built-in WebView (80% zoom, locked).

| Command | Description |
|---------|-------------|
| `/status` | Check daemon status |
| `/think high` | Enable high-quality thinking |
| `/reset` | Reset session |

---

## Security

OpenFang includes **16 security systems**:

1. WASM Dual-Metered Sandbox
2. Merkle Hash-Chain Audit Trail
3. Information Flow Taint Tracking
4. Ed25519 Signed Agent Manifests
5. SSRF Protection
6. Secret Zeroization
7. Mutual Authentication
8. Capability Gates
9. Security Headers
10. Health Endpoint Redaction
11. Subprocess Sandbox
12. Prompt Injection Scanner
13. Loop Guard
14. Session Repair
15. Path Traversal Prevention
16. GCRA Rate Limiter

---

## Troubleshooting

### Daemon won't start

```bash
# Check status
openfangx status

# Re-run setup if needed
openfangx setup

# Make sure initialization is complete
openfangx init
```

### Process killed in background

Disable battery optimization for the app in Android settings.

---

## Manual Setup

<details>
<summary>Click to expand manual installation steps</summary>

### 1. Install proot-distro and Ubuntu

```bash
pkg update && pkg install -y proot-distro
proot-distro install ubuntu
```

### 2. Setup OpenFang in Ubuntu

```bash
proot-distro login ubuntu
apt update && apt install -y curl wget git

mkdir -p /root/.local/bin
curl -fsSL https://github.com/RightNow-AI/openfang/releases/latest/download/openfang-linux-x64.tar.gz -o /tmp/openfang.tar.gz
tar -xzf /tmp/openfang.tar.gz -C /root/.local/bin/
chmod +x /root/.local/bin/openfang

echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### 3. Run OpenFang

```bash
openfang init  # Configure API keys
openfang start  # Start daemon
```

</details>

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing-feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with Rust. Secured with 16 layers. Agents that actually work for you.</strong>
</p>
