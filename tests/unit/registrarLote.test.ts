import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearDB } from '../../src/data/db';
import { crearRepositoriosDexie } from '../../src/data/repositorios';
import type { DatosNuevoLote } from '../../src/domain/lote';
import { borrarLote } from '../../src/services/borrarLote';
import type { ContextoServicio } from '../../src/services/contexto';
import { registrarLote } from '../../src/services/registrarLote';

let ctx: ContextoServicio;
let n = 0;

beforeEach(async () => {
  const db = crearDB(`agroiq-test-${crypto.randomUUID()}`);
  await db.open();
  n = 0;
  ctx = {
    db,
    repos: crearRepositoriosDexie(db),
    // Reloj que avanza 1 minuto por lote, para un orden determinista.
    ahora: () => new Date(Date.UTC(2026, 10, 18, 13, n++)),
    nuevoId: () => `ev-${crypto.randomUUID()}`,
  };
});

afterEach(async () => {
  ctx.db.close();
  await ctx.db.delete();
});

const datos = (cambios: Partial<DatosNuevoLote> = {}): DatosNuevoLote => ({
  packing: 'Packing de Cañete (demo)',
  fechaRecepcion: '2026-11-18',
  variedad: 'Hass',
  pesoKg: 250,
  responsable: 'Supervisor de calidad (demo)',
  ...cambios,
});

describe('registrarLote()', () => {
  it('guarda el lote registrado, el evento y el contador del año', async () => {
    const lote = await registrarLote(datos({ observaciones: 'Línea 2' }), ctx);

    expect(lote).toMatchObject({ id: 'LT-2026-0001', estado: 'registrado', pesoKg: 250 });
    expect(await ctx.repos.lotes.obtener('LT-2026-0001')).toEqual(lote);
    const eventos = await ctx.repos.eventos.listarPorLote('LT-2026-0001');
    expect(eventos).toHaveLength(1);
    expect(eventos[0]).toMatchObject({ tipo: 'registrado', detalle: 'Lote registrado' });
    expect(await ctx.repos.contadores.leer('LT-2026')).toBe(1);
  });

  it('da IDs consecutivos a dos lotes del mismo año y el más reciente sale primero', async () => {
    await registrarLote(datos(), ctx);
    await registrarLote(datos(), ctx);
    expect((await ctx.repos.lotes.listar()).map((l) => l.id)).toEqual([
      'LT-2026-0002',
      'LT-2026-0001',
    ]);
  });

  it('usa el año de recepción y un correlativo independiente por año', async () => {
    await registrarLote(datos(), ctx);
    const anterior = await registrarLote(datos({ fechaRecepcion: '2025-12-30' }), ctx);
    expect(anterior.id).toBe('LT-2025-0001');
  });

  it('no reutiliza el ID de un lote borrado', async () => {
    await registrarLote(datos(), ctx);
    await registrarLote(datos(), ctx);
    await borrarLote('LT-2026-0002', ctx);
    const nuevo = await registrarLote(datos(), ctx);
    expect(nuevo.id).toBe('LT-2026-0003');
  });

  it('si falla una parte, no deja nada a medias (transacción)', async () => {
    const idRepetido = 'ev-fijo';
    await ctx.repos.eventos.agregar({
      id: idRepetido,
      loteId: 'X',
      tipo: 'registrado',
      fecha: 'x',
      detalle: 'x',
    });
    const conFallo: ContextoServicio = { ...ctx, nuevoId: () => idRepetido };

    await expect(registrarLote(datos(), conFallo)).rejects.toThrow();
    expect(await ctx.repos.lotes.listar()).toEqual([]);
    expect(await ctx.repos.contadores.leer('LT-2026')).toBe(0);
  });
});

describe('borrarLote()', () => {
  it('borra el lote y sus eventos', async () => {
    await registrarLote(datos(), ctx);
    await borrarLote('LT-2026-0001', ctx);
    expect(await ctx.repos.lotes.obtener('LT-2026-0001')).toBeUndefined();
    expect(await ctx.repos.eventos.listarPorLote('LT-2026-0001')).toEqual([]);
  });

  it('rechaza borrar un lote clasificado o inexistente', async () => {
    const lote = await registrarLote(datos(), ctx);
    await ctx.repos.lotes.guardar({ ...lote, estado: 'clasificado' });
    await expect(borrarLote(lote.id, ctx)).rejects.toThrow(/antes de clasificarlo/);
    await expect(borrarLote('LT-2026-0999', ctx)).rejects.toThrow(/no encontrado/);
    expect(await ctx.repos.lotes.obtener(lote.id)).toBeDefined();
  });
});
