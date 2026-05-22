import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { QuizHeaderComponent } from '../../shared/components/quiz-header/quiz-header.component';
import { QuizBottomNavComponent } from '../../shared/components/quiz-bottom-nav/quiz-bottom-nav.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AVATARS, getAvatar } from '../../shared/utils/avatars';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, QuizHeaderComponent, QuizBottomNavComponent, AvatarComponent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 2rem;">

        <!-- Header -->
        <header class="flex items-center justify-between" style="padding-top: max(3rem, env(safe-area-inset-top, 1rem));">
          <h1 class="text-2xl font-bold tracking-tight">Profile</h1>
          <div class="flex items-center gap-2">
            <button class="w-11 h-11 rounded-2xl bg-surface flex items-center justify-center shadow-soft active:scale-95 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Profile card -->
        <section class="bg-surface rounded-card shadow-soft text-center" style="margin-top: 1.5rem; padding: 1.5rem;">
          <button (click)="toggleAvatarPicker()"
                  class="mx-auto block rounded-full overflow-hidden active:scale-95 transition"
                  style="width: 6rem; height: 6rem; box-shadow: 0 0 0 4px var(--primary), 0 8px 24px -6px rgba(246,219,192,0.6);">
            <app-avatar [spec]="currentAvatarSpec()" [size]="96"></app-avatar>
          </button>
          <h2 class="font-bold" style="font-size: 1.25rem; margin-top: 0.75rem;">{{ displayName() }}</h2>
          <p class="text-xs opacity-60">{{ userEmail() }} · Level {{ profile()?.level ?? 1 }}</p>

          <div class="grid grid-cols-3 gap-3" style="margin-top: 1.25rem;">
            <div class="rounded-2xl bg-background p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="mx-auto opacity-60">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              <div class="mt-1 text-base font-bold">{{ profile()?.streak_days ?? 0 }}d</div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; font-weight: 700;">Streak</div>
            </div>
            <div class="rounded-2xl bg-background p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="mx-auto opacity-60">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              <div class="mt-1 text-base font-bold">{{ profile()?.xp ?? 0 }}</div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; font-weight: 700;">XP</div>
            </div>
            <div class="rounded-2xl bg-background p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="mx-auto opacity-60">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z"/>
              </svg>
              <div class="mt-1 text-base font-bold">{{ profile()?.level ?? 1 }}</div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; font-weight: 700;">Level</div>
            </div>
          </div>
        </section>

        <!-- Avatar picker -->
        <section class="bg-surface rounded-card shadow-soft" style="margin-top: 1.25rem; padding: 1.25rem;">
          <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
            <div>
              <h3 class="text-base font-bold">Choose your avatar</h3>
              <p class="opacity-60" style="font-size: 11px;">20 handcrafted styles</p>
            </div>
            <button (click)="toggleAvatarPicker()"
                    class="rounded-full bg-background"
                    style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; padding: 0.375rem 0.75rem;">
              {{ showPicker() ? 'Hide' : 'Change' }}
            </button>
          </div>
          <div *ngIf="showPicker()" class="grid grid-cols-4 gap-3 animate-in fade-in">
            <button *ngFor="let av of allAvatars"
                    (click)="selectAvatar(av.key)"
                    [disabled]="savingAvatar()"
                    class="relative mx-auto rounded-full overflow-hidden active:scale-90 transition-all"
                    style="width: 60px; height: 60px;"
                    [style.box-shadow]="av.key === currentAvatarKey() ? '0 0 0 3px var(--foreground), 0 0 0 6px var(--primary)' : '0 0 0 2px transparent'">
              <app-avatar [spec]="av" [size]="60"></app-avatar>
              <span *ngIf="av.key === currentAvatarKey()"
                    class="absolute flex items-center justify-center rounded-full"
                    style="bottom: -2px; right: -2px; width: 20px; height: 20px; background: var(--foreground); color: var(--background);">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </span>
            </button>
          </div>
        </section>

        <!-- Sign out -->
        <button (click)="signOut()"
                class="w-full rounded-2xl inline-flex items-center justify-center gap-2 font-semibold active:scale-99 transition"
                style="margin-top: 1.25rem; padding: 1rem; background: var(--warning);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sign out
        </button>

        <div style="height: 6.5rem;"></div>
      </div>
    </ion-content>

    <app-quiz-bottom-nav active="profile"></app-quiz-bottom-nav>
  `
})
export class ProfilePage {
  showPicker = signal(false);
  savingAvatar = signal(false);
  allAvatars = AVATARS;

  get profile() { return this.profileService.profile; }
  currentAvatarKey = () => this.profileService.profile()?.avatar_url ?? 'av-1';
  currentAvatarSpec = () => getAvatar(this.currentAvatarKey());
  displayName = () => { const p = this.profileService.profile(); return p?.display_name || p?.username || 'Friend'; };
  userEmail = () => this.auth.currentUser?.email ?? '';

  constructor(private profileService: ProfileService, private auth: AuthService, private router: Router, private toast: ToastController) {}

  toggleAvatarPicker() { this.showPicker.update(v => !v); }

  async selectAvatar(key: string) {
    if (this.savingAvatar()) return;
    this.savingAvatar.set(true);
    const { error } = await this.profileService.updateAvatar(key);
    this.savingAvatar.set(false);
    const t = await this.toast.create({ message: error ? "Couldn't save avatar" : 'Avatar updated!', duration: 2000, position: 'top', color: error ? 'danger' : 'success' });
    await t.present();
  }

  async signOut() { await this.auth.signOut(); this.router.navigate(['/login']); }
}
