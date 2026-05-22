import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 3rem; min-height: 100%; display: flex; flex-direction: column; justify-content: center;">
        <div style="padding-top: max(3rem, env(safe-area-inset-top, 1rem));">
          <h1 class="font-bold tracking-tight" style="font-size: 1.875rem;">Set new password</h1>
          <p class="text-sm opacity-60" style="margin-top: 0.25rem;">Choose something memorable.</p>
        </div>

        <div class="flex items-center gap-3 bg-surface rounded-2xl shadow-soft" style="margin-top: 2rem; padding: 0 1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.4; flex-shrink: 0;">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input [(ngModel)]="newPassword" type="password" placeholder="New password (8+ characters)"
                 style="flex: 1; padding: 1rem 0; background: transparent; border: none; outline: none; font-family: inherit; font-size: 1rem;" />
        </div>

        <button (click)="update()" [disabled]="loading()"
          class="w-full rounded-2xl bg-foreground text-background font-bold inline-flex items-center justify-center transition-transform active:scale-99"
          style="margin-top: 1.5rem; padding: 1rem; font-size: 1rem;"
          [style.opacity]="loading() ? '0.7' : '1'">
          <span *ngIf="!loading()">Update password</span>
          <svg *ngIf="loading()" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </button>
      </div>
    </ion-content>
  `
})
export class ResetPasswordPage {
  newPassword = '';
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router, private toast: ToastController) {}

  async update() {
    if (!this.newPassword || this.newPassword.length < 8) {
      const t = await this.toast.create({ message: 'Password must be 8+ characters', duration: 3000, position: 'top', color: 'warning' });
      await t.present(); return;
    }
    this.loading.set(true);
    const { error } = await this.auth.updatePassword(this.newPassword);
    this.loading.set(false);
    if (error) {
      const t = await this.toast.create({ message: error.message, duration: 3000, position: 'top', color: 'danger' });
      await t.present();
    } else {
      const t = await this.toast.create({ message: 'Password updated!', duration: 3000, position: 'top', color: 'success' });
      await t.present();
      this.router.navigate(['/login']);
    }
  }
}
