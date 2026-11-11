# SuperVista — contexto del proyecto

Landing page publicitaria de venta de espejuelos personalizados, con estética verde pastel y futurista. El front es **HTML + CSS + JavaScript vanilla** (módulos ES), sin frameworks, sin bundler y sin dependencias de runtime.

Este archivo es el contexto que debe leerse al iniciar cualquier sesión de trabajo. Para el detalle funcional completo consulta [`docs/SPEC.md`](docs/SPEC.md); para el estado y los pendientes, [`docs/CHANGELOG.md`](docs/CHANGELOG.md). Para el plan de escalabilidad (backend y TypeScript, **aún no implementado**), consulta [`docs/PLAN-ESCALABILIDAD.md`](docs/PLAN-ESCALABILIDAD.md).

## Estado actual

- Landing de una sola página: hero, colección filtrable, personalizador en vivo, beneficios, reseñas, newsletter, footer, carrito lateral y checkout simulado.
- Repositorio: `https://github.com/Zandii-creator/Front-de-SuperVista` (privado). Rama `main`, remoto `origin`.
- Último commit publicado: `33450f2` — landing completa con personalizador y carrito.
- El checkout es **una simulación**: genera un pedido `SV-#####` y vacía el carrito. No hay pasarela de pago ni backend.
- Pendientes principales: pasarela real, más monturas, publicación con GitHub Pages y sustituir la mención de “prueba virtual” por una implementación real si se solicita.

## Comandos

```bash
npm start        # servidor local en http://localhost:5173
npm run assets   # regenera assets/img/*.svg desde el generador
```

No hay build, tests ni lint. Se debe servir por HTTP porque `js/app.js` usa módulos ES.

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Toda la estructura y el copy de la landing, carrito y toast |
| `css/styles.css` | Sistema visual, componentes, animaciones y responsive |
| `js/app.js` | Catálogo, filtros, carrito, personalizador, menú móvil y formulario |
| `js/frames.js` | Formas (`SHAPES`), colores (`FRAME_COLORS`), tintes (`TINTS`) y renderizador SVG |
| `assets/img/*.svg` | Imágenes de producto y favicon **generadas**; no editarlas a mano |
| `tools/generate-assets.mjs` | Genera las imágenes de producto con `buildGlassesSVG` |
| `tools/serve.mjs` | Servidor estático de desarrollo |
| `docs/SPEC.md` | Especificación funcional y técnica detallada |
| `docs/CHANGELOG.md` | Bitácora de cambios, decisiones y pendientes |
| `docs/PLAN-ESCALABILIDAD.md` | Plan de migración a TypeScript, backend y workflow de cambios (propuesta) |
| `nn.docx` | Archivo personal del usuario. **No rastrear, no borrar, no commitear** |

## Arquitectura y convenciones

- Sin frameworks ni dependencias. No añadir React, Tailwind ni un paso de build salvo petición explícita.
- `js/app.js` es un módulo ES que importa `SHAPES`, `FRAME_COLORS`, `TINTS`, `buildGlassesSVG` y `shapeIcon` desde `js/frames.js`.
- La UI se renderiza con plantillas de string y `innerHTML`, con delegación de eventos sobre contenedores.
- Los productos viven en el array `PRODUCTS` de `js/app.js`; cada uno tiene `id`, `name`, `shape`, `group`, `price`, `tag`, `meta`, `img`, `alt` y `colors`.
- Las imágenes son SVG locales generadas por `tools/generate-assets.mjs`; no dependen de servicios externos de imágenes.
- La única petición externa es Google Fonts (Space Grotesk + Manrope), con fallbacks del sistema.
- Los textos de interfaz van en **español**, con trato de “tú”, y los precios en **USD**.
- Moneda: `Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })`.

## Reglas de negocio

