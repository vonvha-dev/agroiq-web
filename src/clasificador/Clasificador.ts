import type { ClaseId, Clasificacion } from '../domain/tipos';

/** Datos mínimos de una imagen para clasificarla. */
export interface EntradaClasificacion {
  imagenId: string;
  loteId: string;
  nombreArchivo: string;
  /** SHA-256 del archivo original, en hexadecimal. */
  hash: string;
}

/** Fila válida de la hoja de etiquetas CSV. */
export interface EtiquetaManual {
  archivo: string;
  clase: ClaseId;
  etiquetador: string;
  fecha: string;
}

/**
 * Hoy: etiqueta manual o simulación determinista (ClasificadorMuestra, PB-04).
 * Después de la feria: un modelo (Jetson/API, PB-14) con la misma interfaz.
 */
export interface Clasificador {
  clasificar(
    imagen: EntradaClasificacion,
    etiquetas?: ReadonlyMap<string, EtiquetaManual>,
  ): Promise<Clasificacion>;
}
