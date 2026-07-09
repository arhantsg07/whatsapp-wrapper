import { settings } from "./settings.js";

/**
 * Inject custom CSS into WhatsApp Web for theming.
 * Handles dark mode override, accent color, and user custom CSS.
 */
function injectTheme(mainWindow) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const darkMode = settings.get("darkMode", "system");
  const accentColor = settings.get("accentColor", "#25D366");

  // Build the CSS to inject
  let css = "";

  // ── Custom accent color ──
  css += `
    /* WhatsApp Wrapper — Accent Color Override */
    :root {
      --wa-wrapper-accent: ${accentColor};
    }

    /* Override WhatsApp's green with custom accent */
    ._ak72 .x123j3cw,
    [data-icon="send"] path,
    .x1n2onr6[style*="background-color: var(--pea-green)"],
    .xlhp2vp {
      color: var(--wa-wrapper-accent) !important;
    }
  `;

  // ── Dark mode override ──
  if (darkMode === "dark") {
    css += `
      /* WhatsApp Wrapper — Force Dark Mode */
      body {
        color-scheme: dark !important;
      }
      
      /* Trigger WhatsApp's native dark mode via CSS class */
      html {
        filter: none !important;
      }
    `;

    // Execute JS to enable WhatsApp's built-in dark mode
    mainWindow.webContents
      .executeJavaScript(
        `
      (function() {
        try {
          document.body.classList.add('dark');
          // Try to find and click the dark mode setting if available
          const html = document.querySelector('html');
          if (html) {
            html.setAttribute('data-color-scheme', 'dark');
          }
        } catch(e) {}
      })();
    `
      )
      .catch(() => {});
  } else if (darkMode === "light") {
    mainWindow.webContents
      .executeJavaScript(
        `
      (function() {
        try {
          document.body.classList.remove('dark');
          const html = document.querySelector('html');
          if (html) {
            html.setAttribute('data-color-scheme', 'light');
          }
        } catch(e) {}
      })();
    `
      )
      .catch(() => {});
  }

  // ── Wrapper-specific styles ──
  css += `
    /* WhatsApp Wrapper — App Styles */
    
    /* Smooth scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(134, 150, 160, 0.4);
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(134, 150, 160, 0.6);
    }

    /* Hide "Download WhatsApp" banners if they appear */
    [data-testid="download-cta"],
    .landing-window [role="button"][tabindex="0"] {
      display: none !important;
    }

    /* Smoother transitions for panels */
    ._ak72, ._ak73 {
      transition: width 0.2s ease, transform 0.2s ease !important;
    }
  `;

  // Remove previously injected styles, then inject new ones
  mainWindow.webContents
    .executeJavaScript(
      `
    (function() {
      // Remove old injected styles
      const old = document.getElementById('wa-wrapper-theme');
      if (old) old.remove();

      // Inject new styles
      const style = document.createElement('style');
      style.id = 'wa-wrapper-theme';
      style.textContent = ${JSON.stringify(css)};
      document.head.appendChild(style);
    })();
  `
    )
    .catch(() => {});
}

export { injectTheme };
