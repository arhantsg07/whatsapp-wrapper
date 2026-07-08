/**
 * Script to generate tray and app icons at various sizes.
 * Uses Node.js to create SVG-based PNG icons.
 * Run: node scripts/generate-icons.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "assets", "icons");

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

/**
 * Generate an SVG WhatsApp-style icon
 */
function generateSVGIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#25D366"/>
      <stop offset="100%" stop-color="#128C48"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" ry="100" fill="url(#bg)"/>
  <g transform="translate(256, 256)">
    <!-- Speech bubble -->
    <path d="M-8 -140 C-95 -140 -165 -75 -165 5 C-165 40 -150 72 -125 97 L-140 145 L-85 120 C-62 132 -36 140 -8 140 C80 140 150 75 150 -5 C150 -80 80 -140 -8 -140 Z" 
          fill="white" opacity="0.95"/>
    <!-- Phone icon -->
    <g transform="translate(-8, 0) scale(0.55)">
      <path d="M-90 55 C-110 40 -120 10 -105 -20 C-85 -60 -40 -95 10 -105 C45 -112 80 -100 100 -75 C110 -60 105 -35 85 -25 L65 -15 C55 -10 42 -15 35 -25 C28 -35 15 -40 5 -35 C-15 -25 -35 -5 -40 15 C-42 25 -38 38 -28 45 C-18 52 -15 65 -25 72 L-40 85 C-55 95 -75 90 -90 75 Z"
            fill="#25D366"/>
    </g>
  </g>
</svg>`;
}

/**
 * Generate a simple tray icon (smaller, simpler design for system tray)
 */
function generateTrayIconSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 22 22">
  <circle cx="11" cy="11" r="10" fill="#25D366"/>
  <g transform="translate(11, 11) scale(0.35)">
    <path d="M-8 -18 C-15 -18 -20 -12 -20 -4 C-20 0 -18 4 -15 7 L-17 14 L-11 11 C-9 12 -6 13 -3 13 C5 13 12 7 12 -1 C12 -9 5 -18 -3 -18 Z"
          fill="white" opacity="0.95"/>
  </g>
</svg>`;
}

// Write SVG icons (these work well with Electron's nativeImage)
const sizes = [16, 22, 24, 32, 48, 64, 128, 256, 512];

sizes.forEach((size) => {
  const svg = generateSVGIcon(size);
  const filename = `icon_${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
});

// Tray icon
const traysvg = generateTrayIconSVG(22);
fs.writeFileSync(path.join(iconsDir, "tray_icon.svg"), traysvg);

console.log("✓ SVG icons generated successfully in assets/icons/");
console.log(
  "  Note: The generated PNG icon from image generation is at icon_512x512.png"
);
console.log("  SVG icons are provided as fallbacks at all sizes.");
