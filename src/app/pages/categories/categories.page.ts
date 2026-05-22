import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { QuizHeaderComponent } from '../../shared/components/quiz-header/quiz-header.component';
import { QuizBottomNavComponent } from '../../shared/components/quiz-bottom-nav/quiz-bottom-nav.component';
import { SupabaseService } from '../../core/services/supabase.service';

interface Category { id: string; slug: string; name: string; description: string | null; icon_key: string | null; }

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, QuizHeaderComponent, QuizBottomNavComponent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="true">
      <div style="width: 100%; max-width: 480px; margin: 0 auto; padding: 0 1.5rem 2rem;">

        <app-quiz-header title="Categories"></app-quiz-header>

        <!-- Search -->
        <div class="flex items-center gap-3 bg-surface rounded-2xl shadow-soft"
             style="margin-top: 1.5rem; padding: 0 1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            style="opacity: 0.4; flex-shrink: 0;">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input [(ngModel)]="searchQuery"
                 placeholder="Search topics…"
                 style="flex: 1; padding: 1rem 0; background: transparent; border: none; outline: none;
                        font-family: inherit; font-size: 1rem; color: var(--foreground);" />
        </div>

        <!-- Category grid -->
        <div class="grid grid-cols-2 gap-4" style="margin-top: 1.25rem;">
          <ng-container *ngFor="let cat of filtered()">
            <a [routerLink]="['/generate']"
               [queryParams]="{ topic: cat.name, count: 30, difficulty: 'Mixed', auto: 1 }"
               class="bg-surface rounded-card flex flex-col items-center text-center shadow-soft active:scale-97 transition-transform"
               style="padding: 1.25rem; text-decoration: none; color: inherit;">
              <div class="w-14 h-14 rounded-full bg-background flex items-center justify-center"
                   style="margin-bottom: 0.75rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  style="opacity: 0.8;">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                </svg>
              </div>
              <span class="font-bold text-sm">{{ cat.name }}</span>
              <span *ngIf="cat.description" class="text-xs opacity-60" style="margin-top: 0.25rem; line-height: 1.4;">{{ cat.description }}</span>
            </a>
          </ng-container>

          <!-- AI card — always shown -->
          <a routerLink="/generate"
             class="bg-foreground text-background rounded-card flex flex-col items-center text-center active:scale-97 transition-transform"
             style="padding: 1.25rem; text-decoration: none;">
            <div class="w-14 h-14 rounded-full bg-primary flex items-center justify-center"
                 style="margin-bottom: 0.75rem; color: var(--foreground);">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <span class="font-bold text-sm">AI Generate</span>
            <span class="text-xs opacity-70" style="margin-top: 0.25rem;">Any topic, instantly</span>
          </a>

          <p *ngIf="filtered().length === 0 && !loading()"
             class="text-sm opacity-60 text-center"
             style="grid-column: span 2; padding: 2rem 0;">
            No categories match "{{ searchQuery }}"
          </p>
        </div>

        <div style="height: 6.5rem;"></div>
      </div>
    </ion-content>

    <app-quiz-bottom-nav active="categories"></app-quiz-bottom-nav>
  `
})
export class CategoriesPage implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  searchQuery = '';

  filtered = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.categories();
    return this.categories().filter(c => c.name.toLowerCase().includes(q));
  });

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data } = await this.supabase.client.from('categories').select('*').order('sort_order');
    if (data) this.categories.set(data);
    this.loading.set(false);
  }
}
