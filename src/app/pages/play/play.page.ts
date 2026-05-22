import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { QuizHeaderComponent } from '../../shared/components/quiz-header/quiz-header.component';
import { QuizSessionService, AIQuestion } from '../../core/services/quiz-session.service';
import { QuizFxService } from '../../core/services/quiz-fx.service';

const PER_QUESTION = 30;

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, QuizHeaderComponent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 3rem;">

        <!-- Loading -->
        <ng-container *ngIf="!session()">
          <app-quiz-header [showBack]="true"></app-quiz-header>
          <div class="flex items-center justify-center" style="min-height: 60vh;">
            <div class="w-10 h-10 rounded-full animate-spin"
                 style="border: 4px solid var(--primary); border-top-color: transparent;"></div>
          </div>
        </ng-container>

        <!-- Play UI -->
        <ng-container *ngIf="session() && currentQuestion()">
          <app-quiz-header [showBack]="true" [title]="session()!.topic"></app-quiz-header>

          <!-- HUD -->
          <div class="flex items-center justify-between" style="margin-top: 1rem;">
            <div class="flex items-center gap-1 bg-surface rounded-full shadow-soft"
                 style="padding: 0.375rem 0.75rem;">
              <ng-container *ngFor="let i of [0, 1, 2]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  stroke-linecap="round" stroke-linejoin="round"
                  [attr.fill]="i < lives() ? 'var(--destructive)' : 'none'"
                  [attr.stroke]="i < lives() ? 'var(--destructive)' : 'rgba(74,68,61,0.2)'"
                  stroke-width="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </ng-container>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="toggleSound()"
                class="w-9 h-9 rounded-full bg-surface flex items-center justify-center shadow-soft">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <ng-container *ngIf="soundOn()">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </ng-container>
                  <ng-container *ngIf="!soundOn()">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                  </ng-container>
                </svg>
              </button>
              <button (click)="togglePause()"
                class="w-9 h-9 rounded-full bg-surface flex items-center justify-center shadow-soft">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <ng-container *ngIf="paused()">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </ng-container>
                  <ng-container *ngIf="!paused()">
                    <rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/>
                  </ng-container>
                </svg>
              </button>
            </div>
          </div>

          <!-- Timer + Progress -->
          <div class="flex items-center gap-4" style="margin-top: 1.25rem;">
            <div *ngIf="session()!.timed" class="relative shrink-0" style="width: 4rem; height: 4rem;">
              <svg viewBox="0 0 36 36" style="width: 4rem; height: 4rem; transform: rotate(-90deg);">
                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--surface)" stroke-width="3"/>
                <circle cx="18" cy="18" r="16" fill="none"
                  [attr.stroke]="secs() <= 5 ? 'var(--destructive)' : 'var(--foreground)'"
                  stroke-width="3" stroke-linecap="round"
                  [attr.stroke-dasharray]="circumference"
                  [attr.stroke-dashoffset]="dashOffset()"
                  style="transition: stroke-dashoffset 0.7s linear, stroke 0.3s;"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center font-bold text-sm"
                   [class.animate-pulse]="secs() <= 5"
                   [style.color]="secs() <= 5 ? 'var(--destructive)' : 'inherit'">
                {{ secs() }}
              </div>
            </div>
            <div style="flex: 1;">
              <div class="flex justify-between font-bold uppercase tracking-widest opacity-60" style="font-size: 11px;">
                <span>Q {{ currentIdx() + 1 }} / {{ totalQuestions() }}</span>
                <span>Score {{ score() }}{{ streak() > 1 ? ' · 🔥 ' + streak() : '' }}</span>
              </div>
              <div class="rounded-full bg-surface overflow-hidden" style="margin-top: 0.5rem; height: 0.5rem;">
                <div class="h-full bg-primary rounded-full transition-all" [style.width]="progress() + '%'"></div>
              </div>
            </div>
          </div>

          <!-- Question card -->
          <div class="bg-surface rounded-card shadow-soft" style="margin-top: 1.5rem; padding: 1.5rem;">
            <h2 class="font-bold leading-snug" style="font-size: 1.25rem;">{{ currentQuestion()?.prompt }}</h2>
          </div>

          <!-- Options -->
          <div class="space-y-3" style="margin-top: 1.25rem;">
            <button *ngFor="let opt of currentOptions(); let i = index"
              (click)="onPick(opt.id)"
              [disabled]="revealed() || paused()"
              class="w-full text-left flex items-center gap-4 rounded-2xl transition-all active:scale-99"
              style="padding: 1rem 1.25rem; border: 2px solid transparent;"
              [style.background]="optionBg(opt.id)"
              [style.border-color]="optionBorder(opt.id)">
              <span class="w-9 h-9 rounded-xl bg-background flex items-center justify-center text-sm font-bold"
                    style="flex-shrink: 0;">{{ letters[i] }}</span>
              <span class="font-semibold">{{ opt.label }}</span>
            </button>
          </div>

          <!-- Explanation -->
          <div *ngIf="revealed() && currentQuestion()?.explanation"
               class="rounded-2xl bg-surface shadow-soft animate-in fade-in"
               style="margin-top: 1rem; padding: 1rem;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">Explanation</div>
            <p class="mt-1" style="font-size: 0.875rem;">{{ currentQuestion()?.explanation }}</p>
          </div>

          <!-- Paused overlay -->
          <div *ngIf="paused()"
               class="rounded-2xl bg-surface shadow-soft flex items-center justify-between"
               style="margin-top: 1.5rem; padding: 1rem;">
            <span class="font-semibold text-sm">Paused</span>
            <a routerLink="/home" class="font-bold uppercase tracking-widest opacity-60"
               style="font-size: 12px; text-decoration: none; color: inherit;">Exit</a>
          </div>
        </ng-container>
      </div>
    </ion-content>
  `
})
export class PlayPage implements OnInit, OnDestroy {
  private timer: ReturnType<typeof setInterval> | null = null;
  readonly circumference = 2 * Math.PI * 16;
  readonly letters = ['A', 'B', 'C', 'D'];

  currentIdx = signal(0);
  score = signal(0);
  streak = signal(0);
  lives = signal(3);
  picked = signal<string | null>(null);
  revealed = signal(false);
  paused = signal(false);
  soundOn = signal(true);
  secs = signal(PER_QUESTION);
  private startedAt = Date.now();

  session = () => this.sessionService.session();
  currentQuestion = computed((): AIQuestion | undefined => this.session()?.questions[this.currentIdx()]);
  currentOptions = computed(() => this.currentQuestion()?.options ?? []);
  totalQuestions = computed(() => this.session()?.questions.length ?? 0);
  progress = computed(() => ((this.currentIdx() + 1) / Math.max(this.totalQuestions(), 1)) * 100);
  dashOffset = computed(() => this.circumference * (1 - this.secs() / PER_QUESTION));

  constructor(private sessionService: QuizSessionService, private fx: QuizFxService, private router: Router) {}

  ngOnInit() {
    const s = this.sessionService.session();
    if (!s) { this.router.navigate(['/generate']); return; }
    this.soundOn.set(s.sound);
    if (s.timed) this.startTimer();
  }
  ngOnDestroy() { this.stopTimer(); }

  private startTimer() {
    this.stopTimer();
    this.secs.set(PER_QUESTION);
    this.timer = setInterval(() => {
      const s = this.secs();
      if (s <= 5) this.fx.tick(this.soundOn());
      if (s <= 1) { this.stopTimer(); this.handleTimeout(); return; }
      this.secs.update(v => v - 1);
    }, 1000);
  }
  private stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  toggleSound() { this.soundOn.update(v => !v); }
  togglePause() {
    this.paused.update(v => !v);
    if (!this.paused() && this.session()?.timed && !this.revealed()) this.startTimer();
    else this.stopTimer();
  }

  optionBg(id: string) {
    if (this.revealed() && id === this.currentQuestion()?.correct_id) return 'var(--success)';
    if (this.revealed() && this.picked() === id && id !== this.currentQuestion()?.correct_id) return 'var(--warning)';
    if (this.picked() === id) return 'var(--primary)';
    return 'var(--surface)';
  }
  optionBorder(id: string) {
    if (this.revealed() && id === this.currentQuestion()?.correct_id) return 'var(--success)';
    if (this.revealed() && this.picked() === id && id !== this.currentQuestion()?.correct_id) return 'rgba(192,82,74,0.4)';
    return 'transparent';
  }

  handleTimeout() {
    if (this.revealed()) return;
    this.revealed.set(true); this.fx.wrong(this.soundOn());
    const newLives = this.lives() - 1; this.lives.set(newLives); this.streak.set(0);
    setTimeout(() => this.advance(this.score(), newLives), 1100);
  }

  onPick(id: string) {
    if (this.revealed() || this.paused() || !this.currentQuestion()) return;
    this.stopTimer(); this.picked.set(id); this.revealed.set(true);
    if (id === this.currentQuestion()!.correct_id) {
      const newScore = this.score() + 1; this.score.set(newScore); this.streak.update(v => v + 1); this.fx.correct(this.soundOn());
      setTimeout(() => this.advance(newScore, this.lives()), 900);
    } else {
      const newLives = this.lives() - 1; this.lives.set(newLives); this.streak.set(0); this.fx.wrong(this.soundOn());
      setTimeout(() => this.advance(this.score(), newLives), 1100);
    }
  }

  private advance(finalScore: number, remainingLives: number) {
    if (remainingLives <= 0 || this.currentIdx() + 1 >= this.totalQuestions()) { this.finish(finalScore); }
    else { this.currentIdx.update(i => i + 1); this.picked.set(null); this.revealed.set(false); if (this.session()?.timed) this.startTimer(); }
  }

  private finish(finalScore: number) {
    this.fx.complete(this.soundOn());
    const time = Math.round((Date.now() - this.startedAt) / 1000);
    this.sessionService.setResult({ topic: this.session()!.topic, difficulty: this.session()!.difficulty, questions: this.session()!.questions, score: finalScore, total: this.totalQuestions(), time });
    this.router.navigate(['/results'], { queryParams: { score: finalScore, total: this.totalQuestions(), time, xp: finalScore * 30 } });
  }
}
