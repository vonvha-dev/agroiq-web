/** Esquemas Zod de los bordes de entrada (docs/02 §1). Los catálogos se inyectan: `domain` no importa `config`. */
import { z } from 'zod';
import { esFechaIsoValida } from './fechas';

export interface CatalogosLoteForm {
  packings: readonly [string, ...string[]];
  responsables: readonly [string, ...string[]];
  /** Fecha de hoy `aaaa-mm-dd` (Lima): la recepción no puede ser posterior. */
  hoy: string;
}

const PESO_MAX_KG = 50_000;

export function crearEsquemaLoteForm({ packings, responsables, hoy }: CatalogosLoteForm) {
  return z.object({
    packing: z.enum(packings, { error: 'Elige un packing de la lista' }),
    fechaRecepcion: z
      .string()
      .min(1, 'Ingresa la fecha de recepción')
      .refine(esFechaIsoValida, 'Ingresa una fecha válida')
      .refine((f) => f <= hoy, 'La fecha no puede ser posterior a hoy'),
    variedad: z.literal('Hass', { error: 'La variedad debe ser Hass' }),
    pesoKg: z
      .string()
      .trim()
      .min(1, 'Ingresa el peso del lote en kg')
      .refine(
        (s) => /^-?\d+([.,]\d+)?$/.test(s),
        'Ingresa el peso como un número, p. ej. 250 o 250.5',
      )
      .refine((s) => /^-?\d+([.,]\d{1,2})?$/.test(s), 'Usa como máximo 2 decimales')
      .transform((s) => Number(s.replace(',', '.')))
      .pipe(
        z
          .number()
          .positive('El peso debe ser mayor que 0')
          .max(PESO_MAX_KG, 'El peso no puede superar 50 000 kg'),
      ),
    observaciones: z
      .string()
      .trim()
      .max(300, 'Las observaciones no pueden superar 300 caracteres')
      .optional()
      .transform((s) => (s ? s : undefined)),
    responsable: z.enum(responsables, { error: 'Elige un responsable de la lista' }),
  });
}

export type EsquemaLoteForm = ReturnType<typeof crearEsquemaLoteForm>;
/** Lo que llega del formulario (todo texto). */
export type LoteFormEntrada = z.input<EsquemaLoteForm>;
/** Datos validados y normalizados. */
export type LoteFormDatos = z.output<EsquemaLoteForm>;

/** Primer mensaje de error de cada campo, para mostrarlo junto al campo. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? '');
    if (campo && !(campo in errores)) errores[campo] = issue.message;
  }
  return errores;
}
