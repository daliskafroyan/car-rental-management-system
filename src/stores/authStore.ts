import { create } from 'zustand';
import { auth } from '@/lib/supabase/auth';
import type { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    initialize: async () => {
        try {
            const user = await auth.getCurrentUser();
            set({ user, isLoading: false });
        } catch (error) {
            set({ user: null, isLoading: false });
        }
    },
    signIn: async (email: string, password: string) => {
        const { user } = await auth.signIn(email, password);
        set({ user });
    },
    signOut: async () => {
        await auth.signOut();
        set({ user: null });
    },
})); 