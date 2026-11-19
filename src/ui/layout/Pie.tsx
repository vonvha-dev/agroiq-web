export const CREDITO_IMAGENES =
  "Imágenes de palta Hass: “'Hass' Avocado Ripening Photographic Dataset” (Xavier, Rodrigues y Silva, 2024, Mendeley Data, doi:10.17632/3xd9n945v8.1), licencia CC BY 4.0, recortadas y redimensionadas.";

export function Pie() {
  return (
    <footer className="note">
      AgroIQ · Prototipo funcional (FIIS-UNI, Gestión de Proyectos 2026-II). Clasificación por
      etiquetas manuales o simulada; precios ilustrativos; publicación de prueba sin pagos.{' '}
      {CREDITO_IMAGENES}
    </footer>
  );
}
