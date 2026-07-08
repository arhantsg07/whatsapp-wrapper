import { Tray, Menu, nativeImage } from "electron";
import path from "path";
import { settings } from "./settings.js";
import { injectTheme } from "./theme.js";

let currentTray = null;

/**
 * Create a system tray icon with context menu
 */
function createTray(mainWindow, openSettingsCallback, quitCallback) {
  // Try multiple icon paths: PNG first, then SVG, then generated fallback
  const iconPaths = [
    path.join(import.meta.dirname, "..", "assets", "icons", "tray_icon.png"),
    path.join(import.meta.dirname, "..", "assets", "icons", "icon_256x256.png"),
    path.join(import.meta.dirname, "..", "assets", "icons", "icon_512x512.png"),
  ];

  let trayIcon = null;
  for (const iconPath of iconPaths) {
    try {
      const img = nativeImage.createFromPath(iconPath);
      if (!img.isEmpty()) {
        trayIcon = img;
        break;
      }
    } catch {
      // Try next icon
    }
  }

  if (!trayIcon || trayIcon.isEmpty()) {
    trayIcon = createFallbackIcon();
  }

  currentTray = new Tray(trayIcon.resize({ width: 22, height: 22 }));
  currentTray.setToolTip("WhatsApp");

  // Build context menu
  const buildMenu = () => {
    const isVisible = mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible();
    const isAlwaysOnTop = settings.get("alwaysOnTop", false);
    const darkMode = settings.get("darkMode", "system");

    return Menu.buildFromTemplate([
      {
        label: isVisible ? "Hide Window" : "Show Window",
        click: () => {
          if (!mainWindow || mainWindow.isDestroyed()) return;
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      { type: "separator" },
      {
        label: "Dark Mode",
        type: "checkbox",
        checked: darkMode === "dark",
        click: (menuItem) => {
          settings.set("darkMode", menuItem.checked ? "dark" : "light");
          if (mainWindow && !mainWindow.isDestroyed()) {
            injectTheme(mainWindow);
          }
        },
      },
      {
        label: "Always on Top",
        type: "checkbox",
        checked: isAlwaysOnTop,
        click: (menuItem) => {
          settings.set("alwaysOnTop", menuItem.checked);
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.setAlwaysOnTop(menuItem.checked);
          }
        },
      },
      { type: "separator" },
      {
        label: "Settings",
        click: openSettingsCallback,
      },
      { type: "separator" },
      {
        label: "Quit WhatsApp",
        click: quitCallback,
      },
    ]);
  };

  currentTray.setContextMenu(buildMenu());

  // Left-click toggles window visibility
  currentTray.on("click", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    // Rebuild context menu to reflect state
    currentTray.setContextMenu(buildMenu());
  });

  // Rebuild menu when it's about to be shown (right-click)
  currentTray.on("right-click", () => {
    currentTray.setContextMenu(buildMenu());
  });

  return currentTray;
}

/**
 * Update tray icon tooltip with unread badge count
 */
function updateTrayBadge(tray, count) {
  if (!tray || tray.isDestroyed()) return;

  if (count > 0) {
    tray.setToolTip(`WhatsApp (${count} unread)`);
  } else {
    tray.setToolTip("WhatsApp");
  }
}

/**
 * Create a simple fallback tray icon (green circle)
 */
function createFallbackIcon() {
  // Create a simple 22x22 green circle icon as fallback
  const size = 22;
  const canvas = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#25D366" />
      <text x="${size / 2}" y="${size / 2 + 1}" text-anchor="middle" dominant-baseline="central" 
            font-family="Arial" font-size="12" font-weight="bold" fill="white">W</text>
    </svg>
  `;

  return nativeImage.createFromBuffer(
    Buffer.from(canvas),
    { width: size, height: size }
  );
}

export { createTray, updateTrayBadge };
