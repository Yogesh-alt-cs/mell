import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 3rem; min-height: 100%; display: flex; flex-direction: column; justify-content: center;">
        <a routerLink="/login" class="inline-flex items-center gap-2 font-semibold text-sm opacity-60 active:scale-95 transition"
           style="padding-top: max(3rem, env(safe-area-inset-top, 1rem)); text-decoration: none; color: inherit;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </a>

        <h1 class="font-bold tracking-tight" style="font-size: 1.875rem; margin-top: 2rem;">Forgot password?</h1>
        <p class="text-sm opacity-60" style="margin-top: 0.5rem;">We'll send a reset link to your email.</p>

        <div class="flex items-center gap-3 bg-surface rounded-2xl shadow-soft" style="margin-top: 2rem; padding: 0 1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.4; flex-shrink: 0;">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <input [(ngModel)]="email" type="email" placeholder="you@email.com"
                 style="flex: 1; padding: 1rem 0; background: transparent; border: none; outline: none; font-family: inherit; font-size: 1rem;" />
        </div>

        <ng-container *ngIf="!sent()">
          <button (click)="sendReset()" [disabled]="loading()"
            class="w-full rounded-2xl bg-foreground text-background font-bold inline-flex items-center justify-center transition-transform active:scale-99"
            style="margin-top: 1.5rem; padding: 1rem; font-size: 1rem;"
            [style.opacity]="loading() ? '0.7' : '1'">
            <span *ngIf="!loading()">Send reset link</span>
            <svg *ngIf="loading()" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </button>
        </ng-container>

        <div *ngIf="sent()" class="rounded-2xl bg-surface shadow-soft text-center" style="margin-top: 1.5rem; padding: 1.5rem;">
          <div class="text-2xl" style="margin-bottom: 0.5rem;">📬</div>
          <div class="font-bold">Check your inbox!</div>
          <p class="text-sm opacity-60" style="margin-top: 0.25rem;">A reset link was sent to {{ email }}.</p>
        </div>
      </div>
    </ion-content>
  `
})
export class ForgotPasswordPage {
  email = '';
  loading = signal(false);
  sent = signal(false);

  constructor(private auth: AuthService, private toast: ToastController) {}

  async sendReset() {
    if (!this.email) return;
    this.loading.set(true);
    const { error } = await this.auth.resetPasswordForEmail(this.email, window.location.origin + '/reset-password');
    this.loading.set(false);
    if (error) {
      const t = await this.toast.create({ message: error.message, duration: 3000, position: 'top', color: 'danger' });
      await t.present();
    } else {
      this.sent.set(true);
    }
  }
}
