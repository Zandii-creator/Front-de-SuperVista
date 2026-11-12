# Design

## Context

Ver `proposal.md` para la motivación. El estado actual que condiciona el enfoque:

- `css/styles.css` tiene 2195 líneas y ~40 valores hexadecimales distintos, muchos usados una sola vez. Solo una parte pasa por `:root`; el resto está fijado en componentes concretos.
- Los paneles del carrito, checkout, toast y estudio ya usan fondos oscuros (`#07251c`, `#0f4a38`, `#fbfffd`), pero con valores literales y sin relación entre sí.
- `index.html` carga un único módulo diferido (`js/app.js`) y declara `theme-color` fijo en `#07251c`.
- No hay build ni tests. La verificación es manual y con Lighthouse.

## Goals / Non-Goals

**Goals:**

- Un único punto de verdad para el tema (`data-theme` en `<html>`) y una capa de tokens semánticos que todos los componentes consuman.
- Cero destello de tema incorrecto en la carga inicial.
- Refactor del tema claro sin cambios visuales perceptibles, para poder revisar el oscuro por separado.

**Non-Goals:**

- Reorganizar el CSS en varios archivos o introducir capas (`@layer`) que cambien el orden de cascada.
- Añadir un tercer estado "auto" visible en la UI; el modo automático es el comportamiento por defecto, no una opción del control.
- Tokens para las imágenes de producto ni variantes oscuras de los SVG.

## Decisions

### 1. `data-theme` en `<html>` con valor explícito

El script de arranque siempre escribe `data-theme="light"` o `data-theme="dark"`; no se depende de la ausencia del atributo.

- **Por qué:** el atributo en `<html>` cubre `html`, `body` y el fondo del documento, y permite alternar `color-scheme` en el mismo nodo. Un valor explícito evita ramas `:root:not([data-theme])` y hace trivial el CSS.
- **Alternativas descartadas:** clase en `<body>` (llega más tarde y no controla el fondo del documento); solo `@media (prefers-color-scheme)` (impide el override manual); clase `.dark` (mismo efecto pero menos explícita para `color-scheme`).

### 2. Script inline mínimo en `<head>` + módulo de hidratación

Un `<script>` clásico, sin `defer` ni `type="module"`, se ejecuta antes del primer pintado: lee `supervista.theme.v1`, valida el valor, consulta `matchMedia("(prefers-color-scheme: dark)")` si no hay elección, aplica `data-theme`, `color-scheme` y `meta[name="theme-color"]`.

`js/theme.js` (módulo ES importado por `app.js`) se encarga después de: estado del botón, toggle, persistencia, escucha del sistema y actualización de metadatos.

- **Por qué:** los módulos ES son diferidos por definición y no pueden evitar el FOUC. El inline es la única forma sin build ni petición extra.
- **Coste:** la clave de `localStorage` aparece dos veces (inline y módulo) y no puede importarse. Se mitiga con una constante con nombre idéntico y un comentario cruzado en ambos archivos.
- **Alternativas descartadas:** script externo bloqueante (petición extra y latencia); aceptar el flash (incumple la spec); renderizar el tema en servidor (no hay backend).

### 3. Dos capas de tokens

1. **Paleta base:** se conservan `--ink`, `--mint`, `--mint-2`, `--lime`, `--aqua`, `--paper`, `--white` como valores de marca.
2. **Tokens semánticos:** `--surface`, `--surface-raised`, `--surface-sunken`, `--surface-inverse`, `--text`, `--text-muted`, `--text-inverse`, `--border`, `--border-strong`, `--accent`, `--accent-strong`, `--on-accent`, `--shadow-lg`, `--shadow-md`, `--glow-1`, `--glow-2`.

Los componentes pasan a usar solo la capa semántica. `[data-theme="dark"]` redefine únicamente esa capa.

- **Por qué:** los colores literales actuales (por ejemplo `#eafff5` repetido 17 veces, `#0f6b4f` 13 veces) son el verdadero coste del modo oscuro. Sin una capa intermedia habría que duplicar reglas por componente y el mantenimiento se vuelve frágil.
- **Alternativa descartada:** bloque `[data-theme="dark"]` con overrides por selector (`.card`, `.cart`, `.toast`...). Es más rápido al principio, pero deja dos fuentes de verdad y garantiza olvidos.
- **Alternativa descartada:** `filter: invert()` sobre la página. Rompe la marca, las imágenes y el contraste.

### 4. Paleta oscura derivada de la existente

El tema oscuro no invierte el claro; reinterpreta la misma familia verde:

- Fondo base: `#041a14` (más profundo que `--ink`).
- Superficie elevada: `#07251c` y `#0b2f26`.
- Texto principal: `#eafff5`; texto atenuado: `#a9c6ba`.
- Acento: se mantienen `--mint-2` y `--lime`; `--accent-strong` pasa a un mint más luminoso para texto pequeño.
- Bordes: `rgba(185, 245, 217, 0.14)` y `0.24`.

