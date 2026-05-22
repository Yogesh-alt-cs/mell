import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { QuizHeaderComponent } from '../../shared/components/quiz-header/quiz-header.component';
import { QuizBottomNavComponent } from '../../shared/components/quiz-bottom-nav/quiz-bottom-nav.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';

interface Attempt {
  id: string;
  quiz_id: string | null;
  score: number;
  total: number;
  time_seconds: number;
  completed_at: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, QuizHeaderComponent, QuizBottomNavComponent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 2rem;">

        <app-quiz-header title="Dashboard"></app-quiz-header>
        <div class="space-y-5" style="margin-top: 1.5rem;">

        <!-- Glass hero stats -->
        <section class="relative rounded-card p-5 overflow-hidden border"
                 style="background: rgba(246,219,192,0.8); backdrop-filter: blur(8px); border-color: rgba(255,255,255,0.4); box-shadow: var(--shadow-soft-lg);">
          <div class="absolute rounded-full"
               style="width: 10rem; height: 10rem; right: -2.5rem; top: -2.5rem; background: var(--secondary); opacity: 0.6;"></div>
          <div class="relative grid grid-cols-3 gap-3">
            <div class="rounded-2xl p-3 text-center"
                 style="background: rgba(255,255,255,0.8); backdrop-filter: blur(4px);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="mx-auto opacity-70">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              <div class="mt-1 text-lg font-bold">{{ profile()?.streak_days ?? 0 }}d</div>
              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; font-weight: 700;">Streak</div>
            </div>
            <div class="rounded-2xl p-3 text-center"
                 style="background: rgba(255,255,255,0.8); backdrop-filter: blur(4px);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="mx-auto opacity-70">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z"/>
              </svg>
              <div class="mt-1 text-lg font-bold">{{ profile()?.level ?? 1 }}</div>
              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; font-weight: 700;">Level</div>
            </div>
            <div class="rounded-2xl p-3 text-center"
                 style="background: rgba(255,255,255,0.8); backdrop-filter: blur(4px);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="mx-auto opacity-70">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              <div class="mt-1 text-lg font-bold">{{ profile()?.xp ?? 0 }}</div>
              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; font-weight: 700;">XP</div>
            </div>
          </div>
        </section>

        <!-- Accuracy + Sparkline -->
        <section class="rounded-card p-5 border"
                 style="background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); border-color: rgba(255,255,255,0.5); box-shadow: var(--shadow-soft);">
          <div class="flex items-end justify-between">
            <div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">Accuracy</div>
              <div class="text-4xl font-bold tracking-tight">{{ accuracy() }}%</div>
            </div>
            <div class="text-right">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">Played</div>
              <div class="text-2xl font-bold">{{ attempts().length }}</div>
            </div>
          </div>
          <div class="mt-4 h-2 rounded-full bg-background overflow-hidden">
            <div class="h-full bg-foreground rounded-full transition-all" [style.width]="accuracy() + '%'"></div>
          </div>

          <!-- SVG Sparkline -->
          <div class="mt-5">
            <div class="flex items-center gap-2 opacity-60"
                 style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v18h18M7 16l4-4 4 4 4-4"/>
              </svg>
              Last 7 attempts
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="mt-2 w-full" style="height: 6rem;">
              <polyline
                fill="none"
                stroke="var(--foreground)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
                [attr.points]="sparklinePoints() || '0,100 100,100'"
              />
            </svg>
          </div>
        </section>

        <!-- Quick stats -->
        <section class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl p-4 border"
               style="background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); border-color: rgba(255,255,255,0.5); box-shadow: var(--shadow-soft);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" class="opacity-60">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            <div class="mt-2 text-xl font-bold">{{ timeSpentMinutes() }}m</div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; font-weight: 700;">Time spent</div>
          </div>
          <div class="rounded-2xl p-4 border"
               style="background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); border-color: rgba(255,255,255,0.5); box-shadow: var(--shadow-soft);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" class="opacity-60">
              <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
            </svg>
            <div class="mt-2 text-xl font-bold">{{ totalCorrect() }}/{{ totalAnswered() }}</div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; font-weight: 700;">Correct</div>
          </div>
        </section>

