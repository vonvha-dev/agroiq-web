import { Link } from 'react-router-dom';
import { EnConstruccion } from '../components/EnConstruccion';
import { useContextoApp } from '../contexto';

export default function DashboardPage() {
  const { loteContexto } = useContextoApp();
  return (
    <EnConstruccion
      titulo="Dashboard de merma"
      historia="PB-07"
      sprint="Sprint 03"
      descripcion="Volumen y distribución de defectos de los lotes clasificados, filtrados por fecha y packing."
    >
      {loteContexto && <Link to={`/lotes/${loteContexto}`}>Volver al lote {loteContexto}</Link>}
    </EnConstruccion>
  );
}
