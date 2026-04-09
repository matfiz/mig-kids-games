'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GameErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white p-8">
          <div className="text-center max-w-lg">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold mb-4">Ups! Coś poszło nie tak</h1>
            <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
            <pre className="text-xs text-left bg-black/50 p-4 rounded overflow-auto max-h-48 mb-4">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-500"
            >
              Odśwież stronę
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
