import { EnConstruccion } from '../components/EnConstruccion';
import { AvisoSimulado } from '../layout/AvisoSimulado';

export default function ConfiguracionPage() {
  return (
    <EnConstruccion
      titulo="Configuración"
      historia="PB-08 · PB-11"
      sprint="Sprints 03–04"
      descripcion="Precios ilustrativos, modo demo, exportar e importar respaldo y reinicio de datos."
    >
      <AvisoSimulado tipo="precios" />
    </EnConstruccion>
  );
}
