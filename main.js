const {
  app,
  BrowserWindow,
  shell,
  session,
  globalShortcut,
  ipcMain,
  nativeImage,
  Menu,
} = require("electron");
const path = require("path");
const { createTray, updateTrayBadge } = require("./src/tray");
const { setupNotifications } = require("./src/notifications");
const { settings } = require("./src/settings");
const { injectTheme } = require("./src/theme");

// Keep global references to prevent garbage collection
let mainWindow = null;
let tray = null;
let isQuitting = false;

// WhatsApp Web URL
const WHATSAPP_URL = "https://web.whatsapp.com";

// Chrome user agent — WhatsApp Web requires Chromium
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Create the main application window
 */
function createMainWindow() {
  // Restore saved window state
  const windowState = settings.get("windowState", {
    width: 1200,
    height: 800,
    x: undefined,
    y: undefined,
    isMaximized: false,
  });

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 400,
    minHeight: 300,
    title: "WhatsApp",
    icon: path.join(__dirname, "assets", "icons", "icon_256x256.png"),
    show: !settings.get("startMinimized", false),
    autoHideMenuBar: true,
    backgroundColor: "#111b21",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: settings.get("spellCheck", true),
      partition: "persist:whatsapp",
    },
  });

  // Restore maximized state
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Set always on top from settings
  mainWindow.setAlwaysOnTop(settings.get("alwaysOnTop", false));

  // Set user agent
  mainWindow.webContents.setUserAgent(USER_AGENT);

  // Load WhatsApp Web
  mainWindow.loadURL(WHATSAPP_URL);

  // Remove the default menu bar
  mainWindow.setMenu(null);

  // ── Window Events ──

  // Save window state on move/resize
  const saveWindowState = () => {
    if (mainWindow.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    settings.set("windowState", {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: mainWindow.isMaximized(),
    });
  };

  mainWindow.on("resize", saveWindowState);
  mainWindow.on("move", saveWindowState);
  mainWindow.on("maximize", saveWindowState);
  mainWindow.on("unmaximize", saveWindowState);

  // Close to tray behavior
  mainWindow.on("close", (event) => {
    if (!isQuitting && settings.get("closeToTray", true)) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // ── Web Content Events ──

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith("https://web.whatsapp.com")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Prevent navigation away from WhatsApp Web
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("https://web.whatsapp.com")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Inject theme & notification handler after page loads
  mainWindow.webContents.on("did-finish-load", () => {
    injectTheme(mainWindow);
    setupNotifications(mainWindow);
  });

  // Update tray badge from title changes (WhatsApp uses "(3) WhatsApp" format)
  mainWindow.webContents.on("page-title-updated", (event, title) => {
    const match = title.match(/\((\d+)\)/);
    const count = match ? parseInt(match[1], 10) : 0;
    updateTrayBadge(tray, count);
  });

  return mainWindow;
}

/**
 * Grant media permissions for voice/video calls
 */
function setupPermissions() {
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const allowedPermissions = [
        "media",
        "mediaKeySystem",
        "notifications",
        "fullscreen",
        "clipboard-read",
        "clipboard-sanitized-write",
      ];
      callback(allowedPermissions.includes(permission));
    }
  );

  session.defaultSession.setPermissionCheckHandler(
    (webContents, permission) => {
      const allowedPermissions = [
        "media",
        "mediaKeySystem",
        "notifications",
        "fullscreen",
        "clipboard-read",
        "clipboard-sanitized-write",
      ];
      return allowedPermissions.includes(permission);
    }
  );
}

/**
 * Register keyboard shortcuts
 */
function registerShortcuts() {
  // Shortcuts that work when the window is focused
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;

    const ctrl = input.control || input.meta;

    // Ctrl+Shift+D — Toggle dark mode
    if (ctrl && input.shift && input.key === "D") {
      const current = settings.get("darkMode", "system");
      const next = current === "dark" ? "light" : "dark";
      settings.set("darkMode", next);
      injectTheme(mainWindow);
    }

    // Ctrl+Shift+T — Toggle always on top
    if (ctrl && input.shift && input.key === "T") {
      const current = settings.get("alwaysOnTop", false);
      settings.set("alwaysOnTop", !current);
      mainWindow.setAlwaysOnTop(!current);
    }

    // Ctrl+, — Open settings
    if (ctrl && input.key === ",") {
      openSettingsWindow();
    }

    // F11 — Toggle fullscreen
    if (input.key === "F11") {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }

    // Ctrl+Plus — Zoom in
    if (ctrl && (input.key === "=" || input.key === "+")) {
      const zoom = mainWindow.webContents.getZoomLevel();
      mainWindow.webContents.setZoomLevel(Math.min(zoom + 0.5, 5));
    }

    // Ctrl+Minus — Zoom out
    if (ctrl && input.key === "-") {
      const zoom = mainWindow.webContents.getZoomLevel();
      mainWindow.webContents.setZoomLevel(Math.max(zoom - 0.5, -5));
    }

    // Ctrl+0 — Reset zoom
    if (ctrl && input.key === "0") {
      mainWindow.webContents.setZoomLevel(0);
    }
  });
}

/**
 * Open the settings window
 */
let settingsWindow = null;

function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 640,
    parent: mainWindow,
    modal: true,
    resizable: false,
    autoHideMenuBar: true,
    backgroundColor: "#1a1a2e",
    icon: path.join(__dirname, "assets", "icons", "icon_256x256.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.setMenu(null);
  settingsWindow.loadFile(path.join(__dirname, "src", "settings-window.html"));

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

// ── IPC Handlers ──

ipcMain.handle("get-settings", () => {
  return settings.store;
});

ipcMain.handle("set-setting", (event, key, value) => {
  settings.set(key, value);

  // Apply settings immediately
  if (key === "alwaysOnTop" && mainWindow) {
    mainWindow.setAlwaysOnTop(value);
  }
  if (key === "darkMode" && mainWindow) {
    injectTheme(mainWindow);
  }
  if (key === "customCSS" && mainWindow) {
    injectTheme(mainWindow);
  }
  if (key === "accentColor" && mainWindow) {
    injectTheme(mainWindow);
  }

  return true;
});

ipcMain.handle("open-settings", () => {
  openSettingsWindow();
});

ipcMain.handle("close-settings-window", () => {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
  }
});

ipcMain.on("notification-clicked", () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

ipcMain.on("badge-count", (event, count) => {
  updateTrayBadge(tray, count);
});

// ── App Lifecycle ──

// Single instance lock — prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    setupPermissions();
    mainWindow = createMainWindow();
    tray = createTray(mainWindow, openSettingsWindow, () => {
      isQuitting = true;
      app.quit();
    });
    registerShortcuts();
  });
}

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "linux" || isQuitting) {
    app.quit();
  }
});
