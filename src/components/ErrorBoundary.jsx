import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-white font-semibold mb-2">Something went wrong</h2>
          <pre className="text-red-400 text-xs bg-red-500/10 p-4 rounded-xl max-w-lg overflow-auto text-left mb-4">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500"
          >
            Clear data & reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
