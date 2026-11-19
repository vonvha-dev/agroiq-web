# 02 · Arquitectura y calidad — AgroIQ Web

Actualizado con `DECISIONES_PO_2026-11-18.md` (D1–D16), que prevalece ante cualquier diferencia.

## 1. Stack

**Entorno:** Node.js **LTS instalada (≥ 22)**; `.nvmrc` con la versión mayor detectada por `node -v` (D3).

| Necesidad | Elección | Motivo |
|---|---|---|
| Build | **Vite** | Rápido; build estático y de archivo único |
| Lenguaje | **TypeScript** con `strict: true` | Errores de datos detectados al compilar |
| UI | **React** + **React Router** (`HashRouter`) | Componentes en lugar de `innerHTML`; hash routing funciona en GitHub Pages y abierto como archivo |
| Validación | **Zod** | Un esquema por formulario, CSV y JSON importado; los tipos se derivan del esquema |
| Persistencia | **Dexie** (IndexedDB) | Guarda imágenes (Blob) y datos; sobrevive a recargas; funciona offline |
| Estilos | CSS con **variables del prototipo** (CSS Modules o un `tokens.css` global) | Conserva la identidad visual del Sprint 01; sin Tailwind |
| Fuentes | `@fontsource/inter`, `@fontsource/space-grotesk` | Sin dependencia de Google Fonts |
| Gráficos | SVG propio (barras y columnas) en `components/charts/` | Liviano, accesible y bajo control total; evita una librería pesada |
| CSV | Parser propio pequeño o `papaparse` | Hoja de etiquetas |
| Pruebas unitarias | **Vitest** + **@testing-library/react** (+ `user-event`, `jest-dom`) + `jsdom` + `fake-indexeddb` + `@vitest/coverage-v8` | Dominio, repositorios y componentes; cobertura medida (D15) |
| Pruebas e2e | **Playwright** + `@axe-core/playwright` | Flujo completo, accesibilidad y capturas de evidencia |
| Calidad | ESLint 9 (typescript-eslint, react, react-hooks, jsx-a11y) + Prettier | Estilo uniforme. ESLint 9 y TypeScript 6.0 porque los plugins aún no admiten ESLint 10 ni TS 7 |
| Offline | `vite-plugin-singlefile` (script `build:single`) | Respaldo de la feria (riesgo R6) |
| CI y despliegue | GitHub Actions → GitHub Pages | URL pública para el jurado y el docente |

Antes de agregar cualquier otra dependencia, justifícala en el PR.

## 2. Estructura de carpetas

```
src/
  domain/            # lógica pura, sin React ni Dexie
    tipos.ts         # tipos derivados de los esquemas Zod
    esquemas.ts      # Zod: LoteForm, EtiquetaCSV, OfertaForm, Respaldo
    catalogos.ts     # clases, destinos, estados y transiciones
    ids.ts           # LT-/IMG-/OF- y contadores
    reparto.ts       # kg por clase (resto mayor)
    valorizacion.ts
    comision.ts      # céntimos, 4 %, redondeo half-up
    metricas.ts      # KPI del dashboard
    estados.ts       # transiciones válidas del lote
  data/
    db.ts            # Dexie: tablas lotes, imagenes, clasificaciones, eventos, valorizaciones, ofertas, intereses, contadores
    repositorios.ts  # interfaces + implementación Dexie
    respaldo.ts      # exportar e importar JSON (imágenes en base64), validado con Zod
    demo.ts          # semilla de datos de demostración
  clasificador/
    Clasificador.ts          # interface { clasificar(img, etiquetas?): Promise<Clasificacion> }
    ClasificadorMuestra.ts   # etiqueta manual → si no hay, hash determinista ("simulada")
  services/          # casos de uso que orquestan dominio + repos + eventos
    registrarLote.ts, cargarImagenes.ts, clasificarLote.ts, valorizarLote.ts, publicarOferta.ts
  ui/
    layout/          # Cabecera, BarraPasos, SelectorPerfil, AvisoSimulado, Pie
    components/      # Boton, Campo, Tabla, Kpi, Chip, EstadoVacio, Confirmar, Toast
    components/charts/
    pages/           # una por ruta
  config/precios.ts
  config/packings.ts # packings, roles responsables y empresas compradoras demo (D4, D5, D10)
  styles/tokens.css  # variables del prototipo (claro y oscuro)
tests/
  unit/  e2e/  fixtures/   # imágenes y CSV de prueba pequeños y versionados
evidencias/          # capturas generadas por Playwright (en .gitignore, salvo las de cierre de sprint)
docs/
iniciar-demo.bat     # plan B offline de la feria: doble clic → npm run demo:local (D12)
```

