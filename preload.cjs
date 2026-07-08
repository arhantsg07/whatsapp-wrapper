const { contextBridge, ipcRenderer } = require("electron");

/**
 * Preload script — secure bridge between WhatsApp Web (renderer) and main process.
 * Uses contextBridge to expose a limited API surface. No direct Node.js access in renderer.
 */
contextBridge.exposeInMainWorld("whatsappWrapper", {
  // ── Settings ──
  getSettings: () => ipcRenderer.invoke("get-settings"),
  setSetting: (key, value) => ipcRenderer.invoke("set-setting", key, value),
  openSettings: () => ipcRenderer.invoke("open-settings"),
  closeSettingsWindow: () => ipcRenderer.invoke("close-settings-window"),

  // ── Notifications ──
  onNotificationClicked: () => ipcRenderer.send("notification-clicked"),
  sendBadgeCount: (count) => ipcRenderer.send("badge-count", count),
  showNotification: (data) => ipcRenderer.send("show-notification", data),

  // ── Platform Info ──
  platform: process.platform,
});
