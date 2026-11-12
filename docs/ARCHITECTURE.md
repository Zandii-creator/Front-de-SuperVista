# SuperVista — Arquitectura del frontend

> **Radiografía oficial del proyecto.** Última actualización: **11 de noviembre de 2026**.
> Alcance: frontend estático (`index.html`, `css/`, `js/`, `assets/`, `tools/`). No incluye el plan de backend, que vive en [`PLAN-ESCALABILIDAD.md`](PLAN-ESCALABILIDAD.md) y **no está implementado**.
>
> Este documento describe lo que existe hoy. Si cambia una vista, un dato, una interacción o la persistencia, hay que actualizarlo.

---

## 0. Resumen ejecutivo

SuperVista es una **landing page de una sola página** construida con HTML, CSS y JavaScript vanilla. No hay framework, bundler, router, tests ni backend.

- **Pantallas:** una sola (`/`), con 6 secciones principales, header/footer globales y un carrito lateral con 3 estados.
- **Datos:** catálogo y opciones del personalizador **hardcodeados** en JavaScript. No hay carpeta de datos ni API.
- **Estado:** vive en memoria (`cart`, `studio`, `activeFilter`, `orderSuccess`) y se persiste solo el carrito en `localStorage`.
- **Backend:** **no existe**. No hay ni una llamada `fetch`, `XMLHttpRequest` ni `sendBeacon`. El checkout y el newsletter son simulaciones locales.
- **Puntos de integración futura:** 18 interacciones inventariadas en la sección 5; 6 de ellas son flujos de negocio con posible llamada al backend.

**Conclusión de la auditoría:** el front está bien organizado para su tamaño y tiene una accesibilidad y una estética cuidadas, pero **toda la lógica de negocio vive en el cliente**. Antes de cobrar de verdad hay que mover precios, stock, pedidos y correos al servidor.

**Método de esta pasada:** lectura de los archivos de runtime, inventario de IDs y `data-*`, revisión de eventos y persistencia, `node --check` de los cuatro módulos y smoke test HTTP del servidor local (200 en `/`, CSS y JS). No se ejecutó Lighthouse ni una prueba manual en navegador en esta pasada.

---

## 1. Mapa arquitectónico en texto plano

### 1.1 Capas actuales

```text
┌─────────────────────────────────────────────────────────────────────┐
│ CAPA 1 · PRESENTACIÓN (DOM)                                         │
│ index.html                                                          │
│ Estructura, copy, secciones, carrito, toast y metadatos SEO.        │
└───────────────┬─────────────────────────────────┬───────────────────┘
                │ <link rel="stylesheet">         │ <script type="module">
┌───────────────▼───────────────────┐ ┌───────────▼───────────────────┐
│ CAPA 2 · ESTILOS                  │ │ CAPA 3 · COMPORTAMIENTO       │
│ css/styles.css                    │ │ js/app.js                     │
│ Tokens, layout, componentes,      │ │ Estado, eventos, render,      │
│ animaciones y responsive.         │ │ filtros, carrito y estudio.   │
└───────────────────────────────────┘ └───────────┬───────────────────┘
                                                  │ import { ... }
                                      ┌───────────▼───────────────────┐
                                      │ CAPA 4 · DOMINIO GRÁFICO      │
                                      │ js/frames.js                  │
                                      │ SHAPES, FRAME_COLORS, TINTS,  │
                                      │ buildGlassesSVG(), shapeIcon()│
                                      └───────────┬───────────────────┘
                                                  │ importa el renderizador
┌───────────────────────────────────┐ ┌───────────▼───────────────────┐
│ CAPA 5 · ASSETS GENERADOS         │ │ HERRAMIENTAS NODE (solo dev)  │
│ assets/img/*.svg                  │◄┤ tools/generate-assets.mjs     │
│ Imágenes de producto y favicon.   │ │ tools/serve.mjs               │
└───────────────────────────────────┘ └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ CAPA 6 · PERSISTENCIA LOCAL                                         │
│ localStorage["supervista.cart.v1"]  ← solo el carrito               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND                                                             │
│ (no existe)  0 endpoints · 0 fetch · 0 base de datos · 0 auth       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ CAPA 7 · WORKFLOW DE CAMBIOS (solo desarrollo)                      │
│ openspec/config.yaml · openspec/specs/ · openspec/changes/          │
│ .agents/skills/openspec-*                                           │
│ Planifica y documenta cambios; no participa en el runtime.          │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Flujo de una interacción típica

```text
Usuario
  │ clic / input / submit
  ▼
