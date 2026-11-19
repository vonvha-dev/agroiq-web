import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PACKINGS, RESPONSABLES, RESPONSABLE_POR_DEFECTO } from '../../config/packings';
import { crearEsquemaLoteForm, erroresPorCampo, type LoteFormEntrada } from '../../domain/esquemas';
import { hoyLima } from '../../domain/fechas';
import { registrarLote } from '../../services/registrarLote';
import { Campo } from '../components/Campo';
import { useTitulo } from '../useTitulo';

type Errores = Partial<Record<keyof LoteFormEntrada, string>>;

const ORDEN_CAMPOS: (keyof LoteFormEntrada)[] = [
  'packing',
  'fechaRecepcion',
  'variedad',
  'pesoKg',
  'responsable',
  'observaciones',
];

const MAX_OBSERVACIONES = 300;

export default function NuevoLotePage() {
  useTitulo('Registrar un lote');
  const navegar = useNavigate();
  const hoy = hoyLima();
  const esquema = useMemo(
    () => crearEsquemaLoteForm({ packings: PACKINGS, responsables: RESPONSABLES, hoy }),
    [hoy],
  );
  const formulario = useRef<HTMLFormElement>(null);

  const [valores, setValores] = useState<LoteFormEntrada>({
    packing: PACKINGS[0],
    fechaRecepcion: hoy,
    variedad: 'Hass',
    pesoKg: '',
    observaciones: '',
    responsable: RESPONSABLE_POR_DEFECTO,
  });
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  function cambiar<K extends keyof LoteFormEntrada>(campo: K, valor: LoteFormEntrada[K]) {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral(null);
    const resultado = esquema.safeParse(valores);
    if (!resultado.success) {
      const nuevos = erroresPorCampo(resultado.error) as Errores;
      setErrores(nuevos);
      const primero = ORDEN_CAMPOS.find((c) => nuevos[c]);
      if (primero) formulario.current?.querySelector<HTMLElement>(`#lote-${primero}`)?.focus();
      return;
    }
    setGuardando(true);
    try {
      const lote = await registrarLote(resultado.data);
      navegar('/lotes', { state: { registrado: lote.id } });
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : 'No se pudo registrar el lote');
      setGuardando(false);
    }
  }

  const observaciones = valores.observaciones ?? '';

  return (
    <div className="view">
      <div className="head">
        <h1>Registrar un lote</h1>
        <p>
          Registra un lote del área de descarte. Recibirá un ID único LT-AAAA-NNNN según el año de
          recepción.
        </p>
      </div>
      <section className="panel" aria-labelledby="titulo-form">
        <h2 id="titulo-form">Datos del lote</h2>
        <form ref={formulario} className="formulario" onSubmit={enviar} noValidate>
          <Campo id="lote-packing" etiqueta="Packing" error={errores.packing}>
            {(aria) => (
              <select
                {...aria}
                value={valores.packing}
                onChange={(e) => cambiar('packing', e.target.value)}
              >
                {PACKINGS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            )}
          </Campo>
          <Campo
            id="lote-fechaRecepcion"
            etiqueta="Fecha de recepción"
            error={errores.fechaRecepcion}
            ayuda="No puede ser posterior a hoy."
          >
            {(aria) => (
              <input
                {...aria}
                type="date"
                max={hoy}
                required
                value={valores.fechaRecepcion}
                onChange={(e) => cambiar('fechaRecepcion', e.target.value)}
              />
            )}
          </Campo>
          <Campo id="lote-variedad" etiqueta="Variedad" error={errores.variedad}>
            {(aria) => (
              <select
                {...aria}
                value={valores.variedad}
                onChange={() => cambiar('variedad', 'Hass')}
              >
                <option value="Hass">Hass</option>
              </select>
            )}
          </Campo>
          <Campo
            id="lote-pesoKg"
            etiqueta="Peso del lote (kg)"
            error={errores.pesoKg}
            ayuda="Mayor que 0 y hasta 50 000 kg; máximo 2 decimales."
          >
            {(aria) => (
              <input
                {...aria}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                required
                value={valores.pesoKg}
                onChange={(e) => cambiar('pesoKg', e.target.value)}
              />
            )}
          </Campo>
          <Campo id="lote-responsable" etiqueta="Responsable" error={errores.responsable}>
            {(aria) => (
              <select
                {...aria}
                value={valores.responsable}
                onChange={(e) => cambiar('responsable', e.target.value)}
              >
                {RESPONSABLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            )}
          </Campo>
          <Campo
            id="lote-observaciones"
            etiqueta="Observaciones (opcional)"
            error={errores.observaciones}
            ayuda={`${observaciones.length}/${MAX_OBSERVACIONES} caracteres`}
            ancho
          >
            {(aria) => (
              <textarea
                {...aria}
                rows={2}
                value={observaciones}
                onChange={(e) => cambiar('observaciones', e.target.value)}
              />
            )}
          </Campo>
          {errorGeneral && (
            <p className="wide aviso-error" role="alert">
              {errorGeneral}
            </p>
          )}
          <div className="actions wide">
            <Link className="btn ghost" to="/lotes">
              Cancelar
            </Link>
            <button className="btn" type="submit" disabled={guardando}>
              {guardando ? 'Registrando…' : 'Registrar lote'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
