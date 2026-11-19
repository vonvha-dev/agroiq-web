# 01 · Especificación funcional — AgroIQ Web

Fuente: Plan Ágil del proyecto (PAG), Resultados del Sprint 01 (SPR) y prototipo navegable del Sprint 01.
Marco: Scrum con sprints semanales, alineado con el PMBOK 6.ª y 7.ª ed. y la Guía Scrum.
Actualizado con `DECISIONES_PO_2026-11-18.md` (D1–D16), que prevalece ante cualquier diferencia.

---

## 1. Problema, objetivo y alcance

**Problema.** La palta Hass descartada por defectos externos suele agruparse sin información de tipo,
volumen ni destino, y se pierde valor.

**Objetivo del producto (Product Goal).** Un prototipo demostrable de AgroIQ que recorra
**lote → clasificación → dashboard → valorización → publicación B2B** para el **04/12/2026**.

**Dentro del alcance (prototipo web funcional):**
- Registro real de lotes con ID único y persistencia en el navegador.
- Carga real de imágenes (archivo o arrastrar y soltar) y de la hoja de etiquetas de la muestra (CSV).
- Clasificación en cinco categorías por **etiqueta manual** o **simulación determinista**, rotulada como tal.
- Ficha del lote con trazabilidad y eventos.
- Dashboard calculado con los datos reales registrados.
- Valorización por destino con precios ilustrativos configurables.
- Publicación de ofertas B2B de prueba con comisión del 4 % y una vista para compradores.
- Modo demo (datos de ejemplo, reinicio), exportar e importar respaldo JSON y funcionamiento sin internet.

**Fuera del alcance (Product Backlog posterior a la feria):** cámara y luz controlada (PB-12),
etiquetado de ≈ 5 000 imágenes (PB-13), modelo edge ≤ 1 s por fruta (PB-14), segregación física (PB-15),
APIs, nube y control de accesos (PB-16), integración completa del MVP (PB-17) y piloto (PB-18).
Las metas RNF-01 (exactitud ≥ 90 %, recall ≥ 85 %) y RNF-02 (≤ 1 s) son del producto completo:
**no se muestran como logradas** en el prototipo.

## 2. Usuarios

| Usuario | Necesidad | Pantallas |
|---|---|---|
| Operario de clasificación | Cargar un lote y ver la categoría de cada fruta | Lotes, carga, clasificación |
| Supervisor de calidad / packing | Consultar defectos, volúmenes y destino para priorizar la valorización | Ficha, dashboard, valorización, publicación |
| Comprador (procesadora de aceite, pulpa o congelados) | Ver ofertas de fracciones y mostrar interés | Marketplace |

No hay login en el prototipo. Un **selector de perfil** en la cabecera ("Packing" / "Comprador")
cambia la navegación. El control de accesos real corresponde a PB-16.

**Perfil Comprador (D10):** oculta la barra de pasos 1–5; su navegación es solo Marketplace y Acerca.
En la cabecera elige su **empresa demo** (catálogo 3.6). Nunca ve el formulario de registro ni las
fichas internas de los lotes.

## 3. Catálogos

### 3.1 Clases (RF-02)

| id | Nombre | Criterio de etiquetado | Destino sugerido | Color (token) |
|---|---|---|---|---|
| `dm` | Daño mecánico | Golpes, cortes o magulladuras por manipuleo | Aceite | `--c1` |
| `dp` | Daño de piel | Manchas, roces o quemaduras de sol sin daño a la pulpa | Aceite | `--c2` |
| `pl` | Plagas | Picaduras, galerías o lesiones por insectos | Pulpa | `--c3` |
| `cp` | Calibre pequeño | Fruta sana por debajo del calibre de exportación | Pulpa | `--c4` |
| `ox` | Óptima para exportación | Sin defectos visibles, dentro del calibre | Reclasificación | `--c5` |

### 3.2 Destinos y precios de referencia (RF-07)

| id | Destino | Clases | Precio ilustrativo (S/ por kg) |
|---|---|---|---|
| `aceite` | Aceite de palta | dm, dp | 1,10 |
| `pulpa` | Pulpa y guacamole | pl, cp | 1,60 |
| `reclasificacion` | Reclasificación a exportación | ox | 4,20 |

