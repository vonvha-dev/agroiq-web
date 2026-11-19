/** Catálogos demo editables (docs/01 §3.4–3.6; D4, D5, D10). Sin datos personales reales. */

export const PACKINGS = [
  'Packing de Cañete (demo)',
  'Packing de Chincha (demo)',
  'Packing de Huaral (demo)',
] as const;

export const RESPONSABLES = [
  'Supervisor de calidad (demo)',
  'Operario de clasificación (demo)',
  'Jefe de packing (demo)',
] as const;

export const RESPONSABLE_POR_DEFECTO = RESPONSABLES[0];

export const EMPRESAS_COMPRADORAS = [
  'Procesadora de aceite (demo)',
  'Procesadora de pulpa (demo)',
  'Procesadora de congelados (demo)',
] as const;
