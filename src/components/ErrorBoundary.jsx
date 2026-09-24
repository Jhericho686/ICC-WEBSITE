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
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#121212] border border-[#2a2a2a] p-8 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-red-500">Something went wrong</h2>
            <p className="text-sm text-gray-400 mb-6">
              An error occurred while displaying this page. Clearing cached data usually resolves this issue immediately.
            </p>
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
                Clear Local Cache & Reload
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
