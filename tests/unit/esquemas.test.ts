import { describe, expect, it } from 'vitest';
import {
  crearEsquemaLoteForm,
  erroresPorCampo,
  type LoteFormEntrada,
} from '../../src/domain/esquemas';

const esquema = crearEsquemaLoteForm({
  packings: ['Packing A (demo)', 'Packing B (demo)'],
  responsables: ['Supervisor (demo)', 'Operario (demo)'],
  hoy: '2026-11-18',
});

const valido: LoteFormEntrada = {
  packing: 'Packing A (demo)',
  fechaRecepcion: '2026-11-18',
  variedad: 'Hass',
  pesoKg: '250',
  observaciones: 'Descarte de la línea 2',
  responsable: 'Supervisor (demo)',
};

function errores(cambios: Partial<LoteFormEntrada>) {
  const r = esquema.safeParse({ ...valido, ...cambios });
  return r.success ? {} : erroresPorCampo(r.error);
}

describe('LoteForm', () => {
  it('acepta un lote válido y convierte el peso a número', () => {
    const r = esquema.safeParse(valido);
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ ...valido, pesoKg: 250 });
  });

  it('acepta decimales con punto o coma (máximo 2)', () => {
    expect(esquema.parse({ ...valido, pesoKg: '12.5' }).pesoKg).toBe(12.5);
    expect(esquema.parse({ ...valido, pesoKg: '12,75' }).pesoKg).toBe(12.75);
    expect(errores({ pesoKg: '1.234' }).pesoKg).toMatch(/2 decimales/);
  });

  it('valida el peso: obligatorio, número, > 0 y ≤ 50 000', () => {
    expect(errores({ pesoKg: '' }).pesoKg).toMatch(/Ingresa el peso/);
    expect(errores({ pesoKg: 'abc' }).pesoKg).toMatch(/número/);
    expect(errores({ pesoKg: '0' }).pesoKg).toMatch(/mayor que 0/);
    expect(errores({ pesoKg: '-5' }).pesoKg).toMatch(/mayor que 0/);
    expect(errores({ pesoKg: '50000' }).pesoKg).toBeUndefined();
    expect(errores({ pesoKg: '50000.01' }).pesoKg).toMatch(/50 000/);
  });

  it('exige una fecha válida que no sea posterior a hoy', () => {
    expect(errores({ fechaRecepcion: '' }).fechaRecepcion).toMatch(/fecha/);
    expect(errores({ fechaRecepcion: '2026-02-30' }).fechaRecepcion).toMatch(/fecha válida/);
    expect(errores({ fechaRecepcion: '2026-11-19' }).fechaRecepcion).toMatch(/posterior a hoy/);
    expect(errores({ fechaRecepcion: '2025-12-31' }).fechaRecepcion).toBeUndefined();
  });

  it('solo admite packings y responsables del catálogo', () => {
    expect(errores({ packing: 'Otro packing' }).packing).toMatch(/packing/);
    expect(errores({ responsable: 'Juan Pérez' }).responsable).toMatch(/responsable/);
  });

  it('solo admite la variedad Hass', () => {
    expect(errores({ variedad: 'Fuerte' as 'Hass' }).variedad).toBeDefined();
  });

  it('observaciones es opcional, se recorta y no supera 300 caracteres', () => {
    expect(esquema.parse({ ...valido, observaciones: '   ' }).observaciones).toBeUndefined();
    expect(esquema.parse({ ...valido, observaciones: ' hola ' }).observaciones).toBe('hola');
    expect(errores({ observaciones: 'x'.repeat(300) }).observaciones).toBeUndefined();
    expect(errores({ observaciones: 'x'.repeat(301) }).observaciones).toMatch(/300/);
  });

  it('conserva el texto con <script> tal cual (se escapa al mostrarlo, no al validarlo)', () => {
    const texto = '<script>alert(1)</script>';
    expect(esquema.parse({ ...valido, observaciones: texto }).observaciones).toBe(texto);
  });

  it('erroresPorCampo devuelve el primer mensaje de cada campo', () => {
    const r = esquema.safeParse({ ...valido, pesoKg: '', packing: '' });
    expect(r.success).toBe(false);
    const e = erroresPorCampo(r.error!);
    expect(Object.keys(e).sort()).toEqual(['packing', 'pesoKg']);
  });
});
