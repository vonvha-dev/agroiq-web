import type { DestinoId } from '../domain/catalogos';

/** Precios ILUSTRATIVOS por kg, en céntimos (docs/01 §3.2). No son cotizaciones. */
export interface TablaPrecios {
  version: string;
  porDestinoCent: Readonly<Record<DestinoId, number>>;
}

export const PRECIOS_REFERENCIA: TablaPrecios = {
  version: 'precios-2026-11-v1',
  porDestinoCent: { aceite: 110, pulpa: 160, reclasificacion: 420 },
};

export const AVISO_PRECIOS = 'Valores ilustrativos, no son cotizaciones';
