/** Catálogos del dominio (docs/01 §3). Sin dependencias de UI ni de almacenamiento. */

export const CLASE_IDS = ['dm', 'dp', 'pl', 'cp', 'ox'] as const;
export type ClaseId = (typeof CLASE_IDS)[number];

export const DESTINO_IDS = ['aceite', 'pulpa', 'reclasificacion'] as const;
export type DestinoId = (typeof DESTINO_IDS)[number];

export const ESTADOS_LOTE = [
  'registrado',
  'imagenes_cargadas',
  'clasificado',
  'valorizado',
  'publicado',
] as const;
export type EstadoLote = (typeof ESTADOS_LOTE)[number];

export interface Clase {
  id: ClaseId;
  nombre: string;
  criterio: string;
  destino: DestinoId;
  /** Token CSS del color de la clase. */
  color: `--c${1 | 2 | 3 | 4 | 5}`;
}

export interface Destino {
  id: DestinoId;
  nombre: string;
}

/** En el orden del catálogo: este orden define la clase simulada (D14) y los desempates. */
export const CLASES: readonly Clase[] = [
  {
    id: 'dm',
    nombre: 'Daño mecánico',
    criterio: 'Golpes, cortes o magulladuras por manipuleo',
    destino: 'aceite',
    color: '--c1',
  },
  {
    id: 'dp',
    nombre: 'Daño de piel',
    criterio: 'Manchas, roces o quemaduras de sol sin daño a la pulpa',
    destino: 'aceite',
    color: '--c2',
  },
  {
    id: 'pl',
    nombre: 'Plagas',
    criterio: 'Picaduras, galerías o lesiones por insectos',
    destino: 'pulpa',
    color: '--c3',
  },
  {
    id: 'cp',
    nombre: 'Calibre pequeño',
    criterio: 'Fruta sana por debajo del calibre de exportación',
    destino: 'pulpa',
    color: '--c4',
  },
  {
    id: 'ox',
    nombre: 'Óptima para exportación',
    criterio: 'Sin defectos visibles, dentro del calibre',
    destino: 'reclasificacion',
    color: '--c5',
  },
];

export const DESTINOS: readonly Destino[] = [
  { id: 'aceite', nombre: 'Aceite de palta' },
  { id: 'pulpa', nombre: 'Pulpa y guacamole' },
  { id: 'reclasificacion', nombre: 'Reclasificación a exportación' },
];

export const NOMBRE_ESTADO: Readonly<Record<EstadoLote, string>> = {
  registrado: 'Registrado',
  imagenes_cargadas: 'Imágenes cargadas',
  clasificado: 'Clasificado',
  valorizado: 'Valorizado',
  publicado: 'Publicado',
};

export function getClase(id: ClaseId): Clase {
  const clase = CLASES.find((c) => c.id === id);
  if (!clase) throw new Error(`Clase desconocida: ${id}`);
  return clase;
}

export function getDestino(id: DestinoId): Destino {
  const destino = DESTINOS.find((d) => d.id === id);
  if (!destino) throw new Error(`Destino desconocido: ${id}`);
  return destino;
}

export function clasesDeDestino(id: DestinoId): ClaseId[] {
  return CLASES.filter((c) => c.destino === id).map((c) => c.id);
}