Los precios viven en `src/config/precios.ts` con un campo `version` y se pueden editar en
Configuración. **Siempre** se muestran con el aviso "Valores ilustrativos, no son cotizaciones".

### 3.3 Estados del lote

`registrado → imagenes_cargadas → clasificado → valorizado → publicado`

Un lote solo avanza en este orden. Se puede reclasificar mientras no esté publicado; reclasificar
invalida la valorización y genera un evento.

El lote pasa a `publicado` con su **primera** oferta. Las ofertas siguientes (otros destinos, D7) no
cambian el estado, pero registran un evento `publicado` con el destino en el detalle.

### 3.4 Packings (D4)

Catálogo editable en `src/config/packings.ts`:
- Packing de Cañete (demo)
- Packing de Chincha (demo)
- Packing de Huaral (demo)

### 3.5 Responsables (D5)

Lista de **roles demo**, no texto libre (sin datos personales):
- Supervisor de calidad (demo) — valor por defecto
- Operario de clasificación (demo)
- Jefe de packing (demo)

### 3.6 Empresas compradoras demo (D10)

- Procesadora de aceite (demo)
- Procesadora de pulpa (demo)
- Procesadora de congelados (demo)

## 4. Historias de usuario y criterios de aceptación

Formato: Como ⟨usuario⟩ quiero ⟨acción⟩ para ⟨valor⟩. Los criterios se escriben como pruebas.

> **Replanificación (D3).** En el Sprint 02 solo se compromete PB-03 (más la base técnica).
> PB-02/04 y PB-05 vuelven al Product Backlog y el PO los prioriza **al inicio del Sprint 03**,
> antes que PB-07, PB-08 y PB-09. Lo que no entre en el Sprint 03 pasa al Sprint 04 junto con PB-10 y PB-11.
> Los criterios de aceptación no cambian; solo el sprint en que se entregan.

### Sprint 02 (13–19 nov) · RF-02, RF-05, RF-11 · EDT E6/E7 (PB-02/04 y PB-05 → Sprint 03)

**PB-03 · Registrar un lote con identificador (3 pts).**
Como supervisor quiero registrar un lote de descarte para trazarlo desde su origen.
- El formulario pide: packing (lista del catálogo 3.4), fecha de recepción (≤ hoy), variedad (Hass), peso en kg (> 0 y ≤ 50 000, admite decimales), observaciones (opcional, ≤ 300 caracteres) y responsable (lista de roles demo del catálogo 3.5; por defecto "Supervisor de calidad (demo)").
- No hay edición de lotes (D6): si un dato está mal, se borra el lote (solo en `registrado` o `imagenes_cargadas`) y se registra de nuevo.
- Valida con Zod y muestra los errores junto al campo; no se envía con datos inválidos.
- Genera un ID `LT-AAAA-NNNN` correlativo por año (AAAA = año de recepción) que **nunca se repite**, aunque se borren lotes.
- El lote aparece primero en "Lotes de descarte", con estado `registrado` y el evento "Lote registrado".
- Tras recargar la página, el lote sigue ahí (persistencia).

**PB-02 / PB-04 · Muestra etiquetada y clasificación en cinco categorías (3 + 5 pts).**
Como operario quiero cargar las imágenes del lote y ver la categoría de cada fruta para identificar su condición.
- Acepta JPG o PNG (≤ 10 MB cada una, hasta 200 por lote) por selector o arrastre. Rechaza otros archivos con un mensaje claro.
- Cada imagen se redimensiona en el navegador (máx. 512 px de lado), se guarda vinculada al lote y recibe un código `IMG-NNN` por lote.
- Opcionalmente se carga la **hoja de etiquetas** CSV con las columnas `archivo,clase,etiquetador,fecha`. `clase` acepta el id (`dm`) o el nombre ("Daño mecánico"). Las filas inválidas se reportan sin abortar la carga.
- **Regla del clasificador:** si el nombre del archivo está en la hoja, la clase sale de la etiqueta (`origen: "etiqueta_manual"`). Si no, se asigna una clase **determinista** a partir del hash SHA-256 del contenido (`origen: "simulada"`): los **primeros 4 bytes como `uint32` big-endian, mod 5**, en el orden del catálogo (`dm, dp, pl, cp, ox`), versión `"simulada-v1"` (D14). La misma imagen siempre da la misma clase, así que el resultado es reproducible.
- La pantalla muestra cada fruta con su clase y origen, el resumen por clase (n.º y %) y un aviso visible: "Clasificación con etiquetas manuales o simulada; no proviene de un modelo entrenado".
- No se muestra "confianza" salvo con `origen: "modelo"` (no existe aún). Los porcentajes de confianza del prototipo del Sprint 01 **no se replican** (D16).
- Al clasificar, el lote pasa a `clasificado` y se registra el evento correspondiente.
- **Imágenes reales (decisión del 18/11/2026):** las pruebas y el modo demo usan las 12 fotos reales de palta Hass del prototipo (dataset de Mendeley, CC BY 4.0, con crédito). Ese dataset es de maduración, no de defectos, así que la hoja de etiquetas solo incluye las fotos cuya clase confirme alguien del equipo; las demás salen como `simulada`. Las fotos de daño mecánico (`dm`) y plagas (`pl`) las tomará el equipo en descarte real más adelante y se agregarán a `tests/fixtures/` y al modo demo cuando existan.

