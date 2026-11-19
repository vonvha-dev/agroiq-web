import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Rutas de docs/01 §8 con el título esperado (perfil Packing). */
export const RUTAS_PACKING: { ruta: string; nombre: string; titulo: RegExp }[] = [
  { ruta: '#/lotes', nombre: 'lotes', titulo: /Lotes de descarte/ },
  { ruta: '#/lotes/nuevo', nombre: 'lotes-nuevo', titulo: /Registrar un lote/ },
  { ruta: '#/lotes/LT-2026-0143', nombre: 'ficha', titulo: /Ficha del lote LT-2026-0143/ },
  { ruta: '#/lotes/LT-2026-0143/imagenes', nombre: 'imagenes', titulo: /Cargar imágenes/ },
  {
    ruta: '#/lotes/LT-2026-0143/clasificacion',
    nombre: 'clasificacion',
    titulo: /Clasificación · LT-2026-0143/,
  },
  { ruta: '#/dashboard', nombre: 'dashboard', titulo: /Dashboard de merma/ },
  {
    ruta: '#/lotes/LT-2026-0143/valorizacion',
    nombre: 'valorizacion',
    titulo: /Valorización · LT-2026-0143/,
  },
  {
    ruta: '#/lotes/LT-2026-0143/publicacion',
    nombre: 'publicacion',
    titulo: /Publicación B2B · LT-2026-0143/,
  },
  { ruta: '#/marketplace', nombre: 'marketplace', titulo: /Marketplace/ },
  { ruta: '#/marketplace/OF-2026-0001', nombre: 'oferta', titulo: /Oferta OF-2026-0001/ },
  { ruta: '#/configuracion', nombre: 'configuracion', titulo: /Configuración/ },
  { ruta: '#/acerca', nombre: 'acerca', titulo: /Acerca del prototipo/ },
];

/** Acumula errores de consola y excepciones no capturadas de la página. */
export function vigilarConsola(page: Page): string[] {
  const errores: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errores.push(msg.text());
  });
  page.on('pageerror', (err) => errores.push(err.message));
  return errores;
}

/** 0 violaciones serious o critical de axe (docs/02 §5). */
export async function revisarAxe(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const graves = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(
    graves.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`),
    'violaciones de accesibilidad graves',
  ).toEqual([]);
}
