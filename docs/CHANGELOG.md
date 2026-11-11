# Changelog — SuperVista

Registro de cambios, decisiones y pendientes. Añadir una entrada al terminar cada bloque de trabajo relevante.

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