**PB-05 · Consultar la ficha del lote por su ID (2 pts).**
Como supervisor quiero buscar un lote por su ID para ver toda su trazabilidad.
- Hay una búsqueda por ID (exacta, sin distinguir mayúsculas) en la lista de lotes y una ruta directa `#/lotes/LT-2026-0143`.
- La ficha muestra los datos del lote, KPI (peso, n.º de imágenes, % óptima), la galería con clase y origen, el resumen por clase en n.º y kg, y la línea de tiempo de eventos.
- Un ID inexistente muestra "Lote no encontrado" con un enlace a la lista, sin errores en consola.

### Sprint 03 (20–26 nov) · RF-06 a RF-09 · EDT E7/E8

**PB-07 · Dashboard con métricas por lote (5 pts).**
Como supervisor quiero ver el volumen y la distribución de la merma para decidir su destino.
- El Dashboard es **global** (D8): no depende del lote en contexto. Si hay un lote en contexto, aparece el enlace "Volver al lote LT-…" sobre los KPI.
- Filtros por rango de fechas (por defecto, la semana actual) y por packing.
- KPI calculados de los lotes con estado ≥ `clasificado` (clasificado, valorizado y publicado; D9): kg de descarte, n.º de lotes, defecto más frecuente (por kg), % recuperable para exportación (kg `ox` / kg total).
- Gráficos: distribución por clase en kg (barras horizontales) y kg por día (columnas). Tienen leyenda o rótulos directos, colores de clase y tabla accesible equivalente.
- Sin datos: estado vacío con un enlace a "Registrar lote".
- Todo se calcula con funciones puras probadas (`domain/metricas.ts`).

**PB-08 · Estimar el destino y el valor del lote (3 pts).**
Como supervisor quiero ver qué destino conviene a cada fracción y su valor de referencia.
- kg por clase = peso del lote × (n.º de frutas de la clase / n.º total). Se reparte con el **método del resto mayor** para que la suma sea exactamente el peso del lote (2 decimales).
- Fracción por destino = suma de kg de sus clases; valor = kg × precio; total del lote.
- Muestra la versión de precios usada y el aviso de "valores ilustrativos".
- Al confirmar, guarda la `Valorizacion`, pasa el lote a `valorizado` y registra el evento.

**PB-09 · Publicar el lote y calcular la comisión de prueba (3 pts).**
Como supervisor quiero publicar una fracción para conectarla con procesadoras interesadas.
- Se elige la fracción (destino) con kg > 0; el precio por kg viene precargado y es editable (> 0); se indican la fecha de retiro (≥ hoy) y el tipo de comprador.
- Monto = kg × precio; **comisión AgroIQ = 4 % del monto**; neto para el packing = monto − comisión. Todo se calcula en céntimos, con redondeo half-up.
- Genera una oferta `OF-AAAA-NNNN`, la guarda con estado `publicada`, pasa el lote a `publicado` (si es la primera) y registra el evento `publicado` con el destino en el detalle.
- **Varias ofertas por lote (D7):** una oferta **activa por destino** (máximo tres: aceite, pulpa, reclasificación), solo para fracciones con kg > 0. No se permite una segunda oferta activa del mismo destino; si la oferta se retira (`estado: 'retirada'`), ese destino puede publicarse de nuevo.
- La pantalla de publicación muestra las tres fracciones con su estado: "Publicada OF-…", "Disponible" o "Sin kg".
- **Vista Comprador (marketplace):** lista de ofertas publicadas filtrable por destino, con detalle de la oferta (sin datos sensibles del packing) y botón "Me interesa" que registra un interés de prueba visible para el packing, guardando la empresa demo elegida en la cabecera en `InteresComprador.comprador` (D10).
- Aviso permanente: "Publicación de prueba; no se realizan ventas ni pagos".

