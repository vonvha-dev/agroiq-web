# 03 · Plan de trabajo para Claude Code — AgroIQ Web

El plan sigue el Product Backlog del PAG. Cada fase termina con un **incremento demostrable** y
evidencia para la Sprint Review del jueves. No se empieza una fase sin cerrar (o devolver al
backlog) las historias de la anterior.

Actualizado con `DECISIONES_PO_2026-11-18.md` (D1–D16), que prevalece ante cualquier diferencia.

| Fase | Sprint | Fechas | Historias | Review |
|---|---|---|---|---|
| 0 | Sprint 02 | 18/11 (noche) | Base técnica | 19/11 |
| 1 | Sprint 02 → Sprint 03 | 18–26 nov | PB-03 (Sprint 02, si cumple la DoD); PB-02/04 y PB-05 (Sprint 03, primeras en prioridad) | 19/11 y 26/11 |
| 2 | Sprint 03 → Sprint 04 | 20 nov–03 dic | PB-07, PB-08, PB-09 (lo que no entre en el Sprint 03 pasa al 04) | 26/11 y 03/12 |
| 3 | Sprint 04 | 27 nov–03 dic | PB-10, PB-11 | 03/12 |
| — | Feria | 04 dic | Demostración: 15 min + 5 min de preguntas | — |

> **Replanificación (D3).** La Fase 1 no llega completa al 19/11. En esa Review se presentan la base
> técnica y lo que cumpla la DoD (objetivo: PB-03). PB-02/04 y PB-05 se informan como "no terminado",
> vuelven al Product Backlog y el PO los prioriza al inicio del Sprint 03, antes que PB-07, PB-08 y
> PB-09. Se acepta que el Sprint 03 supere la capacidad planificada (11 pts). No se fuerza el "hecho".

**Forma de trabajo con Git (D1):** una rama por historia (`fase-0`, `pb-03`, `pb-04`…) con PR hacia
`main`; el CI corre en cada PR y el despliegue a Pages solo en `main`. Repositorio: `agroiq-web`.

---

## Fase 0 · Base técnica (½–1 día)

**Tareas**
0. `git init`, `.gitignore` (node_modules, dist, dist-single, coverage, test-results, playwright-report y `evidencias/` salvo las de cierre de sprint), primer commit de los docs, repositorio `agroiq-web` en GitHub y rama `fase-0`.
1. Crear el proyecto Vite + React + TypeScript (`strict`). Configurar ESLint, Prettier, Vitest, Playwright y `fake-indexeddb`. `.nvmrc` con la LTS instalada (≥ 22).
2. Scripts `dev`, `build`, `build:single`, `preview`, `demo:local`, `typecheck`, `lint`, `test`, `test:e2e`, `check` y `evidencias`. `base` por `VITE_BASE` (D2) y CSP inyectada solo en build (D11). `iniciar-demo.bat` como plan B offline (D12).
3. `styles/tokens.css` con las variables claras y oscuras del prototipo, fuentes `@fontsource` y layout (cabecera, barra de pasos, selector de perfil, pie con créditos).
4. `HashRouter` con todas las rutas de la Sección 8 de la especificación, con páginas vacías que digan "En construcción (Sprint 0X)".
5. `domain/catalogos.ts` y `domain/estados.ts` con sus pruebas; `config/packings.ts` (D4, D5, D10).
6. Dexie (`data/db.ts`) con todas las tablas y repositorios vacíos con su interfaz (imágenes como `ArrayBuffer` + `mime`, D13).
7. CI de GitHub Actions y despliegue a Pages. PR `fase-0` → `main`.

**Verificación:** `npm run check` en verde; `npm run build:single` abre sin servidor en Chrome y Edge (IndexedDB, `crypto.subtle`, Blob; D12) o, si falla, `demo:local` queda como respaldo oficial; la URL de Pages carga.

## Fase 1 · Lote, clasificación y ficha (PB-03 en Sprint 02; PB-02/04 y PB-05 en Sprint 03)

**PB-03 · Registro**
- `domain/ids.ts` y sus pruebas (formato, correlativo, no reutilizar).
- `esquemas.ts` → `LoteForm`; `services/registrarLote.ts` (transacción: contador + lote + evento).
- Páginas `#/lotes` (tabla, estado vacío, búsqueda por ID) y `#/lotes/nuevo` (formulario validado).
- e2e: registrar → aparece en la lista → recargar → sigue ahí.

