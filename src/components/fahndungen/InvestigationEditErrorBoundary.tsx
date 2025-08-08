import React, { type ErrorInfo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class InvestigationEditErrorBoundary extends React.Component<
  Props,
  State
> {
  override state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    console.error("Investigation Edit Error:", {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      componentStack: errorInfo.componentStack,
    });

    // Send to error tracking (z.B. Sentry)
    if (
      typeof window !== "undefined" &&
      (
        window as {
          Sentry?: {
            captureException: (error: Error, context: unknown) => void;
          };
        }
      ).Sentry
    ) {
      (
        window as {
          Sentry?: {
            captureException: (error: Error, context: unknown) => void;
          };
        }
      ).Sentry?.captureException(error, {
        contexts: { react: errorInfo },
        tags: { component: "InvestigationEdit" },
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Fehler beim Bearbeiten
              </h2>
              <p className="mt-2 text-red-600 dark:text-red-300">
                {this.state.error?.message ??
                  "Ein unerwarteter Fehler ist aufgetreten"}
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-red-600 dark:text-red-300">
                    Technische Details (nur in Entwicklung)
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-300">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={this.handleReset}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  Erneut versuchen
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-white transition-colors hover:bg-muted"
                >
                  <RefreshCw className="h-4 w-4" />
                  Seite neu laden
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
