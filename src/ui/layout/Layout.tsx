import { Suspense, useEffect, useRef, type MouseEvent } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContextoApp } from '../contexto';
import { BarraPasos } from './BarraPasos';
import { Cabecera } from './Cabecera';
import { ErrorBoundary } from './ErrorBoundary';
import { Pie } from './Pie';

const RUTAS_COMPRADOR = ['/marketplace', '/acerca'];

export function Layout() {
  const { perfil } = useContextoApp();
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const primera = useRef(true);

  // Al cambiar de ruta, el foco va al contenido (lectores de pantalla y teclado).
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    main.current?.focus();
    window.scrollTo(0, 0);
  }, [pathname]);

  // El comprador solo ve Marketplace y Acerca (D10).
  if (perfil === 'comprador' && !RUTAS_COMPRADOR.some((r) => pathname.startsWith(r))) {
    return <Navigate to="/marketplace" replace />;
  }

  return (
    <>
      <a className="saltar" href="#contenido" onClick={saltar}>
        Saltar al contenido
      </a>
      <Cabecera />
      <div className="wrap">
        {perfil === 'packing' && <BarraPasos />}
        <main id="contenido" ref={main} tabIndex={-1}>
          <ErrorBoundary key={pathname}>
            <Suspense
              fallback={
                <p role="status" className="view">
                  Cargando…
                </p>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <Pie />
      </div>
    </>
  );
}

/** Con HashRouter, un enlace "#contenido" cambiaría la ruta: se enfoca a mano. */
function saltar(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  document.getElementById('contenido')?.focus();
}
