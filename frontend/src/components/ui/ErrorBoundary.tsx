import React from 'react';

type Props = { children: React.ReactNode; fallbackLabel?: string };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? 'Unknown error' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary caught]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-error">bug_report</span>
          <p className="text-sm font-semibold text-error">
            {this.props.fallbackLabel ?? 'This section encountered an error.'}
          </p>
          <p className="text-xs font-mono bg-surface-container px-4 py-2 rounded-lg max-w-lg break-all">
            {this.state.message}
          </p>
          <button
            className="text-xs text-primary underline"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
