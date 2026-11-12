# Spec Delta

## Purpose

Define cómo la landing resuelve, aplica, recuerda y expone un tema visual claro u oscuro en todas sus superficies, respetando la preferencia del sistema y la accesibilidad.

## ADDED Requirements

### Requirement: Resolución inicial del tema

El sistema SHALL resolver el tema antes del primer pintado. Si existe una preferencia guardada válida, SHALL usarla; si no existe o es inválida, SHALL seguir `prefers-color-scheme` del sistema.

#### Scenario: Preferencia guardada válida

- **GIVEN** el usuario guardó previamente el tema oscuro
- **WHEN** carga la landing con el sistema en tema claro
- **THEN** la página se muestra en tema oscuro desde el primer pintado

#### Scenario: Sin preferencia guardada

- **GIVEN** no hay preferencia guardada y el sistema está en tema oscuro
- **WHEN** el usuario carga la landing
- **THEN** la página se muestra en tema oscuro sin un destello previo del tema claro

#### Scenario: Preferencia guardada inválida

- **GIVEN** el valor guardado no es `"light"` ni `"dark"`
- **WHEN** el usuario carga la landing
- **THEN** el sistema descarta ese valor y aplica la preferencia del sistema operativo

### Requirement: Cambio manual y persistencia

El sistema SHALL permitir cambiar de tema con un control visible y SHALL persistir la elección en `localStorage` bajo la clave `supervista.theme.v1`.

#### Scenario: Cambio a tema oscuro

- **WHEN** el usuario activa el modo oscuro desde el control de tema
- **THEN** la interfaz cambia a oscuro y la clave `supervista.theme.v1` guarda `"dark"`

#### Scenario: Persistencia tras recargar

- **GIVEN** el usuario eligió el tema claro
- **WHEN** recarga la página en otro momento
- **THEN** la interfaz se muestra en tema claro aunque el sistema operativo esté en oscuro

#### Scenario: Almacenamiento no disponible

- **GIVEN** `localStorage` lanza un error al escribir
- **WHEN** el usuario cambia de tema
- **THEN** el tema cambia igualmente en la sesión actual y la interfaz no muestra errores

### Requirement: Control de tema accesible

El control de tema SHALL ser un `button` nativo, con nombre accesible en español que describa la acción, estado expuesto mediante `aria-pressed`, foco visible y operación completa por teclado. SHALL estar disponible en el header de escritorio y dentro del menú móvil, y ambas instancias SHALL reflejar el mismo estado.

#### Scenario: Estado anunciado

- **WHEN** el tema activo es claro
- **THEN** el control se anuncia como "Activar modo oscuro" con `aria-pressed="false"`

#### Scenario: Operación con teclado

- **WHEN** el usuario enfoca el control con Tab y pulsa Enter o Espacio
- **THEN** el tema cambia y el estado accesible del control se actualiza

#### Scenario: Sincronización entre header y menú móvil

- **WHEN** el usuario cambia el tema desde el menú móvil
- **THEN** el control del header refleja el mismo tema y estado al cerrar el menú

### Requirement: Cobertura de todas las superficies

El cambio de tema SHALL aplicarse a todas las superficies visibles: header, hero, colección, filtros, personalizador, beneficios, reseñas, newsletter, footer, menú móvil, carrito, checkout simulado y toast. Ninguna superficie SHALL conservar colores pensados solo para el tema claro ni quedar con contraste roto al cambiar de tema.

#### Scenario: Carrito abierto durante el cambio

- **GIVEN** el carrito está abierto en tema claro
- **WHEN** el usuario cambia a tema oscuro
- **THEN** el carrito, sus ítems, totales y botones adoptan el tema oscuro sin cerrarse

#### Scenario: Toast en tema oscuro

- **WHEN** se muestra un toast con el tema oscuro activo
- **THEN** el toast mantiene texto legible y se distingue del fondo

#### Scenario: Paneles ya oscuros

- **GIVEN** el estudio del personalizador y el checkout usan fondos oscuros en tema claro
- **WHEN** el usuario activa el tema oscuro
- **THEN** esos paneles se ajustan al nuevo tema sin perder legibilidad ni jerarquía visual

### Requirement: Contraste y foco en ambos temas

El sistema SHALL mantener un contraste mínimo de 4.5:1 para texto pequeño en tema claro y oscuro, y SHALL conservar un indicador de foco visible en ambos temas.

#### Scenario: Texto atenuado legible

- **WHEN** el usuario lee textos secundarios como metadatos, notas o ayudas
- **THEN** el contraste respecto a su fondo cumple al menos 4.5:1 en el tema activo

#### Scenario: Foco visible

- **WHEN** el usuario navega con teclado por enlaces, botones o campos en cualquier tema
- **THEN** el elemento enfocado muestra un indicador de foco claramente visible

### Requirement: Seguimiento de la preferencia del sistema

Mientras no exista una elección explícita del usuario, el sistema SHALL actualizar el tema cuando cambie `prefers-color-scheme`. Una vez que el usuario elige manualmente, el sistema SHALL dejar de seguir al sistema operativo.

#### Scenario: Cambio del sistema sin elección manual

- **GIVEN** el usuario nunca eligió un tema
- **WHEN** el sistema operativo pasa de claro a oscuro
- **THEN** la landing cambia a tema oscuro sin recargar

#### Scenario: Elección manual prevalece

- **GIVEN** el usuario eligió manualmente el tema claro
- **WHEN** el sistema operativo cambia a oscuro
- **THEN** la landing permanece en tema claro

### Requirement: Metadatos del tema

El sistema SHALL declarar `color-scheme` según el tema activo y SHALL actualizar `meta[name="theme-color"]` para que la interfaz del navegador coincida con la superficie visible.

#### Scenario: Barra del navegador en móvil

- **WHEN** el usuario cambia de tema en un navegador móvil
- **THEN** el color de la barra del navegador se actualiza al color de fondo del tema activo

### Requirement: Movimiento reducido

El sistema SHALL respetar `prefers-reduced-motion` y SHALL evitar transiciones animadas al cambiar de tema cuando el usuario haya solicitado movimiento reducido.

#### Scenario: Cambio de tema sin animación

- **GIVEN** el usuario tiene activada la preferencia de movimiento reducido
- **WHEN** cambia de tema
- **THEN** el cambio se aplica sin transición animada de color
