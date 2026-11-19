import { describe, expect, it } from 'vitest';
import { anioDeFecha, esFechaIsoValida, hoyLima } from '../../src/domain/fechas';

describe('hoyLima()', () => {
  it('usa la fecha de Lima (UTC−5), no la UTC', () => {
    // 19/11 a las 03:00 UTC todavía es 18/11 en Lima.
    expect(hoyLima(new Date('2026-11-19T03:00:00Z'))).toBe('2026-11-18');
    expect(hoyLima(new Date('2026-11-19T06:00:00Z'))).toBe('2026-11-19');
  });
});

describe('esFechaIsoValida()', () => {
  it('acepta fechas reales en formato aaaa-mm-dd', () => {
    expect(esFechaIsoValida('2026-11-18')).toBe(true);
    expect(esFechaIsoValida('2028-02-29')).toBe(true);
  });

  it('rechaza formatos y fechas imposibles', () => {
    expect(esFechaIsoValida('18/11/2026')).toBe(false);
    expect(esFechaIsoValida('2026-02-30')).toBe(false);
    expect(esFechaIsoValida('2026-13-01')).toBe(false);
    expect(esFechaIsoValida('')).toBe(false);
  });
});

describe('anioDeFecha()', () => {
  it('toma el año de la fecha ISO', () => {
    expect(anioDeFecha('2025-12-31')).toBe(2025);
  });
});
