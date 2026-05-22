// Sound + haptic feedback helpers using Web Audio API (no asset files needed).
// Direct port of quiz-fx.ts from the React codebase.
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class QuizFxService {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    return this.ctx;
  }

  private tone(freq: number, duration = 0.18, type: OscillatorType = 'sine', gain = 0.12): void {
    const c = this.getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g).connect(c.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.stop(c.currentTime + duration + 0.02);
  }

  correct(enabled = true): void {
    if (!enabled) return;
    this.tone(660, 0.12, 'sine');
    setTimeout(() => this.tone(880, 0.18, 'sine'), 90);
    this.vibrate(20);
  }

  wrong(enabled = true): void {
    if (!enabled) return;
    this.tone(220, 0.22, 'sawtooth', 0.08);
    this.vibrate([30, 40, 30]);
  }

  tick(enabled = true): void {
    if (!enabled) return;
    this.tone(1200, 0.04, 'square', 0.04);
  }

  complete(enabled = true): void {
    if (!enabled) return;
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.18), i * 110));
    this.vibrate([40, 50, 40]);
  }

  vibrate(pattern: number | number[]): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch { /* no-op */ }
    }
  }
}
