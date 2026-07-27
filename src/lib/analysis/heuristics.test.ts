import { expect, test, describe } from 'vitest';
import { detectContentType, calculateUsefulnessScore } from './heuristics';

describe('Heuristics', () => {
  test('detects github links', () => {
    expect(detectContentType('check this out', 'https://github.com/user/repo')).toBe('github');
  });

  test('detects videos', () => {
    expect(detectContentType('new video', 'https://youtube.com/watch?v=123')).toBe('video');
  });

  test('calculates usefulness score correctly', () => {
    const bookmark1 = {
      url: 'https://github.com/facebook/react',
      text: 'A great tutorial on how to use React components effectively in Next.js',
    };
    const result1 = calculateUsefulnessScore(bookmark1);
    
    // Base 50 + 20 (GitHub) + 15 (tutorial) = 85
    expect(result1.score).toBe(85);
    expect(result1.reasons.length).toBe(2);

    const bookmark2 = {
      url: 'https://giveaway.com',
      text: 'FREE GIVEAWAY! RT and follow to win a new phone. Ends in 24 hours limited time',
    };
    const result2 = calculateUsefulnessScore(bookmark2);
    
    // Base 50 - 30 (giveaway) - 20 (limited time) = 0
    expect(result2.score).toBe(0);
  });
});
