import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {}
    window.location.href = window.location.pathname + '?reset=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-lg w-full bg-[#121212] border border-[#2a2a2a] p-8 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-red-500">Something went wrong</h2>
            <p className="text-sm text-gray-400 mb-4">
              An error occurred while displaying this page.
            </p>
            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-left font-mono text-xs text-red-300 overflow-x-auto max-h-40">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-xl transition-all text-xs"
              >
                Clear Local Cache & Force Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
