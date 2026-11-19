import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Modos de build:
 * - production (npm run build): GitHub Pages, base /agroiq-web/.
 * - single (npm run build:single): un solo index.html en dist-single/, se abre con doble clic.
 * - demo (npm run demo:local): plan B offline servido en http://localhost:4173.
 * VITE_BASE sobrescribe la base en cualquier modo (D2).
 */
export default defineConfig(({ command, mode }) => {
  const single = mode === 'single';
  const baseDefecto = command === 'build' && mode === 'production' ? '/agroiq-web/' : './';

  return {
    base: process.env.VITE_BASE ?? baseDefecto,
    plugins: [react(), csp(single), ...(single ? [viteSingleFile()] : [])],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      emptyOutDir: true,
    },
    preview: { port: 4173, strictPort: true },
  };
});

/** CSP solo en build (en dev rompería el HMR). El build de archivo único necesita script inline (D11). */
function csp(single: boolean): Plugin {
  const directivas = [
    "default-src 'self'",
    "img-src 'self' blob: data:",
    "style-src 'self' 'unsafe-inline'",
  ];
  if (single) {
    directivas.push("script-src 'self' 'unsafe-inline'", "font-src 'self' data:");
  }
  return {
    name: 'agroiq-csp',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: directivas.join('; ') },
        injectTo: 'head',
      },
    ],
  };
}
