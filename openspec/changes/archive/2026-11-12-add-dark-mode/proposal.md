# Proposal

## Why

La landing solo ofrece hoy una apariencia clara. El CSS mezcla tokens de `:root` con decenas de colores literales, y los paneles que ya son oscuros (carrito, checkout, toast, estudio) están fijados a mano. Eso impide ofrecer un modo oscuro coherente y hace que el sitio ignore la preferencia del sistema operativo, algo que los usuarios esperan de una interfaz moderna.

## What Changes

- Introducir una capa de tokens semánticos de tema en `css/styles.css` (superficie, superficie elevada, texto, texto atenuado, borde, acento, sombra) con valores para tema claro y oscuro, y sustituir los colores literales de los componentes por esos tokens.
- Declarar el tema con `data-theme="light|dark"` en `<html>` y `color-scheme` para que los controles nativos acompañen.
- Añadir un botón de tema en el header (escritorio) y dentro del menú móvil, con estado accesible (`aria-pressed` y etiqueta dinámica en español).
- Resolver el tema inicial antes del primer pintado con un script inline en el `<head>`, evitando el parpadeo de tema incorrecto (FOUC).
- Persistir la elección en `localStorage` bajo `supervista.theme.v1`; si no hay elección guardada, seguir `prefers-color-scheme` y reaccionar a cambios del sistema.
- Adaptar al tema oscuro las superficies que hoy son claras y también las que ya son oscuras (carrito, checkout simulado, toast, estudio del personalizador), de modo que el cambio de modo se perciba en toda la interfaz.
- Actualizar `meta[name="theme-color"]` según el tema activo.
- Mantener sin cambios la lógica de catálogo, carrito, precios, checkout y persistencia del carrito.

Fuera de alcance:

- Variantes oscuras de `assets/img/*.svg`: las imágenes de producto se mantienen tal cual.
- Backend, detección de tema en servidor o nuevas dependencias.
- Cambios de copy, precios o flujos de negocio.

## Capabilities

### New Capabilities

- `theme-mode`: comportamiento del tema visual de la landing: resolución inicial, cambio manual, persistencia, accesibilidad del control y cobertura de todas las superficies de la interfaz.

### Modified Capabilities

Ninguna. `openspec/specs/` está vacío; este cambio crea la primera capacidad.

## Impact

- `index.html`: atributo de tema en `<html>`, script de resolución temprana, botón de tema en el header y en el menú móvil, `meta[name="theme-color"]`.
- `css/styles.css`: tokens semánticos, bloque de tema oscuro y reemplazo de colores literales en header, hero, colección, filtros, estudio, beneficios, reseñas, newsletter, footer, menú móvil, carrito, checkout y toast.
- `js/app.js`: lectura y escritura de `supervista.theme.v1`, resolución del tema inicial, toggle accesible, escucha de `prefers-color-scheme` y sincronización de `aria-pressed`/`meta theme-color`.
- `docs/SPEC.md`, `docs/ARCHITECTURE.md` y `docs/CHANGELOG.md`: documentar el nuevo comportamiento y el punto de integración.
- Riesgo principal: contraste insuficiente en textos pequeños y en los paneles que ya eran oscuros; se verifica con la checklist manual y Lighthouse.
