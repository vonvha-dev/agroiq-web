# AgroIQ Web · prototipo funcional

Aplicación web para packings agroexportadores: convierte el **descarte de palta Hass** en
información por lote y en oportunidades de **valorización B2B**. Proyecto del curso Gestión de
Proyectos (FIIS-UNI, 2026-II). Feria FIIS: 04/12/2026.

> Prototipo: la clasificación es por etiquetas manuales o simulada (no hay modelo entrenado),
> los precios son ilustrativos y la publicación B2B es de prueba, sin pagos.

## Requisitos

Node.js LTS ≥ 22 (ver `.nvmrc`) y Git.

```bash
npm ci
npm run dev
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | Typecheck + lint + pruebas unitarias con cobertura (obligatorio antes de cada commit) |
| `npm run test:e2e` | Playwright (rutas, accesibilidad con axe, perfiles) |
| `npm run test:file` | `dist-single` abierto por `file://` en Chrome y Edge |
| `npm run build` | Build estático para GitHub Pages (`VITE_BASE`, por defecto `/agroiq-web/`) |
| `npm run build:single` | Un solo `dist-single/index.html` que se abre con doble clic, sin internet |
| `npm run demo:local` | Plan B offline: sirve el build en `http://localhost:4173` (o `iniciar-demo.bat`) |
| `npm run evidencias` | Capturas de cada pantalla en `evidencias/sprint-$SPRINT/` |

## Documentación

Empieza por [`CLAUDE.md`](CLAUDE.md) y [`docs/`](docs/): especificación funcional, arquitectura y
calidad, plan de trabajo y decisiones del Product Owner.

## Créditos

Imágenes de palta Hass: “'Hass' Avocado Ripening Photographic Dataset” (Xavier, Rodrigues y Silva,
2024, Mendeley Data, doi:10.17632/3xd9n945v8.1), CC BY 4.0, recortadas y redimensionadas.
