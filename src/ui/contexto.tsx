import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { EMPRESAS_COMPRADORAS } from '../config/packings';

export type Perfil = 'packing' | 'comprador';
export type EmpresaCompradora = (typeof EMPRESAS_COMPRADORAS)[number];

interface ContextoApp {
  perfil: Perfil;
  cambiarPerfil: (perfil: Perfil) => void;
  empresa: EmpresaCompradora;
  cambiarEmpresa: (empresa: EmpresaCompradora) => void;
  /** Lote en contexto para la barra de pasos; se conserva al ir al Dashboard (D8). */
  loteContexto: string | null;
  fijarLoteContexto: (id: string | null) => void;
}

const Contexto = createContext<ContextoApp | null>(null);

const CLAVE_PERFIL = 'agroiq.perfil';
const CLAVE_EMPRESA = 'agroiq.empresa';

/** localStorage es solo una comodidad: puede faltar o lanzar (modo privado, file://). */
function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}
function escribir(clave: string, valor: string): void {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // sin persistencia; la app sigue funcionando
  }
}

function perfilInicial(): Perfil {
  return leer(CLAVE_PERFIL) === 'comprador' ? 'comprador' : 'packing';
}
function empresaInicial(): EmpresaCompradora {
  const guardada = leer(CLAVE_EMPRESA);
  return EMPRESAS_COMPRADORAS.find((e) => e === guardada) ?? EMPRESAS_COMPRADORAS[0];
}

export function ContextoAppProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil>(perfilInicial);
  const [empresa, setEmpresa] = useState<EmpresaCompradora>(empresaInicial);
  const [loteContexto, fijarLoteContexto] = useState<string | null>(null);

  const valor = useMemo<ContextoApp>(
    () => ({
      perfil,
      cambiarPerfil: (p) => {
        setPerfil(p);
        escribir(CLAVE_PERFIL, p);
      },
      empresa,
      cambiarEmpresa: (e) => {
        setEmpresa(e);
        escribir(CLAVE_EMPRESA, e);
      },
      loteContexto,
      fijarLoteContexto,
    }),
    [perfil, empresa, loteContexto],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useContextoApp(): ContextoApp {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useContextoApp fuera de ContextoAppProvider');
  return valor;
}
