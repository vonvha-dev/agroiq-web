import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { repositorios } from '../../data/app';
import { NOMBRE_ESTADO } from '../../domain/catalogos';
import { puede } from '../../domain/estados';
import { esIdLote, normalizarId } from '../../domain/ids';
import type { Lote } from '../../domain/tipos';
import { borrarLote } from '../../services/borrarLote';
import { formatearFecha, formatearKg } from '../formato';
import { useTitulo } from '../useTitulo';

const POR_PAGINA = 50;

export default function LotesPage() {
  useTitulo('Lotes de descarte');
  const lotes = useLiveQuery(() => repositorios.lotes.listar(), []);
  const registrado = (useLocation().state as { registrado?: string } | null)?.registrado;

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<string | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function buscar(e: FormEvent) {
    e.preventDefault();
    const id = normalizarId(busqueda);
    if (!id) {
      setFiltro(null);
      setErrorBusqueda(null);
      return;
    }
    if (!esIdLote(id)) {
      setErrorBusqueda('Escribe un ID completo, por ejemplo LT-2026-0143.');
      return;
    }
    setErrorBusqueda(null);
    setFiltro(id);
    setPagina(0);
  }

  function limpiarBusqueda() {
    setBusqueda('');
    setFiltro(null);
    setErrorBusqueda(null);
  }

  async function borrar(lote: Lote) {
    const ok = window.confirm(
      `¿Borrar el lote ${lote.id}? Se eliminarán sus datos y eventos. El ID no se volverá a usar.`,
    );
    if (!ok) return;
    setError(null);
    try {
      await borrarLote(lote.id);
      setMensaje(`Lote ${lote.id} borrado.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo borrar el lote');
    }
  }

  const visibles = lotes ? (filtro ? lotes.filter((l) => l.id === filtro) : lotes) : [];
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, paginas - 1);
  const filas = visibles.slice(paginaActual * POR_PAGINA, (paginaActual + 1) * POR_PAGINA);

  return (
    <div className="view">
      <div className="head">
        <h1>Lotes de descarte</h1>
        <p>
          Registra un lote del área de descarte, carga sus imágenes y obtén su clasificación por
          tipo de defecto.
        </p>
      </div>

      <div aria-live="polite">
        {registrado && !mensaje && <p className="aviso-ok">Lote {registrado} registrado.</p>}
        {mensaje && <p className="aviso-ok">{mensaje}</p>}
      </div>
      {error && (
        <p className="aviso-error" role="alert">
          {error}
        </p>
      )}

      <section className="panel" aria-labelledby="titulo-lotes">
        <div className="barra-lista">
          <h2 id="titulo-lotes">Lotes registrados</h2>
          <form className="buscador" role="search" onSubmit={buscar}>
            <label htmlFor="buscar-id">Buscar por ID</label>
            <input
              id="buscar-id"
              type="search"
              placeholder="LT-2026-0143"
              autoComplete="off"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-invalid={Boolean(errorBusqueda)}
              aria-describedby={errorBusqueda ? 'buscar-error' : undefined}
            />
            <button className="btn ghost" type="submit">
              Buscar
            </button>
            {errorBusqueda && (
              <span id="buscar-error" className="campo-error">
                {errorBusqueda}
              </span>
            )}
          </form>
          <Link className="btn" to="/lotes/nuevo">
            Registrar lote
          </Link>
        </div>

        {lotes === undefined ? (
          <p role="status">Cargando lotes…</p>
        ) : lotes.length === 0 ? (
          <div className="vacio">
            <p>Aún no hay lotes registrados.</p>
            <Link to="/lotes/nuevo">Registra el primer lote</Link>
          </div>
        ) : filtro && visibles.length === 0 ? (
          <div className="vacio" role="status">
            <p>Lote no encontrado: no hay ningún lote con el ID {filtro}.</p>
            <button className="btn ghost" type="button" onClick={limpiarBusqueda}>
              Mostrar todos los lotes
            </button>
          </div>
        ) : (
          <>
            {filtro && (
              <p className="contexto">
                Mostrando el lote {filtro}.{' '}
                <button className="enlace" type="button" onClick={limpiarBusqueda}>
                  Mostrar todos
                </button>
              </p>
            )}
            {/* Región desplazable en móvil: debe poder enfocarse para desplazarla con el teclado (axe). */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
            <div className="tbl" role="region" aria-labelledby="titulo-lotes" tabIndex={0}>
              <table>
                <caption className="sr-only">
                  Lotes de descarte, del más reciente al más antiguo
                </caption>
                <thead>
                  <tr>
                    <th scope="col">ID de lote</th>
                    <th scope="col">Recepción</th>
                    <th scope="col">Packing</th>
                    <th scope="col" className="num">
                      Peso (kg)
                    </th>
                    <th scope="col">Estado</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((l) => (
                    <tr key={l.id}>
                      <th scope="row">{l.id}</th>
                      <td>{formatearFecha(l.fechaRecepcion)}</td>
                      <td>{l.packing}</td>
                      <td className="num">{formatearKg(l.pesoKg)}</td>
                      <td>
                        <span className="estado">{NOMBRE_ESTADO[l.estado]}</span>
                      </td>
                      <td className="obs" title={l.observaciones}>
                        {l.observaciones ?? '—'}
                      </td>
                      <td className="acciones-fila">
                        <Link to={`/lotes/${l.id}`} aria-label={`Ver ficha de ${l.id}`}>
                          Ver ficha
                        </Link>
                        {puede(l, 'borrar') && (
                          <button
                            className="enlace peligro"
                            type="button"
                            onClick={() => void borrar(l)}
                            aria-label={`Borrar ${l.id}`}
                          >
                            Borrar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {paginas > 1 && (
              <nav className="paginacion" aria-label="Páginas de lotes">
                <button
                  className="btn ghost"
                  type="button"
                  disabled={paginaActual === 0}
                  onClick={() => setPagina(paginaActual - 1)}
                >
                  Anterior
                </button>
                <span>
                  Página {paginaActual + 1} de {paginas}
                </span>
                <button
                  className="btn ghost"
                  type="button"
                  disabled={paginaActual >= paginas - 1}
                  onClick={() => setPagina(paginaActual + 1)}
                >
                  Siguiente
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
