import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../lib/supabase';

type AuthState = {
  session: Session | null;
  isInitialized: boolean;
  init: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isInitialized: false,
  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, isInitialized: true });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, isInitialized: true });
    });
  },
}));
