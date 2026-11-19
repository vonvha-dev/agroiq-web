/** Fechas de calendario como texto ISO `aaaa-mm-dd`, en la zona horaria de Lima. */

const ZONA = 'America/Lima';

/** Fecha de hoy en Lima, `aaaa-mm-dd`. */
export function hoyLima(ahora: Date = new Date()): string {
  // en-CA formatea como aaaa-mm-dd.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora);
}

export function esFechaIsoValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

export function anioDeFecha(fechaIso: string): number {
  return Number(fechaIso.slice(0, 4));
}