### Sprint 04 (27 nov–03 dic) · EDT E9

**PB-10 · Integrar y probar el flujo de extremo a extremo (5 pts).**
- Una prueba Playwright recorre todo el flujo con datos de prueba versionados en `tests/fixtures/` y pasa en CI.
- Ninguna pantalla tiene errores en consola ni fallas de accesibilidad graves (axe).
- El build de archivo único funciona abierto sin servidor y sin internet.

**PB-11 · Guion, video de respaldo y ensayo (3 pts).**
- El **modo demo** carga un conjunto de ejemplo (3–4 lotes, ≥ 12 imágenes) con un botón y se reinicia con otro.
- Un **modo presentación** opcional muestra la guía del paso actual (texto corto del guion) en un panel plegable.
- Se generan capturas de todas las pantallas (`npm run evidencias`) para el guion y el video.

## 5. Reglas de negocio (resumen para pruebas)

| Regla | Detalle |
|---|---|
| ID de lote | `LT-` + año de recepción + `-` + correlativo de 4 dígitos. El correlativo es el máximo histórico del año + 1 y se guarda en un contador persistente; no se reutiliza. |
| ID de imagen | `IMG-` + correlativo de 3 dígitos por lote, en el orden de carga. |
| ID de oferta | `OF-AAAA-NNNN`, con la misma lógica que el lote. |
| Clase simulada | Primeros 4 bytes del SHA-256 como `uint32` big-endian, mod 5, en el orden `dm, dp, pl, cp, ox` (`simulada-v1`). |
| Ofertas por lote | Máximo una oferta `publicada` por destino; solo fracciones con kg > 0; retirada → se puede volver a publicar. La primera oferta pasa el lote a `publicado`. |
| Lotes del dashboard | Estado ≥ `clasificado`. |
| kg por clase | Proporcional al n.º de frutas, con reparto por resto mayor; la suma es igual al peso. |
| Comisión | 4 % del monto; los montos en céntimos enteros. |
| % óptima | n.º `ox` / n.º total de frutas clasificadas. |
| Defecto más frecuente | Clase con más kg, excluyendo `ox`. En empate, el orden del catálogo. |
| Reclasificar | Permitido si el lote no está `publicado`; borra la valorización y registra un evento. |
| Borrar lote | Solo en estado `registrado` o `imagenes_cargadas`; pide confirmación; el contador no retrocede. |

## 6. Modelo de datos (TypeScript, referencia)

