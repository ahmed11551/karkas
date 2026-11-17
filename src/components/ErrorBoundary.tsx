import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render errors anywhere in the app and shows a branded fallback
 * instead of a blank page. The error is logged to the console for diagnosis.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    const isRu = document.documentElement.lang !== 'en';

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center p-6 bg-paper text-ink"
      >
        <div className="max-w-md w-full rounded-[20px] border border-ink/15 bg-paper-deep p-8 text-center">
          <p className="eyebrow text-brass-ink mb-4">{isRu ? 'Что-то пошло не так' : 'Something went wrong'}</p>
          <h1 className="font-light text-4xl leading-tight mb-4">
            {isRu ? 'Страница временно недоступна' : 'The page is temporarily unavailable'}
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed mb-8">
            {isRu
              ? 'Обновите страницу. Если ошибка повторяется, позвоните нам, мы поможем оформить расчёт.'
              : 'Please reload the page. If the problem persists, call us and we will help with your estimate.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-[12px] bg-brass hover:bg-brass-hover text-ink font-medium text-sm transition-colors"
          >
            {isRu ? 'Обновить страницу' : 'Reload page'}
          </button>
        </div>
      </div>
    );
  }
}
