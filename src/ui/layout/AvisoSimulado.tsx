/** Avisos de honestidad del prototipo (riesgo R4). No se ocultan nunca. */
const AVISOS = {
  clasificacion: {
    titulo: 'Clasificación con etiquetas manuales o simulada.',
    texto: 'No proviene de un modelo entrenado ni tiene precisión medida.',
  },
  precios: {
    titulo: 'Valores ilustrativos, no son cotizaciones.',
    texto: 'Los precios por kilogramo sirven para mostrar el cálculo.',
  },
  publicacion: {
    titulo: 'Publicación de prueba.',
    texto: 'No se realizan ventas ni pagos.',
  },
} as const;

export function AvisoSimulado({ tipo }: { tipo: keyof typeof AVISOS }) {
  const aviso = AVISOS[tipo];
  return (
    <p className="sim" role="note">
      <span>
        <strong>{aviso.titulo}</strong> {aviso.texto}
      </span>
    </p>
  );
}
