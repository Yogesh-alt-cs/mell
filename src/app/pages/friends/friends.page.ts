import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { QuizHeaderComponent } from '../../shared/components/quiz-header/quiz-header.component';
import { QuizBottomNavComponent } from '../../shared/components/quiz-bottom-nav/quiz-bottom-nav.component';

const FEATURE_CARDS = [
  { title: 'Invite friends',  desc: 'Share your code so they can join you.',    icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M19 8v6m3-3h-6' },
  { title: '1v1 challenges',  desc: 'Send a quiz, settle the score.',            icon: 'M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z' },
  { title: 'Squad XP',        desc: 'Climb the squad leaderboard each week.',   icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
];

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, QuizHeaderComponent, QuizBottomNavComponent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 2rem;">
        <app-quiz-header title="Friends"></app-quiz-header>

        <!-- Hero card -->
        <section class="rounded-card relative overflow-hidden border"
                 style="margin-top: 1.5rem; padding: 1.5rem; background: rgba(246,219,192,0.8); backdrop-filter: blur(8px); border-color: rgba(255,255,255,0.4); box-shadow: var(--shadow-soft-lg);">
          <div class="absolute rounded-full" style="width: 8rem; height: 8rem; right: -2rem; top: -2rem; background: var(--secondary); opacity: 0.6;"></div>
          <div class="relative">
            <div class="inline-flex items-center gap-1 rounded-full px-3 py-1 backdrop-blur"
                 style="background: rgba(255,255,255,0.7); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              Coming soon
            </div>
            <h2 class="font-bold leading-tight" style="font-size: 1.5rem; margin-top: 0.75rem;">Play together</h2>
            <p class="text-sm opacity-70" style="margin-top: 0.25rem; max-width: 18rem;">
              Add friends, send quiz challenges, and race to the top of the weekly leaderboard.
            </p>
          </div>
        </section>

        <div class="space-y-3" style="margin-top: 1.5rem;">
          <div *ngFor="let card of featureCards"
               class="flex items-center gap-4 bg-surface rounded-card p-4 shadow-soft">
            <div class="w-12 h-12 rounded-2xl bg-background flex items-center justify-center" style="flex-shrink: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="card.icon" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="font-bold text-sm">{{ card.title }}</div>
              <div class="opacity-60" style="font-size: 11px;">{{ card.desc }}</div>
            </div>
          </div>
        </div>

        <div style="height: 6.5rem;"></div>
      </div>
    </ion-content>

    <app-quiz-bottom-nav active="friends"></app-quiz-bottom-nav>
  `
})
export class FriendsPage {
  featureCards = FEATURE_CARDS;
}
