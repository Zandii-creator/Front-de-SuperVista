/* ============================================================
   SuperVista · app
   ============================================================ */

import {
  SHAPES,
  FRAME_COLORS,
  TINTS,
  buildGlassesSVG,
  shapeIcon,
} from "./frames.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );

const FREE_SHIPPING = 60;
const SHIPPING_COST = 6;
const CUSTOM_BASE = 99;
const ENGRAVING_COST = 9;
const CART_KEY = "supervista.cart.v1";

/* ---------------- catálogo ---------------- */

const PRODUCTS = [
  {
    id: "aurora",
    name: "Aurora",
    shape: "Redondo",
    group: "redondos",
    price: 89,
    tag: "Best seller",
    meta: "Bioacetato flexible · luz azul",
    img: "assets/img/aurora.svg",
    alt: "Espejuelos Aurora, montura redonda verde con lentes menta",
    colors: ["#0f6b4f", "#5fd7a8", "#dcffb0"],
  },
  {
    id: "nova",
    name: "Nova",
    shape: "Cuadrado",
    group: "cuadrados",
    price: 109,
    tag: "Nuevo",
    meta: "Perfil ultrafino · UV400",
    img: "assets/img/nova.svg",
    alt: "Espejuelos Nova, montura cuadrada verde oscuro",
    colors: ["#123f33", "#2f9e78", "#c8f4ec"],
  },
  {
    id: "lumen",
    name: "Lumen",
    shape: "Cat-eye",
    group: "cat-eye",
    price: 99,
    tag: "Icónico",
    meta: "Edición menta · antirreflejo",
    img: "assets/img/lumen.svg",
    alt: "Espejuelos Lumen, montura cat-eye color menta",
    colors: ["#2f9e78", "#b9f5d9", "#e6fff7"],
  },
  {
    id: "orbit",
    name: "Orbit",
    shape: "Aviador",
    group: "aviadores",
    price: 119,
    tag: "Edición limitada",
    meta: "Titanio ligero · polarizado",
    img: "assets/img/orbit.svg",
    alt: "Espejuelos Orbit, montura aviador verde bosque",
    colors: ["#0b2f26", "#57c79b", "#d9ffb0"],
  },
  {
    id: "vela",
    name: "Vela",
    shape: "Ovalado",
    group: "otros",
    price: 79,
    tag: "",
    meta: "Bioacetato jade · luz azul",
    img: "assets/img/vela.svg",
    alt: "Espejuelos Vela, montura ovalada color jade",
    colors: ["#57c79b", "#c4f77e", "#e6fff7"],
  },
  {
    id: "prisma",
    name: "Prisma",
    shape: "Geométrico",
    group: "otros",
    price: 129,
    tag: "Futurista",
    meta: "Hexagonal · espejado suave",
    img: "assets/img/prisma.svg",
    alt: "Espejuelos Prisma, montura geométrica verde",
    colors: ["#16624a", "#8fffd0", "#c8f4ec"],
  },
];

/* ---------------- utilidades ---------------- */

const cart = loadCart();
let activeFilter = "todos";
let orderSuccess = null;
let toastTimer = null;
let lastFocused = null;

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item) => item && item.key && Number.isFinite(item.price) && item.qty > 0)
      .map((item) => ({ ...item, qty: Math.min(9, Math.max(1, Math.round(item.qty))) }));
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* El carrito sigue funcionando en memoria. */
  }
}

function cartCount() {
  return cart.reduce((total, item) => total + item.qty, 0);
}

