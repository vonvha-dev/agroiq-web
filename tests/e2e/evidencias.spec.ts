import { expect, test, type Page } from '@playwright/test';
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

async function registrar(page: Page, peso: string, observaciones: string) {
  await page.goto('#/lotes/nuevo');
  await page.getByLabel('Fecha de recepción').fill('2026-11-10');
  await page.getByLabel('Peso del lote (kg)').fill(peso);
  await page.getByLabel('Observaciones (opcional)').fill(observaciones);
  await page.getByRole('button', { name: 'Registrar lote' }).click();
  await expect(page).toHaveURL(/#\/lotes$/);
}

test.describe('PB-03 con datos', () => {
  const ruta = (archivo: string) => `evidencias/sprint-${sprint}/${archivo}`;

  test('lista con lotes registrados y búsqueda', async ({ page }) => {
    await registrar(page, '240', 'Descarte de la línea 1, turno tarde');
    await registrar(page, '250', 'Descarte de la línea 2, turno mañana');
    await expect(page.getByRole('rowheader')).toHaveCount(2);
    await page.screenshot({ path: ruta('13-pb03-lista-con-lotes.png'), fullPage: true });

    await page.getByLabel('Buscar por ID').fill('lt-2026-0001');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(page.getByRole('rowheader')).toHaveText(['LT-2026-0001']);
    await page.screenshot({ path: ruta('14-pb03-busqueda.png'), fullPage: true });
  });

  test('formulario con errores de validación', async ({ page }) => {
    await page.goto('#/lotes/nuevo');
    await page.getByLabel('Fecha de recepción').fill('2099-01-01');
    await page.getByLabel('Peso del lote (kg)').fill('0');
    await page.getByRole('button', { name: 'Registrar lote' }).click();
    await expect(page.getByText('El peso debe ser mayor que 0')).toBeVisible();
    await page.screenshot({ path: ruta('15-pb03-errores.png'), fullPage: true });
  });

  test('lista en móvil (390 px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await registrar(page, '250', 'Descarte de la línea 2');
    await expect(page.getByRole('rowheader')).toHaveText(['LT-2026-0001']);
    await page.screenshot({ path: ruta('16-pb03-movil.png'), fullPage: true });
  });
});
