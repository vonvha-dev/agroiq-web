import { motivoNoPuede } from '../domain/estados';
import { contextoApp, type ContextoServicio } from './contexto';

/**
 * Borra un lote en estado registrado o imagenes_cargadas, con sus imágenes y eventos (docs/01 §5, D6).
 * El contador del año no retrocede: el ID no se vuelve a usar.
 */
export async function borrarLote(id: string, ctx: ContextoServicio = contextoApp): Promise<void> {
  const { db, repos } = ctx;
  await db.transaction('rw', [db.lotes, db.imagenes, db.clasificaciones, db.eventos], async () => {
    const lote = await repos.lotes.obtener(id);
    if (!lote) throw new Error(`Lote no encontrado: ${id}`);
    const motivo = motivoNoPuede(lote, 'borrar');
    if (motivo) throw new Error(motivo);

    await repos.imagenes.borrarPorLote(id);
    await repos.clasificaciones.borrarPorLote(id);
    await repos.eventos.borrarPorLote(id);
    await repos.lotes.borrar(id);
  });
}
