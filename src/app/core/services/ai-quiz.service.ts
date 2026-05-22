import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { AIQuestion } from './quiz-session.service';

export interface AIQuizInput {
  topic: string;
  count: 10 | 30 | 50;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
}

export interface AIQuizResult {
  questions: AIQuestion[];
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AiQuizService {
  async generate(input: AIQuizInput): Promise<AIQuizResult> {
    const apiKey = environment.lovableApiKey;
    if (!apiKey) {
      return { questions: [], error: 'AI is not configured. Add a LOVABLE_API_KEY to environment.ts' };
    }

    const seed = Math.random().toString(36).slice(2, 10);
    const system =
      'You are a quiz designer. Create original, factually-accurate multiple-choice questions. ' +
      'Vary phrasing, sub-topics, and angles. Return ONLY via the provided tool. ' +
      "Each question has exactly 4 options with ids 'a','b','c','d'. " +
      'correct_id must match one option id. ' +
      'Keep prompts under 220 chars and explanations under 240 chars.';

    const userMsg =
      `Topic: ${input.topic}\n` +
      `Difficulty: ${input.difficulty}${input.difficulty === 'Mixed' ? ' (mix Easy/Medium/Hard roughly evenly)' : ''}\n` +
      `Count: ${input.count}\n` +
      `Variation seed: ${seed} (use this to ensure questions differ from prior generations)\n` +
      `Return ${input.count} unique questions.`;

    try {
      const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: userMsg },
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'return_quiz',
              description: 'Return generated quiz questions.',
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        prompt: { type: 'string' },
                        options: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
                              label: { type: 'string' },
                            },
                            required: ['id', 'label'],
                          },
                          minItems: 4,
                          maxItems: 4,
                        },
                        correct_id: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
                        explanation: { type: 'string' },
                        difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
                      },
                      required: ['prompt', 'options', 'correct_id', 'explanation', 'difficulty'],
                    },
                  },
                },
                required: ['questions'],
              },
            },
          }],
          tool_choice: { type: 'function', function: { name: 'return_quiz' } },
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { questions: [], error: 'Rate limit reached. Try again shortly.' };
        if (res.status === 402) return { questions: [], error: 'AI credits exhausted.' };
        return { questions: [], error: 'AI generation failed.' };
      }

      const json = await res.json();
      const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) return { questions: [], error: 'AI returned no questions.' };

      const parsed = JSON.parse(args);
      const questions: AIQuestion[] = parsed.questions ?? [];
      if (!questions.length) return { questions: [], error: 'AI returned no questions.' };

      // Shuffle questions and options
      const shuffled = questions
        .map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) }))
        .sort(() => Math.random() - 0.5);

      return { questions: shuffled, error: null };
    } catch (e) {
      console.error('AiQuizService.generate failed', e);
      return { questions: [], error: 'AI request failed.' };
    }
  }
}
