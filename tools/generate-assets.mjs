/**
 * Genera las imágenes SVG de producto y el favicon.
 * Ejecutar: npm run assets
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGlassesSVG } from "../js/frames.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "assets", "img");
mkdirSync(outDir, { recursive: true });

const products = [
  {
    file: "aurora",
    shape: "redondo",
    frame: "#0f6b4f",
    tint: "#7cf7c0",
    palette: { bg1: "#f2fffa", bg2: "#bdf3d7", glowA: "#8dffcf", glowB: "#e7ffc0" },
    title: "Espejuelos Aurora, montura redonda verde",
  },
  {
    file: "nova",
    shape: "cuadrado",
    frame: "#123f33",
    tint: "#bfffe3",
    palette: { bg1: "#f4fff8", bg2: "#c8f3e2", glowA: "#a6ffe0", glowB: "#dbffb1" },
    title: "Espejuelos Nova, montura cuadrada verde",
  },
  {
    file: "lumen",
    shape: "cat-eye",
    frame: "#2f9e78",
    tint: "#9bffd4",
    palette: { bg1: "#f0fff9", bg2: "#c9f6df", glowA: "#8bffd2", glowB: "#efffbe" },
    title: "Espejuelos Lumen, montura cat-eye menta",
  },
  {
    file: "orbit",
    shape: "aviador",
    frame: "#0b2f26",
    tint: "#d9ffb0",
    palette: { bg1: "#f5fff6", bg2: "#c2f0d4", glowA: "#b6ffd0", glowB: "#e9ffc2" },
    title: "Espejuelos Orbit, montura aviador verde",
  },
  {
    file: "vela",
    shape: "ovalado",
    frame: "#57c79b",
    tint: "#c9ffee",
    palette: { bg1: "#f4fffa", bg2: "#cdf5e4", glowA: "#9dffdd", glowB: "#eeffc6" },
    title: "Espejuelos Vela, montura ovalada jade",
  },
  {
    file: "prisma",
    shape: "geometrico",
    frame: "#16624a",
    tint: "#8fffd0",
    palette: { bg1: "#f2fffa", bg2: "#c0f2dc", glowA: "#84ffd0", glowB: "#e2ffc0" },
    title: "Espejuelos Prisma, montura geométrica verde",
  },
];

for (const product of products) {
  const svg = buildGlassesSVG({
    shape: product.shape,
    frame: product.frame,
    tint: product.tint,
    palette: product.palette,
    background: true,
    title: product.title,
  });
  writeFileSync(resolve(outDir, `${product.file}.svg`), svg, "utf8");
  console.log(`✓ assets/img/${product.file}.svg`);
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#07251c"/>
  <g fill="none" stroke="#7cf7c0" stroke-width="4" stroke-linecap="round">
    <circle cx="23" cy="33" r="10"/>
    <circle cx="45" cy="33" r="10"/>
    <path d="M33 33h2M10 29l3-3M58 29l-3-3"/>
  </g>
  <circle cx="50" cy="16" r="4" fill="#d9ffb0"/>
</svg>`;
writeFileSync(resolve(outDir, "favicon.svg"), favicon, "utf8");
console.log("✓ assets/img/favicon.svg");
