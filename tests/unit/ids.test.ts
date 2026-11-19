import { describe, expect, it } from 'vitest';
import {
  claveContador,
  correlativoDeId,
  esIdLote,
  formatearId,
  normalizarId,
  siguienteCorrelativo,
} from '../../src/domain/ids';

describe('formatearId()', () => {
  it('da el formato LT-AAAA-NNNN y OF-AAAA-NNNN con ceros a la izquierda', () => {
    expect(formatearId('LT', 2026, 143)).toBe('LT-2026-0143');
    expect(formatearId('LT', 2026, 1)).toBe('LT-2026-0001');
    expect(formatearId('OF', 2026, 9999)).toBe('OF-2026-9999');
  });

  it('rechaza correlativos fuera de 1–9999 y años inválidos', () => {
    expect(() => formatearId('LT', 2026, 0)).toThrow(/Correlativo/);
    expect(() => formatearId('LT', 2026, 10000)).toThrow(/Correlativo/);
    expect(() => formatearId('LT', 2026, 1.5)).toThrow(/Correlativo/);
    expect(() => formatearId('LT', 999, 1)).toThrow(/Año/);
  });
});

describe('claveContador()', () => {
  it('separa el contador por prefijo y año', () => {
    expect(claveContador('LT', 2026)).toBe('LT-2026');
    expect(claveContador('OF', 2025)).toBe('OF-2025');
  });
});

describe('correlativoDeId()', () => {
  it('extrae el correlativo si el ID es del prefijo y año pedidos', () => {
    expect(correlativoDeId('LT-2026-0143', 'LT', 2026)).toBe(143);
    expect(correlativoDeId('LT-2025-0143', 'LT', 2026)).toBeNull();
    expect(correlativoDeId('OF-2026-0001', 'LT', 2026)).toBeNull();
    expect(correlativoDeId('LT-2026-14', 'LT', 2026)).toBeNull();
  });
});

describe('siguienteCorrelativo()', () => {
  it('es el contador + 1', () => {
    expect(siguienteCorrelativo(0, [], 'LT', 2026)).toBe(1);
    expect(siguienteCorrelativo(5, ['LT-2026-0005'], 'LT', 2026)).toBe(6);
  });

  it('no reutiliza un número aunque el lote se haya borrado (el contador manda)', () => {
    expect(siguienteCorrelativo(7, ['LT-2026-0001'], 'LT', 2026)).toBe(8);
  });

  it('nunca queda por debajo del máximo histórico existente del año', () => {
    const ids = ['LT-2026-0010', 'LT-2026-0003', 'LT-2025-0500', 'OF-2026-0900'];
    expect(siguienteCorrelativo(2, ids, 'LT', 2026)).toBe(11);
  });

  it('falla al agotar los 9999 correlativos del año', () => {
    expect(() => siguienteCorrelativo(9999, [], 'LT', 2026)).toThrow(/agotaron/);
  });
});

describe('búsqueda por ID', () => {
  it('normaliza espacios y mayúsculas', () => {
    expect(normalizarId('  lt-2026-0143 ')).toBe('LT-2026-0143');
  });

  it('reconoce solo IDs de lote completos', () => {
    expect(esIdLote('LT-2026-0143')).toBe(true);
    expect(esIdLote('lt-2026-0143')).toBe(false);
    expect(esIdLote('LT-2026-143')).toBe(false);
    expect(esIdLote('OF-2026-0143')).toBe(false);
  });
});
