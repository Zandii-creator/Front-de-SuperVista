# SuperVista

Landing page de venta de espejuelos personalizados, con estética verde pastel y futurista. HTML, CSS y JavaScript vanilla, sin frameworks ni dependencias de runtime. Los cambios no triviales se planifican con OpenSpec.

Repositorio: [Zandii-creator/Front-de-SuperVista](https://github.com/Zandii-creator/Front-de-SuperVista)

## Cómo verla

```bash
npm start
```

Abre `http://localhost:5173`. También puedes usar cualquier servidor estático; es necesario servirla por HTTP porque el JavaScript usa módulos ES.

## OpenSpec

Los cambios no triviales se planifican con [OpenSpec](https://openspec.dev) antes de escribir código. El CLI se instala una vez por máquina (Node ≥ 22.12); no es una dependencia del proyecto y no se añade a `package.json`:

```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

Estructura del proyecto:

```text
openspec/
├── config.yaml   Contexto y reglas de generación
├── specs/        Comportamiento actual, por dominio
└── changes/      Propuestas en curso y archivo histórico
.agents/skills/   Skills de OpenSpec para OpenCode
```

Ciclo de trabajo: **explorar → proponer → revisar → aplicar → archivar**. Las propuestas viven en `openspec/changes/<cambio>/` y no se implementa nada hasta que el plan esté aprobado.

```bash
openspec list              # cambios activos
openspec list --specs      # specs principales
openspec validate --all    # validar todo
```

Las skills disponibles en OpenCode son `openspec-explore`, `openspec-propose`, `openspec-update-change`, `openspec-apply-change`, `openspec-sync-specs` y `openspec-archive-change`.

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
openspec/config.yaml       Contexto de OpenSpec para generar artefactos
openspec/specs/            Comportamiento actual del sistema
openspec/changes/          Propuestas en curso y archivo
.agents/skills/            Skills de OpenSpec para OpenCode
docs/SPEC.md               Especificación funcional y técnica
docs/CHANGELOG.md          Historial de cambios y pendientes
docs/ARCHITECTURE.md       Radiografía de capas, vistas e integraciones
docs/PLAN-ESCALABILIDAD.md Propuesta de TypeScript + backend (no implementada)
```

## Documentación

- **[`AGENTS.md`](AGENTS.md)**: contexto que OpenCode carga automáticamente en cada sesión (arquitectura, reglas, diseño, accesibilidad y flujo de Git).
- **[`openspec/`](openspec/)**: specs de comportamiento y cambios planificados con OpenSpec; el contexto de generación está en `config.yaml`.
- **[`docs/SPEC.md`](docs/SPEC.md)**: especificación completa de la landing, catálogo, personalizador, carrito y decisiones técnicas.
- **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**: radiografía oficial de capas, carpetas, vistas, componentes, datos y puntos de contacto con el backend.
- **[`docs/CHANGELOG.md`](docs/CHANGELOG.md)**: qué se ha hecho, cuándo y qué queda pendiente.
- **[`docs/PLAN-ESCALABILIDAD.md`](docs/PLAN-ESCALABILIDAD.md)**: propuesta de migración a TypeScript y backend (no implementada).

## Personalización rápida

- **Productos y precios**: array `PRODUCTS` en `js/app.js`.
- **Formas, colores y tintes**: constantes `SHAPES`, `FRAME_COLORS` y `TINTS` en `js/frames.js`.
- **Paleta general**: variables CSS en `:root` dentro de `css/styles.css`.
- **Imágenes**: edita `tools/generate-assets.mjs` y ejecuta `npm run assets` para regenerar los SVG.

El checkout es una simulación de demostración: genera un número de pedido y vacía el carrito, sin pasarela de pago real.
