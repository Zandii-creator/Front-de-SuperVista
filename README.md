# SuperVista

Landing page de venta de espejuelos personalizados, con estética verde pastel y futurista. HTML, CSS y JavaScript vanilla, sin frameworks ni dependencias.

Repositorio: [Zandii-creator/Front-de-SuperVista](https://github.com/Zandii-creator/Front-de-SuperVista)

## Cómo verla

```bash
npm start
```

Abre `http://localhost:5173`. También puedes usar cualquier servidor estático; es necesario servirla por HTTP porque el JavaScript usa módulos ES.

## Qué incluye

- **Colección filtrable** con 6 monturas y arte SVG generado localmente.
- **Personalizador en vivo**: forma, color de montura, tinte, grabado y precio dinámico.
- **Carrito funcional**: añadir, cantidades, eliminar, envío gratis desde $60, total y checkout simulado.
- **Persistencia** del carrito en `localStorage` (incluye miniaturas de diseños personalizados).
- **Diseño responsive** con menú móvil, animaciones de scroll y respeto por `prefers-reduced-motion`.
- **Accesibilidad**: navegación por teclado, foco atrapado en el carrito, etiquetas ARIA y contraste verificado (Lighthouse 100 en accesibilidad, buenas prácticas y SEO).

## Estructura

```
index.html                 Página completa
css/styles.css             Sistema visual y responsive
js/app.js                  Productos, filtros, carrito y personalizador
js/frames.js               Formas, colores y renderizador SVG de monturas
assets/img/*.svg           Imágenes de producto y favicon
tools/generate-assets.mjs  Generador de las imágenes SVG
tools/serve.mjs            Servidor estático local
AGENTS.md                  Contexto operativo para agentes de IA
docs/SPEC.md               Especificación funcional y técnica
docs/CHANGELOG.md          Historial de cambios y pendientes
```

## Documentación

- **[`AGENTS.md`](AGENTS.md)**: contexto que OpenCode carga automáticamente en cada sesión (arquitectura, reglas, diseño, accesibilidad y flujo de Git).
- **[`docs/SPEC.md`](docs/SPEC.md)**: especificación completa de la landing, catálogo, personalizador, carrito y decisiones técnicas.
- **[`docs/CHANGELOG.md`](docs/CHANGELOG.md)**: qué se ha hecho, cuándo y qué queda pendiente.

## Personalización rápida

- **Productos y precios**: array `PRODUCTS` en `js/app.js`.
- **Formas, colores y tintes**: constantes `SHAPES`, `FRAME_COLORS` y `TINTS` en `js/frames.js`.
- **Paleta general**: variables CSS en `:root` dentro de `css/styles.css`.
- **Imágenes**: edita `tools/generate-assets.mjs` y ejecuta `npm run assets` para regenerar los SVG.

El checkout es una simulación de demostración: genera un número de pedido y vacía el carrito, sin pasarela de pago real.
