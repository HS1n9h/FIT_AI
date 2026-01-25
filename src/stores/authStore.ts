import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

const storage = new MMKV();

interface AuthState {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ user: data.user, isAuthenticated: true });
      await get().loadUser();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            display_name: displayName,
            fitness_level: 'beginner',
            goals: [],
            available_minutes: 30,
            preferred_equipment: [],
            subscription_tier: 'free',
          });

        if (profileError) throw profileError;
      }

      set({ user: data.user, isAuthenticated: true });
      await get().loadUser();
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, profile: null, isAuthenticated: false });
      storage.clearAll();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Load profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Load profile error:', error);
      }

      set({
        user,
        profile: profile || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Load user error:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      set({ profile: data });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
}));
