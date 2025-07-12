import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Define the Profile interface
interface Profile {
    id: string;
    user_id: string;
    display_name: string | null;
    phone: string | null;
    address: string | null;
    user_type: 'customer' | 'restaurant' | 'driver';
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

// Define the UserRole interface
interface UserRole {
    role: 'admin' | 'customer' | 'restaurant' | 'driver';
}

// Define the AuthContextType
interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    userRoles: UserRole[];
    session: Session | null;
    login: (email: string, password: string) => Promise<{ error: any }>;
    signup: (email: string, password: string, displayName: string, userType: 'customer' | 'restaurant' | 'driver') => Promise<{ error: any }>;
    logout: () => Promise<void>;
    loading: boolean;
    isAdmin: boolean;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// AuthProvider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true); // Initial loading state is true

    // Memoized function for fetching profile to avoid re-creation on every render
    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            // PGRST116 means "No rows found" - this is expected if a profile doesn't exist yet for a new user
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
                setProfile(null); // Ensure profile is null on actual error
                return;
            }

            // If no data (PGRST116), data will be null. Cast to Profile or null directly.
            setProfile(data as Profile | null);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null); // Ensure profile is null on unexpected error
        }
    }, []); // Empty dependency array means this function is created once

    // Memoized function for fetching user roles
    const fetchUserRoles = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching user roles:', error);
                setUserRoles([]); // Ensure roles are empty on error
                return;
            }

            setUserRoles(data as UserRole[]);
        } catch (error) {
            console.error('Error fetching user roles:', error);
            setUserRoles([]); // Ensure roles are empty on unexpected error
        }
    }, []); // Empty dependency array means this function is created once

    useEffect(() => {
        // Function to handle fetching user-specific data
        const handleUserDataFetch = async (currentSession: Session | null) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession?.user) {
                await fetchProfile(currentSession.user.id);
                await fetchUserRoles(currentSession.user.id);
            } else {
                setProfile(null);
                setUserRoles([]);
            }
            setLoading(false); // Set loading to false once initial data is fetched
        };

        // 1. Check for an existing session on initial load
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            handleUserDataFetch(initialSession);
        });

        // 2. Set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                // Only trigger data fetch if the session actually changes significantly
                // (e.g., login, logout, token refresh that changes user ID)
                // This check prevents unnecessary re-fetches on minor event types like 'TOKEN_REFRESHED'
                if (newSession?.user?.id !== user?.id || (!newSession && user) || (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
                    handleUserDataFetch(newSession);
                } else if (event === 'SIGNED_OUT') {
                    // Explicitly clear state on sign out event if the above `if` didn't catch it
                    setUser(null);
                    setSession(null);
                    setProfile(null);
                    setUserRoles([]);
                    setLoading(false);
                }
            }
        );

        // Cleanup subscription on component unmount
        return () => subscription.unsubscribe();
    }, [fetchProfile, fetchUserRoles, user]); // Add user to dependency array to re-run effect if user changes unexpectedly,
    // but primarily relying on onAuthStateChange for reactivity.

    const login = async (email: string, password: string) => {
        setLoading(true); // Set loading true on login attempt
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        // The onAuthStateChange listener will handle setting user/profile/roles and setting loading to false
        return { error };
    };

    const signup = async (email: string, password: string, displayName: string, userType: 'customer' | 'restaurant' | 'driver') => {
        setLoading(true); // Set loading true on signup attempt
        const redirectUrl = `${window.location.origin}/`;

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    display_name: displayName,
                    user_type: userType,
                }
            }
        });
        // The onAuthStateChange listener will handle setting user/profile/roles and setting loading to false
        return { error };
    };

    const logout = async () => {
        setLoading(true); // Set loading true on logout attempt
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
            setLoading(false); // If logout fails, ensure loading is set back to false
        }
        // The onAuthStateChange listener will handle clearing state and setting loading to false
    };

    const isAdmin = userRoles.some(role => role.role === 'admin');

    const value = {
        user,
        profile,
        userRoles,
        session,
        login,
        signup,
        logout,
        loading,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};