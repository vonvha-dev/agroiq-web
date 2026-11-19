import { repositorios } from '../data/app';
import { db, type AgroIQDB } from '../data/db';
import type { Repositorios } from '../data/repositorios';

/** Dependencias de los casos de uso; las pruebas inyectan una base propia y un reloj fijo. */
export interface ContextoServicio {
  db: AgroIQDB;
  repos: Repositorios;
  ahora: () => Date;
  nuevoId: () => string;
}

export const contextoApp: ContextoServicio = {
  db,
  repos: repositorios,
  ahora: () => new Date(),
  nuevoId: () => crypto.randomUUID(),
};