```ts
type ClaseId = 'dm' | 'dp' | 'pl' | 'cp' | 'ox';
type DestinoId = 'aceite' | 'pulpa' | 'reclasificacion';
type EstadoLote = 'registrado' | 'imagenes_cargadas' | 'clasificado' | 'valorizado' | 'publicado';
type OrigenClasificacion = 'etiqueta_manual' | 'simulada' | 'modelo';

interface Lote {
  id: string;                 // LT-2026-0143
  packing: string;            // catálogo 3.4 (src/config/packings.ts)
  fechaRecepcion: string;     // ISO yyyy-mm-dd
  variedad: 'Hass';
  pesoKg: number;
  observaciones?: string;
  responsable: string;        // rol demo del catálogo 3.5
  estado: EstadoLote;
  creadoEn: string;           // ISO datetime
}

interface ImagenFruta {
  id: string;                 // `${loteId}/IMG-001`
  codigo: string;             // IMG-001
  loteId: string;
  nombreArchivo: string;
  hash: string;               // SHA-256 del archivo original
  datos: ArrayBuffer;         // imagen redimensionada (≤ 512 px); el repositorio expone un Blob a la UI (D13)
  mime: 'image/jpeg' | 'image/png' | 'image/webp';
  ancho: number; alto: number;
  cargadaEn: string;
}

interface Clasificacion {
  imagenId: string;
  loteId: string;
  clase: ClaseId;
  origen: OrigenClasificacion;
  confianza?: number;         // solo si origen === 'modelo'
  etiquetador?: string;       // si origen === 'etiqueta_manual'
  version: string;            // p. ej. "simulada-v1"
  clasificadaEn: string;
}

interface EventoLote {
  id: string;
  loteId: string;
  tipo: 'registrado' | 'imagenes_cargadas' | 'clasificado' | 'reclasificado'
      | 'valorizado' | 'publicado' | 'interes_recibido';   // 'editado' eliminado (D6)
  fecha: string;
  detalle: string;
}

interface Valorizacion {
  loteId: string;
  fracciones: { destino: DestinoId; clases: ClaseId[]; kg: number; precioKgCent: number; valorCent: number }[];
  totalCent: number;
  preciosVersion: string;
  calculadaEn: string;
}

interface OfertaB2B {
  id: string;                 // OF-2026-0001
  loteId: string;
  destino: DestinoId;
  kg: number;
  precioKgCent: number;
  fechaRetiro: string;
  tipoComprador: string;
  montoCent: number;
  comisionCent: number;       // 4 %
  netoCent: number;
  estado: 'publicada' | 'retirada';   // máx. una 'publicada' por (loteId, destino) (D7)
  publicadaEn: string;
}

interface InteresComprador {
  id: string; ofertaId: string;
  comprador: string;          // empresa demo del catálogo 3.6
  mensaje?: string; fecha: string;
}
```

## 7. Definition of Done (del PAG, aplicada al software)

Una historia está **hecha** solo si cumple todo lo siguiente:

1. **Interfaz funcional:** las etapas se recorren sin errores bloqueantes, en escritorio y en móvil (≥ 360 px).
2. **Datos trazables:** ID de lote, imagen, categoría y cantidad consultables en la ficha.
3. **Pruebas:** unitarias del dominio y prueba e2e del tramo; `npm run check` en verde.
4. **Prueba del flujo:** se recorre según el guion sin pasos manuales ocultos.
5. **Evidencia guardada:** capturas en `evidencias/` y resumen en `docs/evidencias/SPRINT_0X.md`.
6. **Revisión entre pares y aceptación del Product Owner** (Omar Vega) en la Sprint Review.

## 8. Pantallas y rutas

| Ruta | Pantalla | Historia |
|---|---|---|
| `#/lotes` | Lista, búsqueda por ID y botón de registro | PB-03, PB-05 |
| `#/lotes/nuevo` | Formulario de registro | PB-03 |
| `#/lotes/:id/imagenes` | Carga de imágenes y hoja de etiquetas | PB-04 |
| `#/lotes/:id/clasificacion` | Resultado por fruta y resumen | PB-04 |
| `#/lotes/:id` | Ficha del lote | PB-05 |
| `#/dashboard` | Dashboard de merma | PB-07 |
| `#/lotes/:id/valorizacion` | Valorización por destino | PB-08 |
| `#/lotes/:id/publicacion` | Oferta B2B y comisión | PB-09 |
| `#/marketplace` · `#/marketplace/:ofertaId` | Vista Comprador | PB-09 |
| `#/configuracion` | Precios ilustrativos, modo demo, exportar e importar, reiniciar | PB-08, PB-11 |
| `#/acerca` | Alcance del prototipo, avisos y créditos de imágenes | — |

La barra de pasos 1–5 del prototipo se mantiene: muestra el paso activo y el lote en contexto.
Los pasos que aún no se pueden ejecutar para ese lote aparecen deshabilitados, con una explicación.

- **En el Dashboard (D8)** la barra conserva el lote en contexto: los pasos 1, 2, 4 y 5 siguen apuntando a ese lote y el paso 3 se marca activo.
- **Perfil Comprador (D10):** la barra no se muestra; solo están disponibles `#/marketplace`, `#/marketplace/:ofertaId` y `#/acerca`. Las demás rutas redirigen al Marketplace.

## 9. Créditos

Si se reutilizan las imágenes del prototipo, mantener en `#/acerca` y en el pie de página:
"'Hass' Avocado Ripening Photographic Dataset" (Xavier, Rodrigues y Silva, 2024, Mendeley Data,
doi:10.17632/3xd9n945v8.1), CC BY 4.0, recortadas y redimensionadas.
