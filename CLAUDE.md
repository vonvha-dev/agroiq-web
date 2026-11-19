# CLAUDE.md — AgroIQ Web (prototipo funcional)

Este archivo lo lee Claude Code al iniciar cada sesión. Contiene las reglas que no se negocian.
La especificación completa está en `docs/`. Léela antes de planificar cualquier tarea.

## Qué es AgroIQ

Aplicación web para packings agroexportadores: convierte el **descarte de palta Hass** en información
(tipo de defecto, volumen por lote) y en oportunidades de **valorización B2B** (aceite, pulpa,
reclasificación a exportación). Es un proyecto del curso Gestión de Proyectos (FIIS-UNI, 2026-II),
gestionado con Scrum en sprints semanales. Se demuestra en la **Feria FIIS el 04/12/2026**.

Flujo del producto (debe poder recorrerse de extremo a extremo):
**1 Lote → 2 Clasificación → 3 Dashboard → 4 Valorización → 5 Publicación B2B**

## Documentos (léelos en este orden)

0. `docs/DECISIONES_PO_2026-11-18.md`: decisiones del PO; **prevalecen** sobre los demás documentos (ya incorporadas en ellos).
1. `docs/01_ESPECIFICACION_FUNCIONAL.md`: usuarios, historias PB-xx, criterios de aceptación, reglas de negocio y modelo de datos.
2. `docs/02_ARQUITECTURA_Y_CALIDAD.md`: stack, estructura, capas, pruebas, accesibilidad, seguridad y despliegue.
3. `docs/03_PLAN_DE_TRABAJO.md`: fases por sprint, tareas, verificación y evidencias.
4. `reference/AgroIQ_Prototipo_Sprint01.html`: prototipo navegable del Sprint 01. Es la **referencia visual** (colores, tono, pantallas); su código no se reutiliza tal cual.

## Reglas obligatorias

1. **Honestidad del prototipo (riesgo R4).** Toda clasificación que no venga de un modelo entrenado se marca en la interfaz y en los datos (`origen: "etiqueta_manual" | "simulada"`). Nunca muestres un porcentaje de confianza ni una métrica de precisión que no se haya medido. Los precios por kg son **ilustrativos** y se rotulan así. La publicación B2B es **de prueba**: no hay pagos.
2. **Trazabilidad.** Cada dato (imagen, clasificación, valorización, oferta, evento) se enlaza al **ID de lote `LT-AAAA-NNNN`**. Cada cambio de estado registra un evento en la línea de tiempo del lote.
3. **Nada de `innerHTML` con datos del usuario.** Renderiza con componentes React. Valida toda entrada con Zod en el borde (formularios, CSV, JSON importado).
4. **Lógica de negocio pura y probada.** Los cálculos (IDs, kg por clase, valorización, comisión del 4 %, KPIs) viven en `src/domain/` sin dependencias de UI ni de almacenamiento, y cada uno tiene pruebas unitarias. El dinero se calcula en **céntimos enteros**.
5. **Persistencia detrás de una interfaz.** La UI usa repositorios (`LoteRepository`, etc.), nunca Dexie/IndexedDB directamente. Así se puede cambiar a una API en la nube después de la feria (PB-16) sin tocar la UI.
6. **Clasificador detrás de una interfaz** (`Clasificador`). Hoy se implementa con etiquetas manuales o simulación determinista. Mañana se conecta a un modelo (Jetson/API) sin cambiar pantallas.
7. **Funciona sin internet.** No uses CDN ni Google Fonts en tiempo de ejecución (usa `@fontsource`). Debe existir un build de archivo único para el respaldo de la feria (riesgo R6).
8. **Español de Perú en la interfaz:** fechas `dd/mm/aaaa`, moneda `S/ 1 234,50` vía `Intl` con `es-PE`. El código usa nombres de dominio en español sin tildes (`Lote`, `pesoKg`, `clasificacion`).
9. **Accesibilidad AA:** etiquetas en todos los campos, foco visible, navegación por teclado, contraste suficiente, `prefers-reduced-motion` y tema oscuro (como el prototipo).
10. **No amplíes el alcance por tu cuenta.** Si algo no está en `docs/`, pregunta o anótalo en `docs/PENDIENTES.md`. Cosas como login real, pagos, la cámara/Jetson o el entrenamiento de modelos son posteriores a la feria.

## Comandos

```bash
npm run dev           # servidor de desarrollo
npm run check         # typecheck + lint + pruebas unitarias (OBLIGATORIO antes de cada commit)
npm run test          # Vitest
npm run test:e2e      # Playwright (flujo completo)
npm run build         # build estático (GitHub Pages)
npm run build:single  # un solo index.html autocontenido (respaldo offline de la feria)
npm run demo:local    # plan B offline: sirve el build en http://localhost:4173 (o iniciar-demo.bat)
npm run evidencias    # capturas de cada pantalla en evidencias/ (para la Sprint Review)
```

## Forma de trabajo

- **Planifica antes de codificar.** Para cada historia PB-xx, propone primero un plan breve (archivos, pruebas, riesgos) y espera aprobación si el cambio es grande.
- **Una historia, una rama y commits pequeños.** Mensajes del tipo `feat(PB-03): genera ID LT-AAAA-NNNN correlativo`.
- **Definition of Done** (de la Sección 7 de la especificación): interfaz funcional, datos trazables, pruebas pasando, prueba del flujo, evidencia guardada y revisión. No declares "hecho" algo que no la cumpla.
- **Al cerrar cada historia:** ejecuta `npm run check`, ejecuta los e2e del tramo afectado y actualiza `docs/evidencias/SPRINT_0X.md`.
- Si una prueba falla, corrige la causa; no la desactives ni la debilites.
