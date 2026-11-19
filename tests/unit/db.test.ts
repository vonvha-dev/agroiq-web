import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearDB, type AgroIQDB } from '../../src/data/db';
import { crearRepositoriosDexie, type Repositorios } from '../../src/data/repositorios';
import type { ImagenFruta, Lote } from '../../src/domain/tipos';

let db: AgroIQDB;
let repos: Repositorios;

beforeEach(async () => {
  db = crearDB(`agroiq-test-${crypto.randomUUID()}`);
  await db.open();
  repos = crearRepositoriosDexie(db);
});

afterEach(async () => {
  db.close();
  await db.delete();
});

const lote = (id: string, creadoEn: string): Lote => ({
  id,
  packing: 'Packing de Cañete (demo)',
  fechaRecepcion: '2026-11-18',
  variedad: 'Hass',
  pesoKg: 250,
  responsable: 'Supervisor de calidad (demo)',
  estado: 'registrado',
  creadoEn,
});

describe('base de datos', () => {
  it('crea las ocho tablas del modelo', () => {
    expect(db.tables.map((t) => t.name).sort()).toEqual([
      'clasificaciones',
      'contadores',
      'eventos',
      'imagenes',
      'intereses',
      'lotes',
      'ofertas',
      'valorizaciones',
    ]);
  });
});

describe('ContadorRepository', () => {
  it('lee 0 si no existe y guarda valores por clave, independientes entre claves', async () => {
    expect(await repos.contadores.leer('LT-2026')).toBe(0);
    await repos.contadores.guardar('LT-2026', 2);
    await repos.contadores.guardar('OF-2026', 1);
    expect(await repos.contadores.leer('LT-2026')).toBe(2);
    expect(await repos.contadores.leer('OF-2026')).toBe(1);
  });

  it('no permite que el contador retroceda', async () => {
    await repos.contadores.guardar('LT-2026', 5);
    await expect(repos.contadores.guardar('LT-2026', 4)).rejects.toThrow(/retroceder/);
    expect(await repos.contadores.leer('LT-2026')).toBe(5);
  });
});

describe('LoteRepository', () => {
  it('lista los IDs por prefijo y no admite un ID repetido al agregar', async () => {
    await repos.lotes.agregar(lote('LT-2026-0001', '2026-11-18T10:00:00Z'));
    await repos.lotes.agregar(lote('LT-2025-0007', '2026-11-18T10:01:00Z'));
    expect(await repos.lotes.listarIds('LT-2026-')).toEqual(['LT-2026-0001']);
    await expect(repos.lotes.agregar(lote('LT-2026-0001', 'x'))).rejects.toThrow();
  });

  it('lista el lote más reciente primero y persiste entre lecturas', async () => {
    await repos.lotes.guardar(lote('LT-2026-0001', '2026-11-18T10:00:00Z'));
    await repos.lotes.guardar(lote('LT-2026-0002', '2026-11-18T11:00:00Z'));
    expect((await repos.lotes.listar()).map((l) => l.id)).toEqual(['LT-2026-0002', 'LT-2026-0001']);
    expect((await repos.lotes.obtener('LT-2026-0001'))?.pesoKg).toBe(250);
  });
});

describe('ImagenRepository (D13)', () => {
  it('guarda ArrayBuffer + mime y entrega un Blob a la UI', async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const imagen: ImagenFruta = {
      id: 'LT-2026-0001/IMG-001',
      codigo: 'IMG-001',
      loteId: 'LT-2026-0001',
      nombreArchivo: 'palta1.jpg',
      hash: 'ab'.repeat(32),
      datos: bytes.buffer,
      mime: 'image/jpeg',
      ancho: 512,
      alto: 512,
      cargadaEn: '2026-11-18T10:05:00Z',
    };
    await repos.imagenes.guardar(imagen);

    const [vista] = await repos.imagenes.listarPorLote('LT-2026-0001');
    expect(vista).toBeDefined();
    expect(vista).not.toHaveProperty('datos');
    expect(vista?.blob.type).toBe('image/jpeg');
    expect(new Uint8Array(await vista!.blob.arrayBuffer())).toEqual(bytes);
    expect(await repos.imagenes.contarPorLote('LT-2026-0001')).toBe(1);
  });
});
