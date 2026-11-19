import { useParams } from 'react-router-dom';
import { EnConstruccion } from '../components/EnConstruccion';
import { AvisoSimulado } from '../layout/AvisoSimulado';

export default function ValorizacionPage() {
  const { id = '' } = useParams();
  return (
    <EnConstruccion
      titulo={`Valorización · ${id}`}
      historia="PB-08"
      sprint="Sprint 03"
      descripcion="Destino sugerido para cada fracción del lote y su valor de referencia."
    >
      <AvisoSimulado tipo="precios" />
    </EnConstruccion>
  );
}
