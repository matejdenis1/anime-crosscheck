import ReactDOM from 'react-dom/client';
import App from './App';
import 'hover.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css'

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/providers/AuthProvider';
import { NotificationProvider } from './components/providers/NotificationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/misc/ErrorBoundary';

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter future={{ v7_startTransition: true,v7_relativeSplatPath: true }}>
                <AuthProvider>
                    <NotificationProvider>
                        <App />
                    </NotificationProvider>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </ErrorBoundary>
);
