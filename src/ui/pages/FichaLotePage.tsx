import { useParams } from 'react-router-dom';
import { EnConstruccion } from '../components/EnConstruccion';

export default function FichaLotePage() {
  const { id = '' } = useParams();
  return (
    <EnConstruccion
      titulo={`Ficha del lote ${id}`}
      historia="PB-05"
      sprint="Sprint 03"
      descripcion="Trazabilidad del lote: datos de registro, imágenes, clasificación y eventos."
    />
  );
}
