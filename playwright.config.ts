import { defineConfig, devices } from '@playwright/test';

/**
 * Proyectos:
 * - chromium: e2e del flujo contra el build servido por `npm run demo:local` (también en CI).
 * - evidencias: capturas 1440×900 de cada ruta (`npm run evidencias`, variable SPRINT).
 * - file-chrome / file-edge: dist-single abierto por file:// en los navegadores instalados (D12).
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    trace: 'retain-on-failure',
    // La animación de entrada (250 ms de opacidad) falsea el contraste que mide axe.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: ['**/evidencias.spec.ts', '**/offline-file.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'evidencias',
      testMatch: '**/evidencias.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'file-chrome',
      testMatch: '**/offline-file.spec.ts',
      use: { channel: 'chrome' },
    },
    {
      name: 'file-edge',
      testMatch: '**/offline-file.spec.ts',
      use: { channel: 'msedge' },
    },
  ],
  webServer: {
    command: 'npm run demo:local',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
