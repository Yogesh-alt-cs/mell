import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private loadingSignal = signal(true);

  session$ = this.sessionSubject.asObservable();
  user = computed(() => this.sessionSubject.getValue()?.user ?? null);
  loading = this.loadingSignal.asReadonly();

  get currentUser(): User | null {
    return this.sessionSubject.getValue()?.user ?? null;
  }

  get currentSession(): Session | null {
    return this.sessionSubject.getValue();
  }

  constructor(private supabase: SupabaseService) {
    // Subscribe to auth state changes
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.sessionSubject.next(session);
      this.loadingSignal.set(false);
    });

    // Initial session fetch
    this.supabase.client.auth.getSession().then(({ data }) => {
      this.sessionSubject.next(data.session);
      this.loadingSignal.set(false);
    });
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signUp({ email, password });
    return { data, error };
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
  }

  async resetPasswordForEmail(email: string, redirectTo: string) {
    return this.supabase.client.auth.resetPasswordForEmail(email, { redirectTo });
  }

  async updatePassword(password: string) {
    return this.supabase.client.auth.updateUser({ password });
  }

  async signInWithOAuth(provider: 'google' | 'apple') {
    return this.supabase.client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    });
  }
}
