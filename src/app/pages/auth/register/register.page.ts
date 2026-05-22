import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 3rem; min-height: 100%; display: flex; flex-direction: column; justify-content: center;">

        <div style="padding-top: max(3rem, env(safe-area-inset-top, 1rem));">
          <h1 class="font-bold tracking-tight" style="font-size: 1.875rem;">Create account</h1>
          <p class="text-sm opacity-60" style="margin-top: 0.25rem;">Start your learning streak today.</p>
        </div>

        <div style="margin-top: 2rem;" class="space-y-3">
          <div class="flex items-center gap-3 bg-surface rounded-2xl shadow-soft" style="padding: 0 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.4; flex-shrink: 0;">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input [(ngModel)]="username" type="text" placeholder="Username"
                   style="flex: 1; padding: 1rem 0; background: transparent; border: none; outline: none; font-family: inherit; font-size: 1rem;" />
          </div>

          <div class="flex items-center gap-3 bg-surface rounded-2xl shadow-soft" style="padding: 0 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.4; flex-shrink: 0;">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input [(ngModel)]="email" type="email" placeholder="you@email.com"
                   style="flex: 1; padding: 1rem 0; background: transparent; border: none; outline: none; font-family: inherit; font-size: 1rem;" />
          </div>

          <div class="flex items-center gap-3 bg-surface rounded-2xl shadow-soft" style="padding: 0 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.4; flex-shrink: 0;">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input [(ngModel)]="password" type="password" placeholder="Password (8+ characters)"
                   style="flex: 1; padding: 1rem 0; background: transparent; border: none; outline: none; font-family: inherit; font-size: 1rem;" />
          </div>
        </div>

        <button (click)="signUp()" [disabled]="loading()"
          class="w-full rounded-2xl bg-foreground text-background font-bold inline-flex items-center justify-center transition-transform active:scale-99"
          style="margin-top: 1.5rem; padding: 1rem; font-size: 1rem;"
          [style.opacity]="loading() ? '0.7' : '1'">
          <span *ngIf="!loading()">Create account</span>
          <svg *ngIf="loading()" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </button>

        <p class="text-center text-sm" style="margin-top: 2rem; opacity: 0.7;">
          Already have an account?
          <a routerLink="/login" style="font-weight: 700; text-decoration: none; color: inherit; opacity: 1;">Sign in</a>
        </p>
      </div>
    </ion-content>
  `
})
export class RegisterPage {
  username = ''; email = ''; password = '';
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router, private toast: ToastController) {}

  async signUp() {
    if (!this.email || !this.password || this.password.length < 8) {
      const t = await this.toast.create({ message: 'Please fill all fields (password 8+ chars)', duration: 3000, position: 'top', color: 'warning' });
      await t.present(); return;
    }
    this.loading.set(true);
    const { error } = await this.auth.signUp(this.email, this.password);
    this.loading.set(false);
    if (error) {
      const t = await this.toast.create({ message: error.message, duration: 3000, position: 'top', color: 'danger' });
      await t.present();
    } else {
      const t = await this.toast.create({ message: 'Account created! Check your email to confirm.', duration: 4000, position: 'top', color: 'success' });
      await t.present();
      this.router.navigate(['/login']);
    }
  }
}
