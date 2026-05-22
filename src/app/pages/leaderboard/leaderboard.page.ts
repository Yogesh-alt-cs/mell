import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { QuizHeaderComponent } from '../../shared/components/quiz-header/quiz-header.component';
import { QuizBottomNavComponent } from '../../shared/components/quiz-bottom-nav/quiz-bottom-nav.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService } from '../../core/services/auth.service';
import { initialsFor } from '../../core/services/profile.service';

interface LeaderboardRow { id: string; username: string | null; display_name: string | null; xp: number; level: number; }

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, QuizHeaderComponent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 3rem;">
        <app-quiz-header title="Leaderboard"></app-quiz-header>

        <!-- Podium top-3 -->
        <div class="grid grid-cols-3 gap-3 items-end" style="margin-top: 1rem;" *ngIf="top3().length >= 1">
          <ng-container *ngFor="let item of podiumOrder(); let i = index">
            <div class="flex flex-col items-center">
              <div class="relative">
                <div class="rounded-full flex items-center justify-center font-bold text-base"
                     style="width: 4rem; height: 4rem;"
                     [style.background]="item.place === 1 ? 'var(--primary)' : 'var(--secondary)'">
                  {{ initialsFor(item.name) }}
                </div>
                <ng-container *ngIf="item.place === 1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                    fill="var(--primary)" stroke="var(--foreground)" stroke-width="1.5"
                    style="position: absolute; top: -1rem; left: 50%; transform: translateX(-50%);">
                    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                  </svg>
                </ng-container>
              </div>
              <div class="mt-2 text-sm font-bold truncate" style="max-width: 100%;">{{ item.name }}</div>
              <div class="opacity-60" style="font-size: 11px;">{{ item.xp }} XP</div>
              <div class="w-full rounded-t-2xl flex items-start justify-center pt-2 font-bold"
                   [class]="podiumHeights[i]"
                   [style.background]="item.place === 1 ? 'var(--primary)' : 'var(--surface)'"
                   [style.box-shadow]="item.place !== 1 ? 'var(--shadow-soft)' : 'none'"
                   style="margin-top: 0.5rem;">
                #{{ item.place }}
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Ranked list -->
        <div class="space-y-2" style="margin-top: 1.5rem;">
          <div *ngFor="let row of rest(); let i = index"
               class="flex items-center gap-4 rounded-2xl"
               style="padding: 0.75rem 1rem;"
               [style.background]="row.id === currentUserId() ? 'var(--primary)' : 'var(--surface)'"
               [style.box-shadow]="row.id !== currentUserId() ? 'var(--shadow-soft)' : 'none'">
            <div class="w-8 text-center font-bold text-sm">{{ i + 4 }}</div>
            <div class="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-xs">
              {{ initialsFor(row.display_name || row.username) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold truncate">
                {{ row.display_name || row.username || 'Anon' }}
                <span *ngIf="row.id === currentUserId()"> (You)</span>
              </div>
              <div class="opacity-60" style="font-size: 11px;">{{ row.xp }} XP · Lv {{ row.level }}</div>
            </div>
          </div>
          <p *ngIf="rows().length === 0" class="text-center text-sm opacity-60" style="padding: 2rem 0;">
            No players yet — be the first!
          </p>
        </div>
      </div>
    </ion-content>
  `
})
export class LeaderboardPage implements OnInit {
  rows = signal<LeaderboardRow[]>([]);
  top3 = signal<LeaderboardRow[]>([]);
  rest = signal<LeaderboardRow[]>([]);
  podiumOrder = signal<Array<{ name: string; xp: number; place: number; id: string }>>([]);
  podiumHeights = ['h-24', 'h-32', 'h-20'];
  currentUserId = signal<string>('');
  initialsFor = initialsFor;

  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  async ngOnInit() {
    this.currentUserId.set(this.auth.currentUser?.id ?? '');
    const { data } = await this.supabase.client.from('profiles').select('id, username, display_name, xp, level').order('xp', { ascending: false }).limit(50);
    if (data) {
      const rows = data as LeaderboardRow[];
      this.rows.set(rows);
      const top3 = rows.slice(0, 3); const rest = rows.slice(3);
      this.top3.set(top3); this.rest.set(rest);
      const podium = [top3[1], top3[0], top3[2]].filter(Boolean).map((p, i) => ({
        id: p.id, name: p.display_name || p.username || 'Anon', xp: p.xp,
        place: i === 0 ? 2 : i === 1 ? 1 : 3
      }));
      this.podiumOrder.set(podium);
    }
  }
}
