import { useParams } from 'react-router-dom';
import { EnConstruccion } from '../components/EnConstruccion';
import { AvisoSimulado } from '../layout/AvisoSimulado';

export default function PublicacionPage() {
  const { id = '' } = useParams();
  return (
    <EnConstruccion
      titulo={`Publicación B2B · ${id}`}
      historia="PB-09"
      sprint="Sprint 03"
      descripcion="Una oferta activa por destino, con la comisión de prueba del 4 %."
    >
      <AvisoSimulado tipo="publicacion" />
    </EnConstruccion>
  );
}
