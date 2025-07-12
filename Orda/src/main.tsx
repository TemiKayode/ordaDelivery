// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Your main application component (which contains all your routes)
import './index.css'; // Your global CSS
import { AuthProvider } from './contexts/AuthContext'; // Your AuthProvider
import { CartProvider } from './contexts/CartContext'; // <<< Import your CartProvider here

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            {/* AuthProvider should wrap CartProvider if cart operations depend on user authentication */}
            <AuthProvider>
                {/* CartProvider must wrap any component that uses `useCart` */}
                <CartProvider>
                    <App /> {/* Your main application component (which contains all your routes) */}
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);