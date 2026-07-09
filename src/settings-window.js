/**
 * Settings window renderer script.
 * Communicates with main process via the whatsappWrapper bridge (preload.js).
 */

(async function () {
  const api = window.whatsappWrapper;

  // ── Elements ──
  const elements = {
    closeToTray: document.getElementById("closeToTray"),
    startMinimized: document.getElementById("startMinimized"),
    alwaysOnTop: document.getElementById("alwaysOnTop"),
    spellCheck: document.getElementById("spellCheck"),
    darkMode: document.getElementById("darkMode"),
    accentColor: document.getElementById("accentColor"),
    accentColorValue: document.getElementById("accentColorValue"),
    colorPreview: document.getElementById("colorPreview"),
    btnSave: document.getElementById("btnSave"),
    btnCancel: document.getElementById("btnCancel"),
    toast: document.getElementById("toast"),
  };

  // ── Load current settings ──
  let currentSettings = {};

  async function loadSettings() {
    try {
      currentSettings = await api.getSettings();
    } catch {
      currentSettings = {};
    }

    // Populate UI
    elements.closeToTray.checked = currentSettings.closeToTray ?? true;
    elements.startMinimized.checked = currentSettings.startMinimized ?? false;
    elements.alwaysOnTop.checked = currentSettings.alwaysOnTop ?? false;
    elements.spellCheck.checked = currentSettings.spellCheck ?? true;
    elements.darkMode.value = currentSettings.darkMode ?? "system";

    const accent = currentSettings.accentColor ?? "#25D366";
    elements.accentColor.value = accent;
    elements.accentColorValue.textContent = accent.toUpperCase();
    elements.colorPreview.style.background = accent;
  }

  await loadSettings();

  // ── Color picker interaction ──
  elements.colorPreview.addEventListener("click", () => {
    elements.accentColor.click();
  });

  elements.accentColor.addEventListener("input", (e) => {
    const color = e.target.value;
    elements.colorPreview.style.background = color;
    elements.accentColorValue.textContent = color.toUpperCase();
  });

  // ── Save ──
  elements.btnSave.addEventListener("click", async () => {
    try {
      await api.setSetting("closeToTray", elements.closeToTray.checked);
      await api.setSetting("startMinimized", elements.startMinimized.checked);
      await api.setSetting("alwaysOnTop", elements.alwaysOnTop.checked);
      await api.setSetting("spellCheck", elements.spellCheck.checked);
      await api.setSetting("darkMode", elements.darkMode.value);
      await api.setSetting("accentColor", elements.accentColor.value);

      showToast();

      // Close after a brief delay
      setTimeout(() => {
        api.closeSettingsWindow();
      }, 800);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  });

  // ── Cancel ──
  elements.btnCancel.addEventListener("click", () => {
    api.closeSettingsWindow();
  });

  // ── Escape key closes ──
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      api.closeSettingsWindow();
    }
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      elements.btnSave.click();
    }
  });

  // ── Toast notification ──
  function showToast() {
    elements.toast.classList.add("show");
    setTimeout(() => {
      elements.toast.classList.remove("show");
    }, 2000);
  }
})();
