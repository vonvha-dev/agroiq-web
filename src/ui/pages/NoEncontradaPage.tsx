import { Link } from 'react-router-dom';
import { useTitulo } from '../useTitulo';

export default function NoEncontradaPage() {
  useTitulo('Página no encontrada');
  return (
    <div className="view">
      <div className="head">
        <h1>Página no encontrada</h1>
        <p>La dirección no corresponde a ninguna pantalla de AgroIQ.</p>
      </div>
      <p>
        <Link to="/lotes">Ir a Lotes de descarte</Link>
      </p>
    </div>
  );
}
