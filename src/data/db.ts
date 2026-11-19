import Dexie, { type EntityTable } from 'dexie';
import type {
  Clasificacion,
  EventoLote,
  ImagenFruta,
  InteresComprador,
  Lote,
  OfertaB2B,
  Valorizacion,
} from '../domain/tipos';

/** Contador persistente de correlativos (clave p. ej. `LT-2026`). Nunca retrocede. */
export interface Contador {
  clave: string;
  valor: number;
}

export type AgroIQDB = Dexie & {
  lotes: EntityTable<Lote, 'id'>;
  imagenes: EntityTable<ImagenFruta, 'id'>;
  clasificaciones: EntityTable<Clasificacion, 'imagenId'>;
  eventos: EntityTable<EventoLote, 'id'>;
  valorizaciones: EntityTable<Valorizacion, 'loteId'>;
  ofertas: EntityTable<OfertaB2B, 'id'>;
  intereses: EntityTable<InteresComprador, 'id'>;
  contadores: EntityTable<Contador, 'clave'>;
};

export const NOMBRE_DB = 'agroiq';

export function crearDB(nombre: string = NOMBRE_DB): AgroIQDB {
  const db = new Dexie(nombre) as AgroIQDB;
  db.version(1).stores({
    lotes: 'id, estado, fechaRecepcion, packing, creadoEn',
    imagenes: 'id, loteId, hash',
    clasificaciones: 'imagenId, loteId',
    eventos: 'id, loteId, fecha',
    valorizaciones: 'loteId',
    ofertas: 'id, loteId, destino, estado, [loteId+destino]',
    intereses: 'id, ofertaId, fecha',
    contadores: 'clave',
  });
  return db;
}

/** Instancia de la aplicación. Las pruebas crean la suya con `crearDB(nombreÚnico)`. */
export const db = crearDB();
