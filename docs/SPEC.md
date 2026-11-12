# SuperVista — Especificación funcional y técnica

> Documento de referencia detallado. El resumen operativo para agentes está en [`../AGENTS.md`](../AGENTS.md). El historial de cambios está en [`CHANGELOG.md`](CHANGELOG.md).

## 1. Visión del producto

SuperVista es una marca ficticia de espejuelos personalizados. La landing debe transmitir:

- **Personalización real:** el usuario elige forma, color de montura, tinte y grabado.
- **Estética futurista y accesible:** verde pastel, superficies de cristal, brillos suaves y retícula tecnológica.
- **Compra simple:** descubrir, personalizar, añadir al carrito y finalizar en pocos pasos.

Público objetivo: personas jóvenes/adultas que buscan gafas con diseño y valoran la personalización. El tono es cercano, en español y con trato de “tú”.

### Objetivos

- Presentar la colección y el personalizador como propuesta de valor central.
- Permitir completar un flujo de compra de demostración sin fricción.
- Funcionar en móvil, tableta y escritorio sin frameworks.

### Fuera de alcance (estado actual)

- Pago real, backend, cuentas de usuario, inventario o envío de correos.
- Prueba virtual con cámara/IA: hoy existe solo como mensaje de marketing.
- Páginas de producto individuales o blog.

## 2. Arquitectura de la información

Orden de la página:

1. **Header fijo** con marca, navegación, botón “Diseñar” y carrito.
2. **Hero** con propuesta de valor, CTAs, prueba social e imagen de producto.
3. **Marquee** con ventajas (envío, prueba virtual, lentes, garantía).
4. **Colección** (`#coleccion`) con filtros por forma y 6 tarjetas.
5. **Estudio de personalización** (`#personaliza`) con vista previa en vivo y controles.
6. **Beneficios** (`#beneficios`) con 4 tarjetas.
7. **Reseñas** (`#resenas`) con valoración media y 3 testimonios.
8. **Club SuperVista** con formulario de correo.
9. **Footer** con navegación, ayuda, contacto y legal.
10. **Carrito lateral** (dialog) y **toast** global.

Los enlaces internos del header y footer usan anclas a estas secciones. El header es sticky y las secciones tienen `scroll-margin-top` para no quedar tapadas.

## 3. Identidad visual

### Paleta

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#07251c` | Texto principal, botones, paneles oscuros |
| `--ink-2` | `#0f3d2f` | Variante de profundidad |
| `--mint` | `#b9f5d9` | Fondos suaves, iconos, acentos |
| `--mint-2` | `#7ce8b8` | Brillos, subrayados, detalles |
| `--lime` | `#dcffb0` | Acentos sobre fondo oscuro |
| `--paper` | `#f4fdf9` | Fondo general |
| `--muted` | `#527065` | Texto secundario |
| Acento accesible | `#1b6f53` | Texto pequeño sobre fondos claros |
| Panel oscuro | `#0f4a38` → `#07251c` | Gradientes del estudio |

### Tema claro y oscuro

El tema se representa con `data-theme="light"` o `data-theme="dark"` en `<html>`. Un script inline en `<head>` resuelve el tema antes del primer pintado:

1. Lee `localStorage["supervista.theme.v1"]`; si vale `light` o `dark`, lo aplica.
2. Si no hay elección guardada, usa `prefers-color-scheme`.
3. Actualiza `meta[name="theme-color"]` (`#f4fdf9` en claro, `#041a14` en oscuro).

`js/theme.js` mantiene la alternancia, la persistencia y la sincronización de los controles; también escucha cambios del sistema mientras no haya elección manual. Los botones `[data-theme-toggle]` viven en el header y en el menú móvil, usan `aria-pressed` y una etiqueta dinámica (“Activar modo oscuro” / “Activar modo claro”).