        <!-- Achievements -->
        <section>
          <h3 class="text-base font-bold tracking-tight mb-3">Achievements</h3>
          <div class="grid grid-cols-3 gap-3">
            <div *ngFor="let badge of badges()"
                 class="rounded-2xl p-3 text-center shadow-soft transition-all"
                 [style.background]="badge.earned ? 'var(--primary)' : 'var(--surface)'"
                 [style.opacity]="badge.earned ? '1' : '0.5'">
              <div [innerHTML]="badge.iconSvg" class="mx-auto" style="width: 20px; height: 20px;"></div>
              <div class="mt-1 font-bold leading-tight" style="font-size: 10px;">{{ badge.label }}</div>
            </div>
          </div>
        </section>

        <!-- Recent activity -->
        <section>
          <h3 class="text-base font-bold tracking-tight mb-3">Recent activity</h3>
          <div *ngIf="loading()" class="space-y-2">
            <div *ngFor="let s of [1,2,3]" class="h-16 rounded-2xl bg-surface animate-pulse"></div>
          </div>
          <p *ngIf="!loading() && attempts().length === 0"
             class="text-sm opacity-60 text-center py-6">No quizzes yet. Play one to see stats!</p>
          <ul *ngIf="!loading() && attempts().length > 0" class="space-y-2">
            <li *ngFor="let a of attempts().slice(0, 6)"
                class="flex items-center gap-3 bg-surface rounded-2xl p-3 shadow-soft">
              <div class="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-sm">
                {{ a.total ? (((a.score / a.total) * 100) | number:'1.0-0') : '0' }}%
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold">{{ a.score }}/{{ a.total }} correct</div>
                <div class="opacity-60" style="font-size: 11px;">
                  {{ a.completed_at | date:'MMM d' }} · {{ (a.time_seconds / 60) | number:'1.0-0' }}m
                </div>
              </div>
            </li>
          </ul>
        </section>
        </div>
        <div style="height: 6.5rem;"></div>
      </div>
    </ion-content>

    <app-quiz-bottom-nav active="dashboard"></app-quiz-bottom-nav>
  `
})
export class DashboardPage implements OnInit {
  attempts = signal<Attempt[]>([]);
  loading = signal(true);

  get profile() { return this.profileService.profile; }

  totalCorrect = computed(() => this.attempts().reduce((s, a) => s + a.score, 0));
  totalAnswered = computed(() => this.attempts().reduce((s, a) => s + a.total, 0));
  accuracy = computed(() => {
    const ta = this.totalAnswered();
    return ta ? Math.round((this.totalCorrect() / ta) * 100) : 0;
  });
  timeSpentMinutes = computed(() =>
    Math.round(this.attempts().reduce((s, a) => s + a.time_seconds, 0) / 60)
  );
  sparklinePoints = computed(() => {
    const last7 = this.attempts().slice(0, 7).reverse();
    return last7.map((a, i) => {
      const x = (i / Math.max(last7.length - 1, 1)) * 100;
      const acc = a.total ? (a.score / a.total) * 100 : 0;
      const y = 100 - acc;
      return `${x},${y}`;
    }).join(' ');
  });

  badges = computed(() => {
    const p = this.profile();
    const attempts = this.attempts();
    const accuracy = this.accuracy();
    const totalQuizzes = attempts.length;
    const minutes = this.timeSpentMinutes();

    return [
      { id: 'first',   label: 'First Quiz',    earned: totalQuizzes >= 1,                iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>' },
      { id: 'streak3', label: '3-Day Streak',  earned: (p?.streak_days ?? 0) >= 3,       iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>' },
      { id: 'ace',     label: 'Sharp Shooter', earned: accuracy >= 80,                   iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>' },
      { id: 'ten',     label: '10 Quizzes',    earned: totalQuizzes >= 10,               iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>' },
      { id: 'scholar', label: 'Scholar',       earned: minutes >= 60,                   iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 14 5-3-5-3v6z M5 18V9.5L12 6l7 3.5V18"/></svg>' },
      { id: 'trend',   label: 'On Fire',       earned: (p?.streak_days ?? 0) >= 7,       iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
    ];
  });

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService,
    private profileService: ProfileService
  ) {}

  async ngOnInit() {
    this.loading.set(true);
    const user = this.auth.currentUser;
    if (!user) { this.loading.set(false); return; }
    const { data } = await this.supabase.client
      .from('quiz_attempts')
      .select('id, quiz_id, score, total, time_seconds, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(50);
    if (data) this.attempts.set(data);
    this.loading.set(false);
  }
}
