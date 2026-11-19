import type { EventoLote, Lote } from './tipos';

export interface DatosNuevoLote {
  packing: string;
  fechaRecepcion: string;
  variedad: 'Hass';
  pesoKg: number;
  observaciones?: string | undefined;
  responsable: string;
}

export function crearLote(datos: DatosNuevoLote, id: string, creadoEn: string): Lote {
  const { observaciones, ...resto } = datos;
  return {
    ...resto,
    ...(observaciones ? { observaciones } : {}),
    id,
    estado: 'registrado',
    creadoEn,
  };
}

/** Evento "Lote registrado" de la línea de tiempo (docs/01 PB-03). */
export function eventoRegistrado(lote: Lote, idEvento: string): EventoLote {
  return {
    id: idEvento,
    loteId: lote.id,
    tipo: 'registrado',
    fecha: lote.creadoEn,
    detalle: 'Lote registrado',
  };
}
