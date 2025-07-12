import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';

interface UserProfile {
    id: string;
    display_name: string;
    user_type: 'customer' | 'restaurant' | 'driver' | 'admin';
    avatar_url?: string;
    phone?: string;
    address?: string;
}

interface AuthContextType {
    user: any;
    profile: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ user: any | null; error: any | null }>;
    signup: (
        email: string,
        password: string,
        displayName: string,
        userType: UserProfile['user_type'],
        phone?: string
    ) => Promise<{ user: any | null; error: any | null }>;
    logout: () => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
                setProfile(null);
                return null;
            }

            setProfile(data as UserProfile | null);
            return data as UserProfile | null;
        } catch (error) {
            console.error('Error fetching profile (unexpected):', error);
            setProfile(null);
            return null;
        }
    };

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setLoading(true);
            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        const getSession = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        };

        getSession();

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error('Login error:', error.message);
            return { user: null, error };
        }
        return { user: data.user, error: null };
    };

    const signup = async (
        email: string,
        password: string,
        displayName: string,
        userType: UserProfile['user_type'],
        phone?: string
    ) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

        if (authError) {
            console.error('Signup auth error:', authError.message);
            return { user: null, error: authError };
        }

        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    display_name: displayName,
                    user_type: userType,
                    email,
                    phone: phone || null,
                });

            if (profileError) {
                console.error('Error creating user profile:', profileError.message);
                return { user: null, error: profileError };
            }
            return { user: authData.user, error: null };
        }

        return { user: null, error: new Error('User data not returned after signup.') };
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error.message);
        }
        setUser(null);
        setProfile(null);
        return { error };
    };

    const value = { user, profile, loading, login, signup, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};