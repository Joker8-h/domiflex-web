import React from "react";
import ErrorState from "./ErrorState";

// Captura crashes de render por ruta en vez de pantalla en negro.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title="Esta sección no pudo cargarse"
          description="Ocurrió un error inesperado. Puedes reintentar o volver al inicio."
          onRetry={() => {
            this.setState({ error: null });
            this.props.onRetry?.();
          }}
        />
      );
    }
    return this.props.children;
  }
}
