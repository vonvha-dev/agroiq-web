import { EnConstruccion } from '../components/EnConstruccion';
import { AvisoSimulado } from '../layout/AvisoSimulado';

export default function MarketplacePage() {
  return (
    <EnConstruccion
      titulo="Marketplace"
      historia="PB-09"
      sprint="Sprint 03"
      descripcion="Ofertas publicadas de fracciones de palta, filtrables por destino."
    >
      <AvisoSimulado tipo="publicacion" />
    </EnConstruccion>
  );
}
