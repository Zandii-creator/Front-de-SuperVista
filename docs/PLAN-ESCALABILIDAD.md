# SuperVista — Plan de escalabilidad y workflow

> **Estado:** propuesta. Nada de esto está implementado todavía. El front actual sigue siendo HTML/CSS/JS vanilla y el checkout sigue siendo una simulación.
>
> Documento de trabajo para la transición a TypeScript + backend y para adoptar OpenSpec. Creado el 11 de noviembre de 2026 a partir de tres preguntas sobre escalabilidad.

## Índice

1. [¿Se puede crear el backend desde la documentación actual?](#1-¿se-puede-crear-el-backend-desde-la-documentación-actual)
2. [Documentación viva vs. OpenSpec](#2-documentación-viva-vs-openspec)
3. [Workflow escalable para TypeScript + backend](#3-workflow-escalable-para-typescript--backend)
4. [Próximos pasos](#4-próximos-pasos)

---

## 1. ¿Se puede crear el backend desde la documentación actual?

### Respuesta corta

**Sí, pero la documentación actual no basta por sí sola.** Describe el producto y el front, no la arquitectura del servidor. Falta una fase de **diseño** (contrato de API, modelo de datos, auth, pagos). Con esas decisiones tomadas, el contexto actual sí sirve para arrancar sin perder el hilo.

### Lo que la documentación ya sabe

`AGENTS.md` y `docs/SPEC.md` ya contienen información valiosa para un backend:

- Catálogo y precios.
- Reglas de envío: gratis desde $60, si no $6.
- Personalización: forma, color, tinte, grabado de máximo 14 caracteres.
- Precio de montura personalizada: $99 + $9 con grabado.
- Cantidad máxima por línea: 9.
- Formato del pedido: `SV-#####`.
- El newsletter hoy no guarda correos.
- El checkout es simulado.

Eso es el **dominio del negocio**. Es la mitad del trabajo.

### Lo que la documentación todavía no sabe

No existen decisiones sobre:

- Qué endpoints hay y qué reciben/devuelven.
- Qué base de datos y qué tablas.
- Cómo se identifica un pedido sin exponer IDs secuenciales.
- Dónde se calcula el dinero.
- Cómo se cobra (Stripe, Mercado Pago, etc.).
- Qué pasa si el pago falla o se reintenta.
- Cómo se envían correos.
- Cómo se autentica el panel de administración.
- Dónde se despliega y cómo se configuran los secretos.
- Validación, rate limiting, CORS, logs.

Eso no se puede “inferir” de un README. Son **decisiones de arquitectura**, y hay que tomarlas explícitamente.

### Un matiz importante: el front no es solo presentación

El front ya tiene lógica real de negocio en el navegador:

- Calcula subtotales y envío.
- Valida cantidades.
- Calcula el precio del personalizador.
- Guarda el carrito en `localStorage`.

El problema no es que no exista lógica, sino que esa lógica **vive en el cliente**, y el cliente no es confiable. Cualquiera puede abrir la consola y cambiar un precio.

**Regla de oro del backend:** el servidor nunca acepta precios ni totales del front. El front envía *qué* quiere comprar; el servidor decide *cuánto cuesta*.

### Stack recomendado para este caso

| Capa | Opción | Por qué |
|---|---|---|
| Lenguaje | **TypeScript** en front y back | Un solo lenguaje, tipos compartidos |
| API | **Node 22 + Fastify** | Rápido, simple, buen soporte de TypeScript |
| Validación | **Zod** | Schemas reutilizables entre front y back |
| Base de datos | **PostgreSQL** (Neon/Supabase) o **SQLite** al inicio | Postgres si va a crecer; SQLite para aprender |
| ORM | **Drizzle** o **Prisma** | Migraciones y consultas tipadas |
| Pagos | **Stripe Checkout** en modo test | No manejas tarjetas, rediriges a Stripe |
| Correos | **Resend** o similar | Confirmación de pedido |
| Tests | **Vitest** + **Playwright** | Unitarios, integración y flujo completo |
| CI | **GitHub Actions** | Typecheck, lint y tests en cada PR |
| Hosting API | Railway / Render / Fly.io | Sencillo para un proyecto pequeño |
| Hosting front | GitHub Pages o Vercel | El front puede seguir siendo estático |

### Contrato de API mínimo (MVP)

```http
GET  /api/products
GET  /api/products/:slug

POST /api/quote
     body: { items: [{ kind, productId?, customization?, qty }] }
     res:  { subtotalCents, shippingCents, totalCents, freeShippingRemainingCents }

POST /api/orders
     body: { items, email, idempotencyKey }
     res:  { orderId, publicId, totals, status: "pending_payment" }

POST /api/orders/:orderId/checkout
     res:  { checkoutUrl }        ← redirige a Stripe

POST /api/webhooks/stripe        ← Stripe confirma el pago
GET  /api/orders/:publicId?token=...   ← estado del pedido para el cliente

POST /api/newsletter
     body: { email }
```

Detalles que importan:

- **`POST /api/quote`** permite mostrar totales en vivo sin que el front sea la autoridad.
- **`idempotencyKey`** evita pedidos duplicados si el usuario hace doble clic o se reintenta la petición.
- **`publicId` + `token`** evita que cualquiera adivine el pedido de otra persona.
- **Webhook** es la única fuente confiable de “pagado”; no confíes en que el navegador vuelva a la página de éxito.
- **Dinero en centavos** (`8900`, no `89`). Evita errores de decimales.

### Modelo de datos inicial

```text
products
  id, slug, name, shape, price_cents, active, created_at

orders
  id, public_id, access_token, status, email,
  subtotal_cents, shipping_cents, total_cents, currency,
  stripe_session_id, created_at, paid_at

order_items
  id, order_id, kind ('catalog' | 'custom'), product_id,
  name, unit_price_cents, qty, customization_json

newsletter_subscribers
  id, email (unique), source, consent_at, created_at
```

`customization_json` guarda forma, color, tinte y grabado; el servidor lo valida y **recalcula el precio** con las reglas del negocio.

### Cómo se conecta el front

Hoy el checkout hace esto:

```js
// simulación actual
const orderId = `SV-${...}`;
cart = [];
```

Debería pasar a algo así:

```js
const res = await fetch(`${API_URL}/api/orders`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ items, email, idempotencyKey: crypto.randomUUID() }),
});
const { checkoutUrl } = await res.json();
window.location.href = checkoutUrl;
```

Y el catálogo puede seguir siendo local al principio, o venir de `GET /api/products`.

### Plan por fases (no todo de golpe)

1. **Fase 0 — Fundaciones:** TypeScript, estructura de carpetas, tests, CI.
2. **Fase 1 — Catálogo desde API:** `GET /api/products`, sin tocar pagos.
3. **Fase 2 — Cotización y pedidos:** `POST /api/quote` y `POST /api/orders`, todavía sin cobrar.
4. **Fase 3 — Pago real:** Stripe Checkout + webhook + correo de confirmación.
5. **Fase 4 — Migración del front a TypeScript** y retirada de la lógica duplicada.
6. **Fase 5 — Limpieza:** quitar promesas no implementadas, panel de pedidos, documentación final.

Cada fase puede ser **un cambio de OpenSpec**. Así no se hace una migración gigante e inmanejable.

---

## 2. Documentación viva vs. OpenSpec

### La diferencia en una frase

- La documentación actual es un **mapa del sistema**: qué es, cómo funciona y qué reglas tiene.
- OpenSpec es un **expediente de obras**: qué vamos a cambiar, por qué, cómo se verifica y cuándo se da por terminado.

### Comparación

| Dimensión | Documentación actual | OpenSpec |
|---|---|---|
| Propósito | Describir el sistema existente | Gestionar cambios del sistema |
| Unidad | Un `SPEC.md` general | Una carpeta por cambio |
| Fuente de verdad | Documento narrativo | Specs de comportamiento + deltas |
| Momento | Se actualiza después de implementar | Se escribe **antes** de implementar |
| Define “terminado” | Implícito | Requisitos verificables en `specs/` |
| Contexto para la IA | `AGENTS.md` siempre + docs bajo demanda | Solo la carpeta del cambio activo |
| Progreso | Lista de pendientes | `tasks.md` con checkboxes |
| Historial | `CHANGELOG.md` + commits | `changes/archive/` + commits |
| Herramientas | Git y Markdown | CLI `openspec`, skills y comandos |
| Coste | Bajo | Medio: hay que escribir el plan antes |
| Riesgo principal | Deriva: el documento se queda viejo | Sobrecarga si se usa para cambios triviales |

### El workflow de OpenSpec

```text
1. Explore   → pensar la idea, sin código
2. Propose   → proposal.md + specs/ + design.md + tasks.md
3. Review    → el usuario corrige el plan antes de que exista código
4. Apply     → la IA implementa tarea por tarea
5. Archive   → las specs principales absorben el cambio
```

La estructura que crea:

```text
openspec/
├── specs/                          ← comportamiento actual del sistema
│   ├── catalog/spec.md
│   ├── cart/spec.md
│   ├── checkout/spec.md
│   └── newsletter/spec.md
└── changes/
    ├── add-backend-foundation/
    │   ├── proposal.md
    │   ├── specs/
    │   ├── design.md
    │   └── tasks.md
    └── archive/
```

### Cómo se integran sin duplicar

La clave es **una sola fuente de verdad por tipo de información**:

| Información | Dónde vive |
|---|---|
| Reglas para la IA, stack, comandos, convenciones | `AGENTS.md` |
| Comportamiento actual y requisitos verificables | `openspec/specs/` |
| Plan de un cambio en curso | `openspec/changes/<cambio>/` |
| Decisiones de arquitectura | `docs/adr/` |
| Contrato de API | `docs/api/openapi.yaml` o `packages/shared` |
| Visión para humanos | `README.md` |
| Historia resumida | `docs/CHANGELOG.md` + Git |
| Detalle histórico de cambios | `openspec/changes/archive/` |

Recomendación concreta:

1. **Dejar `AGENTS.md` como está**, pero añadir una regla: “todo cambio no trivial pasa por OpenSpec”.
2. **Migrar el contenido de `docs/SPEC.md` a `openspec/specs/` por dominios.** Dejar `SPEC.md` como índice o resumen, no como copia.
3. **Usar `docs/CHANGELOG.md` para humanos** y el archivo de OpenSpec para el detalle técnico.
4. **No duplicar requisitos.** Si una regla está en `openspec/specs/cart/spec.md`, en `AGENTS.md` solo va “envío gratis desde $60; detalle en la spec del carrito”.

### ¿Merece la pena ahora?

- Para retoques pequeños de la landing: **no**. La documentación actual es suficiente.
- Para la migración a TypeScript + backend + pagos: **sí**. Ahí OpenSpec evita que una sesión haga cambios enormes sin plan y sin saber cuándo está terminado.

También se puede empezar con un **OpenSpec-lite** manual: crear `openspec/specs/` y `openspec/changes/` sin instalar el CLI. La disciplina es lo valioso; el CLI añade validación, skills y comandos.

Si se instala el CLI, necesita **Node 22.12 o superior**:

```powershell
node --version
npm install -g @fission-ai/openspec@latest
```

Y luego `openspec init` en la raíz del proyecto.

---

## 3. Workflow escalable para TypeScript + backend

### El principio fundamental

Una sesión nueva **no recuerda la conversación anterior**. No hay memoria oculta. Lo único que sobrevive es:

- lo que está en el repositorio,
- los commits,
- y los archivos de estado (`tasks.md`, `CHANGELOG.md`).

Por eso el workflow tiene que **escribir el estado mientras trabaja**, no al final. Si la sesión se corta a medias, `tasks.md` y los commits son el punto de recuperación.

### Estructura objetivo del repo

Cuando llegue el momento de migrar:

```text
supervista/
├── apps/
│   ├── web/                  ← front (primero JS, luego TS)
│   └── api/                  ← backend TypeScript
├── packages/
│   ├── shared/               ← tipos, schemas Zod, dinero, reglas
│   └── config/               ← tsconfig, eslint compartidos
├── openspec/
│   ├── specs/
│   └── changes/
├── docs/
│   ├── adr/                  ← decisiones de arquitectura
│   ├── api/openapi.yaml
│   └── CHANGELOG.md
├── AGENTS.md
├── README.md
└── package.json              ← workspaces
```

No hay que hacerlo de golpe. Se puede empezar con `apps/` y mover el front cuando la API ya funcione.

### El ciclo de una sesión

#### 0. Arranque (5 minutos)

```text
1. Leer AGENTS.md
2. git status y git log -5
3. Leer openspec/changes/<activo>/tasks.md (si existe)
4. Leer la última entrada de docs/CHANGELOG.md
5. Confirmar en una frase: “hoy hacemos X, no hacemos Y”
```

Esto evita el problema clásico: empezar a construir sin saber en qué quedó la sesión anterior.

#### 1. Explorar

Antes de escribir código:

- ¿Qué problema resolvemos?
- ¿Qué queda fuera?
- ¿Qué decisiones hay que tomar?
- ¿Afecta a dinero, seguridad o datos personales?

Si la decisión es arquitectónica (elegir Fastify, Postgres, Stripe), se escribe un **ADR** corto:

```text
docs/adr/0001-usar-fastify-y-postgres.md
```

Con contexto, decisión, alternativas y consecuencias. Así, dentro de tres meses no hay que preguntarse “¿por qué hicimos esto?”.

#### 2. Proponer el cambio

Un cambio = un objetivo entregable. Por ejemplo:

```text
openspec/changes/add-order-quote-endpoint/
├── proposal.md
├── specs/checkout/spec.md
├── design.md
└── tasks.md
```

`tasks.md` debe ser concreto:

```md
## 1. Dominio
- [ ] Mover cálculo de envío a packages/shared
- [ ] Añadir tests de envío gratis desde $60

## 2. API
- [ ] Crear POST /api/quote
- [ ] Validar items con Zod
- [ ] Recalcular precios en servidor
- [ ] Test de integración

## 3. Front
- [ ] Llamar a /api/quote desde el carrito
- [ ] Mostrar error si la API falla
```

#### 3. Revisar el plan

El usuario lee `proposal.md`, `specs/` y `tasks.md`. Corrige antes de que exista código. Esto es más barato que corregir una implementación mal orientada.

#### 4. Aplicar

- Rama corta: `change/add-order-quote-endpoint`.
- Un commit por tarea o por bloque lógico.
- Marcar los checkboxes en el mismo commit.
- Tests junto al código, no “después”.
- No tocar la documentación general todavía; el cambio aún no está archivado.

#### 5. Verificar

Antes de archivar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Y una prueba manual del flujo: carrito → cotización → pedido → pago test → confirmación.

#### 6. Archivar y sincronizar

Aquí es donde se integra todo lo nuevo:

```text
openspec archive <cambio>
```

Eso fusiona las specs del cambio en `openspec/specs/`.

Después, la pasada de sincronización:

| Si cambió... | Actualiza... |
|---|---|
| Comportamiento del producto | `openspec/specs/<dominio>/spec.md` (lo hace el archivo) |
| Stack, comandos, estructura | `AGENTS.md` |
| Cómo se instala o se corre | `README.md` |
| Historia y estado | `docs/CHANGELOG.md` |
| API | `docs/api/openapi.yaml` |
| Una decisión arquitectónica | `docs/adr/` |
| Se eliminó una función | Spec con requisito `REMOVED`, copy del front, README y CHANGELOG |

#### 7. Cerrar la sesión

Última entrada del changelog, con formato de traspaso:

```md
## 2026-11-12 — add-order-quote-endpoint

**Estado:** completado y archivado.
**Hecho:** endpoint de cotización, precios recalculados en servidor, tests.
**Decisiones:** dinero en centavos; envío calculado en `packages/shared`.
**Siguiente:** crear pedidos e integrar Stripe Checkout en modo test.
**Riesgos:** el front todavía muestra totales locales hasta la fase 4.
```

Eso es lo que hace que la siguiente sesión —propia o de una IA— arranque con contexto real.

### Cómo integrar todo al final de una sesión larga

Cuando se pida “cierra la sesión” o “sincroniza la documentación”, hacer una **reconciliación** explícita:

1. `git diff` y `git status` para ver qué cambió de verdad.
2. Comparar el código con `openspec/specs/` y detectar comportamientos no documentados.
3. Actualizar las specs afectadas y archivar el cambio.
4. Actualizar `AGENTS.md` si cambiaron comandos, carpetas o stack.
5. Actualizar `README.md` si cambió la forma de ejecutar el proyecto.
6. Actualizar `docs/api/openapi.yaml` si cambiaron endpoints.
7. Añadir la entrada de traspaso al `CHANGELOG`.
8. Buscar referencias obsoletas: `grep -r "sin backend"`, `"simulado"`, `"vanilla"`, nombres de archivos viejos.
9. Ejecutar tests y typecheck.
10. Commit de documentación separado del commit de código.

Esto no es automático por arte de magia. Es un **paso del workflow**. Si se quiere, se puede convertir en un comando de OpenCode (`/sync-docs`) o en un skill que ejecute el checklist.

### Cómo encajaría la migración a TypeScript

No hacer “pasar todo a TypeScript” en una sola sesión. Sería un cambio grande con subcambios:

1. **`add-typescript-foundation`**: tsconfig, workspaces, scripts, CI. El front sigue funcionando.
2. **`migrate-shared-domain-to-ts`**: `frames`, dinero, envío y validaciones a `packages/shared` con tipos y tests.
3. **`migrate-web-to-ts`**: renombrar y tipar archivos del front, sin cambiar comportamiento.
4. **`add-api-foundation`**: Fastify, healthcheck, configuración, tests.
5. **`add-catalog-api`**: productos desde base de datos.
6. **`add-order-quote`**: cotización server-side.
7. **`add-orders-and-stripe`**: pedidos, pago test, webhook, correo.
8. **`remove-unimplemented-claims`**: quitar “prueba virtual” y “escaneo 3D” si no se van a implementar.
9. **`harden-and-document`**: CORS, rate limit, logs, OpenAPI, ADRs, README.

Cada uno con su carpeta, sus tasks y su archivo. Si uno se atasca, los demás no arrastran el proyecto entero.

### Definition of Done de un cambio

Un cambio no está terminado hasta que:

- [ ] Cumple los requisitos de `specs/`.
- [ ] Tiene tests o una verificación manual documentada.
- [ ] Pasa typecheck, lint y tests.
- [ ] Está archivado en OpenSpec.
- [ ] `AGENTS.md` sigue siendo cierto.
- [ ] `README.md` sigue siendo cierto.
- [ ] `CHANGELOG.md` tiene la entrada de traspaso.
- [ ] No hay secretos en el repo (`.env` fuera, `.env.example` dentro).
- [ ] El commit tiene un mensaje descriptivo.

### Lo que NO hacer

- Migrar todo a TypeScript y backend en una sola rama gigante.
- Duplicar las mismas reglas en `AGENTS.md`, `SPEC.md` y `openspec/specs/`.
- Confiar en que “la IA se acordará” de una decisión de la sesión anterior.
- Meter precios o totales calculados por el cliente en el backend.
- Instalar OpenSpec para cambios de una línea.
- Documentar el futuro como si ya existiera.

---

## 4. Próximos pasos

Este documento es la base para la sesión de arquitectura. En esa sesión:

1. Instalar OpenSpec 2.x.
2. Ejecutar `openspec init --tools opencode`.
3. Revisar `openspec/config.yaml` y decidir qué contexto va ahí sin duplicar `AGENTS.md`.
4. Crear `docs/ARCHITECTURE.md` con la arquitectura objetivo.
5. Crear `docs/adr/` con las primeras decisiones.
6. Crear `docs/api/openapi.yaml` con el contrato inicial.
7. Actualizar `AGENTS.md` y `docs/SPEC.md` para reflejar el cambio de dirección.
8. Empezar por un cambio pequeño: `add-typescript-foundation` o `add-api-foundation`.

> **Recordatorio:** el front actual sigue siendo vanilla y el checkout simulado. Este plan no cambia el comportamiento por sí solo; hay que implementarlo por fases.