Evento DOM delegado o directo (js/app.js)
  │
  ▼
Estado en memoria (cart, studio, activeFilter, orderSuccess)
  │
  ├──► Render con plantillas string + innerHTML
  │       └──► DOM actualizado (grid, carrito, precio, toast)
  │
  └──► saveCart() ──► localStorage["supervista.cart.v1"]

Futuro (no implementado):
  └──► fetch("/api/...") ──► backend ──► base de datos / pago / correo
```

### 1.3 Dependencias entre archivos

```text
index.html
├── css/styles.css
└── js/app.js ──────────────► js/frames.js
                               ▲
tools/generate-assets.mjs ─────┘
tools/serve.mjs ──► sirve todo el árbol por HTTP

js/app.js ──► localStorage
js/app.js ──► IDs y data-* del DOM de index.html (contrato implícito)
```

No hay imports de CSS desde JS, ni JS desde HTML salvo `js/app.js`, ni dependencias de runtime instaladas por npm.

---

## 2. Estructura de capas, carpetas y responsabilidades

### 2.1 Árbol real del proyecto

```text
EspejuelosSuper/
├── index.html                  Página completa (única vista)
├── package.json                Scripts y "type": "module"; sin dependencias
├── README.md                   Presentación y guía rápida
├── AGENTS.md                   Contexto operativo para agentes de IA
├── nn.docx                     Archivo personal; NO rastrear ni commitear
│
├── css/
│   └── styles.css              Sistema visual completo (2.587 líneas)
│
├── js/
│   ├── app.js                  Lógica de la landing (700 líneas)
│   └── frames.js               Datos gráficos + renderizador SVG (187 líneas)
│
├── assets/
│   └── img/
│       ├── aurora.svg          Producto generado
│       ├── nova.svg            Producto generado
│       ├── lumen.svg           Producto generado
│       ├── orbit.svg           Producto generado
│       ├── vela.svg            Producto generado
│       ├── prisma.svg          Producto generado
│       └── favicon.svg         Favicon generado
│
├── tools/
│   ├── generate-assets.mjs     Regenera assets/img/*.svg desde frames.js
│   └── serve.mjs               Servidor estático de desarrollo
│
├── openspec/
│   ├── config.yaml             Contexto de OpenSpec (artefactos en español)
│   ├── specs/                  Comportamiento actual, por dominio
│   └── changes/                Propuestas en curso y archive/
│
├── .agents/
│   └── skills/openspec-*       Skills generadas por el CLI para OpenCode
│
└── docs/
    ├── SPEC.md                 Especificación funcional y técnica
    ├── CHANGELOG.md            Bitácora de cambios y pendientes
    ├── PLAN-ESCALABILIDAD.md   Propuesta de TypeScript + backend
    └── ARCHITECTURE.md         Este documento
```

### 2.2 Carpetas: qué hay y qué no hay

| Ruta | Tipo | Responsabilidad | Contiene |
|---|---|---|---|
| `index.html` | Presentación | Toda la estructura y el copy de la landing | Header, hero, colección, estudio, beneficios, reseñas, CTA, footer, carrito y toast |
| `css/` | Estilos | Sistema visual, componentes y responsive | `styles.css` |
| `js/` | Comportamiento y dominio | Datos simulados, estado, eventos y renderizado | `app.js`, `frames.js` |
| `assets/img/` | Recursos estáticos | Imágenes de producto y favicon | 7 SVG **generados**; no editar a mano |
| `tools/` | Tooling de desarrollo | Servir el sitio y regenerar assets | `serve.mjs`, `generate-assets.mjs` |
| `openspec/` | Workflow de cambios | Contexto, specs de comportamiento y propuestas | `config.yaml`, `specs/`, `changes/` |
| `.agents/skills/` | Tooling de IA | Skills de OpenSpec que OpenCode descubre automáticamente | `openspec-*/SKILL.md` |
| `docs/` | Documentación | Especificación, historial, plan y arquitectura | 4 documentos Markdown |

**No existen** (y conviene saberlo antes de buscar):

- `pages/` o `views/`: no hay páginas separadas ni router. Todo vive en `index.html`.
- `components/`: no hay componentes de framework. Los “componentes” son bloques HTML con clases BEM + funciones de render en `js/app.js`.
- `data/`, `mocks/` o `fixtures/`: los datos simulados están inline en `js/app.js` (`PRODUCTS`) y `js/frames.js` (`SHAPES`, `FRAME_COLORS`, `TINTS`).
- `services/`, `api/` o `lib/`: no hay capa de red.
- `public/` o `dist/`: no hay build ni carpeta de salida.
- Tests, lint, CI, TypeScript, `.env`: no existen.

### 2.3 Capas lógicas

| Capa | Archivo(s) | Responsabilidad | Depende de |
|---|---|---|---|
| Presentación | `index.html` | Semántica, copy, landmarks, IDs y SEO | CSS, `app.js` |
| Estilos | `css/styles.css` | Tokens, layout, componentes, estados, animaciones y breakpoints | Nada |
| Comportamiento/UI | `js/app.js` | Estado, eventos, filtros, carrito, personalizador, menú y newsletter | `frames.js`, DOM, `localStorage` |
| Dominio gráfico | `js/frames.js` | Formas, colores, tintes y generación de SVG | Nada (reutilizable en navegador y Node) |
| Persistencia | `localStorage` | Guardar y recuperar el carrito | Navegador |
| Assets | `assets/img/*.svg` | Arte de producto y favicon | `generate-assets.mjs` |
| Tooling | `tools/*.mjs` | Servidor local y regeneración de imágenes | Node, `frames.js` |
| Workflow | `openspec/`, `.agents/skills/` | Planificar cambios y mantener specs verificables | CLI OpenSpec (global) |
| Documentación | `docs/`, `AGENTS.md`, `README.md` | Contexto, especificación e historial | Nada |

La separación es **lógica, no física**. `js/app.js` concentra catálogo, estado, render y eventos; es el archivo con más responsabilidades y el primero que convendría dividir si el proyecto crece.

---

## 3. Inventario de vistas, secciones y componentes

### 3.1 Pantallas

Hay **una sola pantalla**: la landing en `/` (`index.html`). No hay rutas, historial ni deep links salvo anclas internas.

Estados de interfaz que cambian lo que se ve:

| Estado | Dónde | Qué cambia |
|---|---|---|
| Header con scroll | Global | `.is-scrolled` a partir de 8 px de scroll |
| Menú móvil abierto | Header ≤ 900 px | `.is-open`, `aria-expanded`, panel desplegable |
| Filtro activo | Colección | `aria-pressed` y re-render de tarjetas |
| Carrito vacío | Carrito | Icono, mensaje y CTA “Explorar la colección” |
| Carrito con ítems | Carrito | Lista, totales, envío y botón de compra |
| Pedido confirmado | Carrito | Check, número `SV-#####` y CTA “Seguir explorando” |
| Toast visible | Global | Mensaje temporal de 2,6 s |
| Reveal on scroll | Secciones | `.is-visible` vía `IntersectionObserver` |
| Focus trap | Carrito abierto | Tab/Shift+Tab ciclan dentro del panel |

### 3.2 Bloques visuales de la landing

| # | Bloque | Ancla / ID | Componentes internos | Origen |
|---|---|---|---|---|
| 1 | Skip link | `.skip-link` | Enlace “Saltar al contenido” | HTML |
| 2 | Atmósfera | `.page-glow` | Dos halos decorativos fijos | HTML + CSS |
| 3 | Header | `#siteHeader` | Marca, nav de 5 enlaces, botón “Diseñar”, botón de carrito con contador, botón hamburguesa | HTML + JS |
| 4 | Hero | `.hero` | Píldora “Nueva colección”, H1, lead, 2 CTAs, prueba social (avatares + estrellas), visual con órbitas, halo, chip “Drop 026”, imagen Aurora y 2 tarjetas flotantes (“Escaneo 3D”, precio) | HTML + CSS |
| 5 | Marquee | `.marquee` | Cinta infinita con 6 ventajas duplicadas | HTML + CSS |
| 6 | Colección | `#coleccion` | Eyebrow, H2, intro, 6 filtros, grid de 6 tarjetas, pie con enlace al estudio | HTML + `renderProducts()` |
| 7 | Tarjeta de producto | `.card` | Imagen SVG, etiqueta opcional, botón “+”, nombre, precio, forma + meta, 3 swatches, badge UV400 | `cardMarkup()` |
| 8 | Estudio / personalizador | `#personaliza` | Preview en vivo, precio, badge de grabado, 3 fieldsets (forma, color, tinte), input de grabado con contador, botón “Añadir al carrito” con precio, nota de envío | HTML + `renderStudio()` |
| 9 | Beneficios | `#beneficios` | 4 tarjetas: prueba virtual, lentes, envío/devoluciones, garantía | HTML |
| 10 | Reseñas | `#resenas` | Badge 4.9, 3 testimonios con estrellas y avatares | HTML |
| 11 | Club SuperVista / CTA | `.section--cta` | Panel oscuro con 2 decoraciones, copy y formulario de email + estado | HTML + JS |
| 12 | Footer | `.footer` | Marca y descripción, redes, “Explorar”, “Ayuda”, “Hablemos”, legal | HTML |
| 13 | Carrito lateral | `#cart` | Overlay, cabecera, cuerpo con 3 estados, pie con subtotal/envío/total/hint, botón de compra y nota de pago seguro | HTML + JS |
| 14 | Toast | `#toast` | Mensaje global `role="status"` | HTML + JS |

### 3.3 Detalle del personalizador

| Sub-bloque | ID / selector | Comportamiento |
|---|---|---|
| Vista previa | `#customPreview` | Se regenera completa con `buildGlassesSVG()` en cada cambio |
| Precio de preview | `#customPrice` | `$99` o `$108` con grabado |
| Badge de grabado | `#engravingBadge` | Muestra `Grabado: “texto”` si hay texto |
| Formas | `#shapeOptions` | 6 botones con `aria-pressed`; icono + etiqueta |
| Colores de montura | `#frameOptions` | 6 swatches con `aria-label`, `title` y `aria-pressed` |
| Tintes | `#tintOptions` | 6 swatches con el mismo patrón |
| Nombre de montura | `#frameName` | Se sincroniza con la selección |
| Nombre de tinte | `#tintName` | Se sincroniza con la selección |
| Grabado | `#engraving` | Máximo 14 caracteres; recorta en JS además de `maxlength` |
| Contador | `#charCount` | `0–14` |
| Añadir | `#addCustom` | Crea una línea nueva `custom:<timestamp>` con miniatura data URI |

### 3.4 Detalle del carrito

| Estado | Markup | Pie | Checkout |
|---|---|---|---|
| Vacío | `emptyMarkup()` | Oculto | Deshabilitado |
| Con ítems | `itemMarkup()` por línea | Visible | Habilitado |
| Éxito | `successMarkup()` + código `SV-#####` | Oculto | Deshabilitado |

Cada línea muestra miniatura, nombre, detalle, control de cantidad `− / +`, precio de línea y enlace “Eliminar”.

---

## 4. Datos, estado y persistencia

### 4.1 Datos simulados actuales

| Dato | Ubicación | Forma |
|---|---|---|
| Catálogo | `PRODUCTS` en `js/app.js` | 6 objetos con `id`, `name`, `shape`, `group`, `price`, `tag`, `meta`, `img`, `alt`, `colors` |
| Formas | `SHAPES` en `js/frames.js` | 6 claves con `label`, `lens`, `bridge`, `temple`, `highlight` |
| Colores de montura | `FRAME_COLORS` en `js/frames.js` | 6 pares `{ name, value }` |
| Tintes | `TINTS` en `js/frames.js` | 6 pares `{ name, value }` |
| Reseñas | HTML de `#resenas` | 3 testimonios hardcodeados |
| Beneficios | HTML de `#beneficios` | 4 tarjetas hardcodeadas |

### 4.2 Constantes de negocio

| Constante | Valor | Uso |
|---|---|---|
| `FREE_SHIPPING` | `60` | Umbral de envío gratis (USD) |
| `SHIPPING_COST` | `6` | Envío por debajo del umbral (USD) |
| `CUSTOM_BASE` | `99` | Montura personalizada (USD) |
| `ENGRAVING_COST` | `9` | Grabado personalizado (USD) |
| `CART_KEY` | `"supervista.cart.v1"` | Clave de `localStorage` |
| Máximo por línea | `9` | Se aplica al cargar, al añadir y en los botones |

### 4.3 Modelos de datos

Producto:

```js
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
  colors: ["#0f6b4f", "#5fd7a8", "#dcffb0"]
}
```

Ítem del carrito:

```js
{
  key: "product:aurora" | "custom:1720000000000",
  name: "Aurora",
  detail: "Redondo · Bioacetato flexible · luz azul",
  price: 89,
  img: "assets/img/aurora.svg" | "data:image/svg+xml;charset=utf-8,...",
  qty: 1
}
```

Estado del personalizador:

```js
{
  shape: "redondo",
  frame: "#0f6b4f",
  tint: "#7cf7c0",
  engraving: ""
}
```

Pedido: **no hay modelo**. El checkout solo genera un string `SV-#####` en la variable `orderSuccess`; no guarda cliente, líneas, total ni estado.

### 4.4 Estado en memoria

| Variable | Tipo | Para qué |
|---|---|---|
| `cart` | `Array` | Líneas del carrito |
| `activeFilter` | `string` | Filtro de colección activo (`todos` por defecto) |
| `orderSuccess` | `string \| null` | Código de pedido simulado |
| `studio` | `object` | Selección del personalizador |
| `toastTimer` | `number \| null` | Temporizador del toast |
| `lastFocused` | `Element \| null` | Restauración de foco al cerrar el carrito |

### 4.5 Persistencia

- Se guarda **solo el carrito** en `localStorage` bajo `supervista.cart.v1`.
- Al cargar se valida que sea un array, que cada ítem tenga `key`, precio finito y `qty > 0`; la cantidad se limita a `1–9`.
- Si `localStorage` falla (modo privado, cuota llena), el carrito sigue funcionando en memoria; el error se ignora.
- Las miniaturas personalizadas se guardan como **data URI SVG** dentro del propio ítem. Son el principal riesgo de cuota.
- No se persisten: filtro, selección del personalizador, estado del pedido, correo del newsletter ni preferencias.

---

## 5. Puntos de contacto con el backend (hoy simulados)

> **Hallazgo principal:** actualmente hay **cero llamadas HTTP**. Esta sección inventaría los puntos donde el backend entrará; ninguno está conectado.

### 5.1 Inventario de interacciones

| # | Punto de contacto | Ubicación | Disparador | Datos que maneja | Comportamiento actual | Integración futura sugerida |
|---|---|---|---|---|---|---|
| 1 | Añadir producto | `#productGrid` → `[data-add]` | Clic en “+” de una tarjeta | `id` del producto | `addToCart()`, abre carrito y toast | `POST /api/cart/items` o validación de stock/precio |
| 2 | Cambiar forma | `#shapeOptions` | Clic | `shape` | Re-render local del SVG | Cotización o guardado de configuración |
| 3 | Cambiar montura | `#frameOptions` | Clic | `frame` | Re-render local | Igual que #2 |
| 4 | Cambiar tinte | `#tintOptions` | Clic | `tint` | Re-render local | Igual que #2 |
| 5 | Escribir grabado | `#engraving` | `input` | Texto ≤ 14 caracteres | Re-render y precio `$99`/`$108` | Validación server-side del texto y del precio |
| 6 | Añadir diseño personalizado | `#addCustom` | Clic | Forma, montura, tinte, grabado, precio | Crea `custom:<timestamp>` y miniatura data URI | `POST /api/customizations` + `POST /api/orders` |
| 7 | Cambiar cantidad | `.cart-item [data-qty]` | Clic en `−` / `+` | `key`, delta | Modifica `qty` en memoria y guarda | `PATCH /api/cart/items/:key` |
| 8 | Eliminar línea | `.cart-item [data-remove]` | Clic en “Eliminar” | `key` | Quita la línea y guarda | `DELETE /api/cart/items/:key` |
| 9 | Finalizar compra | `#checkout` | Clic | Carrito completo | Genera `SV-#####`, vacía carrito, muestra éxito; **no pide pago ni envía nada** | `POST /api/orders` → pasarela (Stripe/Checkout) → webhook |
| 10 | Newsletter | `#newsletterForm` | `submit` | Email | Valida con JS, muestra éxito, resetea; **no guarda el correo** | `POST /api/newsletter` con doble opt-in |
| 11 | Cargar carrito | `loadCart()` | Inicio de la página | JSON local | Lee y valida `localStorage` | `GET /api/cart` si hay cuenta/sesión |
| 12 | Guardar carrito | `saveCart()` | Cada cambio | JSON del carrito | Escribe `localStorage` | Sincronización con backend (opcional) |
| 13 | Filtrar colección | `#filters` | Clic | `data-filter` | Filtro local sobre `PRODUCTS` | `GET /api/products?shape=...` si el catálogo crece |
| 14 | Navegación por anclas | Header/footer | Clic | `#coleccion`, `#personaliza`, etc. | Scroll suave local | Sin backend |
| 15 | Redes, ayuda y legal | Footer | Clic | — | Enlaces `href="#top"` **placeholder** | URLs reales o páginas informativas |
| 16 | Contacto | Footer | Clic | — | `mailto:hola@supervista.app` | Formulario o helpdesk |
| 17 | Tipografías | `<head>` | Carga de página | — | Petición externa a Google Fonts | Autoalojar fuentes si se busca privacidad/rendimiento |
| 18 | Imágenes de producto | `assets/img/*.svg` | Render | — | Archivos locales generados | CDN si cambia el catálogo |

### 5.2 Qué envía hoy cada flujo (payload real)

| Flujo | Payload actual | Destino |
|---|---|---|
| Añadir producto | `{ key, name, detail, price, img, qty: 1 }` | `localStorage` |
| Añadir personalizado | El mismo objeto, con `key: custom:<timestamp>` y `img` data URI | `localStorage` |
| Cambiar cantidad | Carrito completo serializado | `localStorage` |
| Checkout | Solo un string `SV-#####` en memoria | Ninguno |
| Newsletter | Email validado en el input | Ninguno |

### 5.3 Endpoints propuestos (NO implementados)

> Son una recomendación de diseño, no una especificación cerrada. El servidor debe **recalcular siempre** precios, envío y totales; nunca confiar en los del cliente.

| Método | Ruta propuesta | Uso |
|---|---|---|
| `GET` | `/api/products` | Catálogo y stock |
| `POST` | `/api/cart/items` | Añadir línea (si el carrito se sincroniza) |
| `PATCH` | `/api/cart/items/:key` | Cambiar cantidad |
| `DELETE` | `/api/cart/items/:key` | Eliminar línea |
| `POST` | `/api/customizations` | Guardar configuración estructurada del diseño |
| `POST` | `/api/orders/quote` | Cotizar carrito (precios, envío, impuestos) |
| `POST` | `/api/orders` | Crear pedido y sesión de pago |
| `GET` | `/api/orders/:id` | Estado del pedido |
| `POST` | `/api/newsletter` | Alta con doble opt-in |
| `POST` | `/api/auth/*` | Cuentas, si se añaden |

---

## 6. Contrato DOM ↔ JavaScript

`js/app.js` consulta el DOM por ID al cargar el módulo. Si se renombra o elimina un ID, la app falla en tiempo de ejecución. IDs críticos:

```text
Global:      siteHeader · primaryNav · menuButton · cartButton · cartButtonLabel
             cartCount · toast
Colección:   filters · productGrid
Estudio:     customPreview · customPrice · engravingBadge · shapeOptions
             frameOptions · frameName · tintOptions · tintName
             engraving · charCount · addCustom · addCustomPrice
Carrito:     cart · overlay · cartClose · cartItems · cartFoot · cartBody
             cartSubtotal · cartShipping · cartTotal · cartHint · checkout
             cartTitleCount
Newsletter:  newsletterForm · newsletterEmail · newsletterStatus
Anclas:      top · coleccion · personaliza · beneficios · resenas
```

Atributos de comportamiento:

| Atributo | Uso |
|---|---|
| `data-filter` | Filtro de colección |
| `data-add` | Añadir producto desde una tarjeta |
| `data-shape` | Selección de forma |
| `data-frame` | Selección de color de montura |
| `data-tint` | Selección de tinte |
| `data-qty` | Cambio de cantidad (`-1` / `1`) |
| `data-remove` | Eliminar línea del carrito |
| `data-close-cart` | Cerrar carrito desde estados vacío/éxito |
| `data-reveal` | Animación de aparición al hacer scroll |

---

## 7. Sistema visual y responsive (resumen arquitectónico)

`css/styles.css` está organizado por comentarios de sección:

```text
:root / reset / accesibilidad
atmosphere → buttons → header → hero → hero visual → marquee
sections → collection → studio/customizer → benefits → reviews
cta → footer → cart → toast → reveal → animations → responsive
```

- **Tokens:** colores, sombras, radios, easing y fuentes en `:root`.
- **Contenedor:** máximo `1180 px`, padding `24 px` (`18 px` en móvil).
- **Breakpoints:** `1024`, `900`, `640`, `380` px + `prefers-reduced-motion`.
- **Patrón:** clases BEM (`bloque__elemento--modificador`), estados con `.is-*`.
- **Movimiento:** `IntersectionObserver` para `[data-reveal]`, animaciones CSS para tarjetas, órbitas, marquee y toast; todo se reduce con `prefers-reduced-motion`.

---

## 8. Hallazgos de auditoría

### 8.1 Fortalezas

- Separación clara entre **renderizador gráfico** (`frames.js`) y **lógica de página** (`app.js`).
- `frames.js` no depende del DOM ni del navegador: se reutiliza en Node para generar assets.
- Assets 100 % locales y reproducibles; no hay dependencia de imágenes externas.
- Accesibilidad cuidada: landmarks, skip link, `aria-pressed`, foco atrapado, `inert`, `Escape`, `aria-live`, `alt` descriptivos y contraste.
- Validación defensiva al hidratar el carrito y `escapeHtml()` en los textos dinámicos del carrito.
- Persistencia tolerante a fallos: si `localStorage` no está disponible, el carrito sigue en memoria.
- Sin dependencias de runtime; única petición externa: Google Fonts.

### 8.2 Riesgos y deuda técnica

| Severidad | Hallazgo | Impacto | Recomendación |
|---|---|---|---|
| **Alta** | Precios, envío y totales se calculan en el cliente | Cualquiera puede alterar el carrito o el precio desde la consola | Recalcular todo en el servidor al crear el pedido |
| **Alta** | Checkout sin datos de cliente, pago ni pedido persistido | No se puede cumplir una compra real ni dar seguimiento | Añadir formulario, `POST /api/orders` y pasarela |
| **Alta** | Newsletter no guarda el correo | Se pierde el 100 % de los leads | Conectar API con doble opt-in |
| **Media** | Miniaturas personalizadas como data URI en `localStorage` | Cuota llena; `setItem` falla silenciosamente y el carrito deja de persistir | Guardar solo el ID de configuración o una URL corta |
| **Media** | “Prueba virtual con IA” y “Escaneo 3D” no existen | Promesa de marketing sin producto detrás | Implementarla o retirar el copy |
| **Media** | Sin tests, lint, tipado ni CI | Regresiones silenciosas al crecer | Vitest/Playwright + TypeScript + GitHub Actions |
| **Media** | `og:image` con ruta relativa | Algunos rastreadores no generan preview | URL absoluta al publicar |
| **Media** | Añadir con cantidad ya en 9 muestra “añadido” aunque no incremente | Feedback engañoso | Avisar “máximo 9 por artículo” |
| **Baja** | `item.img` se inserta sin escapar en el carrito | Si se manipula `localStorage`, se puede romper el atributo `src` | Escapar o validar el valor |
| **Baja** | `#cartBody` y algunos selectores existen pero no se usan | Ruido menor | Limpiar o documentar |
| **Baja** | Reseñas, rating y prueba social hardcodeados | No son datos reales | Mover a datos/API si se publica |
| **Baja** | Enlaces de redes, ayuda, legal y cookies son placeholders | Navegación incompleta | Definir URLs reales |
| **Baja** | SVG de estrellas duplicado en HTML | Mantenimiento repetitivo | Extraer a plantilla o icono reutilizable |

### 8.3 Observaciones sobre el contrato de datos

- El carrito no guarda `productId` ni `sku`; guarda `key` y un `img`. Un backend necesitará identificadores estables y cantidades, no el precio.
- El diseño personalizado no guarda la configuración estructurada (`shape`, `frame`, `tint`, `engraving`): solo el texto de `detail`. Para fabricarlo haría falta un objeto de configuración.
- El pedido no existe como entidad. El código `SV-#####` es aleatorio y no se puede consultar después.
- No hay distinción entre “carrito invitado” y “carrito de usuario”; no hay sesión.

---

## 9. Guía para ampliar sin romper la arquitectura

| Cambio | Archivos a tocar | Pasos |
|---|---|---|
| Nueva montura | `js/app.js`, `tools/generate-assets.mjs` | Añadir a `PRODUCTS`, añadir entrada de asset, `npm run assets`, actualizar `SPEC.md` |
| Nueva forma | `js/frames.js` | Añadir a `SHAPES` con `label`, `lens`, `bridge`, `temple`, `highlight`; regenerar assets si aplica |
| Nuevo color o tinte | `js/frames.js` | Añadir a `FRAME_COLORS` o `TINTS`; el personalizador se actualiza solo |
| Nuevo filtro | `index.html`, `js/app.js` | Botón con `data-filter` y productos con el mismo `group` |
| Nueva sección | `index.html`, `css/styles.css` | Reutilizar `.section`, `.container`, `.section__head`; añadir ancla al nav si aplica |
| Nuevo estado del carrito | `js/app.js`, `css/styles.css` | Añadir markup, render y estilos; mantener foco y `aria-live` |
| Conectar backend | Nuevo `js/api.js` (propuesto) + `js/app.js` | Centralizar `fetch`, eliminar autoridad de precios del cliente, manejar errores/carga |
| Cambio no trivial | `openspec/changes/<cambio>/` | Explorar, proponer, revisar, aplicar y archivar con OpenSpec |
| Cambiar precios | `js/app.js` | Constantes y `PRODUCTS`; actualizar `SPEC.md` y `AGENTS.md` |
| Cambiar paleta | `css/styles.css` | Variables de `:root`; evitar valores mágicos |

---

## 10. Checklist para mantener este documento

Actualizar `docs/ARCHITECTURE.md` cuando:

1. Se añada o elimine una sección, vista o estado de UI.
2. Cambie el modelo de `PRODUCTS`, del carrito o del personalizador.
3. Se añada una interacción que pueda enviar datos.
4. Se conecte un endpoint real o se sustituya una simulación.
5. Cambie la clave o el formato de `localStorage`.
6. Se añada una carpeta, herramienta o dependencia.
7. Cambien los breakpoints o la estructura de capas.
8. Cambie el workflow de OpenSpec, la ubicación de las specs o las skills generadas.

---

## 11. Documentos relacionados

- [`../AGENTS.md`](../AGENTS.md) — contexto operativo y reglas del proyecto.
- [`../openspec/config.yaml`](../openspec/config.yaml) — contexto de generación de OpenSpec.
- [`SPEC.md`](SPEC.md) — especificación funcional y técnica detallada.
- [`CHANGELOG.md`](CHANGELOG.md) — historial de cambios y pendientes.
- [`PLAN-ESCALABILIDAD.md`](PLAN-ESCALABILIDAD.md) — propuesta de TypeScript + backend (**no implementada**).
- [`../README.md`](../README.md) — presentación y guía rápida.
