import Store from "electron-store";

/**
 * Persistent settings store using electron-store.
 * Settings are saved to ~/.config/whatsapp-wrapper/config.json
 */
const settings = new Store({
  name: "config",
  defaults: {
    // Window behavior
    startMinimized: false,
    closeToTray: true,
    alwaysOnTop: false,

    // Appearance
    darkMode: "system", // 'system', 'dark', 'light'
    accentColor: "#25D366", // WhatsApp green
    customCSS: "",

    // Features
    spellCheck: true,
    autoLaunch: false,
    muteNotifications: false,

    // Window state (saved automatically)
    windowState: {
      width: 1200,
      height: 800,
      x: undefined,
      y: undefined,
      isMaximized: false,
    },
  },
});

export { settings };