Los colores se organizan en dos capas: la **paleta de marca** de la tabla y los **tokens semánticos** (`--surface`, `--surface-raised`, `--text`, `--text-muted`, `--border`, `--accent`, etc.). El tema oscuro redefine solo la capa semántica:

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--surface` | `#f4fdf9` | `#041a14` | Fondo de página |
| `--surface-raised` | `#ffffff` | `#0b2f26` | Tarjetas, carrito y paneles |
| `--surface-sunken` | `#f7fdfa` | `#061f18` | Controles hundidos |
| `--text` | `#07251c` | `#eafff5` | Texto principal |
| `--text-muted` | `#527065` | `#a9c6ba` | Texto secundario |
| `--border` | `rgba(7, 37, 28, 0.1)` | `rgba(185, 245, 217, 0.14)` | Bordes |
| `--accent` | `#0f6b4f` | `#7ce8b8` | Enlaces y acentos |
| `--surface-inverse` | `#07251c` | `#0b2f26` | Paneles oscuros |

El cambio de tema usa una transición de 300 ms acotada por la clase `theme-transition`; con `prefers-reduced-motion: reduce` se aplica de inmediato. Las imágenes de producto no cambian entre temas.

### Tipografía

- **Space Grotesk** (400–700): títulos, precios, marca.
- **Manrope** (400–700): cuerpo, controles y navegación.
- Fallbacks: `Trebuchet MS`, `Segoe UI`, `sans-serif`.
- Títulos con `letter-spacing` negativo (−0.035 a −0.045 em) y line-height compacto.

### Formas y superficies

- Radios: `18px` controles, `28px` tarjetas, `38px` paneles grandes, `999px` píldoras.
- Bordes: token `--border` (`rgba(7, 37, 28, 0.1)` en claro, verde translúcido en oscuro).
- Sombras suaves de gran difusión; glassmorphism en header, tarjetas flotantes y carrito.
- Retícula de fondo en el estudio y la sección CTA, enmascarada radialmente.
- Microanimaciones: flotación, órbitas, marquee, aparición de tarjetas, pulso del punto “nuevo”.

### Breakpoints

| Ancho | Cambios principales |
|---|---|
| ≤ 1024 px | Beneficios a 2 columnas, footer a 3 columnas, hero más compacto |
| ≤ 900 px | Navegación a menú hamburguesa, hero a 1 columna, estudio y reseñas a 1 columna |
| ≤ 640 px | CTAs a ancho completo, producto a 1 columna, footer a 1 columna, CTA y formulario apilados |
| ≤ 380 px | Opciones de forma a 2 columnas |

## 4. Catálogo

Los datos viven en `PRODUCTS` (`js/app.js`). Todos los precios son USD y se muestran sin decimales.

| ID | Nombre | Forma | Grupo de filtro | Precio | Etiqueta |
|---|---|---|---|---|---|
| `aurora` | Aurora | Redondo | `redondos` | $89 | Best seller |
| `nova` | Nova | Cuadrado | `cuadrados` | $109 | Nuevo |
| `lumen` | Lumen | Cat-eye | `cat-eye` | $99 | Icónico |
| `orbit` | Orbit | Aviador | `aviadores` | $119 | Edición limitada |
| `vela` | Vela | Ovalado | `otros` | $79 | — |
| `prisma` | Prisma | Geométrico | `otros` | $129 | Futurista |

Cada producto incluye una descripción corta (`meta`), una imagen SVG local (`assets/img/<id>.svg`), un `alt` descriptivo y tres muestras de color decorativas.

### Filtros

- Botones: Todos, Redondos, Cuadrados, Cat-eye, Aviador, Otros.
- El botón activo usa `aria-pressed="true"` y la clase `.is-active`.
- Al filtrar se vuelve a renderizar la cuadrícula con animación escalonada (`--i`).

### Tarjetas de producto

