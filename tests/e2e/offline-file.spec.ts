import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';
import { vigilarConsola } from './utilidades';

/**
 * D12: dist-single/index.html abierto por file:// (equivale al doble clic) en Chrome y Edge.
 * Verifica IndexedDB, crypto.subtle e imágenes desde Blob bajo la CSP del build de archivo único.
 * Ejecutar con `npm run test:file` (genera dist-single antes).
 */
const archivo = resolve('dist-single/index.html');

test.skip(!existsSync(archivo), 'Falta dist-single: ejecuta npm run build:single');

test('dist-single funciona por file:// sin servidor', async ({ page }) => {
  const errores = vigilarConsola(page);
  await page.goto(pathToFileURL(archivo).href);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lotes de descarte');

  const resultado = await page.evaluate(async () => {
    // IndexedDB: abrir, escribir y leer.
    const idb = await new Promise<string>((ok, mal) => {
      const req = indexedDB.open('agroiq-prueba-file', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('t');
      req.onerror = () => mal(req.error);
      req.onsuccess = () => {
        const tx = req.result.transaction('t', 'readwrite');
        tx.objectStore('t').put(new Uint8Array([1, 2, 3]).buffer, 'k');
        tx.oncomplete = () => {
          const get = req.result.transaction('t').objectStore('t').get('k');
          get.onsuccess = () => ok(String(new Uint8Array(get.result as ArrayBuffer).length));
        };
      };
    });

    // crypto.subtle: SHA-256 de "abc".
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('abc'));
    const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');

    // Imagen desde Blob (img-src blob:).
    const lienzo = document.createElement('canvas');
    lienzo.width = 4;
    lienzo.height = 3;
    lienzo.getContext('2d')!.fillRect(0, 0, 4, 3);
    const blob = await new Promise<Blob>((ok) => lienzo.toBlob((b) => ok(b!), 'image/png'));
    const url = URL.createObjectURL(blob);
    const ancho = await new Promise<number>((ok, mal) => {
      const img = document.createElement('img');
      img.onload = () => ok(img.naturalWidth);
      img.onerror = () => mal(new Error('La imagen Blob no cargó'));
      img.alt = '';
      img.src = url;
      document.body.append(img);
    });
    URL.revokeObjectURL(url);

    return { seguro: isSecureContext, idb, hash, ancho };
  });

  expect(resultado).toEqual({
    seguro: true,
    idb: '3',
    hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    ancho: 4,
  });

  // La navegación por hash y el selector de perfil funcionan sin servidor.
  await page.getByRole('link', { name: 'Acerca', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Acerca del prototipo');
  expect(errores).toEqual([]);
});
