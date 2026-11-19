# Evidencias · Sprint 02 (13–19 nov 2026)

Alcance replanificado (D3): base técnica + PB-03. PB-02/04 y PB-05 vuelven al Product Backlog
y se priorizan al inicio del Sprint 03.

## Fase 0 · Base técnica
- Estado: Listo para la Review
- Requisito / EDT: soporte de RF-02, RF-05, RF-11 · E6
- Qué se entrega:
  - Vite 8 + React 19 + TypeScript 6.0 (`strict`), HashRouter con las 13 rutas de docs/01 §8 (páginas "En construcción" con su historia y sprint).
  - Layout del prototipo: tokens claro/oscuro, fuentes locales (`@fontsource`), cabecera, selector de perfil Packing/Comprador con empresa demo (D10), barra de pasos con lote en contexto (D8), avisos de simulación, pie con créditos, ErrorBoundary por página, enlace "Saltar al contenido".
  - Dominio: `catalogos.ts` (clases, destinos, estados) y `estados.ts` (`puede`, `motivoNoPuede`, `transicion`, `alcanzo`).
  - Datos: Dexie con 8 tablas, repositorios con interfaz, imágenes como `ArrayBuffer` + `mime` (D13), contador persistente que no retrocede.
  - Interfaz `Clasificador`, `config/precios.ts` (céntimos, con versión) y `config/packings.ts` (D4, D5, D10).
  - Regla de capas con `no-restricted-imports`; `react/no-danger` y prohibición de `innerHTML`.
  - CSP solo en build (D11); `VITE_BASE` (D2); `build:single`; plan B `demo:local` + `iniciar-demo.bat` (D12).
  - CI en GitHub Actions: check → e2e → build → build:single → despliegue a Pages (solo `main`).
- Pruebas: 51 unitarias (cobertura de `src/domain`: 100 % de líneas); 28 e2e (12 rutas × tema claro y oscuro con axe, redirección, ruta inexistente, barra de pasos D8 y perfil Comprador D10); 2 de `file://` (Chrome y Edge). Todas en verde.
- D12 · `file://`: `dist-single/index.html` funciona abierto sin servidor en Chrome y Edge: contexto seguro, IndexedDB, `crypto.subtle` (SHA-256) e imagen desde Blob, sin errores de CSP en consola. **Respaldo oficial de la feria: `dist-single` en USB**; `iniciar-demo.bat` queda como segunda alternativa.
- Evidencia: `evidencias/sprint-02/01..12-*.png` (claro y `-oscuro`), generadas con `npm run evidencias` (SPRINT=02). Se versionan en `evidencias/sprint-02-cierre/` al cerrar el sprint.
- Pendientes / riesgos:
  - ESLint 9 figura como "sin soporte" en npm; se mantiene porque `eslint-plugin-react`, `jsx-a11y` y `typescript-eslint` aún no admiten ESLint 10 / TS 7.
  - En `file://`, los datos de IndexedDB quedan ligados a la ruta del archivo: si se mueve el HTML a otra carpeta o USB, los datos no lo acompañan (se resuelve con el respaldo JSON de PB-11).
  - D17 (nuevo, para el PO): `Intl.NumberFormat('es-PE')` produce `S/ 1,234.50`, no `S/ 1 234,50` como pide CLAUDE.md. Afecta a PB-08/PB-09.

## PB-03 · Registrar un lote con identificador
- Estado: Listo para la Review (falta la revisión entre pares del PR y la aceptación del PO, DoD 6)
- Requisito / EDT: RF-02 · E6/E7
- Qué se entrega:
  - Formulario `#/lotes/nuevo` validado con Zod: packing y responsable de los catálogos demo, fecha ≤ hoy (hora de Lima), variedad Hass, peso > 0 y ≤ 50 000 kg con hasta 2 decimales (acepta punto o coma), observaciones ≤ 300. Errores junto a cada campo y foco en el primero inválido.
  - ID `LT-AAAA-NNNN` por año de recepción: contador persistente que nunca retrocede y que además respeta el máximo histórico existente del año (no se repite aunque se borren lotes o se importe un respaldo).
  - `registrarLote` en una transacción Dexie (contador + lote + evento "Lote registrado"); si una parte falla, no queda nada guardado.
  - `#/lotes`: tabla (más reciente primero, fechas dd/mm/aaaa), estado vacío con enlace al registro, búsqueda por ID exacta sin distinguir mayúsculas con "Lote no encontrado", paginación de 50 y botón "Borrar" con confirmación solo en `registrado`/`imagenes_cargadas` (D6).
  - Zod sin compilación por `eval` (`jitless`), para respetar la CSP.
- Pruebas: 96 unitarias (45 nuevas: `ids`, `fechas`, `esquemas`, `lote`, servicios con `fake-indexeddb` incluido el caso de transacción fallida, formulario y lista); cobertura de `src/domain` 100 % de líneas. 34 e2e (6 nuevas de PB-03: registrar → primero en la lista → recargar → persiste; validación; `<script>` literal; borrar sin reutilizar el ID; búsqueda; móvil 360 px sin desborde). 4 de `file://`: el registro también persiste abierto sin servidor en Chrome y Edge. Todas en verde.
- Evidencia: `evidencias/sprint-02-cierre/13-pb03-lista-con-lotes.png`, `14-pb03-busqueda.png`, `15-pb03-errores.png`, `16-pb03-movil.png` (más las 24 capturas de rutas).
- Pendientes / riesgos:
  - "Ver ficha" abre la página de la ficha aún en construcción (PB-05, Sprint 03).
  - El aviso "Lote … registrado" se conserva si se recarga la página (vive en el historial del navegador); es cosmético.
  - Tras registrar se vuelve a la lista; cuando exista PB-04 conviene ir directo a "Cargar imágenes", como en el prototipo.
