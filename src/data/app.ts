/** Instancias de la aplicación: lo que importan la UI y los servicios. */
import { db } from './db';
import { crearRepositoriosDexie } from './repositorios';

export const repositorios = crearRepositoriosDexie(db);
