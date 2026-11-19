import { Link } from 'react-router-dom';
import { EnConstruccion } from '../components/EnConstruccion';

export default function LotesPage() {
  return (
    <EnConstruccion
      titulo="Lotes de descarte"
      historia="PB-03 · PB-05"
      sprint="Sprint 02"
      descripcion="Registra un lote del área de descarte, carga sus imágenes y obtén su clasificación por tipo de defecto."
    >
      <div className="actions">
        <Link className="btn" to="/lotes/nuevo">
          Registrar lote
        </Link>
      </div>
    </EnConstruccion>
  );
}
