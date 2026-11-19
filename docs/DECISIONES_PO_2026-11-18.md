# Decisiones del Product Owner · 18/11/2026

Respuestas a las dudas D1–D16 que planteó Claude Code al revisar el kit.
**Este documento prevalece** sobre `01_ESPECIFICACION_FUNCIONAL.md`, `02_ARQUITECTURA_Y_CALIDAD.md`
y `03_PLAN_DE_TRABAJO.md` cuando haya diferencias. Claude Code debe incorporar estos cambios en esos
documentos (sección por sección) y dejar este archivo como registro.

---

## Entorno y calendario

**D1 · Git.** El equipo instala Git y GitHub CLI en esta PC (ver "Tareas del equipo" al final).
Mientras tanto, Claude Code avanza la Fase 0 sin Git; cuando `git --version` funcione, hace `git init`,
el primer commit `chore: fase 0 base técnica` y continúa con ramas y PR.

**D2 · Repositorio.** Nombre: **`agroiq-web`** (GitHub, cuenta indicada por el equipo). Que la carpeta
local se llame `MVP_AgroIQ` no importa. `base` de Vite configurable con la variable `VITE_BASE`
(por defecto `/agroiq-web/` en `build` y `./` en `build:single` y en `dev`).

**D3 · Fechas.** Confirmado: la Fase 1 no llega completa a la Review del 19/11.
- **Esta noche:** Fase 0 completa; si queda tiempo, **PB-03** (registro de lote).
- **Review 19/11:** se presenta la base técnica y lo que cumpla la DoD. El resto de PB-02/04 y PB-05 se informa como "no terminado" y **vuelve al Product Backlog**.
- **Sprint 03 (20–26/11):** el PO prioriza PB-04 y PB-05 antes que PB-07, PB-08 y PB-09, porque estas dependen de los datos de clasificación. Se acepta que el Sprint 03 tenga más carga que la capacidad planificada (11 pts); lo que no entre pasa al Sprint 04 junto con PB-10 y PB-11.
- Node.js: usar la **LTS instalada** (≥ 22). `.nvmrc` con la versión mayor detectada (`node -v`), no 20 (ya sin soporte).

## Huecos de la especificación

**D4 · Catálogo de packings** (`src/config/packings.ts`, editable):
- Packing de Cañete (demo)
- Packing de Chincha (demo)
- Packing de Huaral (demo)

**D5 · Responsable.** Lista de **roles demo**, no texto libre (sin datos personales):
- Supervisor de calidad (demo) — valor por defecto
- Operario de clasificación (demo)
- Jefe de packing (demo)

**D6 · Evento `editado`.** **Se elimina** del modelo. No hay edición de lotes en el prototipo; si el
peso o los datos están mal, se borra el lote (permitido en `registrado` o `imagenes_cargadas`) y se
registra de nuevo. "Editar lote" queda anotado en `docs/PENDIENTES.md`.

**D7 · Varias ofertas por lote.** **Sí.** Se puede publicar **una oferta activa por destino**
(máximo tres por lote: aceite, pulpa, reclasificación), solo para fracciones con kg > 0.
- El lote pasa a `publicado` con la primera oferta. Las siguientes registran un evento `publicado` con el destino en el detalle.
- No se permite una segunda oferta activa para el mismo destino. Si la oferta se retira (`estado: 'retirada'`), se puede volver a publicar ese destino.
- La pantalla de publicación muestra las tres fracciones con su estado: "Publicada OF-… / Disponible / Sin kg".

**D8 · Barra de pasos en el Dashboard.** El Dashboard es **global** (filtrado por fechas y packing).
La barra **conserva el lote en contexto**: los pasos 1, 2, 4 y 5 siguen apuntando a ese lote, y el
paso 3 se marca activo al estar en el Dashboard. Si hay un lote en contexto, aparece un enlace
"Volver al lote LT-…" sobre los KPI.

**D9 · Lotes del Dashboard.** Confirmado: estado ≥ `clasificado` (clasificado, valorizado y publicado).

**D10 · Perfil Comprador.** Confirmado: **oculta** la barra de pasos 1–5. Navegación: Marketplace
y Acerca. En la cabecera, el comprador elige su empresa demo:
- Procesadora de aceite (demo)
- Procesadora de pulpa (demo)
- Procesadora de congelados (demo)

El comprador nunca ve el formulario de registro ni las fichas internas. Su "Me interesa" guarda
la empresa elegida en `InteresComprador.comprador`.

## Técnicas

**D11 · CSP.** Aprobado: la CSP se inyecta **solo en `build`** (plugin de Vite en `transformIndexHtml`),
no en `dev`. En `build:single` se añade `script-src 'self' 'unsafe-inline'`. Documentarlo en
`02_ARQUITECTURA_Y_CALIDAD.md §6`.

**D12 · `file://`.** Verificarlo en Chrome y Edge al cerrar la Fase 0 (IndexedDB, `crypto.subtle`,
imágenes desde Blob). **Plan B** si algo falla: script `npm run demo:local`, que sirve `dist/` en
`http://localhost:4173` con `vite preview` (localhost es un contexto seguro y funciona sin internet),
más un `iniciar-demo.bat` con doble clic para Windows. Reportar cuál de los dos queda como respaldo
oficial de la feria.

**D13 · Blob en pruebas.** Aprobado: la capa de datos guarda `ArrayBuffer` + `mime` y el repositorio
expone `Blob` hacia la UI. Actualizar `ImagenFruta` en el modelo:
`datos: ArrayBuffer; mime: 'image/jpeg' | 'image/png' | 'image/webp'`.

**D14 · Sesgo del hash.** Corregido: clase simulada = **primeros 4 bytes del SHA-256 como `uint32`
big-endian, mod 5**, en el orden del catálogo (`dm, dp, pl, cp, ox`). Versión `"simulada-v1"`.
El sesgo resultante es despreciable. Agregar una prueba con un hash fijo conocido.

**D15 · Dependencias adicionales.** Aprobadas: `@vitest/coverage-v8`, `jsdom`,
`@testing-library/user-event`, `@testing-library/jest-dom`. La regla de capas se aplica con
`no-restricted-imports` (sin `eslint-plugin-import`). Versiones: las fijadas en el plan, que
Claude Code verificó en npm. Si alguna no instala, se usa la versión menor compatible y se informa.

**D16 · Confianza del prototipo.** Confirmado: **no se replica.** Solo `origen: 'modelo'` puede mostrar
confianza.

## Aprobación

**Plan de la Fase 0: aprobado** con los ajustes anteriores (`.nvmrc`, `VITE_BASE`, CSP solo en build,
`demo:local` como plan B, `ArrayBuffer` + `mime`). Al terminar, informar: resultado de `npm run check`,
resultado de la prueba `file://` en Chrome y Edge, y qué falta para Pages.

## Tareas del equipo (fuera de Claude Code)

1. Instalar Git y GitHub CLI (PowerShell): `winget install --id Git.Git -e` y `winget install --id GitHub.cli -e`. Cerrar y reabrir la terminal.
2. Configurar Git: `git config --global user.name "…"` y `git config --global user.email "…"`.
3. Autenticarse: `gh auth login` (GitHub.com → HTTPS → navegador).
4. Crear el repositorio `agroiq-web` (o pedírselo a Claude Code con `gh repo create agroiq-web --public --source . --push` cuando ya exista el primer commit).
5. En GitHub → Settings → Pages → Source: **GitHub Actions**.
6. Informar al PO y al equipo que PB-04 y PB-05 pasan al Sprint 03, y reflejarlo en Jira y en el PPT del Sprint 02.
