import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 3rem; min-height: 100%; display: flex; flex-direction: column; justify-content: center;">

        <!-- Logo / Branding -->
        <div class="text-center" style="padding-top: max(3rem, env(safe-area-inset-top, 1rem));">
          <div class="mx-auto rounded-full bg-primary flex items-center justify-center"
               style="width: 4rem; height: 4rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
        </div>

        <h1 class="font-bold tracking-tight" style="font-size: 1.875rem; margin-top: 1.5rem;">Welcome back</h1>
        <p class="text-sm opacity-60" style="margin-top: 0.25rem;">Sign in to keep your streak alive.</p>

        <!-- Form -->
        <div style="margin-top: 2rem;">
          <!-- Email -->
          <div class="flex items-center gap-3 bg-surface rounded-2xl shadow-soft" style="padding: 0 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              style="opacity: 0.4; flex-shrink: 0;">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input [(ngModel)]="email" type="email" placeholder="you@email.com"
                   style="flex: 1; padding: 1rem 0; background: transparent; border: none; outline: none; font-family: inherit; font-size: 1rem;" />
          </div>

          <!-- Password -->
          <div class="flex items-center gap-3 bg-surface rounded-2xl shadow-soft" style="margin-top: 0.75rem; padding: 0 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              style="opacity: 0.4; flex-shrink: 0;">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input [(ngModel)]="password" type="password" placeholder="Password"
                   style="flex: 1; padding: 1rem 0; background: transparent; border: none; outline: none; font-family: inherit; font-size: 1rem;" />
          </div>

          <!-- Forgot -->
          <div style="margin-top: 0.75rem; text-align: right;">
            <a routerLink="/forgot-password"
               style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; text-decoration: none; color: inherit;">
              Forgot password?
            </a>
          </div>

          <!-- Sign in button -->
          <button (click)="signIn()" [disabled]="loading()"
            class="w-full rounded-2xl bg-foreground text-background font-bold inline-flex items-center justify-center transition-transform active:scale-99"
            style="margin-top: 1.25rem; padding: 1rem; font-size: 1rem;"
            [style.opacity]="loading() ? '0.7' : '1'">
            <span *ngIf="!loading()">Sign in</span>
            <svg *ngIf="loading()" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-3" style="margin-top: 1.25rem;">
            <div style="flex: 1; height: 1px; background: var(--border);"></div>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.4;">or</span>
            <div style="flex: 1; height: 1px; background: var(--border);"></div>
          </div>

          <!-- OAuth buttons -->
          <button (click)="signInWithGoogle()"
            class="w-full bg-surface rounded-2xl font-semibold shadow-soft inline-flex items-center justify-center gap-3 active:scale-99 transition-transform"
            style="margin-top: 1rem; padding: 1rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <button (click)="signInWithApple()"
            class="w-full bg-surface rounded-2xl font-semibold shadow-soft inline-flex items-center justify-center gap-3 active:scale-99 transition-transform"
            style="margin-top: 0.75rem; padding: 1rem;">
            <svg width="18" height="18" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-47.4-148.2-112.3C149.1 747 90 570.5 90 448.6c0-217.1 141.4-332 280.8-332 73.3 0 134.4 48.5 179.8 48.5 43.4 0 112.1-51.7 194.3-51.7 31.7 0 117.8 2.6 181.5 75.4zM493.9 220.4c31.6-37.4 54.1-89.7 54.1-142s-2-54.1-5.2-75.8c-50.5 1.9-110 33.7-145.1 75.8-28.3 32.9-55.8 85.2-55.8 138.2 0 6.5 1.3 13 1.9 15.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 136.5-12.6z" fill="currentColor"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <!-- Sign up link -->
        <p class="text-center text-sm" style="margin-top: 2rem; opacity: 0.7;">
          New here?
          <a routerLink="/register" style="font-weight: 700; text-decoration: none; color: inherit; opacity: 1;">Create account</a>
        </p>
      </div>
    </ion-content>
  `
})
export class LoginPage {
  email = ''; password = '';
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router, private toast: ToastController) {}

  async signIn() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    const { error } = await this.auth.signIn(this.email, this.password);
    this.loading.set(false);
    if (error) {
      const t = await this.toast.create({ message: error.message, duration: 3000, position: 'top', color: 'danger' });
      await t.present();
    } else {
      this.router.navigate(['/home']);
    }
  }

  async signInWithGoogle() {
    await this.auth.signInWithOAuth('google');
  }

  async signInWithApple() {
    await this.auth.signInWithOAuth('apple');
  }
}
