import { expect, test } from '@playwright/test';
import { RUTAS_PACKING } from './utilidades';

/**
 * `npm run evidencias` (con SPRINT=02, 03…): capturas 1440×900 de cada ruta, en claro y oscuro,
 * en evidencias/sprint-0X/NN-<ruta>[-oscuro].png. El modo demo se cargará aquí cuando exista (PB-11).
 */
const sprint = (process.env.SPRINT ?? 'xx').padStart(2, '0');

for (const esquema of ['light', 'dark'] as const) {
  test.describe(`capturas ${esquema}`, () => {
    test.use({ colorScheme: esquema });

    RUTAS_PACKING.forEach(({ ruta, nombre, titulo }, i) => {
      test(`${ruta}`, async ({ page }) => {
        await page.goto(ruta);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo);
        const sufijo = esquema === 'dark' ? '-oscuro' : '';
        const archivo = `${String(i + 1).padStart(2, '0')}-${nombre}${sufijo}.png`;
        await page.screenshot({ path: `evidencias/sprint-${sprint}/${archivo}`, fullPage: true });
      });
    });
  });
}
