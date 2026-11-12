# Changelog — SuperVista

Registro de cambios, decisiones y pendientes. Añadir una entrada al terminar cada bloque de trabajo relevante.

## 2026-11-12 — Modo oscuro completo

- Añadido tema oscuro para toda la landing: header, hero, colección, personalizador, beneficios, reseñas, newsletter, footer, menú móvil, carrito, checkout y toast.
- Introducida una capa de tokens semánticos en `:root` (`--surface`, `--text`, `--border`, `--accent`, sombras, etc.) sobre la paleta de marca existente; `[data-theme="dark"]` redefine solo esa capa y declara `color-scheme: dark`.
- Nuevo `js/theme.js`: resolución del tema, alternancia, persistencia en `supervista.theme.v1`, sincronización de controles y escucha de `prefers-color-scheme`.
- Script inline en `<head>` para resolver el tema antes del primer pintado y evitar destellos; `meta[name="theme-color"]` se actualiza entre `#f4fdf9` y `#041a14`.
- Añadidos dos controles `[data-theme-toggle]` (header y menú móvil) con `aria-pressed` y etiqueta dinámica “Activar modo oscuro” / “Activar modo claro”.
- Transición de tema de 300 ms acotada por `theme-transition` y desactivada con `prefers-reduced-motion`.
- Verificado contraste de texto pequeño ≥ 4.5:1 en ambos temas, navegación por teclado, foco atrapado del carrito, `Escape`, persistencia tras recarga y convivencia con el carrito.
- Verificado a 1024, 900, 640 y 380 px sin desbordes horizontales ni bloques con el tema anterior.
- Lighthouse en ambos temas: 100 en accesibilidad, buenas prácticas y SEO.
- Actualizados `README.md`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/CHANGELOG.md` y `AGENTS.md`. Sin cambios en `assets/img/*.svg`.
- Cambio OpenSpec `add-dark-mode` archivado en `openspec/changes/archive/2026-11-12-add-dark-mode/`; la spec `theme-mode` pasa a `openspec/specs/theme-mode/`.

## 2026-11-11 — Instalación y configuración de OpenSpec

- Instalado el CLI global `@fission-ai/openspec` 2.0.0 (requiere Node ≥ 22.12).
- Ejecutado `openspec init --tools opencode --language Spanish --no-animation`.
- Creados `openspec/config.yaml`, `openspec/specs/`, `openspec/changes/` y `.agents/skills/openspec-*`.
- Configurado el contexto de `openspec/config.yaml` con el stack, el estado actual y los documentos de referencia, sin duplicar las reglas de `AGENTS.md`.
- Documentado el workflow en `README.md`, `AGENTS.md` y `docs/ARCHITECTURE.md`.
- Sin cambios de comportamiento: el front sigue siendo vanilla y el checkout simulado.
- `openspec validate --all` pasa sin elementos (las specs están vacías a propósito).

## 2026-11-11 — Auditoría de arquitectura del frontend

- Añadido `docs/ARCHITECTURE.md` con la radiografía oficial: capas, carpetas, vistas, componentes, modelos de datos, persistencia y puntos de contacto con un backend futuro.
- Documentado que hoy no existe ninguna llamada HTTP: el checkout y el newsletter son simulaciones locales.
- Inventariados los 18 puntos de interacción y los endpoints propuestos (no implementados).
- Registrados riesgos de deuda técnica, entre ellos la autoridad de precios en el cliente y las miniaturas en `localStorage`.
- `README.md` y `AGENTS.md` actualizados para enlazar el nuevo documento.
- Sin cambios de comportamiento: solo documentación.

## 2026-11-11 — Plan de escalabilidad

- Añadido `docs/PLAN-ESCALABILIDAD.md` con el plan de migración a TypeScript, backend, OpenSpec y workflow por sesiones.
- Creada una copia de consulta en el escritorio: `SuperVista - Arquitectura y Workflow` (README, respuestas y prompt para la siguiente sesión).
- `AGENTS.md` actualizado para referenciar el plan, marcado como **propuesta no implementada**.
- Sin cambios de comportamiento: el front sigue siendo vanilla y el checkout simulado.
- Commit pendiente; no se ha hecho push.

## 2026-11-09 — Documentación de contexto

- Añadido `AGENTS.md` con el contexto operativo del proyecto: arquitectura, reglas de negocio, diseño, accesibilidad y flujo de Git.
- Añadido `docs/SPEC.md` con la especificación funcional y técnica completa.
- Añadido este `CHANGELOG.md`.
- README actualizado con la sección de documentación y la estructura actual.
- Commit local pendiente de subir a GitHub.

## 2026-11-09 — Publicación inicial y accesibilidad

- Repositorio conectado a `origin` (`Zandii-creator/Front-de-SuperVista`) y rama `main` publicada.
- Commit `33450f2`: landing completa con colección, personalizador, carrito y checkout simulado.
- Corregidos avisos de accesibilidad de Lighthouse:
  - Eliminado `aria-label` de contenedores sin rol válido.
  - Añadido `role="img"` a las estrellas de reseñas.
  - Oscurecido el acento de textos pequeños para alcanzar contraste ≥ 4.5:1.
  - Nombre accesible dinámico en el botón del carrito (“Abrir carrito, N artículos”).
- Toast movido a la parte superior para no tapar el botón de compra.
- Los CTA de los estados vacío/éxito del carrito hacen scroll a la colección.
- Resultado: Lighthouse 100 en accesibilidad, buenas prácticas y SEO.
- Autenticación de GitHub configurada mediante Git Credential Manager.

## 2026-11-06 — Versión inicial

- Landing de una página con estética verde pastel y futurista.
- Hero con propuesta de valor, CTAs y prueba social.
- Colección de 6 monturas con filtros por forma.
- Arte SVG local generado para cada producto y favicon.
- Personalizador en vivo: forma, color, tinte, grabado y precio dinámico.
- Carrito lateral con cantidades, subtotal, envío gratis desde $60 y checkout simulado.
- Persistencia del carrito en `localStorage`.
- Secciones de beneficios, reseñas, newsletter y footer.
- Menú móvil, animaciones de scroll, foco atrapado en el carrito y soporte para `prefers-reduced-motion`.
- Servidor estático local y generador de assets.

## Pendientes

- Publicar el sitio con **GitHub Pages** y actualizar `og:image` con URL absoluta.
- Implementar una **prueba virtual real** o ajustar el copy para no prometer una función inexistente.
- Integrar una **pasarela de pago real** y un backend de pedidos (hoy el checkout es simulado).
- Añadir más monturas, ordenación por precio y página de detalle de producto.
- Evaluar backend para el newsletter (hoy no se guarda ningún correo).
- Añadir tests de flujo (Playwright) y un pipeline de CI.
- Valorar `.gitignore` para archivos personales; por ahora `nn.docx` se excluye manualmente y no se commitea.