Los tonos nuevos se justifican por derivación directa del matiz de `--ink` y `--mint`; no se introduce ninguna familia de color ajena. `--muted` (`#527065`) no se reutiliza como texto sobre fondo oscuro porque no alcanza 4.5:1.

### 5. Los paneles ya oscuros se reubican, no se dejan igual

Carrito, checkout, toast y estudio pasan a `--surface-raised` / `--surface-inverse` con bordes y sombras del tema. En oscuro quedan un escalón más claros que el fondo de página, de modo que se distingan; en claro conservan su contraste actual.

- **Por qué:** dejar los paneles oscuros intactos haría que el cambio de modo no se percibiera en las zonas más visibles y aplanaría la jerarquía.
- **Riesgo controlado:** el texto `#eafff5` sobre `#07251c` ya cumple; solo hay que revisar los textos atenuados y los estados hover.

### 6. Control de tema único con dos puntos de montaje

Dos `<button data-theme-toggle>` (header y menú móvil) comparten una función `syncThemeControls()` que actualiza `aria-pressed`, `aria-label` y el icono visible. El nombre accesible describe la acción y el estado:

- En claro: `aria-label="Activar modo oscuro"`, `aria-pressed="false"`.
- En oscuro: `aria-label="Activar modo claro"`, `aria-pressed="true"`.

Se descarta un `checkbox` disfrazado de switch porque el patrón botón + `aria-pressed` ya se usa en filtros y controles del personalizador, y es el más simple de operar con Enter y Espacio.

### 7. Transición de tema acotada

El cambio de colores se anima solo cuando se añade la clase `theme-transition` a `<html>` durante el toggle, y se retira al terminar. La carga inicial no lleva esa clase. Bajo `prefers-reduced-motion: reduce` no se añade.

- **Por qué:** animar `color`/`background` globalmente en la carga inicial produce un efecto de barrido y penaliza el primer pintado.
- **Alternativa descartada:** `transition` permanente en `*`; provoca repintados y animaciones no deseadas en hover y scroll.

### 8. El sistema solo manda mientras no haya elección

La ausencia de la clave significa "seguir al sistema". El evento `change` de `matchMedia` actualiza el tema solo en ese caso. Cualquier toggle escribe la clave y desactiva el seguimiento.

- **Por qué:** distingue de forma natural entre "no ha elegido" y "eligió justo lo que el sistema tenía".
- **Alternativa descartada:** guardar también el valor inicial del sistema; añade estado y no cambia el comportamiento observable.

## Risks / Trade-offs

- **Colores literales olvidados** → auditoría con búsqueda de `#` y `rgba(` en `styles.css` al cerrar el refactor; checklist por sección (header, hero, colección, estudio, beneficios, reseñas, newsletter, footer, carrito, toast, menú móvil).
- **FOUC si el inline no se ejecuta** (CSP futura, bloqueo de scripts inline) → el inline no depende de nada externo y se mantiene por debajo de ~15 líneas; si se añade CSP, habrá que autorizarlo por hash. Se documenta en `docs/ARCHITECTURE.md`.
- **Clave duplicada inline/módulo** → misma constante `supervista.theme.v1` con comentario en ambos puntos; una prueba manual de recarga cubre la desincronización.
- **Contraste insuficiente en textos atenuados** → medir los pares críticos con DevTools/axe y ajustar el token, no el componente.
- **Dos botones desincronizados** → un único `syncThemeControls()` llamado tras cada cambio, incluida la inicialización y el cambio por sistema.
- **Coste de refactor en un archivo grande** → hacerlo en dos pasos: primero tokens con tema claro idéntico (revisión visual), después el bloque oscuro.
- **`localStorage` bloqueado** → `try/catch` en lectura y escritura, igual que el carrito; el tema funciona en memoria.

## Migration Plan

1. Introducir tokens semánticos y sustituir literales con el tema claro como valor por defecto; verificar que el sitio claro no cambia.
2. Añadir el bloque `[data-theme="dark"]` y revisar superficie por superficie.
3. Añadir el script inline, `js/theme.js` y los dos botones; conectar `app.js`.
4. Actualizar `docs/SPEC.md`, `docs/ARCHITECTURE.md` y `docs/CHANGELOG.md`.
5. Verificación manual por breakpoints + Lighthouse; commit único o dos (refactor de tokens y modo oscuro) según lo que pida el usuario.

Rollback: revertir el commit devuelve el tema claro original. La clave `supervista.theme.v1` es nueva y no afecta al carrito; si se revierte, queda un valor huérfano inofensivo en `localStorage`.
