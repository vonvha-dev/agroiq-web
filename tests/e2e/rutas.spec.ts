import { expect, test } from '@playwright/test';
import { RUTAS_PACKING, revisarAxe, vigilarConsola } from './utilidades';

for (const esquema of ['light', 'dark'] as const) {
  test.describe(`rutas (tema ${esquema === 'light' ? 'claro' : 'oscuro'})`, () => {
    test.use({ colorScheme: esquema });

    for (const { ruta, titulo } of RUTAS_PACKING) {
      test(`${ruta} carga sin errores y sin violaciones graves de axe`, async ({ page }) => {
        const errores = vigilarConsola(page);
        await page.goto(ruta);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo);
        await revisarAxe(page);
        expect(errores).toEqual([]);
      });
    }
  });
}

test('la raíz redirige a Lotes', async ({ page }) => {
  await page.goto('');
  await expect(page).toHaveURL(/#\/lotes$/);
});

test('una ruta inexistente muestra "Página no encontrada"', async ({ page }) => {
  const errores = vigilarConsola(page);
  await page.goto('#/no-existe');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página no encontrada');
  await expect(page.getByRole('link', { name: 'Ir a Lotes de descarte' })).toBeVisible();
  expect(errores).toEqual([]);
});

test('la barra de pasos conserva el lote en contexto en el Dashboard (D8)', async ({ page }) => {
  await page.goto('#/lotes');
  const pasos = page.getByRole('navigation', { name: 'Flujo del lote' });
  await expect(pasos.locator('[aria-disabled="true"]')).toHaveCount(3);

  await page.goto('#/lotes/LT-2026-0143/clasificacion');
  await expect(pasos.getByRole('link', { name: /Clasificación/ })).toHaveAttribute(
    'aria-current',
    'step',
  );

  await pasos.getByRole('link', { name: /Dashboard/ }).click();
  await expect(page).toHaveURL(/#\/dashboard$/);
  await expect(pasos.getByRole('link', { name: /Dashboard/ })).toHaveAttribute(
    'aria-current',
    'step',
  );
  await expect(pasos.getByRole('link', { name: /Valorización/ })).toHaveAttribute(
    'href',
    '#/lotes/LT-2026-0143/valorizacion',
  );
  await page.getByRole('link', { name: 'Volver al lote LT-2026-0143' }).click();
  await expect(page).toHaveURL(/#\/lotes\/LT-2026-0143$/);
});

test('el perfil Comprador oculta la barra de pasos y solo ve Marketplace y Acerca (D10)', async ({
  page,
}) => {
  const errores = vigilarConsola(page);
  await page.goto('#/lotes');
  await page.getByLabel('Perfil').selectOption('comprador');

  await expect(page).toHaveURL(/#\/marketplace$/);
  await expect(page.getByRole('navigation', { name: 'Flujo del lote' })).toHaveCount(0);
  await expect(page.getByLabel('Empresa')).toHaveValue('Procesadora de aceite (demo)');
  const principal = page.getByRole('navigation', { name: 'Principal' });
  await expect(principal.getByRole('link')).toHaveText(['Marketplace', 'Acerca']);

  await page.goto('#/lotes/nuevo');
  await expect(page).toHaveURL(/#\/marketplace$/);

  // El perfil se recuerda al recargar.
  await page.reload();
  await expect(page.getByLabel('Perfil')).toHaveValue('comprador');

  await page.getByLabel('Perfil').selectOption('packing');
  await expect(page).toHaveURL(/#\/lotes$/);
  await expect(page.getByRole('navigation', { name: 'Flujo del lote' })).toBeVisible();
  expect(errores).toEqual([]);
});
