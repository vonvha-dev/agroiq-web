import { NavLink, useNavigate } from 'react-router-dom';
import { EMPRESAS_COMPRADORAS } from '../../config/packings';
import { useContextoApp, type EmpresaCompradora, type Perfil } from '../contexto';

const NAV: Record<Perfil, { a: string; texto: string }[]> = {
  packing: [
    { a: '/lotes', texto: 'Lotes' },
    { a: '/dashboard', texto: 'Dashboard' },
    { a: '/configuracion', texto: 'Configuración' },
    { a: '/acerca', texto: 'Acerca' },
  ],
  comprador: [
    { a: '/marketplace', texto: 'Marketplace' },
    { a: '/acerca', texto: 'Acerca' },
  ],
};

export function Cabecera() {
  const { perfil, cambiarPerfil, empresa, cambiarEmpresa } = useContextoApp();
  const navegar = useNavigate();
  const inicio = perfil === 'comprador' ? '/marketplace' : '/lotes';

  return (
    <header className="top">
      <div className="wrap">
        <NavLink className="brand" to={inicio} aria-label="AgroIQ, inicio">
          Agro<span>IQ</span>
        </NavLink>
        <nav className="nav-principal" aria-label="Principal">
          {NAV[perfil].map((item) => (
            <NavLink key={item.a} to={item.a}>
              {item.texto}
            </NavLink>
          ))}
        </nav>
        <div className="perfil">
          <label>
            Perfil
            <select
              value={perfil}
              onChange={(e) => {
                const nuevo = e.target.value as Perfil;
                cambiarPerfil(nuevo);
                navegar(nuevo === 'comprador' ? '/marketplace' : '/lotes');
              }}
            >
              <option value="packing">Packing</option>
              <option value="comprador">Comprador</option>
            </select>
          </label>
          {perfil === 'comprador' && (
            <label>
              Empresa
              <select
                value={empresa}
                onChange={(e) => cambiarEmpresa(e.target.value as EmpresaCompradora)}
              >
                {EMPRESAS_COMPRADORAS.map((nombre) => (
                  <option key={nombre}>{nombre}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
    </header>
  );
}
