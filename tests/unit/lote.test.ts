import { describe, expect, it } from 'vitest';
import { crearLote, eventoRegistrado } from '../../src/domain/lote';

const datos = {
  packing: 'Packing de Cañete (demo)',
  fechaRecepcion: '2026-11-18',
  variedad: 'Hass' as const,
  pesoKg: 250,
  observaciones: 'Línea 2',
  responsable: 'Supervisor de calidad (demo)',
};

describe('crearLote()', () => {
  it('crea el lote en estado registrado con su ID y fecha de creación', () => {
    expect(crearLote(datos, 'LT-2026-0001', '2026-11-18T13:00:00.000Z')).toEqual({
      ...datos,
      id: 'LT-2026-0001',
      estado: 'registrado',
      creadoEn: '2026-11-18T13:00:00.000Z',
    });
  });

  it('omite observaciones vacías', () => {
    const lote = crearLote({ ...datos, observaciones: undefined }, 'LT-2026-0002', 'x');
    expect(lote).not.toHaveProperty('observaciones');
  });
});

describe('eventoRegistrado()', () => {
  it('describe el registro y se enlaza al lote', () => {
    const lote = crearLote(datos, 'LT-2026-0001', '2026-11-18T13:00:00.000Z');
    expect(eventoRegistrado(lote, 'ev-1')).toEqual({
      id: 'ev-1',
      loteId: 'LT-2026-0001',
      tipo: 'registrado',
      fecha: '2026-11-18T13:00:00.000Z',
      detalle: 'Lote registrado',
    });
  });
});
