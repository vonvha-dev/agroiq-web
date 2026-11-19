import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hoyLima } from '../../src/domain/fechas';
import NuevoLotePage from '../../src/ui/pages/NuevoLotePage';

const registrarLote = vi.hoisted(() => vi.fn());
vi.mock('../../src/services/registrarLote', () => ({ registrarLote }));

function Destino() {
  const estado = useLocation().state as { registrado?: string } | null;
  return <p>Lista · {estado?.registrado}</p>;
}

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/lotes/nuevo']}>
      <Routes>
        <Route path="/lotes/nuevo" element={<NuevoLotePage />} />
        <Route path="/lotes" element={<Destino />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  registrarLote.mockReset();
});

describe('Formulario de registro de lote (PB-03)', () => {
  it('tiene una etiqueta visible para cada campo y valores por defecto', () => {
    renderizar();
    expect(screen.getByLabelText('Packing')).toHaveValue('Packing de Cañete (demo)');
    expect(screen.getByLabelText('Fecha de recepción')).toHaveValue(hoyLima());
    expect(screen.getByLabelText('Variedad')).toHaveValue('Hass');
    expect(screen.getByLabelText('Peso del lote (kg)')).toHaveValue('');
    expect(screen.getByLabelText('Responsable')).toHaveValue('Supervisor de calidad (demo)');
    expect(screen.getByLabelText('Observaciones (opcional)')).toHaveValue('');
  });

  it('no envía datos inválidos: muestra el error junto al campo y lo enfoca', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await usuario.click(screen.getByRole('button', { name: 'Registrar lote' }));

    const peso = screen.getByLabelText('Peso del lote (kg)');
    expect(peso).toHaveAttribute('aria-invalid', 'true');
    expect(peso).toHaveAccessibleDescription(/Ingresa el peso del lote en kg/);
    expect(peso).toHaveFocus();
    expect(registrarLote).not.toHaveBeenCalled();

    await usuario.type(peso, '0');
    await usuario.click(screen.getByRole('button', { name: 'Registrar lote' }));
    expect(peso).toHaveAccessibleDescription(/mayor que 0/);
    expect(registrarLote).not.toHaveBeenCalled();
  });

  it('registra con datos válidos y vuelve a la lista con el ID', async () => {
    registrarLote.mockResolvedValue({ id: 'LT-2026-0007' });
    const usuario = userEvent.setup();
    renderizar();

    await usuario.selectOptions(screen.getByLabelText('Packing'), 'Packing de Huaral (demo)');
    await usuario.type(screen.getByLabelText('Peso del lote (kg)'), '250,5');
    await usuario.type(screen.getByLabelText('Observaciones (opcional)'), 'Línea 2');
    await usuario.click(screen.getByRole('button', { name: 'Registrar lote' }));

    expect(registrarLote).toHaveBeenCalledWith({
      packing: 'Packing de Huaral (demo)',
      fechaRecepcion: hoyLima(),
      variedad: 'Hass',
      pesoKg: 250.5,
      observaciones: 'Línea 2',
      responsable: 'Supervisor de calidad (demo)',
    });
    expect(await screen.findByText('Lista · LT-2026-0007')).toBeInTheDocument();
  });

  it('muestra el error del servicio y permite reintentar', async () => {
    registrarLote.mockImplementation(async () => {
      throw new Error('Se agotaron los correlativos LT del año 2026');
    });
    const usuario = userEvent.setup();
    renderizar();
    await usuario.type(screen.getByLabelText('Peso del lote (kg)'), '10');
    await usuario.click(screen.getByRole('button', { name: 'Registrar lote' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/agotaron/);
    expect(screen.getByRole('button', { name: 'Registrar lote' })).toBeEnabled();
  });
});
