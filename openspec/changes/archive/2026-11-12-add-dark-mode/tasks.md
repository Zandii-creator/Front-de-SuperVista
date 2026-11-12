# Tasks

## 1. Capa de tokens

- [x] 1.1 Definir en `:root` los tokens semánticos (`--surface`, `--surface-raised`, `--surface-sunken`, `--surface-inverse`, `--text`, `--text-muted`, `--text-inverse`, `--border`, `--border-strong`, `--accent`, `--accent-strong`, `--on-accent`, `--glow-1`, `--glow-2`) mapeados a la paleta actual, y verificar con `npm start` que la landing clara se ve igual que antes.
- [x] 1.2 Reemplazar los colores literales de header, hero, botones y filtros por tokens semánticos, y verificar por búsqueda que esas secciones ya no contienen hexadecimales fuera de `:root`.
- [x] 1.3 Reemplazar los colores literales de colección y personalizador (incluidos `#f7fdfa`, `#eafff5`, `#0f6b4f`, `#557467`) por tokens, y verificar que tarjetas, controles y vista previa no cambian en tema claro.
- [x] 1.4 Reemplazar los colores literales de beneficios, reseñas, newsletter, footer y menú móvil por tokens, y confirmar visualmente en escritorio y en 640 px que no hay diferencias respecto a `main`.
- [x] 1.5 Reemplazar los colores literales de carrito, checkout, toast y estudio por `--surface-*`, `--text-*` y `--border-*`, y verificar que el carrito abierto y el toast conservan su apariencia actual.
- [x] 1.6 Documentar la capa de tokens y su relación con la paleta en `docs/ARCHITECTURE.md`, y comprobar que el documento cita los nombres reales definidos en `css/styles.css`.

## 2. Tema oscuro

- [x] 2.1 Añadir el bloque `[data-theme="dark"]` con los valores oscuros de la capa semántica y `color-scheme: dark`, y verificar alternando el atributo a mano en DevTools que ninguna sección queda con fondo claro.
- [x] 2.2 Ajustar los paneles que ya eran oscuros (carrito, checkout, toast, estudio) para que en oscuro queden un escalón por encima del fondo de página, y verificar que se distinguen entre sí y del `body`.
- [x] 2.3 Revisar los pares de texto pequeño sobre fondo (metadatos, notas, ayudas, contadores, placeholders, precios) en ambos temas con DevTools o axe y corregir los tokens que no lleguen a 4.5:1.
- [x] 2.4 Verificar que las imágenes de producto mantienen su marco y fondo sin brillos fuera de lugar en oscuro, y que no se ha modificado ningún archivo de `assets/img/`.
- [x] 2.5 Documentar la paleta oscura y los tokens nuevos en `docs/SPEC.md`, y confirmar que las reglas de negocio existentes siguen referenciadas sin duplicarse.

## 3. Control y persistencia

- [x] 3.1 Añadir en `<head>` de `index.html` el script inline que resuelve `supervista.theme.v1` y `prefers-color-scheme` antes del primer pintado, y verificar con recarga forzada que no aparece un destello del tema contrario.
- [x] 3.2 Crear `js/theme.js` con la lectura/escritura de `supervista.theme.v1`, el toggle, la sincronización de controles, el listener de `matchMedia` y la actualización de `meta[name="theme-color"]`, y verificar que el módulo carga sin errores en consola.
- [x] 3.3 Añadir los botones de tema en el header y en el menú móvil como `<button data-theme-toggle>` con `aria-pressed` y etiqueta dinámica, con su estilo en ambos temas, y verificar que se ven y funcionan en 1024, 900, 640 y 380 px.
- [x] 3.4 Importar e inicializar `js/theme.js` desde `js/app.js` sin alterar el orden del resto de inicializaciones, y verificar que catálogo, carrito y personalizador siguen funcionando.
- [x] 3.5 Verificar la persistencia: cambiar a oscuro, recargar y confirmar que se mantiene; borrar la clave y confirmar que vuelve a mandar el sistema operativo.
- [x] 3.6 Verificar que el cambio de tema no cierra el carrito ni corta el toast, y que un toast visible se repinta con los colores del tema nuevo.
- [x] 3.7 Documentar en `docs/ARCHITECTURE.md` el punto de integración de `js/theme.js`, la clave de almacenamiento y el script inline, y confirmar que el mapa de archivos de `AGENTS.md` incluye el módulo nuevo.

## 4. Accesibilidad y movimiento

- [x] 4.1 Ajustar el color de `:focus-visible` para que sea visible en ambos temas y verificar con teclado que enlaces, botones, filtros, campos y el botón de tema muestran foco claro.
- [x] 4.2 Verificar con teclado (Tab, Enter, Espacio) que ambos botones de tema son operables, que su estado se anuncia correctamente y que el menú móvil se cierra con `Escape` sin romper el tema.
- [x] 4.3 Añadir la transición de tema acotada por la clase `theme-transition` y respetar `prefers-reduced-motion`, y comprobar con la emulación de movimiento reducido de DevTools que el cambio es instantáneo.
- [x] 4.4 Verificar que el foco atrapado del carrito, `inert`/`aria-hidden` y el retorno de foco siguen intactos tras cambiar de tema con el carrito abierto.

## 5. Integración y verificación final

- [x] 5.1 Recorrer la landing completa en tema claro y oscuro a 1024, 900, 640 y 380 px y confirmar que no hay desbordes, superposiciones ni bloques con el tema anterior.
- [x] 5.2 Ejecutar Lighthouse en ambos temas y confirmar que accesibilidad, buenas prácticas y SEO siguen en 100.
- [x] 5.3 Verificar que `localStorage` sigue guardando el carrito bajo `supervista.cart.v1` y que tema y carrito conviven tras recargar y tras finalizar la compra simulada.
- [x] 5.4 Actualizar `docs/CHANGELOG.md` con el cambio, las decisiones de tema y los pendientes, y confirmar que las tres secciones describen el estado real de la implementación.
- [x] 5.5 Ejecutar `openspec validate --all` y confirmar que el cambio y la spec `theme-mode` validan sin errores.

## Workflow follow-up

- Archivar el cambio cuando la revisión manual esté aprobada.
- Hacer commit solo si el usuario lo pide, con mensaje descriptivo en español y sin incluir archivos personales.
