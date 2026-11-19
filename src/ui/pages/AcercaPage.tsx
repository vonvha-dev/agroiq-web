import { CREDITO_IMAGENES } from '../layout/Pie';
import { AvisoSimulado } from '../layout/AvisoSimulado';
import { useTitulo } from '../useTitulo';

export default function AcercaPage() {
  useTitulo('Acerca del prototipo');
  return (
    <div className="view">
      <div className="head">
        <h1>Acerca del prototipo</h1>
        <p>
          AgroIQ convierte el descarte de palta Hass en información por lote y en oportunidades de
          valorización B2B. Proyecto del curso Gestión de Proyectos (FIIS-UNI, 2026-II).
        </p>
      </div>
      <section className="panel">
        <h2>Alcance de este prototipo</h2>
        <ul>
          <li>
            Lotes, imágenes, clasificación, valorización y ofertas se guardan en este navegador.
          </li>
          <li>Funciona sin internet. No hay login ni control de accesos (previsto en PB-16).</li>
          <li>
            Las metas de exactitud (≥ 90 %), recall (≥ 85 %) y tiempo (≤ 1 s por fruta) son del
            producto completo y no se han medido en este prototipo.
          </li>
        </ul>
      </section>
      <AvisoSimulado tipo="clasificacion" />
      <AvisoSimulado tipo="precios" />
      <AvisoSimulado tipo="publicacion" />
      <section className="panel">
        <h2>Créditos</h2>
        <p>{CREDITO_IMAGENES}</p>
      </section>
    </div>
  );
}
