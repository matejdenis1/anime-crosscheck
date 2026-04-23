import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Container, Button } from 'react-bootstrap';

// Tato komponenta zachytává runtime chyby v child komponentách a místo bílé stránky zobrazí fallback UI
function ErrorFallback() {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '50vh' }}>
      <h2>Something went wrong.</h2>
      <p className="text-muted">An unexpected error occurred. Please try again.</p>
      <Button variant="primary" onClick={() => { window.location.href = '/'; }}>
        Go to Home
      </Button>
    </Container>
  );
}

export default function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => console.error('ErrorBoundary caught:', error, info)}
    >
      {children}
    </ReactErrorBoundary>
  );
}
