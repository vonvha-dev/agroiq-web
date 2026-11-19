import { useParams } from 'react-router-dom';
import { EnConstruccion } from '../components/EnConstruccion';
import { AvisoSimulado } from '../layout/AvisoSimulado';

export default function ClasificacionPage() {
  const { id = '' } = useParams();
  return (
    <EnConstruccion
      titulo={`Clasificación · ${id}`}
      historia="PB-02/04"
      sprint="Sprint 03"
      descripcion="Cada fruta recibe una de las cinco categorías definidas para AgroIQ."
    >
      <AvisoSimulado tipo="clasificacion" />
    </EnConstruccion>
  );
}
