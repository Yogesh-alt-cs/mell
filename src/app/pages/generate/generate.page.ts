import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { QuizHeaderComponent } from '../../shared/components/quiz-header/quiz-header.component';
import { QuizBottomNavComponent } from '../../shared/components/quiz-bottom-nav/quiz-bottom-nav.component';
import { AiQuizService } from '../../core/services/ai-quiz.service';
import { QuizSessionService } from '../../core/services/quiz-session.service';
import { Router, ActivatedRoute } from '@angular/router';

const COUNTS = [10, 30, 50] as const;
const DIFFS = ['Easy', 'Medium', 'Hard', 'Mixed'] as const;
type Count = typeof COUNTS[number];
type Difficulty = typeof DIFFS[number];

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, QuizHeaderComponent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 3rem;">

        <!-- Loading screen -->
        <ng-container *ngIf="generating()">
          <div class="flex flex-col items-center justify-center text-center"
               style="min-height: 100vh; padding: 2rem;">
            <div class="relative" style="width: 7rem; height: 7rem;">
              <div class="absolute inset-0 rounded-full bg-primary animate-ping" style="opacity: 0.6;"></div>
              <div class="relative w-28 h-28 rounded-full bg-primary flex items-center justify-center shadow-soft-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" class="animate-pulse">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              </div>
            </div>
            <h2 class="font-bold" style="font-size: 1.5rem; margin-top: 2rem;">Crafting your quiz…</h2>
            <p class="text-sm opacity-60" style="margin-top: 0.5rem; max-width: 20rem;">
              {{ selectedCount }} fresh AI questions on <strong>{{ topic }}</strong>. This usually takes a few seconds.
            </p>
            <div class="flex gap-1 items-center" style="margin-top: 1.5rem;">
              <span class="w-2 h-2 rounded-full bg-foreground animate-bounce" style="animation-delay: 0ms;"></span>
              <span class="w-2 h-2 rounded-full bg-foreground animate-bounce" style="animation-delay: 150ms;"></span>
              <span class="w-2 h-2 rounded-full bg-foreground animate-bounce" style="animation-delay: 300ms;"></span>
            </div>
          </div>
        </ng-container>

        <!-- Form -->
        <ng-container *ngIf="!generating()">
          <app-quiz-header [showBack]="true" title="AI Generator"></app-quiz-header>

          <!-- Hero card -->
          <div class="rounded-card bg-primary shadow-soft relative overflow-hidden" style="padding: 1.5rem; margin-top: 1.5rem;">
            <div class="absolute rounded-full"
                 style="width: 10rem; height: 10rem; right: -2rem; top: -2rem; background: var(--secondary); opacity: 0.6;"></div>
            <div class="relative">
              <div class="inline-flex items-center gap-1 rounded-full px-3 py-1 backdrop-blur"
                   style="background: rgba(255,255,255,0.7); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
                AI Powered
              </div>
              <h2 class="font-bold leading-tight" style="font-size: 1.5rem; margin-top: 0.75rem;">Create a fresh quiz on anything</h2>
              <p class="text-sm opacity-70" style="margin-top: 0.25rem;">Different questions every time.</p>
            </div>
          </div>

          <!-- Topic input -->
          <div style="margin-top: 1.5rem;">
            <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; display: block;">Topic</label>
            <input [(ngModel)]="topic" [maxlength]="200"
                   placeholder="e.g. Renaissance art, async JavaScript, Studio Ghibli films"
                   class="w-full bg-surface rounded-2xl shadow-soft font-medium"
                   style="margin-top: 0.5rem; padding: 1rem 1.25rem; outline: none; border: none;" />
          </div>

          <!-- Question count -->
          <div style="margin-top: 1.5rem;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">Questions</div>
            <div class="grid grid-cols-3 gap-3" style="margin-top: 0.5rem;">
              <button *ngFor="let c of counts" (click)="selectedCount = c"
                class="rounded-2xl py-4 font-bold shadow-soft transition-all active:scale-95"
                [style.background]="selectedCount === c ? 'var(--foreground)' : 'var(--surface)'"
                [style.color]="selectedCount === c ? 'var(--background)' : 'var(--foreground)'">
                {{ c }}
              </button>
            </div>
          </div>

          <!-- Difficulty -->
          <div style="margin-top: 1.5rem;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">Difficulty</div>
            <div class="grid grid-cols-4 gap-2" style="margin-top: 0.5rem;">
              <button *ngFor="let d of diffs" (click)="selectedDiff = d"
                class="rounded-2xl py-3 text-sm font-semibold shadow-soft transition-all active:scale-95"
                [style.background]="selectedDiff === d ? 'var(--primary)' : 'var(--surface)'">
                {{ d }}
              </button>
            </div>
          </div>

          <!-- Toggles -->
          <div class="grid grid-cols-2 gap-3" style="margin-top: 1.5rem;">
            <button (click)="timed = !timed"
              class="rounded-2xl shadow-soft flex items-center justify-between font-semibold text-sm"
              style="padding: 0.75rem 1rem;"
              [style.background]="timed ? 'var(--primary)' : 'var(--surface)'">
              <span>30s Timer</span>
              <span class="rounded-full" style="width: 2.5rem; height: 1.5rem; padding: 0.125rem; transition: background 0.2s;"
                    [style.background]="timed ? 'var(--foreground)' : 'rgba(74,68,61,0.2)'">
                <span class="block rounded-full" style="width: 1.25rem; height: 1.25rem; background: var(--background); transition: transform 0.2s;"
                      [style.transform]="timed ? 'translateX(1rem)' : 'translateX(0)'"></span>
              </span>
            </button>
            <button (click)="sound = !sound"
              class="rounded-2xl shadow-soft flex items-center justify-between font-semibold text-sm"
              style="padding: 0.75rem 1rem;"
              [style.background]="sound ? 'var(--primary)' : 'var(--surface)'">
              <span>Sound FX</span>
              <span class="rounded-full" style="width: 2.5rem; height: 1.5rem; padding: 0.125rem; transition: background 0.2s;"
                    [style.background]="sound ? 'var(--foreground)' : 'rgba(74,68,61,0.2)'">
                <span class="block rounded-full" style="width: 1.25rem; height: 1.25rem; background: var(--background); transition: transform 0.2s;"
                      [style.transform]="sound ? 'translateX(1rem)' : 'translateX(0)'"></span>
              </span>
            </button>
          </div>

          <!-- Generate button -->
          <button [disabled]="!canGenerate()" (click)="generate()"
            class="w-full rounded-2xl bg-foreground text-background font-bold inline-flex items-center justify-center gap-2 transition-transform active:scale-99"
            style="margin-top: 2rem; padding: 1rem; font-size: 1rem;"
            [style.opacity]="canGenerate() ? '1' : '0.5'">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M12.2 6.2 11 5M12.2 11.8 11 13M16 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M21 21l-4.3-4.3 M4 17H2M9 17H7M4 21v-4"/>
            </svg>
            Generate Quiz
          </button>
        </ng-container>

      </div>
    </ion-content>
  `
})
export class GeneratePage implements OnInit {
  topic = '';
  selectedCount: Count = 10;
  selectedDiff: Difficulty = 'Mixed';
  timed = true;
  sound = true;
  generating = signal(false);

  counts = COUNTS;
  diffs = DIFFS;

  canGenerate = () => !this.generating() && this.topic.trim().length >= 2;

  constructor(
    private aiQuiz: AiQuizService,
    private session: QuizSessionService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['topic']) this.topic = params['topic'];
      if (params['count'] && [10, 30, 50].includes(+params['count'])) this.selectedCount = +params['count'] as Count;
      if (params['difficulty'] && DIFFS.includes(params['difficulty'])) this.selectedDiff = params['difficulty'] as Difficulty;
      if (params['auto'] && params['topic'] && !this.generating()) this.generate();
    });
  }

  async generate() {
    if (!this.canGenerate()) return;
    this.generating.set(true);
    const result = await this.aiQuiz.generate({ topic: this.topic.trim(), count: this.selectedCount, difficulty: this.selectedDiff });
    this.generating.set(false);
    if (result.error || result.questions.length === 0) {
      const t = await this.toast.create({ message: result.error ?? 'No questions generated', duration: 3000, position: 'top', color: 'danger' });
      await t.present(); return;
    }
    this.session.setSession({ topic: this.topic.trim(), difficulty: this.selectedDiff, count: this.selectedCount, timed: this.timed, sound: this.sound, questions: result.questions, createdAt: Date.now() });
    this.router.navigate(['/play']);
  }
}