**PB-02/04 · Carga y clasificación**
- `cargarImagenes.ts`: validación de tipo y firma, redimensionado, hash, `IMG-NNN`, barra de progreso, cambio de estado a `imagenes_cargadas`.
- Parser de la hoja de etiquetas CSV + esquema `EtiquetaCSV`, con reporte de filas inválidas.
- `ClasificadorMuestra` (etiqueta manual → simulación determinista con `uint32` BE mod 5, D14) y sus pruebas de reproducibilidad y de hash fijo conocido.
- `clasificarLote.ts` + página de clasificación: grilla por fruta (chip de clase + origen), resumen por clase y `AvisoSimulado`.
- Fixtures: las 12 fotos reales del prototipo (300×300 px, CC BY 4.0) + `etiquetas.csv` en `tests/fixtures/`. El CSV lleva solo las etiquetas confirmadas por el equipo; las fotos de `dm` y `pl` las aporta el equipo después (tarea del equipo, ligada al riesgo R3).

**PB-05 · Ficha**
- Página `#/lotes/:id` con KPI, datos, galería, resumen en n.º y kg (`domain/reparto.ts` y sus pruebas) y línea de tiempo.
- Estado "Lote no encontrado".
- e2e: registrar → cargar fixtures → clasificar → abrir la ficha por ID → verificar eventos y conteos.

**Cierre de la fase:** `npm run check` + e2e; `npm run evidencias`; `docs/evidencias/SPRINT_02.md` (PB-03 y base técnica) y `SPRINT_03.md` (PB-02/04 y PB-05).

## Fase 2 · Dashboard, valorización y B2B (Sprint 03, arrastre al 04)

**PB-07 · Dashboard:** `domain/metricas.ts` y sus pruebas (lotes con estado ≥ `clasificado`, D9); filtros por fecha y packing; KPI; gráficos SVG accesibles (con tabla equivalente); estado vacío; enlace "Volver al lote" y barra de pasos con el lote en contexto (D8).

**PB-08 · Valorización:** `config/precios.ts` (con versión); `domain/valorizacion.ts` y sus pruebas; página con las tres fracciones, el total y el aviso; confirmar → `valorizado` + evento; página de Configuración para editar precios.

**PB-09 · Publicación y marketplace:** `domain/comision.ts` y sus pruebas (céntimos); formulario de oferta validado; `publicarOferta.ts` (oferta + estado + evento; una oferta activa por destino, D7); pantalla con el estado de las tres fracciones; vista Comprador sin barra de pasos y con empresa demo en la cabecera (D10) (lista, filtro, detalle, "Me interesa" → `InteresComprador` + evento `interes_recibido` en el lote).

**Cierre:** e2e del tramo 3–5; evidencias; `docs/evidencias/SPRINT_03.md`.

## Fase 3 · Integración y versión de feria (Sprint 04)

**PB-10:** e2e del flujo completo (perfil Packing → perfil Comprador); `axe` en todas las rutas; revisión de errores en consola; prueba del build de archivo único; pruebas en Chrome, Edge y móvil (viewport 390 px); exportar e importar respaldo.

**PB-11:** modo demo (cargar y reiniciar datos de ejemplo); modo presentación opcional con el guion por paso; `npm run evidencias` final para el video; checklist de la feria (laptop cargada, `dist-single` en USB, respaldo JSON, video offline).

**Cierre:** el Product Owner acepta la versión de feria el 03/12; tag `v1.0-feria`.

---

## Rutina de cierre de cada historia (para Claude Code)

1. `npm run check` en verde y e2e del tramo en verde.
2. Recorrido manual rápido (o Playwright con capturas) de las pantallas tocadas, en claro y oscuro.
3. Actualizar `docs/evidencias/SPRINT_0X.md` con esta plantilla:

```md
## PB-0X · <título>
- Estado: Hecho | Listo para la Review | No terminada (motivo)
- Requisito / EDT: RF-xx · Ex
- Qué se entrega: …
- Pruebas: n unitarias, n e2e (todas en verde)
- Evidencia: evidencias/sprint-0X/<archivo>.png
- Pendientes / riesgos: …
```

4. Commit `feat(PB-0X): …` y PR con un resumen y las capturas.

## Script `npm run evidencias`

Spec de Playwright (`tests/e2e/evidencias.spec.ts`) que carga el modo demo, recorre todas las rutas y
guarda capturas de 1440×900 en `evidencias/sprint-0X/NN-<ruta>.png` (el sprint se pasa por la
variable de entorno `SPRINT`). Estas capturas alimentan el PPT de resultados (SPR) y el video.

## Riesgos del PAG que atiende el software

| Riesgo | Respuesta en el código |
|---|---|
| R2 · Integración fallida al demostrar | e2e del flujo en CI desde la Fase 1; build de archivo único |
| R3 · Imágenes insuficientes | Fixtures versionados + modo demo; carga de la muestra real con CSV |
| R4 · Simulación confundida con IA | Campo `origen`, `AvisoSimulado` permanente, sin confianza falsa |
| R5 · Dependencias entre componentes | Contratos de datos en `domain/tipos.ts`; repositorios con interfaz |
| R6 · Falla de laptop, red o proyector | Offline total, `dist-single` en USB, respaldo JSON |
