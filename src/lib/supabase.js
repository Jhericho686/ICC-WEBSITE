/* ═══════════════════════════════════════════════════════════════
   DATABASE BRIDGE (MIGRATED TO FIREBASE)
   Exports the standard database interface powered by Firebase
   ═══════════════════════════════════════════════════════════════ */

export * from './firebase';

// Backwards-compatible dummy supabase client object for any legacy onAuthStateChange listeners
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const supabase = {
  auth: {
    onAuthStateChange: (callback) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
      });
      return { data: { subscription: { unsubscribe } } };
    },
    getSession: async () => {
      const user = auth.currentUser;
      return { data: { session: user ? { user } : null }, error: null };
    },
    getUser: async () => {
      const user = auth.currentUser;
      return { data: { user }, error: null };
    },
  },
};
