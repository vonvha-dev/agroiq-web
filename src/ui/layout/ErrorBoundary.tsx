import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}
interface Estado {
  error: Error | null;
}

/** Un ErrorBoundary por página: mensaje útil y salida a Lotes (docs/02 §3). */
export class ErrorBoundary extends Component<Props, Estado> {
  override state: Estado = { error: null };

  static getDerivedStateFromError(error: Error): Estado {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn('Error en la página', error, info.componentStack);
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="panel error" role="alert">
        <h1>Algo salió mal en esta pantalla</h1>
        <p>{this.state.error.message}</p>
        <Link className="btn" to="/lotes">
          Volver a Lotes
        </Link>
      </section>
    );
  }
}
