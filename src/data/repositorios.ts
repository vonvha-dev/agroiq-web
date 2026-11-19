/**
 * Repositorios: la única puerta de la UI y los servicios hacia los datos (CLAUDE.md, regla 5).
 * Hoy se implementan con Dexie; después de la feria, con una API (PB-16) sin tocar la UI.
 * Llamados dentro de `db.transaction(...)`, participan de esa transacción (zona de Dexie).
 */
import type {
  Clasificacion,
  EventoLote,
  ImagenFruta,
  ImagenFrutaVista,
  InteresComprador,
  Lote,
  OfertaB2B,
  Valorizacion,
} from '../domain/tipos';
import type { AgroIQDB } from './db';

export interface LoteRepository {
  /** Más reciente primero. */
  listar(): Promise<Lote[]>;
  obtener(id: string): Promise<Lote | undefined>;
  guardar(lote: Lote): Promise<void>;
  borrar(id: string): Promise<void>;
}

export interface ImagenRepository {
  listarPorLote(loteId: string): Promise<ImagenFrutaVista[]>;
  contarPorLote(loteId: string): Promise<number>;
  guardar(imagen: ImagenFruta): Promise<void>;
}

export interface ClasificacionRepository {
  listarPorLote(loteId: string): Promise<Clasificacion[]>;
  guardarVarias(clasificaciones: Clasificacion[]): Promise<void>;
}

export interface EventoRepository {
  /** En orden cronológico. */
  listarPorLote(loteId: string): Promise<EventoLote[]>;
  agregar(evento: EventoLote): Promise<void>;
}

export interface ValorizacionRepository {
  obtener(loteId: string): Promise<Valorizacion | undefined>;
  guardar(valorizacion: Valorizacion): Promise<void>;
  borrar(loteId: string): Promise<void>;
}

export interface OfertaRepository {
  listarPublicadas(): Promise<OfertaB2B[]>;
  listarPorLote(loteId: string): Promise<OfertaB2B[]>;
  obtener(id: string): Promise<OfertaB2B | undefined>;
  guardar(oferta: OfertaB2B): Promise<void>;
}

export interface InteresRepository {
  listarPorOferta(ofertaId: string): Promise<InteresComprador[]>;
  agregar(interes: InteresComprador): Promise<void>;
}

export interface ContadorRepository {
  /** Incrementa y devuelve el siguiente correlativo de la clave (1, 2, 3…). Nunca reutiliza. */
  siguiente(clave: string): Promise<number>;
}

export interface Repositorios {
  lotes: LoteRepository;
  imagenes: ImagenRepository;
  clasificaciones: ClasificacionRepository;
  eventos: EventoRepository;
  valorizaciones: ValorizacionRepository;
  ofertas: OfertaRepository;
  intereses: InteresRepository;
  contadores: ContadorRepository;
}

export function crearRepositoriosDexie(db: AgroIQDB): Repositorios {
  return {
    lotes: {
      listar: () => db.lotes.orderBy('creadoEn').reverse().toArray(),
      obtener: (id) => db.lotes.get(id),
      guardar: async (lote) => void (await db.lotes.put(lote)),
      borrar: (id) => db.lotes.delete(id),
    },
    imagenes: {
      listarPorLote: async (loteId) => {
        const filas = await db.imagenes.where('loteId').equals(loteId).sortBy('codigo');
        return filas.map(({ datos, mime, ...resto }) => ({
          ...resto,
          blob: new Blob([datos], { type: mime }),
        }));
      },
      contarPorLote: (loteId) => db.imagenes.where('loteId').equals(loteId).count(),
      guardar: async (imagen) => void (await db.imagenes.put(imagen)),
    },
    clasificaciones: {
      listarPorLote: (loteId) => db.clasificaciones.where('loteId').equals(loteId).toArray(),
      guardarVarias: async (clasificaciones) =>
        void (await db.clasificaciones.bulkPut(clasificaciones)),
    },
    eventos: {
      listarPorLote: (loteId) => db.eventos.where('loteId').equals(loteId).sortBy('fecha'),
      agregar: async (evento) => void (await db.eventos.add(evento)),
    },
    valorizaciones: {
      obtener: (loteId) => db.valorizaciones.get(loteId),
      guardar: async (valorizacion) => void (await db.valorizaciones.put(valorizacion)),
      borrar: (loteId) => db.valorizaciones.delete(loteId),
    },
    ofertas: {
      listarPublicadas: () => db.ofertas.where('estado').equals('publicada').toArray(),
      listarPorLote: (loteId) => db.ofertas.where('loteId').equals(loteId).toArray(),
      obtener: (id) => db.ofertas.get(id),
      guardar: async (oferta) => void (await db.ofertas.put(oferta)),
    },
    intereses: {
      listarPorOferta: (ofertaId) => db.intereses.where('ofertaId').equals(ofertaId).toArray(),
      agregar: async (interes) => void (await db.intereses.add(interes)),
    },
    contadores: {
      siguiente: (clave) =>
        db.transaction('rw', db.contadores, async () => {
          const actual = (await db.contadores.get(clave))?.valor ?? 0;
          const valor = actual + 1;
          await db.contadores.put({ clave, valor });
          return valor;
        }),
    },
  };
}