- Imagen cuadrada con etiqueta opcional arriba a la izquierda.
- Botón circular “+” abajo a la derecha que añade el producto al carrito.
- Nombre, precio, forma + descripción, muestras de color y badge “UV400”.
- Cada tarjeta se genera con `cardMarkup()` y se delega el clic del botón en `#productGrid`.

## 5. Personalizador

### Estado

```js
{
  shape: "redondo",
  frame: "#0f6b4f",
  tint: "#7cf7c0",
  engraving: ""
}
```

### Opciones

- **Formas (6):** redondo, cuadrado, cat-eye, aviador, ovalado, geométrico.
- **Monturas (6):** Bosque `#0f6b4f`, Jade `#2f9e78`, Menta `#5fd7a8`, Lima `#c4f77e`, Noche `#0a2f26`, Cristal `#e6fff7`.
- **Tintes (6):** Menta `#7cf7c0`, Cristal `#e8fff8`, Lima `#d9ffb0`, Aqua `#8fe9ff`, Rosa `#ffd6ea`, Humo `#b7c9c3`.
- **Grabado:** texto libre, máximo 14 caracteres, opcional.

### Reglas

- Precio base: **$99**. Con grabado no vacío: **$108**.
- El nombre de la forma se muestra en el botón de añadir; el precio se sincroniza en la vista previa, el botón y el toast.
- El grabado se muestra en una insignia sobre la vista previa (`Grabado: “texto”`).
- “Añadir al carrito” crea un ítem único:
  - Nombre: `Montura <Forma>`.
  - Detalle: `<Montura> · Lente <Tinte> · “<grabado>”`.
  - `key`: `custom:<timestamp>`.
  - Miniatura: SVG con fondo generado y codificado como data URI.
- La vista previa se reconstruye con `buildGlassesSVG()` en cada cambio. Cada SVG usa IDs únicos (`svN`) para evitar colisiones de gradientes.

### Renderizador SVG

`js/frames.js` expone:

- `SHAPES`: lente, puente, patilla y brillo por forma.
- `FRAME_COLORS`, `TINTS`.
- `buildGlassesSVG({ shape, frame, tint, engraving, background, palette, title, className })`.
- `shapeIcon(shapeKey)`: icono de contorno para los botones.

El SVG usa un `viewBox="0 0 800 800"`, dos lentes simétricos (el derecho se refleja con `matrix(-1 0 0 1 800 0)`), gradientes de lente/montura, patillas, puente, reflejos y grabado sobre la patilla derecha. Con `background: true` añade degradado pastel, retícula, círculos, sombra y el wordmark “SUPERVISTA”.

## 6. Carrito

### Modelo de ítem

```js
{
  key: "product:aurora" | "custom:1720000000000",
  name: "Aurora",
  detail: "Redondo · Bioacetato flexible · luz azul",
  price: 89,
  img: "assets/img/aurora.svg",
  qty: 1
}
```

### Comportamiento

- Persistencia en `localStorage` (`supervista.cart.v1`). Al cargar se valida la estructura y se limita la cantidad a 1–9.
- Añadir un producto existente incrementa su cantidad (máx. 9). Un diseño personalizado siempre crea una línea nueva.
- Al añadir: guardar, re-renderizar, animar el badge, abrir el carrito y mostrar toast.
- Cantidades: botones − / +; al bajar de 1 se elimina la línea.
- Eliminar: enlace “Eliminar” por ítem, con toast.
- Subtotal: suma de `price × qty`.
- Envío: gratis si subtotal ≥ $60; si no, $6.
- Total: subtotal + envío.
- Si falta para el envío gratis, se muestra “Te faltan $X para el envío gratis”; si no, “¡Envío gratis desbloqueado!”.
- El pie del carrito se oculta cuando está vacío.

### Estados del panel

1. **Vacío:** icono, mensaje, CTA “Explorar la colección”.
2. **Con ítems:** lista, subtotal, envío, total y botón “Finalizar compra”.
3. **Éxito:** check, mensaje, número de pedido `SV-#####`, CTA “Seguir explorando”. El carrito se vacía y el pie se oculta.

