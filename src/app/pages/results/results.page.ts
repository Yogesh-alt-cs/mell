import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { QuizSessionService } from '../../core/services/quiz-session.service';
import { AiQuizService } from '../../core/services/ai-quiz.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <!-- Confetti layer -->
      <div *ngIf="showConfetti()" class="fixed inset-0 overflow-hidden pointer-events-none" style="z-index: 40;">
        <span *ngFor="let p of confettiPieces; let i = index"
          class="absolute w-2 rounded-sm"
          style="height: 0.75rem; top: 0;"
          [style.left]="p.left + '%'"
          [style.background-color]="p.color"
          [style.animation]="'confettiFall ' + p.duration + 'ms ease-in ' + p.delay + 'ms forwards'"
          [style.transform]="'translateY(-20px) rotate(0deg)'">
        </span>
      </div>

      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 4rem 1.5rem 3rem;">
        <!-- Trophy -->
        <div class="text-center">
          <div class="mx-auto rounded-full bg-primary flex items-center justify-center shadow-soft-lg zoom-in"
               style="width: 6rem; height: 6rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/>
            </svg>
          </div>
          <div class="font-bold uppercase tracking-widest opacity-60" style="font-size: 11px; margin-top: 1.25rem;">Quiz Complete</div>
          <h1 class="font-bold" style="font-size: 1.875rem; margin-top: 0.25rem;">Nicely done!</h1>
          <p class="text-sm opacity-60" style="margin-top: 0.5rem; max-width: 20rem; margin-left: auto; margin-right: auto;">
            You earned {{ xp }} XP this session.
          </p>
        </div>

        <!-- Score card -->
        <div class="bg-surface rounded-card shadow-soft" style="margin-top: 2rem; padding: 1.5rem;">
          <div class="flex items-end justify-between">
            <div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">Score</div>
              <div class="font-bold tracking-tight" style="font-size: 3rem; line-height: 1.1;">{{ score }}/{{ total }}</div>
            </div>
            <div class="text-right">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">Accuracy</div>
              <div class="font-bold" style="font-size: 1.5rem;">{{ accuracy }}%</div>
            </div>
          </div>
          <div class="rounded-full bg-background overflow-hidden" style="margin-top: 1rem; height: 0.5rem;">
            <div class="h-full bg-primary rounded-full" [style.width]="accuracy + '%'" style="transition: width 1s ease;"></div>
          </div>
          <div class="grid grid-cols-3 gap-3" style="margin-top: 1.5rem;">
            <div class="rounded-2xl bg-background p-3 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="mx-auto opacity-60">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div class="mt-1 text-base font-bold">{{ timeFormatted }}</div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; font-weight: 700;">Time</div>
            </div>
            <div class="rounded-2xl bg-background p-3 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="mx-auto opacity-60">
                <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
              </svg>
              <div class="mt-1 text-base font-bold">{{ score }}</div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; font-weight: 700;">Correct</div>
            </div>
            <div class="rounded-2xl bg-background p-3 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="mx-auto opacity-60">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z"/>
              </svg>
              <div class="mt-1 text-base font-bold">+{{ xp }}</div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; font-weight: 700;">XP</div>
            </div>
          </div>
        </div>

        <!-- AI Regenerate CTA -->
        <button *ngIf="lastSession()" (click)="regenerate()" [disabled]="regenerating()"
          class="w-full rounded-card bg-foreground text-background shadow-soft-lg active:scale-99 transition-all relative overflow-hidden"
          style="margin-top: 1.5rem; padding: 1.25rem; text-align: left;"
          [style.opacity]="regenerating() ? '0.8' : '1'">
          <div class="absolute rounded-full" style="width: 6rem; height: 6rem; right: -1.5rem; top: -1.5rem; background: var(--primary); opacity: 0.3;"></div>
          <div class="relative flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center" style="color: var(--foreground); flex-shrink: 0;">
              <svg *ngIf="!regenerating()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              <svg *ngIf="regenerating()" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
            <div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7;">
                {{ regenerating() ? 'Generating fresh questions…' : 'AI Regenerate' }}
              </div>
              <div class="font-bold leading-tight">
                New {{ lastSession()?.count ?? 10 }} questions · {{ lastSession()?.topic }}
              </div>
            </div>
          </div>
        </button>

        <!-- Action grid -->
        <div class="grid grid-cols-2 gap-3" style="margin-top: 1rem;">
          <button (click)="downloadPdf()"
            class="rounded-2xl bg-surface shadow-soft inline-flex items-center justify-center gap-2 font-semibold active:scale-98 transition-transform"
            style="padding: 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            PDF
          </button>
          <a routerLink="/generate" class="rounded-2xl bg-surface shadow-soft inline-flex items-center justify-center gap-2 font-semibold active:scale-98 transition-transform"
            style="padding: 1rem; text-decoration: none; color: inherit;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5"/>
            </svg>
            New Topic
          </a>
          <a routerLink="/leaderboard" class="rounded-2xl bg-surface shadow-soft inline-flex items-center justify-center gap-2 font-semibold active:scale-98 transition-transform"
            style="padding: 1rem; text-decoration: none; color: inherit;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2z"/>
            </svg>
            Leaderboard
          </a>
          <a routerLink="/home" class="rounded-2xl bg-primary inline-flex items-center justify-center gap-2 font-semibold active:scale-98 transition-transform"
            style="padding: 1rem; text-decoration: none; color: inherit;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </a>
        </div>
      </div>
    </ion-content>
  `
})
export class ResultsPage implements OnInit {
  score = 0; total = 1; time = 0; xp = 0; accuracy = 0; timeFormatted = '0:00';
  showConfetti = signal(true);
  regenerating = signal(false);
  lastSession = () => this.sessionService.session();

  confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i % 10) * 80,
    duration: 1500 + (i % 5) * 250,
    color: ['#F6DBC0', '#A7F3D0', '#FDE2E2', '#DBEAFE', '#FDE68A'][i % 5]
  }));

  constructor(
    private route: ActivatedRoute,
    private sessionService: QuizSessionService,
    private aiQuiz: AiQuizService,
    private router: Router,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.score = +(params['score'] ?? 0); this.total = +(params['total'] ?? 1);
      this.time = +(params['time'] ?? 0); this.xp = +(params['xp'] ?? 0);
      this.accuracy = this.total ? Math.round((this.score / this.total) * 100) : 0;
      this.timeFormatted = `${Math.floor(this.time / 60)}:${String(this.time % 60).padStart(2, '0')}`;
    });
    setTimeout(() => this.showConfetti.set(false), 2200);
  }

  async regenerate() {
    const s = this.sessionService.session();
    if (!s || this.regenerating()) return;
    this.regenerating.set(true);
    const count = ([10, 30, 50].includes(s.count) ? s.count : 10) as 10 | 30 | 50;
    const result = await this.aiQuiz.generate({ topic: s.topic, count, difficulty: s.difficulty });
    this.regenerating.set(false);
    if (result.error || result.questions.length === 0) {
      const t = await this.toast.create({ message: result.error ?? 'No questions generated', duration: 3000, position: 'top', color: 'danger' });
      await t.present(); return;
    }
    this.sessionService.setSession({ ...s, questions: result.questions, createdAt: Date.now() });
    this.router.navigate(['/play']);
  }

  downloadPdf() {
    const session = this.sessionService.session();
    if (!session) { this.toast.create({ message: 'No quiz to download', duration: 2000, position: 'top', color: 'medium' }).then(t => t.present()); return; }
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(20); doc.text(`${session.topic} Quiz`, 20, 20);
      session.questions.forEach((q, i) => {
        const y = 40 + i * 40; if (y > 270) return;
        doc.setFontSize(11); doc.text(`${i + 1}. ${q.prompt}`, 20, y);
        q.options.forEach((opt, j) => { doc.setFontSize(10); doc.text(`  ${String.fromCharCode(65 + j)}. ${opt.label}`, 20, y + 8 + j * 7); });
      });
      doc.save(`${session.topic}-quiz.pdf`);
    });
  }
}
