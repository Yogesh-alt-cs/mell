import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarSpec } from '../../utils/avatars';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="'0 0 60 60'"
      [attr.width]="size"
      [attr.height]="size"
      role="img"
      [attr.aria-label]="'Avatar ' + spec.key"
    >
      <defs>
        <clipPath [id]="'clip-' + spec.key">
          <circle cx="30" cy="30" r="30" />
        </clipPath>
      </defs>
      <!-- Background -->
      <circle cx="30" cy="30" r="30" [attr.fill]="spec.bg" />

      <g [attr.clip-path]="'url(#clip-' + spec.key + ')'">
        <!-- Initials mode -->
        <ng-container *ngIf="spec.initials">
          <text
            x="30" y="38" text-anchor="middle"
            font-family="Outfit, sans-serif" font-weight="700" font-size="22"
            [attr.fill]="spec.shirt"
          >{{ spec.initials }}</text>
        </ng-container>

        <!-- Icon mode -->
        <ng-container *ngIf="!spec.initials && spec.icon === 'star'">
          <path d="M30 14 L34 25 L46 25 L36 32 L40 44 L30 37 L20 44 L24 32 L14 25 L26 25 Z" [attr.fill]="spec.shirt" />
        </ng-container>
        <ng-container *ngIf="!spec.initials && spec.icon === 'music'">
          <g [attr.fill]="spec.shirt">
            <circle cx="22" cy="40" r="5" />
            <circle cx="40" cy="36" r="5" />
            <rect x="26" y="18" width="3" height="22" />
            <rect x="44" y="14" width="3" height="22" />
            <rect x="26" y="18" width="21" height="3" />
          </g>
        </ng-container>
        <ng-container *ngIf="!spec.initials && spec.icon === 'code'">
          <g fill="none" [attr.stroke]="spec.shirt" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20,24 12,30 20,36" />
            <polyline points="40,24 48,30 40,36" />
            <line x1="34" y1="18" x2="26" y2="42" />
          </g>
        </ng-container>
        <ng-container *ngIf="!spec.initials && spec.icon === 'leaf'">
          <path d="M14 44 C14 24 30 14 46 14 C46 30 36 46 16 46 Z" [attr.fill]="spec.shirt" />
        </ng-container>

        <!-- Face mode -->
        <ng-container *ngIf="showFace">
          <!-- Shoulders -->
          <ellipse cx="30" cy="58" rx="22" ry="14" [attr.fill]="spec.shirt" />
          <!-- Neck -->
          <rect x="26" y="40" width="8" height="8" [attr.fill]="spec.skin" />
          <!-- Face -->
          <circle cx="30" cy="30" r="13" [attr.fill]="spec.skin" />
          <!-- Hair styles -->
          <ng-container *ngIf="spec.hairStyle === 0">
            <path d="M17 28 Q17 14 30 14 Q43 14 43 28 L43 24 Q30 18 17 24 Z" [attr.fill]="spec.hair" />
          </ng-container>
          <ng-container *ngIf="spec.hairStyle === 1">
            <path d="M16 30 Q16 12 30 12 Q44 12 44 30 L44 42 L40 30 Q30 22 20 30 L16 42 Z" [attr.fill]="spec.hair" />
          </ng-container>
          <ng-container *ngIf="spec.hairStyle === 2">
            <circle cx="30" cy="13" r="6" [attr.fill]="spec.hair" />
            <path d="M18 26 Q18 17 30 17 Q42 17 42 26 Z" [attr.fill]="spec.hair" />
          </ng-container>
          <ng-container *ngIf="spec.hairStyle === 3">
            <ellipse cx="30" cy="20" rx="12" ry="3" [attr.fill]="spec.hair" opacity="0.5" />
          </ng-container>
          <ng-container *ngIf="spec.hairStyle === 4">
            <circle cx="20" cy="22" r="4" [attr.fill]="spec.hair" />
            <circle cx="40" cy="22" r="4" [attr.fill]="spec.hair" />
            <circle cx="24" cy="17" r="4" [attr.fill]="spec.hair" />
            <circle cx="36" cy="17" r="4" [attr.fill]="spec.hair" />
            <circle cx="30" cy="14" r="4" [attr.fill]="spec.hair" />
          </ng-container>
          <!-- Eyes -->
          <circle cx="25" cy="30" r="1.4" fill="#1f2937" />
          <circle cx="35" cy="30" r="1.4" fill="#1f2937" />
          <!-- Smile -->
          <path d="M25 35 Q30 39 35 35" stroke="#1f2937" stroke-width="1.4" fill="none" stroke-linecap="round" />
          <!-- Glasses -->
          <ng-container *ngIf="spec.glasses">
            <g stroke="#1f2937" stroke-width="1.2" fill="none">
              <circle cx="25" cy="30" r="3" />
              <circle cx="35" cy="30" r="3" />
              <line x1="28" y1="30" x2="32" y2="30" />
            </g>
          </ng-container>
        </ng-container>
      </g>
    </svg>
  `
})
export class AvatarComponent {
  @Input() spec!: AvatarSpec;
  @Input() size = 60;

  get showFace(): boolean {
    return !this.spec.initials && !this.spec.icon;
  }
}
