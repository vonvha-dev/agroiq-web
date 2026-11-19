/** Identificadores trazables (docs/01 §5): LT-AAAA-NNNN y OF-AAAA-NNNN. */

export type PrefijoId = 'LT' | 'OF';

const MAX_CORRELATIVO = 9999;

export function formatearId(prefijo: PrefijoId, anio: number, correlativo: number): string {
  if (!Number.isInteger(anio) || anio < 1000 || anio > 9999) {
    throw new Error(`Año inválido: ${anio}`);
  }
  if (!Number.isInteger(correlativo) || correlativo < 1 || correlativo > MAX_CORRELATIVO) {
    throw new Error(`Correlativo fuera de rango: ${correlativo}`);
  }
  return `${prefijo}-${anio}-${String(correlativo).padStart(4, '0')}`;
}

/** Clave del contador persistente, p. ej. `LT-2026`. */
export function claveContador(prefijo: PrefijoId, anio: number): string {
  return `${prefijo}-${anio}`;
}

/** Correlativo del ID si pertenece a ese prefijo y año; `null` en otro caso. */
export function correlativoDeId(id: string, prefijo: PrefijoId, anio: number): number | null {
  const m = new RegExp(`^${prefijo}-${anio}-(\\d{4})$`).exec(id);
  return m ? Number(m[1]) : null;
}

/**
 * Siguiente correlativo: el máximo entre el contador persistente y el máximo histórico de los IDs
 * existentes del año, más 1. Así nunca se repite, aunque se borren lotes o se importe un respaldo.
 */
export function siguienteCorrelativo(
  contador: number,
  idsExistentes: readonly string[],
  prefijo: PrefijoId,
  anio: number,
): number {
  const maxExistente = idsExistentes.reduce(
    (max, id) => Math.max(max, correlativoDeId(id, prefijo, anio) ?? 0),
    0,
  );
  const siguiente = Math.max(contador, maxExistente) + 1;
  if (siguiente > MAX_CORRELATIVO) {
    throw new Error(`Se agotaron los correlativos ${prefijo} del año ${anio}`);
  }
  return siguiente;
}

/** Para la búsqueda exacta sin distinguir mayúsculas. */
export function normalizarId(texto: string): string {
  return texto.trim().toUpperCase();
}

export function esIdLote(texto: string): boolean {
  return /^LT-\d{4}-\d{4}$/.test(texto);
}
