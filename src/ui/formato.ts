/** Formato es-PE para la interfaz (CLAUDE.md, regla 8). Solo presentación. */

/** `aaaa-mm-dd` → `dd/mm/aaaa`, sin pasar por Date (evita corrimientos de zona horaria). */
export function formatearFecha(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}

const kg = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });

export function formatearKg(valor: number): string {
  return kg.format(valor);
}
