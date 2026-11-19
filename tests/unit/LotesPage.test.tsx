import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { repositorios } from '../../src/data/app';
import { db } from '../../src/data/db';
import type { Lote } from '../../src/domain/tipos';
import LotesPage from '../../src/ui/pages/LotesPage';

const lote = (id: string, cambios: Partial<Lote> = {}): Lote => ({
  id,
  packing: 'Packing de Cañete (demo)',
  fechaRecepcion: '2026-11-08',
  variedad: 'Hass',
  pesoKg: 1234.5,
  responsable: 'Supervisor de calidad (demo)',
  estado: 'registrado',
  creadoEn: `2026-11-18T10:00:0${id.slice(-1)}Z`,
  ...cambios,
});

function renderizar() {
  return render(
    <MemoryRouter>
      <LotesPage />
    </MemoryRouter>,
  );
}

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('Lista de lotes (PB-03)', () => {
  it('sin lotes muestra el estado vacío con enlace al registro', async () => {
    renderizar();
    expect(await screen.findByText('Aún no hay lotes registrados.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Registra el primer lote' })).toHaveAttribute(
      'href',
      '/lotes/nuevo',
    );
  });

  it('lista los lotes, el más reciente primero, con formato es-PE', async () => {
    await repositorios.lotes.guardar(lote('LT-2026-0001'));
    await repositorios.lotes.guardar(lote('LT-2026-0002', { estado: 'clasificado' }));
    renderizar();

    const filas = await screen.findAllByRole('row');
    expect(within(filas[1]!).getByRole('rowheader')).toHaveTextContent('LT-2026-0002');
    expect(within(filas[2]!).getByRole('rowheader')).toHaveTextContent('LT-2026-0001');
    expect(filas[2]).toHaveTextContent('08/11/2026');
    expect(filas[2]).toHaveTextContent('1,234.5');
    expect(filas[2]).toHaveTextContent('Registrado');
    // Solo se puede borrar antes de clasificar.
    expect(screen.getByRole('button', { name: 'Borrar LT-2026-0001' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Borrar LT-2026-0002' })).toBeNull();
  });

  it('muestra un texto con <script> como texto literal', async () => {
    const texto = '<script>alert(1)</script>';
    await repositorios.lotes.guardar(lote('LT-2026-0001', { observaciones: texto }));
    const { container } = renderizar();
    expect(await screen.findByText(texto)).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
  });

  it('busca por ID exacto sin distinguir mayúsculas', async () => {
    await repositorios.lotes.guardar(lote('LT-2026-0001'));
    await repositorios.lotes.guardar(lote('LT-2026-0002'));
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('LT-2026-0002');

    await usuario.type(screen.getByLabelText('Buscar por ID'), ' lt-2026-0001 ');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getAllByRole('rowheader').map((c) => c.textContent)).toEqual(['LT-2026-0001']);

    await usuario.clear(screen.getByLabelText('Buscar por ID'));
    await usuario.type(screen.getByLabelText('Buscar por ID'), 'LT-2026-0999');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByText(/Lote no encontrado/)).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Mostrar todos los lotes' }));
    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
  });

  it('pide un ID completo si el texto no tiene el formato', async () => {
    await repositorios.lotes.guardar(lote('LT-2026-0001'));
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('LT-2026-0001');
    await usuario.type(screen.getByLabelText('Buscar por ID'), '0001');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByLabelText('Buscar por ID')).toHaveAccessibleDescription(/ID completo/);
  });
});
