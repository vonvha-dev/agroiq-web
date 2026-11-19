import { useEffect } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';
import { useContextoApp } from '../contexto';

interface Paso {
  n: 1 | 2 | 3 | 4 | 5;
  texto: string;
  /** Ruta del paso; `null` si necesita un lote en contexto y no lo hay. */
  ruta: (lote: string | null) => string | null;
}

const PASOS: Paso[] = [
  { n: 1, texto: 'Lote', ruta: (l) => (l ? `/lotes/${l}` : '/lotes') },
  { n: 2, texto: 'Clasificación', ruta: (l) => (l ? `/lotes/${l}/clasificacion` : null) },
  { n: 3, texto: 'Dashboard', ruta: () => '/dashboard' },
  { n: 4, texto: 'Valorización', ruta: (l) => (l ? `/lotes/${l}/valorizacion` : null) },
  { n: 5, texto: 'Publicación B2B', ruta: (l) => (l ? `/lotes/${l}/publicacion` : null) },
];

const SIN_LOTE = 'Registra o elige un lote primero';

function pasoActivo(pathname: string): number | null {
  if (pathname.startsWith('/dashboard')) return 3;
  if (pathname.endsWith('/clasificacion')) return 2;
  if (pathname.endsWith('/valorizacion')) return 4;
  if (pathname.endsWith('/publicacion')) return 5;
  if (pathname.startsWith('/lotes')) return 1;
  return null;
}

/**
 * Barra de pasos 1–5 (docs/01 §8). Conserva el lote en contexto, también en el Dashboard (D8).
 * La habilitación por estado del lote (`puede`) se conecta cuando haya datos (PB-03 en adelante).
 */
export function BarraPasos() {
  const { pathname } = useLocation();
  const { loteContexto, fijarLoteContexto } = useContextoApp();
  const coincidencia = useMatch('/lotes/:id/*');
  const idRuta = coincidencia?.params.id;

  useEffect(() => {
    if (idRuta && idRuta !== 'nuevo') fijarLoteContexto(idRuta);
  }, [idRuta, fijarLoteContexto]);

  const activo = pasoActivo(pathname);

  return (
    <nav className="steps" aria-label="Flujo del lote">
      <ol>
        {PASOS.map((paso) => {
          const ruta = paso.ruta(loteContexto);
          const contenido = (
            <>
              <b aria-hidden="true">{paso.n}</b>
              <span>
                <span className="sr-only">Paso {paso.n}: </span>
                {paso.texto}
              </span>
            </>
          );
          return (
            <li key={paso.n}>
              {ruta ? (
                <Link
                  className="paso"
                  to={ruta}
                  aria-current={activo === paso.n ? 'step' : undefined}
                >
                  {contenido}
                </Link>
              ) : (
                <span className="paso" aria-disabled="true" title={SIN_LOTE}>
                  {contenido}
                  <span className="sr-only"> (no disponible: {SIN_LOTE.toLowerCase()})</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {loteContexto && <p className="contexto">Lote en contexto: {loteContexto}</p>}
    </nav>
  );
}
