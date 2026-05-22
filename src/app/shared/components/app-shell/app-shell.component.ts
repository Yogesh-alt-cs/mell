import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * AppShellComponent — a simple max-width centering container.
 * Scroll is handled by the parent ion-content, NOT this component.
 * No overflow, no height constraints — just centering.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-center-full" style="width: 100%; max-width: 480px; margin: 0 auto;">
      <ng-content></ng-content>
    </div>
  `
})
export class AppShellComponent {}
