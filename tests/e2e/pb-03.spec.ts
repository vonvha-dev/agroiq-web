import { expect, test, type Page } from '@playwright/test';
import { revisarAxe, vigilarConsola } from './utilidades';

/** PB-03 · Registrar un lote con identificador (docs/01 §4). */

const FECHA = '2026-11-10';

async function registrar(page: Page, peso: string, observaciones = '') {
  await page.goto('#/lotes/nuevo');
  await page.getByLabel('Fecha de recepción').fill(FECHA);
  await page.getByLabel('Peso del lote (kg)').fill(peso);
  if (observaciones) await page.getByLabel('Observaciones (opcional)').fill(observaciones);
  await page.getByRole('button', { name: 'Registrar lote' }).click();
  await expect(page).toHaveURL(/#\/lotes$/);
}

/** Espera (con reintentos) a que la tabla muestre exactamente estos IDs, en orden. */
const esperarIds = (page: Page, ids: string[]) =>
  expect(page.getByRole('rowheader')).toHaveText(ids);

test('registrar → aparece primero en la lista → sigue ahí tras recargar', async ({ page }) => {
  const errores = vigilarConsola(page);

  await page.goto('#/lotes');
  await expect(page.getByText('Aún no hay lotes registrados.')).toBeVisible();

  await registrar(page, '250', 'Descarte de la línea 2, turno mañana');
  await expect(page.getByText('Lote LT-2026-0001 registrado.')).toBeVisible();
  const fila = page.getByRole('row', { name: /LT-2026-0001/ });
  await expect(fila).toContainText('10/11/2026');
  await expect(fila).toContainText('Packing de Cañete (demo)');
  await expect(fila).toContainText('250');
  await expect(fila).toContainText('Registrado');

  await registrar(page, '1234,5');
  await esperarIds(page, ['LT-2026-0002', 'LT-2026-0001']);
  await revisarAxe(page);

  await page.reload();
  await esperarIds(page, ['LT-2026-0002', 'LT-2026-0001']);
  await expect(page.getByRole('row', { name: /LT-2026-0002/ })).toContainText('1,234.5');
  expect(errores).toEqual([]);
});

test('no se registra con datos inválidos y los errores se muestran junto al campo', async ({
  page,
}) => {
  await page.goto('#/lotes/nuevo');
  await page.getByLabel('Fecha de recepción').fill('2099-01-01');
  await page.getByLabel('Observaciones (opcional)').fill('x'.repeat(301));
  await page.getByRole('button', { name: 'Registrar lote' }).click();

  await expect(page).toHaveURL(/#\/lotes\/nuevo$/);
  await expect(page.getByLabel('Fecha de recepción')).toHaveAccessibleDescription(
    /posterior a hoy/,
  );
  await expect(page.getByLabel('Peso del lote (kg)')).toHaveAccessibleDescription(
    /Ingresa el peso/,
  );
  await expect(page.getByLabel('Observaciones (opcional)')).toHaveAccessibleDescription(/300/);
  await expect(page.getByLabel('Fecha de recepción')).toBeFocused();
  await revisarAxe(page);

  await page.goto('#/lotes');
  await expect(page.getByText('Aún no hay lotes registrados.')).toBeVisible();
});

test('un texto con <script> en observaciones se muestra como texto literal', async ({ page }) => {
  let dialogo = false;
  page.on('dialog', async (d) => {
    dialogo = true;
    await d.dismiss();
  });
  const texto = '<script>window.__xss=1</script><img src=x onerror="window.__xss=2">';

  await registrar(page, '10', texto);
  await expect(page.getByRole('row', { name: /LT-2026-0001/ })).toContainText(texto);
  expect(
    await page.evaluate(() => (window as unknown as { __xss?: number }).__xss),
  ).toBeUndefined();
  expect(dialogo).toBe(false);
});

test('borrar un lote no libera su ID: el siguiente recibe un número nuevo', async ({ page }) => {
  await registrar(page, '100');
  await registrar(page, '200');

  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Borrar LT-2026-0002' }).click();
  await expect(page.getByText('Lote LT-2026-0002 borrado.')).toBeVisible();
  await esperarIds(page, ['LT-2026-0001']);

  await registrar(page, '300');
  await esperarIds(page, ['LT-2026-0003', 'LT-2026-0001']);
});

test('búsqueda por ID exacta sin distinguir mayúsculas', async ({ page }) => {
  await registrar(page, '100');
  await registrar(page, '200');

  await page.getByLabel('Buscar por ID').fill('lt-2026-0001');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await esperarIds(page, ['LT-2026-0001']);

  await page.getByLabel('Buscar por ID').fill('LT-2026-0404');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByText(/Lote no encontrado/)).toBeVisible();
});

test('en móvil (360 px) el formulario y la lista se usan sin desbordar la página', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await registrar(page, '75');
  await esperarIds(page, ['LT-2026-0001']);
  const anchoPagina = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(anchoPagina).toBeLessThanOrEqual(360);
  await expect(page.getByRole('row', { name: /LT-2026-0001/ })).toBeAttached();
});
