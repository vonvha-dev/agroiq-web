import { describe, expect, it } from 'vitest';
import {
  CLASE_IDS,
  CLASES,
  DESTINOS,
  ESTADOS_LOTE,
  NOMBRE_ESTADO,
  clasesDeDestino,
  getClase,
  getDestino,
  type ClaseId,
  type DestinoId,
} from '../../src/domain/catalogos';

describe('catálogo de clases', () => {
  it('tiene las cinco clases en el orden dm, dp, pl, cp, ox', () => {
    expect(CLASES.map((c) => c.id)).toEqual(['dm', 'dp', 'pl', 'cp', 'ox']);
    expect(CLASE_IDS).toEqual(CLASES.map((c) => c.id));
  });

  it('asigna a cada clase el destino y el color de la especificación', () => {
    const esperado: Record<ClaseId, [DestinoId, string]> = {
      dm: ['aceite', '--c1'],
      dp: ['aceite', '--c2'],
      pl: ['pulpa', '--c3'],
      cp: ['pulpa', '--c4'],
      ox: ['reclasificacion', '--c5'],
    };
    for (const clase of CLASES) {
      expect([clase.destino, clase.color]).toEqual(esperado[clase.id]);
    }
  });

  it('getClase devuelve la clase y falla con un id desconocido', () => {
    expect(getClase('ox').nombre).toBe('Óptima para exportación');
    expect(() => getClase('zz' as ClaseId)).toThrow(/desconocida/);
  });
});

describe('catálogo de destinos', () => {
  it('tiene tres destinos y cada clase pertenece a exactamente uno', () => {
    expect(DESTINOS.map((d) => d.id)).toEqual(['aceite', 'pulpa', 'reclasificacion']);
    const repartidas = DESTINOS.flatMap((d) => clasesDeDestino(d.id));
    expect([...repartidas].sort()).toEqual([...CLASE_IDS].sort());
  });

  it('agrupa las clases por destino', () => {
    expect(clasesDeDestino('aceite')).toEqual(['dm', 'dp']);
    expect(clasesDeDestino('pulpa')).toEqual(['pl', 'cp']);
    expect(clasesDeDestino('reclasificacion')).toEqual(['ox']);
  });

  it('getDestino devuelve el destino y falla con un id desconocido', () => {
    expect(getDestino('pulpa').nombre).toBe('Pulpa y guacamole');
    expect(() => getDestino('otro' as DestinoId)).toThrow(/desconocido/);
  });
});

describe('estados del lote', () => {
  it('sigue el orden registrado → imagenes_cargadas → clasificado → valorizado → publicado', () => {
    expect(ESTADOS_LOTE).toEqual([
      'registrado',
      'imagenes_cargadas',
      'clasificado',
      'valorizado',
      'publicado',
    ]);
  });

  it('tiene un nombre visible para cada estado', () => {
    for (const estado of ESTADOS_LOTE) expect(NOMBRE_ESTADO[estado]).toBeTruthy();
  });
});
