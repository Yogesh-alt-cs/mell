import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { QuizHeaderComponent } from '../../shared/components/quiz-header/quiz-header.component';
import { QuizBottomNavComponent } from '../../shared/components/quiz-bottom-nav/quiz-bottom-nav.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { ProfileService } from '../../core/services/profile.service';

interface Category { id: string; slug: string; name: string; icon_key: string; count?: number; }
interface DailyQuiz { id: string; title: string; }
interface RecentAttempt { quiz_id: string; score: number; total: number; time_seconds: number; }

const ICON_PATHS: Record<string, string> = {
  atom:    'M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z',
  globe:   'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0v20M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  code:    'M16 18l6-6-6-6M8 6l-6 6 6 6',
  palette: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z',
  music:   'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  book:    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  brain:   'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z',
  trophy:  'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  default: 'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'
};
function iconPathFor(key: string | null | undefined) { return ICON_PATHS[key ?? 'default'] ?? ICON_PATHS['default']; }

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, QuizHeaderComponent, QuizBottomNavComponent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width:100%;max-width:480px;margin:0 auto;padding:0 1.25rem 2rem;">

        <!-- Header -->
        <app-quiz-header class="animate-slide-down"></app-quiz-header>

        <!-- ── HERO DAILY QUIZ CARD ── -->
        <a [routerLink]="dailyQuiz() ? ['/quiz', dailyQuiz()!.id] : ['/home']"
           class="block rounded-card shadow-soft-lg card-interactive animate-slide-up"
           style="text-decoration:none;color:inherit;margin-top:1.25rem;position:relative;overflow:hidden;
                  background:linear-gradient(135deg,#F6DBC0 0%,#eeC49A 100%);padding:1.75rem 1.5rem 1.5rem;">

          <!-- Decorative orbs -->
          <div class="absolute rounded-full animate-float-slow"
               style="width:7rem;height:7rem;right:-1.5rem;top:-2rem;background:rgba(255,255,255,0.25);"></div>
          <div class="absolute rounded-full animate-float"
               style="width:4rem;height:4rem;right:3rem;top:-1rem;background:rgba(255,255,255,0.15);animation-delay:1.2s;"></div>
          <div class="absolute rounded-full"
               style="width:5rem;height:5rem;right:-0.5rem;bottom:-2.5rem;background:rgba(74,68,61,0.06);"></div>

          <div style="position:relative;">
            <!-- Tag -->
            <div class="inline-flex items-center gap-1 rounded-full backdrop-blur"
                 style="background:rgba(255,255,255,0.55);padding:0.3rem 0.85rem;
                        font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              Daily Quiz
            </div>

            <!-- Title -->
            <h2 class="font-bold leading-tight"
                style="font-size:1.6rem;max-width:13rem;margin-top:0.875rem;letter-spacing:-0.02em;">
              {{ dailyQuiz()?.title ?? 'Stretch your brain in 5 minutes' }}
            </h2>

            <!-- Subtitle -->
            <p class="opacity-70" style="font-size:0.8rem;margin-top:0.375rem;">
              10 questions &middot; 3 lives &middot; earn 250 XP
            </p>

            <!-- CTA -->
            <div class="inline-flex items-center gap-2 bg-foreground text-background rounded-2xl"
                 style="margin-top:1.25rem;padding:0.7rem 1.25rem;font-size:0.875rem;font-weight:700;
                        box-shadow:0 8px 24px -8px rgba(74,68,61,0.4);">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start now
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </a>

        <!-- ── STATS GRID ── -->
        <div class="grid grid-cols-3 gap-3 animate-slide-up stagger-1" style="margin-top:1rem;">
          <!-- Streak -->
          <div class="bg-surface rounded-2xl shadow-soft text-center"
               style="padding:0.875rem 0.5rem;">
            <div class="gradient-icon mx-auto" style="width:2.5rem;height:2.5rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </div>
            <div class="font-bold" style="font-size:1.3rem;margin-top:0.5rem;letter-spacing:-0.02em;">
              {{ profile()?.streak_days ?? 0 }}d
            </div>
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.5;font-weight:700;margin-top:0.15rem;">
              Streak
            </div>
          </div>

          <!-- XP -->
          <div class="bg-surface rounded-2xl shadow-soft text-center"
               style="padding:0.875rem 0.5rem;">
            <div class="gradient-icon mx-auto" style="width:2.5rem;height:2.5rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <div class="font-bold" style="font-size:1.3rem;margin-top:0.5rem;letter-spacing:-0.02em;">
              {{ profile()?.xp ?? 0 }}
            </div>
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.5;font-weight:700;margin-top:0.15rem;">
              XP
            </div>
          </div>

          <!-- Level -->
          <div class="bg-surface rounded-2xl shadow-soft text-center"
               style="padding:0.875rem 0.5rem;">
            <div class="gradient-icon mx-auto" style="width:2.5rem;height:2.5rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/>
              </svg>
            </div>
            <div class="font-bold" style="font-size:1.3rem;margin-top:0.5rem;letter-spacing:-0.02em;">
              {{ profile()?.level ?? 1 }}
            </div>
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.5;font-weight:700;margin-top:0.15rem;">
              Level
            </div>
            <!-- XP progress bar -->
            <div class="xp-bar" style="margin-top:0.5rem;">
              <div class="xp-fill" [style.width]="xpProgress + '%'"></div>
            </div>
          </div>
        </div>

        <!-- ── AI GENERATE BANNER ── -->
        <a routerLink="/generate"
           class="block rounded-card shadow-soft-lg card-interactive animate-slide-up stagger-2"
           style="margin-top:1rem;padding:1.25rem 1.25rem;text-decoration:none;
                  background:var(--foreground);color:var(--background);">
          <div class="flex items-center justify-between gap-3">
            <div style="flex:1;min-width:0;">
              <div class="inline-flex items-center gap-1 rounded-full"
                   style="background:rgba(255,255,255,0.12);padding:0.25rem 0.7rem;
                          font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
                AI Powered
              </div>
              <h3 class="font-bold leading-tight"
                  style="font-size:1.1rem;margin-top:0.5rem;letter-spacing:-0.02em;">
                Generate a quiz on anything
              </h3>
              <p style="font-size:0.75rem;opacity:0.6;margin-top:0.2rem;">
                Pick a topic &middot; 10 / 30 / 50 questions
              </p>
            </div>
            <div class="gradient-icon animate-float"
                 style="width:3rem;height:3rem;flex-shrink:0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="var(--foreground)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
          </div>
        </a>

        <!-- ── CONTINUE PLAYING ── (shown only when there's a recent attempt) -->
        <ng-container *ngIf="recentAttempt() && dailyQuiz()">
          <div class="section-header animate-slide-up stagger-3" style="margin-top:1.5rem;">
            <h3>Continue playing</h3>
          </div>
          <a [routerLink]="['/quiz', dailyQuiz()!.id]"
             class="flex items-center gap-4 bg-surface rounded-2xl shadow-soft card-interactive animate-slide-up stagger-4"
             style="margin-top:0.75rem;padding:1rem 1.25rem;text-decoration:none;color:inherit;">
            <div class="gradient-icon" style="width:3rem;height:3rem;flex-shrink:0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div style="flex:1;min-width:0;">
              <div class="font-bold truncate" style="font-size:0.875rem;">{{ dailyQuiz()?.title }}</div>
              <div style="font-size:0.75rem;opacity:0.55;margin-top:0.15rem;">
                Last score: {{ recentAttempt()?.score }}/{{ recentAttempt()?.total }}
                &middot; {{ recentAccuracy() }}% accuracy
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              style="opacity:0.3;flex-shrink:0;">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </a>
        </ng-container>

        <!-- ── CATEGORIES ── -->
        <div class="section-header animate-slide-up stagger-3" style="margin-top:1.75rem;">
          <h3>Categories</h3>
          <a routerLink="/categories" class="see-all" style="text-decoration:none;">See all</a>
        </div>
        <p style="font-size:0.75rem;opacity:0.5;margin-top:0.2rem;" class="animate-slide-up stagger-3">
          Pick a topic, start playing
        </p>

        <!-- Skeleton loaders -->
        <ng-container *ngIf="loading() && categories().length === 0">
          <div class="grid grid-cols-2 gap-3" style="margin-top:0.875rem;">
            <div *ngFor="let s of [1,2,3,4]" class="skeleton" style="height:9rem;"></div>
          </div>
        </ng-container>

        <!-- Category grid -->
        <div class="grid grid-cols-2 gap-3" style="margin-top:0.875rem;"
             *ngIf="!loading() || categories().length > 0">
          <ng-container *ngFor="let cat of categories(); let i = index">
            <a [routerLink]="['/generate']"
               [queryParams]="{ topic: cat.name, count: 30, difficulty: 'Mixed', auto: 1 }"
               class="bg-surface rounded-card shadow-soft card-interactive animate-slide-up"
               [class]="'stagger-' + ((i % 6) + 3)"
               style="text-decoration:none;color:inherit;padding:1.25rem;
                      display:flex;flex-direction:column;align-items:center;text-align:center;
                      border:1px solid rgba(255,255,255,0.8);">

              <!-- Icon container -->
              <div class="gradient-icon" style="width:3.5rem;height:3.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                  fill="none" stroke="var(--foreground)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="iconPathFor(cat.icon_key)" />
                </svg>
              </div>

              <span class="font-bold" style="font-size:0.875rem;margin-top:0.75rem;letter-spacing:-0.01em;">
                {{ cat.name }}
              </span>

              <!-- Count badge -->
              <span *ngIf="cat.count !== undefined"
                    style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;
                           opacity:0.45;margin-top:0.2rem;">
                {{ cat.count }} quiz{{ cat.count !== 1 ? 'zes' : '' }}
              </span>
            </a>
          </ng-container>
        </div>

        <!-- Bottom padding for floating nav -->
        <div style="height:7rem;"></div>
      </div>
    </ion-content>

    <!-- Fixed bottom nav -->
    <app-quiz-bottom-nav active="home"></app-quiz-bottom-nav>
  `
})
export class HomePage implements OnInit {
  categories = signal<Category[]>([]);
  dailyQuiz  = signal<DailyQuiz | null>(null);
  recentAttempt = signal<RecentAttempt | null>(null);
  loading = signal(true);

  get profile() { return this.profileService.profile; }

  get xpProgress(): number {
    const xp = this.profileService.profile()?.xp ?? 0;
    const lvl = this.profileService.profile()?.level ?? 1;
    const base = (lvl - 1) * 100;
    const next = lvl * 100;
    return Math.min(Math.round(((xp - base) / (next - base)) * 100), 100);
  }

  get recentAccuracy(): () => number {
    return () => {
      const a = this.recentAttempt();
      if (!a || !a.total) return 0;
      return Math.round((a.score / a.total) * 100);
    };
  }

  constructor(
    private supabase: SupabaseService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  iconPathFor = iconPathFor;

  ngOnInit() { this.loadData(); }

  async loadData() {
    this.loading.set(true);
    const userId = (await this.supabase.client.auth.getUser()).data.user?.id;

    const [catRes, quizRes, attemptRes] = await Promise.all([
      this.supabase.client
        .from('categories')
        .select('id, slug, name, icon_key')
        .order('sort_order'),
      this.supabase.client
        .from('quizzes')
        .select('id, title')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      userId
        ? this.supabase.client
            .from('quiz_attempts')
            .select('quiz_id, score, total, time_seconds')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null })
    ]);

    if (catRes.data) {
      // Load quiz counts per category
      const cats = catRes.data as Category[];
      this.categories.set(cats);
      // Load counts in background
      this.loadCategoryCounts(cats);
    }
    if (quizRes.data) this.dailyQuiz.set(quizRes.data as DailyQuiz);
    if (attemptRes.data) this.recentAttempt.set(attemptRes.data as RecentAttempt);
    this.loading.set(false);
  }

  async loadCategoryCounts(cats: Category[]) {
    const updated = await Promise.all(
      cats.map(async (cat) => {
        const { count } = await this.supabase.client
          .from('quizzes')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', cat.id);
        return { ...cat, count: count ?? 0 };
      })
    );
    this.categories.set(updated);
  }
}
