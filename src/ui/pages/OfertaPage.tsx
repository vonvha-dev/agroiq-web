import { useParams } from 'react-router-dom';
import { EnConstruccion } from '../components/EnConstruccion';
import { AvisoSimulado } from '../layout/AvisoSimulado';

export default function OfertaPage() {
  const { ofertaId = '' } = useParams();
  return (
    <EnConstruccion
      titulo={`Oferta ${ofertaId}`}
      historia="PB-09"
      sprint="Sprint 03"
      descripcion="Detalle de la oferta y botón “Me interesa”."
    >
      <AvisoSimulado tipo="publicacion" />
    </EnConstruccion>
  );
}
