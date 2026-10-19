/* ═══════════════════════════════════════════════════════════════
   DATABASE BRIDGE (MIGRATED TO FIREBASE)
   Exports the standard database interface powered by Firebase
   ═══════════════════════════════════════════════════════════════ */

export * from './firebase';

// Backwards-compatible dummy supabase client object for any legacy onAuthStateChange listeners
import { auth, getLocalAdminSession } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const supabase = {
  auth: {
    onAuthStateChange: (callback) => {
      const dispatchState = (fbUser) => {
        const currentUser = fbUser || getLocalAdminSession();
        callback(currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', currentUser ? { user: currentUser } : null);
      };

      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        dispatchState(fbUser);
      });

      const handleCustomAuth = () => {
        dispatchState(auth.currentUser);
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('icc_admin_auth', handleCustomAuth);
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              unsubscribe();
              if (typeof window !== 'undefined') {
                window.removeEventListener('icc_admin_auth', handleCustomAuth);
              }
            },
          },
        },
      };
    },
    getSession: async () => {
      const user = auth.currentUser || getLocalAdminSession();
      return { data: { session: user ? { user } : null }, error: null };
    },
    getUser: async () => {
      const user = auth.currentUser || getLocalAdminSession();
      return { data: { user }, error: null };
    },
  },
};
