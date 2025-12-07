import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Loader2 } from 'lucide-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
           <div className="bg-slate-900 border border-red-900/50 p-8 rounded-2xl max-w-2xl w-full shadow-2xl">
              <h1 className="text-2xl font-bold text-red-500 mb-4 flex items-center gap-2">
                 <Loader2 className="w-6 h-6 animate-spin" /> Application Error
              </h1>
              <p className="mb-4 text-slate-400">The application crashed while loading. This usually happens due to missing environment variables or build configuration issues.</p>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-red-300 overflow-auto max-h-64 whitespace-pre-wrap border border-slate-800">
                {this.state.error?.message}
                {this.state.error?.stack && `\n\n${this.state.error.stack}`}
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Reload Page
              </button>
           </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);