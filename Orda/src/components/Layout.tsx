// src/components/Layout.tsx
import React from 'react';
import Navigation from './Navigation'; // <<< Remove the curly braces!

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation /> {/* Your header/navigation bar */}
            <main className="flex-grow">
                {children}
            </main>
            {/* Optionally add a Footer component here */}
        </div>
    );
};