import { lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ContextoAppProvider } from './ui/contexto';
import { Layout } from './ui/layout/Layout';

const LotesPage = lazy(() => import('./ui/pages/LotesPage'));
const NuevoLotePage = lazy(() => import('./ui/pages/NuevoLotePage'));
const ImagenesPage = lazy(() => import('./ui/pages/ImagenesPage'));
const ClasificacionPage = lazy(() => import('./ui/pages/ClasificacionPage'));
const FichaLotePage = lazy(() => import('./ui/pages/FichaLotePage'));
const DashboardPage = lazy(() => import('./ui/pages/DashboardPage'));
const ValorizacionPage = lazy(() => import('./ui/pages/ValorizacionPage'));
const PublicacionPage = lazy(() => import('./ui/pages/PublicacionPage'));
const MarketplacePage = lazy(() => import('./ui/pages/MarketplacePage'));
const OfertaPage = lazy(() => import('./ui/pages/OfertaPage'));
const ConfiguracionPage = lazy(() => import('./ui/pages/ConfiguracionPage'));
const AcercaPage = lazy(() => import('./ui/pages/AcercaPage'));
const NoEncontradaPage = lazy(() => import('./ui/pages/NoEncontradaPage'));

/** Rutas de docs/01 §8. HashRouter funciona en GitHub Pages y abierto como archivo. */
export function App() {
  return (
    <HashRouter>
      <ContextoAppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/lotes" replace />} />
            <Route path="lotes" element={<LotesPage />} />
            <Route path="lotes/nuevo" element={<NuevoLotePage />} />
            <Route path="lotes/:id" element={<FichaLotePage />} />
            <Route path="lotes/:id/imagenes" element={<ImagenesPage />} />
            <Route path="lotes/:id/clasificacion" element={<ClasificacionPage />} />
            <Route path="lotes/:id/valorizacion" element={<ValorizacionPage />} />
            <Route path="lotes/:id/publicacion" element={<PublicacionPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="marketplace/:ofertaId" element={<OfertaPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
            <Route path="acerca" element={<AcercaPage />} />
            <Route path="*" element={<NoEncontradaPage />} />
          </Route>
        </Routes>
      </ContextoAppProvider>
    </HashRouter>
  );
}
