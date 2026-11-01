import { defineStore } from 'pinia';
import { authService, type Session } from '../services/auth';

export const useAuthStore = defineStore('auth', {
  state: (): { session: Session | null } => ({
    session: authService.read(),
  }),
  actions: {
    async signIn(email: string, password: string) {
      this.session = await authService.signIn(email, password);
    },
    async signOut() {
      await authService.signOut();
      this.session = null;
    },
  },
});
