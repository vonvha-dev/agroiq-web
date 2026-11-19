import { describe, expect, it } from 'vitest';
import { formatearFecha, formatearKg } from '../../src/ui/formato';

describe('formato es-PE', () => {
  it('muestra las fechas como dd/mm/aaaa', () => {
    expect(formatearFecha('2026-11-08')).toBe('08/11/2026');
    expect(formatearFecha('2026-11-08T23:59:00.000Z')).toBe('08/11/2026');
  });

  it('muestra los kg con hasta 2 decimales', () => {
    expect(formatearKg(250)).toBe('250');
    expect(formatearKg(12.5)).toBe('12.5');
    expect(formatearKg(1234.567)).toBe('1,234.57');
  });
});
