import { Notification } from "electron";

/**
 * Inject JavaScript to intercept WhatsApp Web's browser notifications
 * and forward them to Electron's native notification system.
 */
function setupNotifications(mainWindow) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const injectionScript = `
    (function() {
      // Avoid double-injection
      if (window.__waWrapperNotificationsSetup) return;
      window.__waWrapperNotificationsSetup = true;

      // Override browser Notification API
      class WrappedNotification {
        constructor(title, options = {}) {
          // Send to Electron main process via preload bridge
          if (window.whatsappWrapper) {
            window.whatsappWrapper.showNotification({
              title: title,
              body: options.body || '',
              icon: options.icon || '',
              tag: options.tag || '',
              silent: options.silent || false,
            });
          }

          // Keep reference for onclick handling
          this._title = title;
          this._options = options;
          this.onclick = null;
          this.onclose = null;
          this.onerror = null;
          this.onshow = null;
        }

        close() {}

        static get permission() {
          return 'granted';
        }

        static requestPermission(callback) {
          if (callback) callback('granted');
          return Promise.resolve('granted');
        }
      }

      // Replace browser Notification with our wrapper
      window.Notification = WrappedNotification;

      // Also monitor title changes for badge count
      const titleObserver = new MutationObserver(() => {
        const title = document.title;
        const match = title.match(/\\((\\d+)\\)/);
        const count = match ? parseInt(match[1], 10) : 0;
        if (window.whatsappWrapper) {
          window.whatsappWrapper.sendBadgeCount(count);
        }
      });

      // Observe the title element
      const titleEl = document.querySelector('title');
      if (titleEl) {
        titleObserver.observe(titleEl, { childList: true, characterData: true, subtree: true });
      }

      console.log('[WhatsApp Wrapper] Notification interception active');
    })();
  `;

  mainWindow.webContents.executeJavaScript(injectionScript).catch(() => {
    // Silently fail if injection fails (page might not be ready)
  });
}

/**
 * Show a native desktop notification
 */
function showNativeNotification(mainWindow, { title, body, icon }) {
  if (!Notification.isSupported()) return;

  const notification = new Notification({
    title: title || "WhatsApp",
    body: body || "",
    icon: icon || undefined,
    silent: false,
  });

  notification.on("click", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  notification.show();
}

export { setupNotifications, showNativeNotification };
