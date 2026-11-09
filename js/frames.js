/* ============================================================
   SuperVista · frame renderer
   Shared by the site (live preview) and the asset generator.
   ============================================================ */

export const SHAPES = {
  redondo: {
    label: "Redondo",
    lens: '<ellipse cx="292" cy="395" rx="100" ry="92"/>',
    bridge: "M 386 356 Q 400 338 414 356",
    temple: "M 194 370 C 164 362 138 352 112 340",
    highlight: "M 238 342 C 262 320 308 314 338 332",
  },
  cuadrado: {
    label: "Cuadrado",
    lens: '<rect x="192" y="303" width="200" height="184" rx="34"/>',
    bridge: "M 388 352 Q 400 334 412 352",
    temple: "M 196 366 C 166 358 138 350 112 338",
    highlight: "M 228 344 C 258 322 306 318 336 338",
  },
  "cat-eye": {
    label: "Cat-eye",
    lens: '<path d="M 378 338 C 330 302 250 300 196 318 L 184 332 C 186 370 200 420 232 450 C 270 486 340 478 366 438 C 384 410 386 370 378 338 Z"/>',
    bridge: "M 372 342 Q 400 318 428 342",
    temple: "M 186 346 C 158 340 136 334 112 326",
    highlight: "M 232 348 C 262 322 312 318 344 338",
  },
  aviador: {
    label: "Aviador",
    lens: '<path d="M 380 320 C 350 300 280 298 232 312 C 200 322 185 340 184 365 C 182 405 200 456 240 478 C 285 502 342 480 362 438 C 380 400 388 350 380 320 Z"/>',
    bridge: "M 376 334 Q 400 308 424 334",
    temple: "M 186 352 C 158 346 136 338 112 330",
    highlight: "M 228 342 C 258 318 306 314 336 334",
  },
  ovalado: {
    label: "Ovalado",
    lens: '<ellipse cx="292" cy="398" rx="106" ry="76"/>',
    bridge: "M 394 360 Q 400 344 406 360",
    temple: "M 188 380 C 160 374 136 364 112 352",
    highlight: "M 240 358 C 268 336 312 332 340 350",
  },
  geometrico: {
    label: "Geométrico",
    lens: '<path d="M 384 328 L 330 300 L 230 302 L 186 344 L 190 420 L 240 478 L 330 480 L 382 430 L 384 380 Z"/>',
    bridge: "M 380 344 Q 400 324 420 344",
    temple: "M 188 362 C 158 354 136 346 112 334",
    highlight: "M 228 348 C 256 324 304 320 334 340",
  },
};

export const FRAME_COLORS = [
  { name: "Bosque", value: "#0f6b4f" },
  { name: "Jade", value: "#2f9e78" },
  { name: "Menta", value: "#5fd7a8" },
  { name: "Lima", value: "#c4f77e" },
  { name: "Noche", value: "#0a2f26" },
  { name: "Cristal", value: "#e6fff7" },
];

export const TINTS = [
  { name: "Menta", value: "#7cf7c0" },
  { name: "Cristal", value: "#e8fff8" },
  { name: "Lima", value: "#d9ffb0" },
  { name: "Aqua", value: "#8fe9ff" },
  { name: "Rosa", value: "#ffd6ea" },
  { name: "Humo", value: "#b7c9c3" },
];

const ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);

let uidCounter = 0;