function cartSubtotal() {
  return cart.reduce((total, item) => total + item.price * item.qty, 0);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function bumpBadge() {
  const badge = $("#cartCount");
  badge.classList.remove("is-bump");
  void badge.offsetWidth;
  badge.classList.add("is-bump");
}

/* ---------------- colección ---------------- */

const grid = $("#productGrid");

function cardMarkup(product, index) {
  const swatches = product.colors
    .map(
      (color) =>
        `<span class="swatch-dot" style="background:${color}" aria-hidden="true"></span>`
    )
    .join("");

  return `
    <article class="card" style="--i:${index}" data-product="${product.id}">
      <div class="card__media">
        <img src="${product.img}" alt="${product.alt}" width="800" height="800" loading="lazy" decoding="async">
        ${product.tag ? `<span class="card__tag">${product.tag}</span>` : ""}
        <button class="card__add" type="button" data-add="${product.id}" aria-label="Añadir ${product.name} al carrito">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="card__body">
        <div class="card__top">
          <h3>${product.name}</h3>
          <span class="card__price">${money.format(product.price)}</span>
        </div>
        <p class="card__meta">${product.shape} · ${product.meta}</p>
        <div class="card__bottom">
          <div class="swatches" aria-hidden="true">${swatches}</div>
          <span class="card__badge">UV400</span>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const list =
    activeFilter === "todos"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.group === activeFilter);

  grid.innerHTML = list
    .map((product, index) => cardMarkup(product, index))
    .join("");
}

$("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  activeFilter = button.dataset.filter;
  $$(".filter", $("#filters")).forEach((chip) => {
    const isActive = chip === button;
    chip.classList.toggle("is-active", isActive);
    chip.setAttribute("aria-pressed", String(isActive));
  });
  renderProducts();
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const product = PRODUCTS.find((item) => item.id === button.dataset.add);
  if (!product) return;

  addToCart({
    key: `product:${product.id}`,
    name: product.name,
    detail: `${product.shape} · ${product.meta}`,
    price: product.price,
    img: product.img,
  });
});

/* ---------------- carrito ---------------- */

const cartPanel = $("#cart");
const overlay = $("#overlay");
const cartItems = $("#cartItems");
const cartFoot = $("#cartFoot");
const checkoutButton = $("#checkout");

function itemMarkup(item) {
  return `
    <div class="cart-item" data-key="${escapeHtml(item.key)}">
      <img src="${item.img}" alt="" width="76" height="76" loading="lazy">
      <div class="cart-item__info">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.detail)}</span>
        <div class="qty" aria-label="Cantidad de ${escapeHtml(item.name)}">
          <button type="button" data-qty="-1" aria-label="Quitar una unidad">−</button>
          <span>${item.qty}</span>
          <button type="button" data-qty="1" aria-label="Añadir una unidad">+</button>
        </div>
      </div>
      <div class="cart-item__right">
        <span class="cart-item__price">${money.format(item.price * item.qty)}</span>
        <button class="cart-item__remove" type="button" data-remove aria-label="Eliminar ${escapeHtml(item.name)} del carrito">Eliminar</button>
      </div>
    </div>`;
}

function emptyMarkup() {
  return `
    <div class="cart-empty">
      <span class="cart-empty__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M5.5 8.5h13l-1 11a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8l-1-11Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </span>
      <h3>Tu carrito está vacío</h3>
      <p>Encuentra una montura que hable de ti o diseña una desde cero.</p>
      <button class="btn btn--primary btn--sm" type="button" data-close-cart>Explorar la colección</button>
    </div>`;
}

function successMarkup() {
  return `
    <div class="cart__success">
      <span class="cart__success-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <h3>¡Pedido confirmado!</h3>
      <p>Gracias por elegir SuperVista. Te enviamos los detalles y el seguimiento por correo.</p>
      <code>${orderSuccess}</code>
      <button class="btn btn--primary btn--sm" type="button" data-close-cart>Seguir explorando</button>
    </div>`;
}

function renderCart() {
  const count = cartCount();
  $("#cartCount").textContent = count;
  $("#cartCount").hidden = count === 0;
  $("#cartTitleCount").textContent = `(${count})`;
  $("#cartButtonLabel").textContent = count
    ? `Abrir carrito, ${count} ${count === 1 ? "artículo" : "artículos"}`
    : "Abrir carrito de compras";

  if (orderSuccess) {
    cartItems.innerHTML = successMarkup();
    cartFoot.hidden = true;
    checkoutButton.disabled = true;
    return;
  }

  if (!cart.length) {
    cartItems.innerHTML = emptyMarkup();
    cartFoot.hidden = true;
    checkoutButton.disabled = true;
    return;
  }

  cartFoot.hidden = false;
  checkoutButton.disabled = false;
  cartItems.innerHTML = cart.map(itemMarkup).join("");

  const subtotal = cartSubtotal();
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  $("#cartSubtotal").textContent = money.format(subtotal);
  $("#cartShipping").textContent = shipping === 0 ? "Gratis" : money.format(shipping);
  $("#cartTotal").textContent = money.format(subtotal + shipping);
  $("#cartHint").textContent =
    remaining === 0
      ? "¡Envío gratis desbloqueado!"
      : `Te faltan ${money.format(remaining)} para el envío gratis.`;
}

function bumpCount() {
  renderCart();
  bumpBadge();
}

function addToCart(newItem) {
  const existing = cart.find((item) => item.key === newItem.key);
  if (existing) {
    existing.qty = Math.min(9, existing.qty + 1);
  } else {
    cart.push({ ...newItem, qty: 1 });
  }
  saveCart();
  bumpCount();
  openCart();
  showToast(`${newItem.name} añadido al carrito`);
}

function openCart() {
  if (cartPanel.classList.contains("is-open")) return;
  lastFocused = document.activeElement;
  overlay.hidden = false;
  cartPanel.removeAttribute("inert");
  cartPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");

  requestAnimationFrame(() => {
    overlay.classList.add("is-visible");
    cartPanel.classList.add("is-open");
  });

  window.setTimeout(() => $("#cartClose").focus(), 160);
}

function closeCart() {
  if (!cartPanel.classList.contains("is-open")) return;

  overlay.classList.remove("is-visible");
  cartPanel.classList.remove("is-open");
  cartPanel.setAttribute("aria-hidden", "true");
  cartPanel.setAttribute("inert", "");
  document.body.classList.remove("is-locked");

  window.setTimeout(() => {
    overlay.hidden = true;
  }, 380);

  if (orderSuccess) {
    orderSuccess = null;
    renderCart();
  }

  if (lastFocused && typeof lastFocused.focus === "function") {
    lastFocused.focus({ preventScroll: true });
  }
}

$("#cartButton").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

cartPanel.addEventListener("click", (event) => {
  const close = event.target.closest("[data-close-cart]");
  if (close) {
    closeCart();
    $("#coleccion").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const row = event.target.closest(".cart-item");
  if (!row) return;

  const item = cart.find((entry) => entry.key === row.dataset.key);
  if (!item) return;

  const qtyButton = event.target.closest("[data-qty]");
  if (qtyButton) {
    const delta = Number(qtyButton.dataset.qty);
    item.qty = Math.min(9, item.qty + delta);
    if (item.qty < 1) {
      cart.splice(cart.indexOf(item), 1);
    }
    saveCart();
    bumpCount();
    return;
  }

  if (event.target.closest("[data-remove]")) {
    cart.splice(cart.indexOf(item), 1);
    saveCart();
    bumpCount();
    showToast(`${item.name} eliminado del carrito`);
  }
});

checkoutButton.addEventListener("click", () => {
  if (!cart.length) return;
  orderSuccess = `SV-${Math.floor(10000 + Math.random() * 89999)}`;
  cart.length = 0;
  saveCart();
  bumpCount();
  showToast("¡Compra completada! Revisa tu correo.");
  cartItems.scrollTop = 0;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (cartPanel.classList.contains("is-open")) {
      closeCart();
    } else if ($("#primaryNav").classList.contains("is-open")) {
      closeMobileNav();
    }
  }

  if (event.key === "Tab" && cartPanel.classList.contains("is-open")) {
    const focusable = $$(
      'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])',
      cartPanel
    ).filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

/* ---------------- personalizador ---------------- */

const studio = {
  shape: "redondo",
  frame: FRAME_COLORS[0].value,
  tint: TINTS[0].value,
  engraving: "",
};

const preview = $("#customPreview");
const shapeOptions = $("#shapeOptions");
const frameOptions = $("#frameOptions");
const tintOptions = $("#tintOptions");
const engravingInput = $("#engraving");

function customPrice() {
  return CUSTOM_BASE + (studio.engraving.trim() ? ENGRAVING_COST : 0);
}

function selectedName(list, value) {
  return list.find((entry) => entry.value === value)?.name || "";
}

function renderShapeOptions() {
  shapeOptions.innerHTML = Object.entries(SHAPES)
    .map(([key, shape]) => {
      const active = key === studio.shape;
      return `
        <button class="shape-btn${active ? " is-active" : ""}" type="button" data-shape="${key}" aria-pressed="${active}">
          ${shapeIcon(key)}
          <span>${shape.label}</span>
        </button>`;
    })
    .join("");
}

function renderColorOptions() {
  frameOptions.innerHTML = FRAME_COLORS.map((color) => {
    const active = color.value === studio.frame;
    return `<button class="swatch${active ? " is-active" : ""}" type="button" data-frame="${color.value}" style="background:${color.value}" aria-label="Montura ${color.name}" aria-pressed="${active}" title="${color.name}"></button>`;
  }).join("");

  tintOptions.innerHTML = TINTS.map((tint) => {
    const active = tint.value === studio.tint;
    return `<button class="swatch${active ? " is-active" : ""}" type="button" data-tint="${tint.value}" style="background:${tint.value}" aria-label="Lente ${tint.name}" aria-pressed="${active}" title="${tint.name}"></button>`;
  }).join("");
}

function updateStudioMeta() {
  const price = customPrice();
  const engraving = studio.engraving.trim();

  $("#customPrice").textContent = money.format(price);
  $("#addCustomPrice").textContent = money.format(price);
  $("#frameName").textContent = selectedName(FRAME_COLORS, studio.frame);
  $("#tintName").textContent = selectedName(TINTS, studio.tint);

  const badge = $("#engravingBadge");
  badge.hidden = !engraving;
  badge.textContent = engraving ? `Grabado: “${engraving}”` : "";
  $("#charCount").textContent = studio.engraving.length;
}

function renderStudio() {
  preview.innerHTML = buildGlassesSVG({
    shape: studio.shape,
    frame: studio.frame,
    tint: studio.tint,
    engraving: studio.engraving.trim(),
    title: `Vista previa: montura ${SHAPES[studio.shape].label}, color ${selectedName(FRAME_COLORS, studio.frame)}, lentes ${selectedName(TINTS, studio.tint)}`,
  });

  shapeOptions.querySelectorAll("[data-shape]").forEach((button) => {
    const active = button.dataset.shape === studio.shape;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  frameOptions.querySelectorAll("[data-frame]").forEach((button) => {
    const active = button.dataset.frame === studio.frame;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  tintOptions.querySelectorAll("[data-tint]").forEach((button) => {
    const active = button.dataset.tint === studio.tint;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  updateStudioMeta();
}

shapeOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-shape]");
  if (!button) return;
  studio.shape = button.dataset.shape;
  renderStudio();
});

frameOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-frame]");
  if (!button) return;
  studio.frame = button.dataset.frame;
  renderStudio();
});

tintOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tint]");
  if (!button) return;
  studio.tint = button.dataset.tint;
  renderStudio();
});

engravingInput.addEventListener("input", () => {
  studio.engraving = engravingInput.value.slice(0, 14);
  renderStudio();
});

$("#addCustom").addEventListener("click", () => {
  const price = customPrice();
  const engraving = studio.engraving.trim();
  const frameName = selectedName(FRAME_COLORS, studio.frame);
  const tintName = selectedName(TINTS, studio.tint);
  const shapeName = SHAPES[studio.shape].label;

  const thumbnail = buildGlassesSVG({
    shape: studio.shape,
    frame: studio.frame,
    tint: studio.tint,
    engraving,
    background: true,
    palette: {
      bg1: "#f2fffa",
      bg2: "#c8f4de",
      glowA: "#9dffd1",
      glowB: "#e7ffc0",
    },
    title: "Tu diseño SuperVista",
  });

  addToCart({
    key: `custom:${Date.now()}`,
    name: `Montura ${shapeName}`,
    detail: `${frameName} · Lente ${tintName}${engraving ? ` · “${engraving}”` : ""}`,
    price,
    img: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(thumbnail)}`,
  });
});

/* ---------------- menú móvil ---------------- */

const nav = $("#primaryNav");
const menuButton = $("#menuButton");

function closeMobileNav() {
  nav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
}

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMobileNav();
});

document.addEventListener("click", (event) => {
  if (
    nav.classList.contains("is-open") &&
    !nav.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    closeMobileNav();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMobileNav();
});

/* ---------------- formulario ---------------- */

$("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#newsletterEmail");
  const status = $("#newsletterStatus");

  if (!input.value.trim() || !input.checkValidity()) {
    status.textContent = "Escribe un correo válido para unirte al club.";
    input.focus();
    return;
  }

  status.textContent = "¡Listo! Tu 10% va en camino a tu correo.";
  event.currentTarget.reset();
  showToast("Bienvenida al Club SuperVista");
});

/* ---------------- header + reveal ---------------- */

const header = $("#siteHeader");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const revealItems = $$("[data-reveal]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* ---------------- init ---------------- */

cartPanel.setAttribute("inert", "");
renderProducts();
renderShapeOptions();
renderColorOptions();
renderStudio();
renderCart();
