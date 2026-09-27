import { Component, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "../ui";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last-resort render guard. Shows a recovery card instead of a blank page;
 * details go to the console (wire to Sentry here if adopted).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("[FIZ] Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 text-center shadow-elevation-2">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <TriangleAlert size={20} aria-hidden />
            </span>
            <h1 className="mt-3 font-semibold text-text">Algo deu errado</h1>
            <p className="mt-1 text-sm text-text-muted">
              O app encontrou um erro inesperado. Seus dados salvos estão
              intactos.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => this.setState({ error: null })}
              >
                Tentar novamente
              </Button>
              <Button onClick={() => window.location.reload()}>
                Recarregar
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