### Interacción

- Se abre con el botón del header; overlay con blur; bloqueo del scroll del body.
- `aria-hidden` e `inert` cuando está cerrado; foco al botón de cerrar al abrir.
- Se cierra con la X, el overlay, `Escape` o los CTA de los estados vacío/éxito.
- El foco se restaura al elemento que abrió el panel.
- Trampa de foco con Tab/Shift+Tab mientras está abierto.
- Al cerrar tras una compra se restablece el estado de éxito.
- Los CTA de “explorar” hacen scroll suave a `#coleccion`.

### Checkout (demostración)

- Genera un pedido aleatorio `SV-10000`–`SV-99999`.
- Vacía carrito y `localStorage`.
- Muestra el estado de éxito y un toast.
- No solicita datos de pago ni envía información a ningún servidor.

## 7. Newsletter

- Formulario `#newsletterForm` con `novalidate`; la validación se hace por JS.
- Correo inválido o vacío: mensaje “Escribe un correo válido para unirte al club.”
- Correo válido: mensaje de éxito, reseteo del formulario y toast de bienvenida.
- No hay backend: no se almacena el correo.

## 8. Navegación y header

- Header sticky con blur; añade `.is-scrolled` a partir de 8 px de scroll.
- Menú móvil (≤ 900 px): botón hamburguesa con `aria-expanded`, panel desplegable, cierre al pulsar un enlace, fuera del panel, con `Escape` o al volver a escritorio.
- El botón del carrito incluye un nombre accesible dinámico: “Abrir carrito, N artículos”.
- El contador visual está oculto a tecnologías de asistencia (`aria-hidden`).
- El conmutador de tema aparece como botón circular en el header de escritorio y como fila con icono y texto dentro del menú móvil. Ambos comparten `[data-theme-toggle]`, `aria-pressed` y etiqueta dinámica.

## 9. Animaciones y movimiento

- Aparición al hacer scroll con `IntersectionObserver` (`data-reveal`, threshold 0.12, rootMargin inferior −6%).
- Tarjetas de producto con `cardIn` escalonado.
- Hero: flotación, órbitas y halo; tarjetas flotantes con movimiento suave.
- Marquee infinito con contenido duplicado.
- Toast con transición desde arriba.
- Cambio de tema con transición de 300 ms limitada por `theme-transition`; no se aplica si el usuario pide movimiento reducido.
- Todo se desactiva prácticamente con `prefers-reduced-motion: reduce`.

## 10. Accesibilidad

- `lang="es"`, skip link, landmarks (`header`, `main`, `footer`, `nav`), jerarquía de encabezados.
- Foco visible global (`:focus-visible`, 2 px, token `--focus`: `#2f9e78` en claro y `#9ff3cf` en oscuro).
- Contraste de texto pequeño ≥ 4.5:1 en ambos temas; el acento `--accent-strong` (`#1b6f53` en claro) se usa para textos pequeños.
- El conmutador de tema anuncia su estado con `aria-pressed` y una etiqueta que describe la acción (“Activar modo oscuro” / “Activar modo claro”); es operable con `Enter` y `Espacio`.
- Botones de forma/filtros con `aria-pressed`; swatches con `aria-label` y `aria-pressed`; iconos decorativos con `aria-hidden`.
- Carrito como `role="dialog"`, `aria-modal="true"`, foco atrapado y restaurado, `inert` al cerrar.
- Estrellas de reseñas con `role="img"` y etiqueta “5 de 5 estrellas”.
- Grid de productos y estado del formulario con regiones `aria-live`/`role="status"`.
- Imágenes con `alt` descriptivo; miniaturas del carrito con `alt=""` (decorativas).
- Resultado de referencia: Lighthouse 100 en accesibilidad, buenas prácticas y SEO.

