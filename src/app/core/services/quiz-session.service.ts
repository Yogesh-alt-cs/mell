import { Injectable, signal } from '@angular/core';

export interface AIQuestion {
  prompt: string;
  options: Array<{ id: string; label: string }>;
  correct_id: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizSession {
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  count: 10 | 30 | 50;
  timed: boolean;
  sound: boolean;
  questions: AIQuestion[];
  createdAt: number;
}

export interface QuizResult {
  topic: string;
  difficulty: string;
  questions: AIQuestion[];
  score: number;
  total: number;
  time: number;
}

@Injectable({ providedIn: 'root' })
export class QuizSessionService {
  private _session = signal<QuizSession | null>(null);
  private _result = signal<QuizResult | null>(null);

  session = this._session.asReadonly();
  result = this._result.asReadonly();

  setSession(session: QuizSession): void {
    this._session.set(session);
  }

  clearSession(): void {
    this._session.set(null);
  }

  setResult(result: QuizResult): void {
    this._result.set(result);
  }

  clearResult(): void {
    this._result.set(null);
  }
}