**Dependencias permitidas entre capas:** `ui → services → (domain, data, clasificador)`;
`domain` no importa nada del proyecto. Se hace cumplir con la regla nativa de ESLint
`no-restricted-imports` por carpeta (sin `eslint-plugin-import`, D15).

## 3. Decisiones de diseño clave

- **Casos de uso con eventos atómicos.** Cada servicio (p. ej. `clasificarLote`) usa una transacción Dexie que guarda los datos, cambia el estado y agrega el `EventoLote`. Si algo falla, no queda nada a medias.
- **Transiciones de estado centralizadas** en `domain/estados.ts`. La UI pregunta `puede(lote, 'valorizar')` para habilitar los botones y la barra de pasos.
- **Contadores persistentes** (tabla `contadores`, clave `LT-2026`) incrementados dentro de la transacción, para que los IDs sean únicos y no se reutilicen.
- **Imágenes:** se leen con `createImageBitmap` y se redimensionan en un `OffscreenCanvas` (o `canvas` si no está disponible) a WebP o JPEG con calidad 0,85. En IndexedDB se guardan como **`ArrayBuffer` + `mime`** (no `Blob`, que falla al clonarse en `fake-indexeddb`); el repositorio convierte a `Blob` al entregarlas a la UI (D13). Los `URL.createObjectURL` se liberan al desmontar el componente.
- **Hash** con `crypto.subtle.digest('SHA-256')` sobre el archivo original. Clase simulada = **primeros 4 bytes del hash como `uint32` big-endian, mod 5**, mapeado al orden del catálogo `dm, dp, pl, cp, ox` (`version: "simulada-v1"`). Con 4 bytes el sesgo es despreciable (D14). Hay una prueba con un hash fijo conocido.
- **Ofertas por destino (D7):** `publicarOferta` verifica dentro de la transacción que no exista otra oferta `publicada` para el mismo `(loteId, destino)`.
- **Dinero:** `number` entero en céntimos; formatea solo en la UI con `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })`.
- **Errores:** un `ErrorBoundary` por página con un mensaje útil y un botón "Volver a Lotes"; los errores de servicios se muestran como toasts.
- **Estado de UI:** hooks con `useLiveQuery` (dexie-react-hooks) para leer datos reactivos. No se necesita Redux.

## 4. Diseño visual

Partir de `reference/AgroIQ_Prototipo_Sprint01.html`:
- Tokens: `--bg #F6F7F2`, `--surface #FFF`, `--ink #1E2A17`, `--muted #5E6B55`, `--line #DDE3D3`, `--avocado #3E5F24`, `--avocado-soft #E7EFD9`, `--flesh #C7D66A`, `--pit #7A4E2D`, `--sim #8A5A00`, `--sim-soft #FFF4D6`; clases `--c1 #B5452F`, `--c2 #C98A1B`, `--c3 #6E4C9A`, `--c4 #2F7F86`, `--c5 #3E8A3A`. Además, el tema oscuro equivalente del prototipo.
- Tipografía: Space Grotesk (títulos y cifras) e Inter (texto).
- Componentes: paneles con borde de 1 px y radio de 12 px, chips de clase, barra de pasos 1–5, KPI grandes con números tabulares.
- El **aviso de simulación** (`.sim`, amarillo) es un componente `AvisoSimulado` reutilizable; nunca se oculta.
- Estados obligatorios en cada vista: cargando, vacío, error y éxito.
- Responsivo: barra de pasos en 2 columnas y formularios en 1 columna por debajo de 760 px.

## 5. Estrategia de pruebas

