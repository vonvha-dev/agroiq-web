import { anioDeFecha } from '../domain/fechas';
import { claveContador, formatearId, siguienteCorrelativo } from '../domain/ids';
import { crearLote, eventoRegistrado, type DatosNuevoLote } from '../domain/lote';
import type { Lote } from '../domain/tipos';
import { contextoApp, type ContextoServicio } from './contexto';

/**
 * PB-03: en una sola transacción incrementa el contador del año, guarda el lote y registra el
 * evento "Lote registrado". Si algo falla, no queda nada a medias (docs/02 §3).
 */
export async function registrarLote(
  datos: DatosNuevoLote,
  ctx: ContextoServicio = contextoApp,
): Promise<Lote> {
  const { db, repos } = ctx;
  const anio = anioDeFecha(datos.fechaRecepcion);
  const clave = claveContador('LT', anio);

  return db.transaction('rw', [db.lotes, db.eventos, db.contadores], async () => {
    const contador = await repos.contadores.leer(clave);
    const existentes = await repos.lotes.listarIds(`LT-${anio}-`);
    const correlativo = siguienteCorrelativo(contador, existentes, 'LT', anio);

    const lote = crearLote(datos, formatearId('LT', anio, correlativo), ctx.ahora().toISOString());
    await repos.contadores.guardar(clave, correlativo);
    await repos.lotes.agregar(lote);
    await repos.eventos.agregar(eventoRegistrado(lote, ctx.nuevoId()));
    return lote;
  });
}