function lighten(hex, amount = 0.3) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  const mix = (channel) => Math.round(channel + (255 - channel) * amount);
  const r = mix((num >> 16) & 255);
  const g = mix((num >> 8) & 255);
  const b = mix(num & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Build a full glasses illustration as an SVG string.
 */
export function buildGlassesSVG({
  shape = "redondo",
  frame = "#0f6b4f",
  tint = "#7cf7c0",
  engraving = "",
  background = false,
  palette = {},
  title = "Espejuelos personalizados SuperVista",
  className = "",
} = {}) {
  const def = SHAPES[shape] || SHAPES.redondo;
  const uid = `sv${++uidCounter}`;
  const bg1 = palette.bg1 || "#f0fff9";
  const bg2 = palette.bg2 || "#c6f5de";
  const glowA = palette.glowA || "#9dffd1";
  const glowB = palette.glowB || "#e7ffc0";
  const rimLight = lighten(frame, 0.35);
  const engravingMarkup = engraving.trim()
    ? `<text x="548" y="318" transform="rotate(-7 548 318)" font-family="'Space Grotesk', 'Trebuchet MS', sans-serif" font-size="12" letter-spacing="1.6" fill="${frame}" opacity=".85">${esc(engraving.trim())}</text>`
    : "";

  const backgroundMarkup = background
    ? `
    <rect width="800" height="800" fill="url(#${uid}-bg)"/>
    <rect width="800" height="800" fill="url(#${uid}-grid)"/>
    <circle cx="650" cy="164" r="178" fill="none" stroke="#0a3527" stroke-opacity=".10"/>
    <circle cx="650" cy="164" r="118" fill="none" stroke="#0a3527" stroke-opacity=".08"/>
    <circle cx="128" cy="656" r="158" fill="${glowA}" opacity=".5" filter="url(#${uid}-blur)"/>
    <circle cx="700" cy="560" r="118" fill="${glowB}" opacity=".55" filter="url(#${uid}-blur)"/>
    <circle cx="146" cy="140" r="72" fill="${glowA}" opacity=".4" filter="url(#${uid}-blur)"/>
    <ellipse cx="400" cy="628" rx="216" ry="22" fill="${frame}" opacity=".16" filter="url(#${uid}-soft)"/>
    <text x="400" y="748" text-anchor="middle" font-family="'Space Grotesk', 'Trebuchet MS', sans-serif" font-size="19" letter-spacing="10" fill="#0a3527" opacity=".32">SUPERVISTA</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="${esc(title)}"${className ? ` class="${className}"` : ""}>
  <defs>
    <linearGradient id="${uid}-lens" x1="180" y1="270" x2="620" y2="530" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${tint}" stop-opacity=".92"/>
      <stop offset=".55" stop-color="${tint}" stop-opacity=".48"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity=".16"/>
    </linearGradient>
    <linearGradient id="${uid}-rim" x1="170" y1="290" x2="630" y2="510" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${rimLight}"/>
      <stop offset=".45" stop-color="${frame}"/>
      <stop offset="1" stop-color="${frame}"/>
    </linearGradient>
    ${background ? `<linearGradient id="${uid}-bg" x1="0" y1="0" x2="800" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${bg1}"/>
      <stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
    <pattern id="${uid}-grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#0a3527" stroke-opacity=".055"/>
    </pattern>
    <filter id="${uid}-blur" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="46"/>
    </filter>
    <filter id="${uid}-soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>` : ""}
  </defs>
  ${backgroundMarkup}
  <g stroke-linecap="round" stroke-linejoin="round">
    <path d="${def.temple}" fill="none" stroke="${frame}" stroke-width="13"/>
    <path d="${def.temple}" transform="matrix(-1 0 0 1 800 0)" fill="none" stroke="${frame}" stroke-width="13"/>
    <g fill="url(#${uid}-lens)" stroke="url(#${uid}-rim)" stroke-width="13">
      ${def.lens}
      <g transform="matrix(-1 0 0 1 800 0)">${def.lens}</g>
    </g>
    <path d="${def.bridge}" fill="none" stroke="url(#${uid}-rim)" stroke-width="13"/>
    <g fill="none" stroke="#ffffff" stroke-width="5" opacity=".55">
      <path d="${def.highlight}"/>
      <path d="${def.highlight}" transform="matrix(-1 0 0 1 800 0)"/>
    </g>
    <circle cx="199" cy="368" r="5" fill="${frame}"/>
    <circle cx="601" cy="368" r="5" fill="${frame}"/>
    ${engravingMarkup}
  </g>
</svg>`;
}

/**
 * Small outline icon of a shape, used by the customizer buttons.
 */
export function shapeIcon(shapeKey) {
  const def = SHAPES[shapeKey] || SHAPES.redondo;
  return `<svg viewBox="168 292 464 210" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
      ${def.lens}
      <g transform="matrix(-1 0 0 1 800 0)">${def.lens}</g>
      <path d="${def.bridge}"/>
    </g>
  </svg>`;
}
