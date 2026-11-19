import { ESTADOS_LOTE, type EstadoLote } from './catalogos';

/** Acciones que cambian (o consultan) el estado de un lote (docs/01 §3.3 y §5). */
export type AccionLote =
  'cargar_imagenes' | 'clasificar' | 'reclasificar' | 'valorizar' | 'publicar' | 'borrar';

interface Regla {
  desde: readonly EstadoLote[];
  /** Estado resultante; `null` si la acción no deja un estado (borrar). */
  hacia: EstadoLote | null;
  motivo: string;
}

const REGLAS: Readonly<Record<AccionLote, Regla>> = {
  cargar_imagenes: {
    desde: ['registrado', 'imagenes_cargadas'],
    hacia: 'imagenes_cargadas',
    motivo: 'Solo se cargan imágenes antes de clasificar el lote.',
  },
  clasificar: {
    desde: ['imagenes_cargadas'],
    hacia: 'clasificado',
    motivo: 'Primero carga las imágenes del lote.',
  },
  reclasificar: {
    desde: ['clasificado', 'valorizado'],
    hacia: 'clasificado',
    motivo: 'Solo se reclasifica un lote clasificado que aún no se ha publicado.',
  },
  valorizar: {
    desde: ['clasificado'],
    hacia: 'valorizado',
    motivo: 'Primero clasifica el lote.',
  },
  // La primera oferta pasa el lote a publicado; las siguientes lo mantienen (D7).
  publicar: {
    desde: ['valorizado', 'publicado'],
    hacia: 'publicado',
    motivo: 'Primero valoriza el lote.',
  },
  borrar: {
    desde: ['registrado', 'imagenes_cargadas'],
    hacia: null,
    motivo: 'Solo se borra un lote antes de clasificarlo.',
  },
};

export function puede(lote: { estado: EstadoLote }, accion: AccionLote): boolean {
  return REGLAS[accion].desde.includes(lote.estado);
}

/** Explicación para la UI cuando la acción no está disponible; `null` si sí lo está. */
export function motivoNoPuede(lote: { estado: EstadoLote }, accion: AccionLote): string | null {
  return puede(lote, accion) ? null : REGLAS[accion].motivo;
}

/** Estado resultante de aplicar la acción. Lanza un error si la transición no es válida. */
export function transicion(estado: EstadoLote, accion: Exclude<AccionLote, 'borrar'>): EstadoLote {
  const regla = REGLAS[accion];
  if (!regla.desde.includes(estado) || regla.hacia === null) {
    throw new Error(`Transición inválida: ${accion} desde ${estado}`);
  }
  return regla.hacia;
}

/** true si `estado` está en `minimo` o más adelante en el flujo (p. ej. lotes del dashboard, D9). */
export function alcanzo(estado: EstadoLote, minimo: EstadoLote): boolean {
  return ESTADOS_LOTE.indexOf(estado) >= ESTADOS_LOTE.indexOf(minimo);
}
