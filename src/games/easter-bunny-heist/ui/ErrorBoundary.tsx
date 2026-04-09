'use client';

import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GameErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-600 text-white">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">🐛</div>
            <h2 className="text-2xl font-bold mb-2">Ups! Coś poszło nie tak.</h2>
            <p className="text-sm opacity-75 mb-4">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
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
