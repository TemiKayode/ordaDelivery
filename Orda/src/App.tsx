import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Assuming you have an AuthContext
import { Layout } from './components/Layout'; // A common layout wrapper for most pages

// --- Import all your pages ---
// Public/Auth Pages (Ensure these are default imports if they use `export default`)
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Index from './pages/Index'; // Your main landing/home page

// Customer Pages (Ensure these are default imports if they use `export default`)
import CustomerDashboard from './pages/CustomerDashboard';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage'; // Assuming default export
import CartPage from './pages/CartPage'; // Assuming default export
import CheckoutPage from './pages/CheckoutPage'; // Assuming default export
import OrderConfirmationPage from './pages/OrderConfirmationPage'; // Assuming default export
import OrderTrackingPage from './pages/OrderTrackingPage'; // Assuming default export
import SearchResultsPage from './pages/SearchResultsPage'; // Assuming default export
import UserProfile from './pages/UserProfile'; // Assuming default export

// Admin Pages (Ensure these are default imports if they use `export default`)
import AdminDashboard from './pages/AdminDashboard';

// Driver Pages (Ensure these are default imports if they use `export default`)
import DriverDashboard from './pages/DriverDashboard';

// Restaurant Pages (Ensure these are default imports if they use `export default`)
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantOnboarding from './pages/RestaurantOnboarding';

//Import PrivateRoute Component
import PrivateRoute from './components/PrivateRoute';


// --- PrivateRoute Component for Authentication and Authorization ---
// This component checks if a user is authenticated and has the required role
interface PrivateRouteProps {
    children: JSX.Element;
    allowedRoles?: ('customer' | 'admin' | 'driver' | 'restaurant')[]; // Explicitly define allowed roles
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
    // Use profile and loading from useAuth to determine user's state and role
    const { user, loading, profile } = useAuth();
    const currentUserType = profile?.user_type; // Get the user_type from the profile

    if (loading) {
        // Optionally render a loading spinner or component here while auth state is being determined
        return <div className="flex justify-center items-center h-screen text-lg text-muted-foreground">Loading application...</div>;
    }

    if (!user) {
        // Not logged in, redirect to auth page
        return <Navigate to="/auth" replace />;
    }

    // If allowedRoles are specified, check if the current user's type is among them
    if (allowedRoles && currentUserType && !allowedRoles.includes(currentUserType)) {
        // Logged in but unauthorized role, redirect to their appropriate dashboard or a fallback
        console.warn(`User with role '${currentUserType}' tried to access a restricted page.`);

        // Redirect based on their actual user_type
        switch (currentUserType) {
            case 'customer': return <Navigate to="/customer/dashboard" replace />;
            case 'admin': return <Navigate to="/admin/dashboard" replace />;
            case 'driver': return <Navigate to="/driver/dashboard" replace />;
            case 'restaurant': return <Navigate to="/restaurant-owner/dashboard" replace />;
            default: return <Navigate to="/" replace />; // Fallback for unknown user types
        }
    }

    // If user is logged in and authorized, render the children
    return children;
};


// --- Main App Component with Routes ---
const App: React.FC = () => { // <<< Changed from `export const App` to `const App`
    return (
        <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/not-found" element={<NotFound />} /> {/* Custom 404 page */}

            {/* Search Results (can be public or authenticated based on your design) */}
            {/* If guests can search, this should be outside private routes */}
            <Route path="/search-results" element={<Layout><SearchResultsPage /></Layout>} />


            {/* --- Customer Specific Routes (Protected) --- */}
            {/* All customer routes will be wrapped by Layout and PrivateRoute */}
            <Route path="/customer/*" element={<PrivateRoute allowedRoles={['customer']}><Layout><CustomerRoutes /></Layout></PrivateRoute>} />

            {/* --- Admin Specific Routes (Protected) --- */}
            <Route path="/admin/*" element={<PrivateRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></PrivateRoute>} />

            {/* --- Driver Specific Routes (Protected) --- */}
            <Route path="/driver/*" element={<PrivateRoute allowedRoles={['driver']}><Layout><DriverDashboard /></Layout></PrivateRoute>} />

            {/* --- Restaurant Owner Specific Routes (Protected) --- */}
            <Route path="/restaurant-owner/*" element={<PrivateRoute allowedRoles={['restaurant']}><Layout><RestaurantRoutes /></Layout></PrivateRoute>} />


            {/* --- Catch-all for 404 Not Found --- */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

// --- Nested Customer Routes ---
// This helps organize routes for a specific user type
const CustomerRoutes: React.FC = () => {
    return (
        <Routes>
            <Route index element={<CustomerDashboard />} /> {/* /customer */}
            <Route path="dashboard" element={<CustomerDashboard />} /> {/* /customer/dashboard */}
            <Route path="restaurant/:restaurantId" element={<RestaurantDetailsPage />} /> {/* /customer/restaurant/123 */}
            <Route path="cart" element={<CartPage />} /> {/* /customer/cart */}
            <Route path="checkout" element={<CheckoutPage />} /> {/* /customer/checkout */}
            <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} /> {/* /customer/order-confirmation/abc */}
            <Route path="track-order/:orderId" element={<OrderTrackingPage />} /> {/* /customer/track-order/abc */}
            <Route path="profile" element={<UserProfile />} /> {/* /customer/profile */}
            {/* Add more customer-specific routes here as needed */}
            <Route path="*" element={<NotFound />} /> {/* Catch any unhandled customer sub-routes */}
        </Routes>
    );
};

// --- Nested Restaurant Owner Routes ---
const RestaurantRoutes: React.FC = () => {
    return (
        <Routes>
            <Route index element={<RestaurantDashboard />} /> {/* /restaurant-owner */}
            <Route path="dashboard" element={<RestaurantDashboard />} /> {/* /restaurant-owner/dashboard */}
            <Route path="onboarding" element={<RestaurantOnboarding />} /> {/* /restaurant-owner/onboarding */}
            {/* Add more restaurant owner-specific routes here */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default App; // <<< Added default export for App