import { ParsedBookmark } from '../import/types';

export function detectContentType(text: string, url: string): string {
  const lowerText = text.toLowerCase();
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo')) {
    return 'video';
  }
  if (lowerUrl.includes('github.com')) {
    return 'github';
  }
  if (lowerText.includes('thread') || lowerText.includes('👇')) {
    return 'thread';
  }
  if (lowerText.includes('tool') || lowerText.includes('library') || lowerUrl.includes('.io') || lowerUrl.includes('.dev')) {
    return 'tool';
  }
  if (text.length > 200 || lowerUrl.includes('blog') || lowerUrl.includes('article') || lowerUrl.includes('medium.com')) {
    return 'article';
  }
  if (text.length < 50 && !url) {
    return 'short';
  }
  return 'short';
}

export function calculateUsefulnessScore(bookmark: ParsedBookmark): { score: number, reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];
  const text = bookmark.text?.toLowerCase() || '';

  if (bookmark.url && bookmark.url.includes('github.com')) {
    score += 20;
    reasons.push('GitHub bağlantısı içeriyor (+20)');
  }
  if (text.length > 200) {
    score += 10;
    reasons.push('Uzun metin/Açıklama içeriyor (+10)');
  }
  if (text.includes('tutorial') || text.includes('how to') || text.includes('guide') || text.includes('rehber') || text.includes('nasıl')) {
    score += 15;
    reasons.push('Eğitim veya rehber niteliğinde (+15)');
  }

  // Negative signals
  if (text.includes('giveaway') || text.includes('çekiliş') || text.includes('win') || text.includes('rt and follow')) {
    score -= 30;
    reasons.push('Çekiliş veya kampanya şüphesi (-30)');
  }
  if (text.includes('discount') || text.includes('indirim') || text.includes('ends in') || text.includes('limited time')) {
    score -= 20;
    reasons.push('Süreli teklif veya indirim şüphesi (-20)');
  }
  if (!bookmark.url) {
    score -= 10;
    reasons.push('Herhangi bir dış bağlantı yok (-10)');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons
  };
}