- Envío gratis desde **$60**; por debajo, envío de **$6**.
- Montura personalizada: base **$99**; grabado personalizado **+$9**.
- Grabado máximo: **14 caracteres**.
- Cantidad máxima por línea del carrito: **9**.
- Persistencia: `localStorage` con clave `supervista.cart.v1`. Cada ítem guarda `key`, `name`, `detail`, `price`, `img` y `qty`.
- Los productos se agrupan con `key = "product:<id>"`; cada diseño personalizado usa `key = "custom:<timestamp>"` para no fusionarse con otros.
- Al añadir algo se abre el carrito y se muestra un toast.
- Al finalizar la compra se vacía el carrito, se muestra el estado de éxito y se cierra al salir del panel.

## Sistema de diseño

- Paleta principal: `--ink #07251c`, `--mint #b9f5d9`, `--mint-2 #7ce8b8`, `--lime #dcffb0`, `--paper #f4fdf9`, `--muted #527065`.
- Acento accesible para texto pequeño sobre fondo claro: `#1b6f53`.
- Paneles oscuros: `#07251c` y `#0f4a38`.
- Tipografías: **Space Grotesk** para títulos y **Manrope** para cuerpo.
- Radios: 18 px (controles), 28 px (tarjetas), 38 px (paneles grandes).
- Contenedor máximo: 1180 px. Breakpoints en 1024, 900, 640 y 380 px.
- Estética: glassmorphism, brillos mint, retícula sutil, órbitas y microanimaciones. Respetar `prefers-reduced-motion`.
- Mantener el estilo existente: no introducir colores ajenos a la paleta sin justificarlo.

## Accesibilidad

- Lighthouse debe mantenerse en 100 en accesibilidad, buenas prácticas y SEO.
- Conservar el foco atrapado en el carrito, `inert`/`aria-hidden` cuando está cerrado, cierre con `Escape` y etiquetas ARIA dinámicas.
- Los controles personalizados (forma, color, tinte) usan `aria-pressed`; los filtros también.
- El contraste de texto pequeño debe ser ≥ 4.5:1.
- Las imágenes de producto necesitan `alt` descriptivo; los elementos decorativos, `aria-hidden`.
- Probar navegación por teclado y el menú móvil después de cambios de UI.

## Flujo de Git (preferencia del usuario)

- **“Haz un commit” / “guarda en local”** → solo commit local. **No hacer push.**
- **“Súbelo” / “guarda en GitHub”** → commit (si hay cambios) y push a `origin main`.
- **“Solo push”** → subir commits pendientes sin crear uno nuevo.
- Antes de commitear, revisar `git status` y excluir `nn.docx` y cualquier archivo personal.
- No reescribir historia, no hacer `force push` ni cambiar el remoto sin permiso explícito.
- La autenticación de GitHub está guardada en Git Credential Manager; si vuelve a pedir login, el usuario debe completar la ventana.

## Checklist antes de dar un cambio por terminado

1. Probar con `npm start` y revisar la consola sin errores.
2. Verificar escritorio y móvil (1024 / 900 / 640 / 380 px).
3. Comprobar teclado, foco del carrito y `Escape`.
4. Confirmar que el carrito, totales y `localStorage` siguen funcionando.
5. Mantener el resultado de Lighthouse.
6. Actualizar `docs/CHANGELOG.md` y, si cambia el comportamiento, `docs/SPEC.md`.
7. Hacer commit solo si el usuario lo pidió, con mensaje descriptivo en español.

## Cómo ampliar

- **Nueva montura:** añadir un objeto a `PRODUCTS`; si necesita arte propio, añadir una entrada en `tools/generate-assets.mjs` y ejecutar `npm run assets`; actualizar `docs/SPEC.md`.
- **Nueva forma/color/tinte:** editar `SHAPES`, `FRAME_COLORS` o `TINTS` en `js/frames.js`; el personalizador se actualiza solo. Regenerar imágenes si cambia el arte.
- **Nuevo filtro:** añadir el botón en `index.html` y usar el mismo `data-filter` que el `group` de los productos.
- **Cambios de diseño:** usar las variables CSS de `:root`; evitar valores mágicos repetidos.
