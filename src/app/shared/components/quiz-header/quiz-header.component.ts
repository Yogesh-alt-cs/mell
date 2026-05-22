import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { getAvatar } from '../../utils/avatars';

@Component({
  selector: 'app-quiz-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  template: `
    <header class="shrink-0 px-0 flex items-center justify-between animate-slide-down"
            style="padding-top:max(3rem, env(safe-area-inset-top, 1.25rem));padding-bottom:0.25rem;">

      <!-- Back button or greeting -->
      <ng-container *ngIf="showBack; else greetingBlock">
        <button (click)="goBack()"
                class="flex items-center justify-center shadow-soft active:scale-95 transition-transform"
                style="width:2.75rem;height:2.75rem;border-radius:0.875rem;
                       background:var(--surface);border:none;cursor:pointer;"
                aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      </ng-container>

      <ng-template #greetingBlock>
        <div class="flex flex-col" style="gap:0.05rem;">
          <span style="font-size:0.8rem;font-weight:500;opacity:0.5;letter-spacing:0.01em;">
            {{ greeting }}
          </span>
          <h1 style="font-size:1.5rem;font-weight:700;letter-spacing:-0.03em;line-height:1.15;margin:0;">
            {{ displayName }}
          </h1>
        </div>
      </ng-template>

      <!-- Page title (when not greeting) -->
      <h2 *ngIf="title"
          style="font-size:1rem;font-weight:700;letter-spacing:-0.02em;margin:0;">
        {{ title }}
      </h2>

      <!-- Avatar button -->
      <button (click)="goToProfile()"
              class="active:scale-95 transition-transform"
              style="border:none;background:none;cursor:pointer;padding:0;
                     border-radius:9999px;
                     box-shadow:0 0 0 3px var(--primary),0 4px 16px -4px rgba(74,68,61,0.2);"
              aria-label="Profile">
        <app-avatar [spec]="avatarSpec" [size]="46"></app-avatar>
      </button>
    </header>
  `
})
export class QuizHeaderComponent {
  @Input() greeting = 'Hey,';
  @Input() showBack = false;
  @Input() title?: string;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private location: Location
  ) {}

  get displayName(): string {
    const p = this.profileService.profile();
    return p?.display_name || p?.username || 'Friend';
  }

  get avatarSpec() { return getAvatar(this.profileService.profile()?.avatar_url); }

  goBack(): void { this.location.back(); }
  goToProfile(): void { this.router.navigate(['/profile']); }
}
