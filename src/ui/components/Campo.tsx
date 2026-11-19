import type { ReactElement } from 'react';

interface Props {
  id: string;
  etiqueta: string;
  error?: string | undefined;
  ayuda?: string | undefined;
  ancho?: boolean;
  /** Recibe los atributos de accesibilidad que debe aplicar el control. */
  children: (aria: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
  }) => ReactElement;
}

/** Campo de formulario: etiqueta, control, ayuda y error junto al campo (accesibilidad AA). */
export function Campo({ id, etiqueta, error, ayuda, ancho, children }: Props) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const descrito = [idError, idAyuda].filter(Boolean).join(' ') || undefined;
  return (
    <div className={ancho ? 'f wide' : 'f'}>
      <label htmlFor={id}>{etiqueta}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': descrito })}
      {ayuda && (
        <span id={idAyuda} className="ayuda">
          {ayuda}
        </span>
      )}
      {error && (
        <span id={idError} className="campo-error">
          {error}
        </span>
      )}
    </div>
  );
}
