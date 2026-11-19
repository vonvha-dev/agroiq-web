import type { ReactNode } from 'react';
import { useTitulo } from '../useTitulo';

interface Props {
  titulo: string;
  historia: string;
  sprint: string;
  descripcion: string;
  children?: ReactNode;
}

/** Página provisional de la Fase 0: indica qué historia y qué sprint la completan. */
export function EnConstruccion({ titulo, historia, sprint, descripcion, children }: Props) {
  useTitulo(titulo);
  return (
    <div className="view">
      <div className="head">
        <h1>{titulo}</h1>
        <span className="tag next">
          En construcción ({sprint}) · {historia}
        </span>
        <p>{descripcion}</p>
      </div>
      {children}
    </div>
  );
}
