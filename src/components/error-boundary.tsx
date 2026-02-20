"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service in production
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Etwas ist schiefgelaufen
          </h2>
          <p className="text-slate-600 mb-4 max-w-md">
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleRetry} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Erneut versuchen
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Seite neu laden
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-6 p-4 bg-slate-100 rounded-lg text-left text-xs text-red-600 overflow-auto max-w-full">
              {this.state.error.message}
              {"\n"}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
