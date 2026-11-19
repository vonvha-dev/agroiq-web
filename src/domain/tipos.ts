/**
 * Contratos de datos (docs/01 §6). A medida que se agreguen los esquemas Zod (PB-03 en adelante),
 * los tipos de formularios e importaciones se derivan de ellos en `esquemas.ts`.
 */
import type { ClaseId, DestinoId, EstadoLote } from './catalogos';

export type { ClaseId, DestinoId, EstadoLote };

export type OrigenClasificacion = 'etiqueta_manual' | 'simulada' | 'modelo';
export type MimeImagen = 'image/jpeg' | 'image/png' | 'image/webp';

export interface Lote {
  id: string;
  packing: string;
  fechaRecepcion: string;
  variedad: 'Hass';
  pesoKg: number;
  observaciones?: string;
  responsable: string;
  estado: EstadoLote;
  creadoEn: string;
}

/** Tal como se guarda: ArrayBuffer + mime (D13). */
export interface ImagenFruta {
  id: string;
  codigo: string;
  loteId: string;
  nombreArchivo: string;
  hash: string;
  datos: ArrayBuffer;
  mime: MimeImagen;
  ancho: number;
  alto: number;
  cargadaEn: string;
}

/** Tal como la recibe la UI: con Blob listo para `URL.createObjectURL`. */
export type ImagenFrutaVista = Omit<ImagenFruta, 'datos' | 'mime'> & { blob: Blob };

export interface Clasificacion {
  imagenId: string;
  loteId: string;
  clase: ClaseId;
  origen: OrigenClasificacion;
  /** Solo si origen === 'modelo'. */
  confianza?: number;
  etiquetador?: string;
  version: string;
  clasificadaEn: string;
}

export type TipoEvento =
  | 'registrado'
  | 'imagenes_cargadas'
  | 'clasificado'
  | 'reclasificado'
  | 'valorizado'
  | 'publicado'
  | 'interes_recibido';

export interface EventoLote {
  id: string;
  loteId: string;
  tipo: TipoEvento;
  fecha: string;
  detalle: string;
}

export interface FraccionValorizada {
  destino: DestinoId;
  clases: ClaseId[];
  kg: number;
  precioKgCent: number;
  valorCent: number;
}

export interface Valorizacion {
  loteId: string;
  fracciones: FraccionValorizada[];
  totalCent: number;
  preciosVersion: string;
  calculadaEn: string;
}

export interface OfertaB2B {
  id: string;
  loteId: string;
  destino: DestinoId;
  kg: number;
  precioKgCent: number;
  fechaRetiro: string;
  tipoComprador: string;
  montoCent: number;
  comisionCent: number;
  netoCent: number;
  estado: 'publicada' | 'retirada';
  publicadaEn: string;
}

export interface InteresComprador {
  id: string;
  ofertaId: string;
  comprador: string;
  mensaje?: string;
  fecha: string;
}
