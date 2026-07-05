# WhatsApp for Linux

(More of a vibecoded project than a practical one, to get some native app feel on linux)


A fully featured WhatsApp desktop wrapper for Linux, built with Electron. Since WhatsApp doesn't provide a native Linux app, this wrapper delivers a native-like experience around WhatsApp Web with system tray integration, desktop notifications, custom theming, and more.

![WhatsApp Wrapper](assets/icons/icon_512x512.png)

## ✨ Features

- 🌐 **WhatsApp Web** — Full WhatsApp Web experience in a dedicated window
- 🔔 **Desktop Notifications** — Native Linux notifications (GNOME, KDE, etc.)
- 📌 **System Tray** — Minimize to tray with unread message badge
- 🌙 **Dark Mode** — Force dark/light theme override
- 🎨 **Custom Accent Color** — Personalize the app's accent color
- ⌨️ **Keyboard Shortcuts** — Quick actions (see table below)
- 🔒 **Media Permissions** — Camera & microphone for voice/video calls
- 💾 **Persistent Settings** — All preferences saved across sessions
- 🖥️ **Always on Top** — Pin window above others
- ✏️ **Spell Check** — Built-in spell checking support
- 📝 **Custom CSS** — Inject your own styles into WhatsApp Web
- 🪟 **Window State** — Remembers position, size, and maximized state
- 🔗 **External Links** — Opens links in your system browser

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- npm (comes with Node.js)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/yourusername/whatsapp-wrapper.git
cd whatsapp-wrapper

# Install dependencies
npm install

# Start the app
npm start
```

### Build for Distribution

```bash
# Build AppImage (universal Linux)
npm run dist:appimage

# Build .deb package (Debian/Ubuntu)
npm run dist:deb

# Build all
npm run dist
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle dark mode |
| `Ctrl+Shift+T` | Toggle always on top |
| `Ctrl+,` | Open settings |
| `F11` | Toggle fullscreen |
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |

## ⚙️ Settings

Access settings via:
- System tray → Settings
- Keyboard shortcut `Ctrl+,`

Available settings:
- **Close to tray** — Keep running in background when closed
- **Start minimized** — Launch directly to system tray
- **Always on top** — Pin window above all others
- **Spell check** — Enable/disable spell checking
- **Theme** — System / Dark / Light
- **Accent color** — Custom color picker
- **Custom CSS** — Advanced styling injection

## 🏗️ Tech Stack

- **Electron** — Cross-platform desktop app framework (Chromium-based)
- **electron-store** — Persistent settings storage
- **electron-builder** — Packaging and distribution

## 📁 Project Structure

```
whatsapp-wrapper/
├── main.js                    # Electron main process
├── preload.js                 # Secure context bridge
├── package.json               # Dependencies & scripts
├── electron-builder.yml       # Build/packaging config
├── src/
│   ├── tray.js               # System tray management
│   ├── notifications.js      # Notification interception
│   ├── theme.js              # CSS injection & theming
│   ├── settings.js           # Settings store
│   ├── settings-window.html  # Settings UI
│   └── settings-window.js    # Settings renderer logic
├── assets/
│   ├── icons/                # App & tray icons
│   └── whatsapp-wrapper.desktop
└── scripts/
    └── generate-icons.js     # Icon generation utility
```

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.
