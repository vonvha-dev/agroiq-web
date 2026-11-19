import { describe, expect, it } from 'vitest';
import { ESTADOS_LOTE, type EstadoLote } from '../../src/domain/catalogos';
import {
  alcanzo,
  motivoNoPuede,
  puede,
  transicion,
  type AccionLote,
} from '../../src/domain/estados';

const lote = (estado: EstadoLote) => ({ estado });

/** Estados desde los que cada acción está permitida (docs/01 §3.3, §5 y D7). */
const PERMITIDO: Record<AccionLote, EstadoLote[]> = {
  cargar_imagenes: ['registrado', 'imagenes_cargadas'],
  clasificar: ['imagenes_cargadas'],
  reclasificar: ['clasificado', 'valorizado'],
  valorizar: ['clasificado'],
  publicar: ['valorizado', 'publicado'],
  borrar: ['registrado', 'imagenes_cargadas'],
};

describe('puede()', () => {
  for (const [accion, permitidos] of Object.entries(PERMITIDO) as [AccionLote, EstadoLote[]][]) {
    for (const estado of ESTADOS_LOTE) {
      const esperado = permitidos.includes(estado);
      it(`${accion} desde ${estado} → ${esperado}`, () => {
        expect(puede(lote(estado), accion)).toBe(esperado);
      });
    }
  }

  it('no permite reclasificar un lote publicado', () => {
    expect(puede(lote('publicado'), 'reclasificar')).toBe(false);
  });
});

describe('motivoNoPuede()', () => {
  it('devuelve null si la acción está permitida', () => {
    expect(motivoNoPuede(lote('registrado'), 'cargar_imagenes')).toBeNull();
  });

  it('explica por qué no se puede', () => {
    expect(motivoNoPuede(lote('registrado'), 'clasificar')).toMatch(/carga las imágenes/);
    expect(motivoNoPuede(lote('clasificado'), 'borrar')).toMatch(/antes de clasificarlo/);
  });
});

describe('transicion()', () => {
  it('recorre el flujo completo en orden', () => {
    let estado: EstadoLote = 'registrado';
    estado = transicion(estado, 'cargar_imagenes');
    expect(estado).toBe('imagenes_cargadas');
    estado = transicion(estado, 'clasificar');
    expect(estado).toBe('clasificado');
    estado = transicion(estado, 'valorizar');
    expect(estado).toBe('valorizado');
    estado = transicion(estado, 'publicar');
    expect(estado).toBe('publicado');
  });

  it('mantiene publicado al publicar otro destino (D7)', () => {
    expect(transicion('publicado', 'publicar')).toBe('publicado');
  });

  it('reclasificar un lote valorizado lo devuelve a clasificado', () => {
    expect(transicion('valorizado', 'reclasificar')).toBe('clasificado');
  });

  it('rechaza saltos en el flujo', () => {
    expect(() => transicion('registrado', 'clasificar')).toThrow(/Transición inválida/);
    expect(() => transicion('registrado', 'publicar')).toThrow(/Transición inválida/);
    expect(() => transicion('publicado', 'reclasificar')).toThrow(/Transición inválida/);
  });
});

describe('alcanzo()', () => {
  it('identifica los lotes con estado ≥ clasificado (D9)', () => {
    const delDashboard = ESTADOS_LOTE.filter((e) => alcanzo(e, 'clasificado'));
    expect(delDashboard).toEqual(['clasificado', 'valorizado', 'publicado']);
  });
});
