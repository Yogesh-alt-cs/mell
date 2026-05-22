import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
}

export function initialsFor(name: string | null | undefined, fallback = 'ME'): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || fallback;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  profile = signal<Profile | null>(null);
  loading = signal(false);

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {
    // Load profile whenever auth state changes
    this.auth.session$.subscribe(session => {
      if (session?.user) {
        this.fetchProfile(session.user.id);
      } else {
        this.profile.set(null);
      }
    });
  }

  async fetchProfile(userId: string) {
    this.loading.set(true);
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    this.loading.set(false);
    if (!error && data) this.profile.set(data as Profile);
    return { data, error };
  }

  async updateAvatar(avatarKey: string) {
    const user = this.auth.currentUser;
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await (this.supabase.client
      .from('profiles') as any)
      .update({ avatar_url: avatarKey })
      .eq('id', user.id);
    if (!error) {
      const current = this.profile();
      if (current) this.profile.set({ ...current, avatar_url: avatarKey });
    }
    return { error };
  }
}