## 11. Responsive y layout

- Contenedor de 1180 px con 24 px de padding (18 px en móvil).
- Hero: 2 columnas en escritorio; 1 columna con visual debajo en ≤ 900 px.
- Tarjetas: `repeat(auto-fill, minmax(280px, 1fr))`; 1 columna en ≤ 640 px.
- Estudio: 2 columnas; se apila en móvil; vista previa oscura con alto mínimo que baja a 360 px.
- Carrito: 430 px de ancho, 100dvh, ancho completo en móvil.
- Los botones principales ocupan todo el ancho en móvil; el formulario del club se apila.

## 12. Estructura técnica

```text
index.html        ← incluye el script inline que resuelve el tema antes del pintado
css/styles.css
js/frames.js      ← sin dependencias; puede importarse desde Node
js/theme.js       ← tema claro/oscuro y persistencia
js/app.js         ← importa frames.js y theme.js
assets/img/*.svg
tools/generate-assets.mjs
tools/serve.mjs
```

- No hay bundler: el navegador carga `js/app.js` como módulo ES.
- `tools/generate-assets.mjs` importa `js/frames.js` directamente (requiere `"type": "module"` en `package.json`, ya presente).
- `tools/serve.mjs` sirve archivos estáticos con tipos MIME y puerto configurable con `PORT` (5173 por defecto).
- Los SVG de producto se generan con `npm run assets`; no editar manualmente salvo que se sepa que se regenerarán.
- La única dependencia externa en tiempo de ejecución son las fuentes de Google; existen fallbacks.

## 13. SEO y metadatos

- `title`: “SuperVista · Espejuelos personalizados del futuro”.
- `meta description` orientada a conversión.
- Open Graph básico (`og:title`, `og:description`, `og:type`, `og:image` con ruta relativa).
- `theme-color` dinámico según el tema (`#f4fdf9` / `#041a14`), favicon SVG, `lang="es"`, viewport correcto.
- Una sola `h1`; secciones con `h2` y tarjetas con `h3`.

## 14. Limitaciones conocidas

- Checkout simulado, sin pago ni backend.
- La “prueba virtual con IA” y el “escaneo 3D” son mensajes de marketing, no funcionalidades reales.
- El carrito es local al navegador; no se sincroniza entre dispositivos.
- No hay página de detalle de producto ni selector de tallas/medidas.
- No hay tests automatizados ni pipeline de CI.
- Las imágenes son ilustraciones SVG genéricas, no fotografías de producto.
- `og:image` es relativa; algunos rastreadores requieren URL absoluta para previsualizaciones.
- El formulario de newsletter no persiste correos.

## 15. Próximos pasos posibles

1. Publicar con GitHub Pages y añadir URL absoluta a Open Graph.
2. Implementar una prueba virtual real (cámara + Face Landmarks) o retirar la promesa.
3. Añadir más monturas, categorías y ordenación por precio.
4. Integrar pago real (Stripe/Checkout) y backend de pedidos.
5. Página de producto con galería, materiales y medidas.
6. Tests de flujo con Playwright y auditoría de rendimiento.
7. Internacionalización (ES/EN) y selector de moneda.

## 16. Decisiones de diseño y producto

- **Vanilla JS a propósito:** requisito inicial del usuario; mantiene el proyecto simple y portable.
- **SVG generados localmente:** garantizan que las imágenes carguen sin depender de servicios externos ni de licencias.
- **Carrito lateral en lugar de página aparte:** reduce fricción y mantiene el contexto de compra.
- **Checkout simulado:** suficiente para una pieza publicitaria/demostración; no se presenta como pago real.
- **Verde pastel + paneles oscuros:** equilibrio entre estética futurista y legibilidad.
- **Precios en USD:** decisión de la versión actual; se puede cambiar en `PRODUCTS` y en `money`.
- **Persistencia en `localStorage`:** mantiene el carrito entre recargas sin backend.