| Nivel | Qué cubre | Mínimo |
|---|---|---|
| Unitarias del dominio | `ids`, `reparto`, `valorizacion`, `comision`, `metricas`, `estados`, esquemas Zod | Cobertura ≥ 90 % de líneas en `src/domain` |
| Repositorios y servicios | Con `fake-indexeddb`: transacciones, contadores y eventos | Cada servicio con caso feliz y uno de error |
| Componentes | Formularios (validación y mensajes), tabla de lotes, estados vacíos | Las pantallas de PB-03, 04 y 05 |
| e2e (Playwright) | Flujo completo con `tests/fixtures/` (12 imágenes + CSV), recarga y persistencia, ID inexistente, perfil comprador | 1 spec por sprint + el flujo completo en el Sprint 04 |
| Accesibilidad | `axe` en cada ruta | 0 violaciones *serious* o *critical* |

Casos que no pueden faltar:
- Dos lotes registrados el mismo año → IDs consecutivos; borrar uno y registrar otro → no se reutiliza.
- Peso 250 kg con 12 frutas (5 dm/dp, 3 pl/cp, 4 ox) → la suma de kg es exactamente 250,00.
- Monto S/ 114,58 → comisión S/ 4,58 y neto S/ 110,00 (verificar el redondeo half-up en céntimos).
- CSV con una clase inválida → esa fila se reporta y el resto se carga.
- La misma imagen clasificada dos veces → la misma clase; un hash fijo conocido → la clase esperada (`uint32` BE mod 5).
- Segunda oferta del mismo destino con una activa → rechazada; tras retirarla → permitida.
- Un texto con `<script>` en observaciones → se muestra como texto literal.

## 6. Seguridad y privacidad

- Ningún `dangerouslySetInnerHTML`. Prohíbelo con ESLint (`react/no-danger`).
- Valida el tipo MIME **y** la firma del archivo (magic bytes de JPG y PNG) antes de procesarlo.
- El respaldo JSON importado se valida completo con Zod antes de escribir; si es inválido, no se modifica nada.
- Sin datos personales reales: responsable y comprador son nombres de rol o de demo.
- Content Security Policy: `default-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'`. Se inyecta **solo en `build`** con un plugin de Vite (`transformIndexHtml`), no en `dev` (rompería el HMR). En `build:single` se añade `script-src 'self' 'unsafe-inline'`, porque el script queda incrustado en el HTML (D11).

## 7. Rendimiento

- Carga de 200 imágenes sin bloquear la UI: procesar en lotes de 4 con una barra de progreso (o un Web Worker si es necesario).
- Las listas de más de 100 elementos se paginan o virtualizan.
- Bundle inicial < 300 KB gzip (sin contar fuentes); separa las rutas con `React.lazy`.

## 8. Despliegue y respaldo

- `vite.config.ts` con `base` configurable por la variable `VITE_BASE`: por defecto `/agroiq-web/` en `build` y `./` en `build:single` y en `dev` (D2). Repositorio: `agroiq-web`.
- Workflow `.github/workflows/ci.yml`: `npm ci` → `npm run check` → `npx playwright install --with-deps chromium` → `npm run test:e2e` → `npm run build` → despliegue a Pages (solo en `main`).
- `npm run build:single` genera `dist-single/index.html`, que se abre con doble clic, sin servidor ni internet. Pruébalo antes de cada Review y lleva una copia en USB a la feria. Se verifica en Chrome y Edge: IndexedDB, `crypto.subtle` e imágenes desde Blob (D12).
- **Plan B offline (D12):** `npm run demo:local` sirve el build en `http://localhost:4173` con `vite preview` (localhost es un contexto seguro y no necesita internet), y `iniciar-demo.bat` lo lanza con doble clic en Windows. Tras la prueba de la Fase 0 se registra cuál de los dos es el respaldo oficial de la feria.
- Exportar e importar respaldo JSON desde Configuración, para llevar los datos de demo entre equipos.

## 9. Evolución prevista (no implementar ahora, pero no bloquearla)

- `ApiLoteRepository` contra el backend en la nube (PB-16), con la misma interfaz.
- `ClasificadorModelo` con ONNX Runtime Web o una llamada a la Jetson (PB-14); llena `confianza`.
- Autenticación y roles reales (PB-16).
