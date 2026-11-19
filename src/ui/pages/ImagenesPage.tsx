import { useParams } from 'react-router-dom';
import { EnConstruccion } from '../components/EnConstruccion';

export default function ImagenesPage() {
  const { id = '' } = useParams();
  return (
    <EnConstruccion
      titulo={`Cargar imágenes · ${id}`}
      historia="PB-02/04"
      sprint="Sprint 03"
      descripcion="Carga de imágenes JPG o PNG y de la hoja de etiquetas CSV de la muestra."
    />
  );
}
