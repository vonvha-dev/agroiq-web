# LÉEME PRIMERO · Cómo usar este kit con Claude Code

Este kit tiene todo lo que Claude Code necesita para construir la web funcional de AgroIQ sin
volver a explicarle el proyecto.

```
agroiq-web-kit/
├── CLAUDE.md                          ← reglas del proyecto (Claude Code lo lee solo)
├── LEEME_PRIMERO.md                   ← este archivo (para el equipo)
├── docs/
│   ├── 01_ESPECIFICACION_FUNCIONAL.md ← qué construir: historias, criterios, reglas, datos
│   ├── 02_ARQUITECTURA_Y_CALIDAD.md   ← cómo construirlo: stack, capas, pruebas, seguridad
│   └── 03_PLAN_DE_TRABAJO.md          ← en qué orden: fases por sprint y evidencias
└── reference/
    └── AgroIQ_Prototipo_Sprint01.html ← prototipo del Sprint 01 (referencia visual)
```

## 1. Preparación (una sola vez)

1. Creen un repositorio en GitHub, por ejemplo `agroiq-web`, y copien **todo el contenido** de esta carpeta en su raíz.
2. Abran Claude Code en la carpeta del repositorio, ya sea la versión de terminal (`claude`) o Claude Code en la web con el repositorio conectado.
3. Requisitos locales para la versión de terminal: Node.js LTS 22 o superior y Git (D3 de `docs/DECISIONES_PO_2026-11-18.md`).
4. En GitHub → Settings → Pages, elijan **GitHub Actions** como fuente (para el despliegue automático).

## 2. Prompt de arranque (pegar tal cual en el primer mensaje)

```text
Eres el desarrollador frontend de AgroIQ. Lee CLAUDE.md y luego, en orden,
docs/01_ESPECIFICACION_FUNCIONAL.md, docs/02_ARQUITECTURA_Y_CALIDAD.md,
docs/03_PLAN_DE_TRABAJO.md y reference/AgroIQ_Prototipo_Sprint01.html.

Después:
1. Resúmeme en 10 líneas qué entendiste del producto, de las reglas obligatorias y del plan.
2. Lista las dudas o contradicciones que encuentres en los documentos (no las resuelvas por tu cuenta).
3. Propón el plan detallado de la Fase 0 (archivos, dependencias con versión, scripts y pruebas)
   y espera mi aprobación antes de crear archivos.
```

Usen el **modo plan** de Claude Code para este primer mensaje, de modo que planifique sin tocar archivos.

## 3. Prompts por fase (después de aprobar cada plan)

**Fase 0**
```text
Aprobado. Ejecuta la Fase 0 completa. Al terminar, corre npm run check y npm run build:single,
muéstrame el resultado y la URL de GitHub Pages (o qué falta para tenerla).
```

**Fase 1 · una historia por vez**
```text
Implementa PB-03 según la especificación (Sección 4) y la Definition of Done (Sección 7).
Primero muéstrame el plan: archivos, funciones del dominio y la lista de pruebas que escribirás.
Escribe las pruebas del dominio antes que la UI. Al cerrar, aplica la "Rutina de cierre de cada
historia" del plan de trabajo.
```
Repitan con `PB-02/04` y luego `PB-05`. Al final de la fase:
```text
Cierra la Fase 1: e2e del tramo lote → clasificación → ficha, npm run evidencias con SPRINT=02,
y completa docs/evidencias/SPRINT_02.md. Indícame honestamente qué cumple la DoD y qué no.
```

**Fase 2** (PB-07, PB-08, PB-09) y **Fase 3** (PB-10, PB-11): el mismo patrón, citando el ID de la historia.

## 4. Prompts útiles en cualquier momento

- Revisión de calidad: `Revisa el código como un revisor exigente: seguridad (XSS, archivos), accesibilidad, errores de redondeo, transacciones a medias y pruebas faltantes. Prioriza y no cambies nada aún.`
- Antes de la Review: `Prepara la demo de la Sprint Review: modo demo cargado, guion de 5 pasos en 1 minuto cada uno y lista de riesgos de la demo.`
- Si algo se rompe: `Reproduce el error con una prueba que falle, luego corrígelo y deja la prueba.`
- Control del alcance: `¿Esto está en docs/? Si no, anótalo en docs/PENDIENTES.md y no lo implementes.`

## 5. Recomendaciones para el equipo

- **Una persona aprueba los planes** (sugerido: el Product Owner o el Scrum Master), así se evitan instrucciones contradictorias.
- **Revisen cada PR antes de fusionarlo**: es la "revisión entre pares" de la DoD y queda como evidencia.
- **Tarjetas Jira = historias PB-xx**: muevan la tarjeta a HECHO solo cuando el PR esté fusionado y la evidencia exista, así el tablero coincide con el PPT.
- Si cambian una regla del negocio (precios, comisión, clases), **actualicen primero `docs/`** y luego pidan el cambio.
- La clasificación es por etiquetas manuales o simulada: díganlo igual en la demo, la feria y el artículo (riesgo R4).
