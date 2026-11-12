/* ============================================================
   SuperVista · theme
   Mantener la clave sincronizada con el script inline de index.html.
   ============================================================ */

const THEME_KEY = "supervista.theme.v1";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const THEME_COLORS = { light: "#f4fdf9", dark: "#041a14" };

const root = document.documentElement;
const media = window.matchMedia(DARK_QUERY);

function readStoredTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function currentTheme() {
  return root.dataset.theme === "dark" ? "dark" : "light";
}

function syncControls(theme) {
  const isDark = theme === "dark";
  const label = isDark ? "Activar modo claro" : "Activar modo oscuro";

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", label);
    const text = button.querySelector("[data-theme-label]");
    if (text) text.textContent = label;
  });
}

function applyTheme(theme) {
  root.dataset.theme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[theme]);

  syncControls(theme);
}

function withTransition(update) {
  if (window.matchMedia(REDUCED_QUERY).matches) {
    update();
    return;
  }

  root.classList.add("theme-transition");
  update();
  window.setTimeout(() => root.classList.remove("theme-transition"), 320);
}

function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";

  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* El tema sigue funcionando en memoria. */
  }

  withTransition(() => applyTheme(next));
}

function onSystemChange(event) {
  if (readStoredTheme()) return;
  applyTheme(event.matches ? "dark" : "light");
}

export function initTheme() {
  if (root.dataset.theme !== "light" && root.dataset.theme !== "dark") {
    applyTheme(readStoredTheme() || (media.matches ? "dark" : "light"));
  } else {
    applyTheme(currentTheme());
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onSystemChange);
  } else {
    media.addListener(onSystemChange);
  }
}
