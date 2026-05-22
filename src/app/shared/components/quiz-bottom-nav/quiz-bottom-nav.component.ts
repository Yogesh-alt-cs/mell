import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type NavKey = 'home' | 'categories' | 'dashboard' | 'friends' | 'profile';

interface NavItem { key: NavKey; label: string; route: string; icon: string; }

const NAV_ITEMS: NavItem[] = [
  { key: 'home',       label: 'Home',       route: '/home',       icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { key: 'categories', label: 'Explore',    route: '/categories', icon: 'M10 3H3v7h7V3z M21 3h-7v7h7V3z M21 14h-7v7h7v-7z M10 14H3v7h7v-7z' },
  { key: 'dashboard',  label: 'Progress',   route: '/dashboard',  icon: 'M18 20V10 M12 20V4 M6 20v-6' },
  { key: 'friends',    label: 'Friends',    route: '/friends',    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
  { key: 'profile',    label: 'Profile',    route: '/profile',    icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
];

@Component({
  selector: 'app-quiz-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none animate-slide-up-nav"
         [style.padding-bottom]="'max(0.875rem, env(safe-area-inset-bottom))'">
      <div class="pointer-events-auto mx-3 rounded-card backdrop-blur-xl flex items-center px-1.5 py-1.5"
           style="width:min(440px,calc(100vw - 1.25rem));
                  background:rgba(255,255,255,0.72);
                  box-shadow:0 24px 64px -16px rgba(74,68,61,0.22),0 0 0 1px rgba(255,255,255,0.5);
                  border:1px solid rgba(255,255,255,0.5);">

        <a *ngFor="let item of navItems"
           [routerLink]="item.route"
           style="text-decoration:none;color:inherit;"
           class="flex-1 flex flex-col items-center py-1 rounded-2xl transition-all active:scale-90">

          <span class="relative flex items-center justify-center transition-all"
                style="width:2.75rem;height:2.75rem;border-radius:0.875rem;"
                [class.nav-icon-active]="isActive(item.key)"
                [style.background]="isActive(item.key) ? 'var(--primary)' : 'transparent'"
                [style.box-shadow]="isActive(item.key) ? '0 8px 20px -4px rgba(246,219,192,0.9)' : 'none'">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none"
              [attr.stroke]="isActive(item.key) ? 'var(--foreground)' : 'rgba(74,68,61,0.45)'"
              [attr.stroke-width]="isActive(item.key) ? '2.5' : '1.9'"
              stroke-linecap="round" stroke-linejoin="round"
              class="transition-colors">
              <path [attr.d]="item.icon" />
            </svg>
            <span *ngIf="isActive(item.key)"
                  class="absolute rounded-full"
                  style="bottom:-3px;width:4px;height:4px;background:var(--foreground);"></span>
          </span>

          <span class="font-bold uppercase transition-all"
                style="font-size:8.5px;letter-spacing:0.07em;margin-top:1px;"
                [style.opacity]="isActive(item.key) ? '1' : '0.38'">
            {{ item.label }}
          </span>
        </a>
      </div>
    </nav>
  `
})
export class QuizBottomNavComponent {
  @Input() active: NavKey = 'home';
  navItems = NAV_ITEMS;
  isActive(key: NavKey): boolean { return this.active === key; }
}
