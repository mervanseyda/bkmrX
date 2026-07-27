import { db } from './index';
import { authors, categories, bookmarks, tags, bookmarkTags } from './schema';

const MOCK_AUTHORS = [
  { username: 'vercel', name: 'Vercel', topics: JSON.stringify(['Next.js', 'Frontend', 'Cloud']) },
  { username: 'rauchg', name: 'Guillermo Rauch', topics: JSON.stringify(['Engineering', 'Startups']) },
  { username: 'leeerob', name: 'Lee Robinson', topics: JSON.stringify(['Next.js', 'React', 'Education']) },
  { username: 'shadcn', name: 'shadcn', topics: JSON.stringify(['UI', 'Design', 'React']) },
  { username: 'kentcdodds', name: 'Kent C. Dodds', topics: JSON.stringify(['React', 'Testing']) },
  { username: 't3dotgg', name: 'Theo', topics: JSON.stringify(['Web Dev', 'Opinions']) },
  { username: 'dan_abramov', name: 'Dan Abramov', topics: JSON.stringify(['React', 'JavaScript']) },
  { username: 'rich_harris', name: 'Rich Harris', topics: JSON.stringify(['Svelte', 'Frontend']) },
  { username: 'fireship_dev', name: 'Fireship', topics: JSON.stringify(['Coding', 'Tutorials']) },
  { username: 'github', name: 'GitHub', topics: JSON.stringify(['Open Source', 'Git']) },
];

const MOCK_CATEGORIES = [
  { id: crypto.randomUUID(), name: 'Yazılım Geliştirme', slug: 'yazilim-gelistirme', description: 'Yazılım, kodlama ve programlama.', isSystem: true },
  { id: crypto.randomUUID(), name: 'Yapay Zeka', slug: 'yapay-zeka', description: 'AI, Machine Learning, LLMs.', isSystem: true },
  { id: crypto.randomUUID(), name: 'Tasarım', slug: 'tasarim', description: 'UI/UX ve grafik tasarım.', isSystem: true },
  { id: crypto.randomUUID(), name: 'Ürünler ve Araçlar', slug: 'urunler-araclar', description: 'Yeni çıkan ürünler ve faydalı araçlar.', isSystem: true },
  { id: crypto.randomUUID(), name: 'İş ve Girişimcilik', slug: 'is-girisimcilik', description: 'Startuplar ve iş dünyası.', isSystem: true },
  { id: crypto.randomUUID(), name: 'Eğitim ve Rehberler', slug: 'egitim-rehberler', description: 'Nasıl yapılır ve tutorial içerikleri.', isSystem: true },
  { id: crypto.randomUUID(), name: 'Makale ve Okumalar', slug: 'makale-okumalar', description: 'Uzun okumalar, blog yazıları.', isSystem: true },
  { id: crypto.randomUUID(), name: 'Videolar ve Podcastler', slug: 'videolar-podcastler', description: 'Multimedya içerikleri.', isSystem: true },
  { id: crypto.randomUUID(), name: 'Haberler ve Gündem', slug: 'haberler-gundem', description: 'Güncel olaylar.', isSystem: true },
];

const MOCK_TAGS = ['react', 'nextjs', 'typescript', 'css', 'ui', 'ai', 'tool', 'github', 'tutorial', 'giveaway', 'news', 'opinion'];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function main() {
  console.log('Seeding veritabanı başlıyor...');

  // 1. Yazarları Ekle
  for (const author of MOCK_AUTHORS) {
    await db.insert(authors).values(author).onConflictDoNothing();
  }

  // 2. Kategorileri Ekle
  for (const category of MOCK_CATEGORIES) {
    await db.insert(categories).values(category).onConflictDoNothing();
  }

  // 3. Etiketleri Ekle
  const dbTags = MOCK_TAGS.map(name => ({ id: crypto.randomUUID(), name }));
  for (const tag of dbTags) {
    await db.insert(tags).values(tag).onConflictDoNothing();
  }

  // 4. Yer İşaretleri (Bookmarks) Üret ve Ekle
  const now = new Date();
  const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());

  const sampleTweets = [
    { text: 'We just released Next.js 15! Check out the new features.', type: 'article', score: 85, url: 'https://nextjs.org/blog/next-15' },
    { text: 'Here is a deep dive into React Server Components.', type: 'thread', score: 90, url: 'https://react.dev/blog' },
    { text: 'Check out this awesome new UI library I built.', type: 'tool', score: 75, url: 'https://ui.shadcn.com' },
    { text: 'FREE GIVEAWAY! RT and follow to win a MacBook Pro. Ends in 24 hours!', type: 'short', score: 10, url: 'https://twitter.com/giveaway/status/123' },
    { text: 'I just open-sourced my new project on GitHub.', type: 'github', score: 95, url: 'https://github.com/user/project' },
    { text: 'Just had a great coffee today.', type: 'short', score: 5, url: 'https://twitter.com/user/status/456' },
    { text: 'Complete tutorial on building an AI app with Gemini.', type: 'video', score: 88, url: 'https://youtube.com/watch?v=123' },
    { text: 'Reminder: The early bird discount for my course ends TONIGHT.', type: 'short', score: 15, url: 'https://course.dev' },
    { text: 'How to center a div in CSS - a definitive guide.', type: 'article', score: 80, url: 'https://css-tricks.com/centering-css-complete-guide/' },
    { text: 'My thoughts on the current state of web development...', type: 'thread', score: 65, url: 'https://x.com/opinion/status/789' },
  ];

  for (let i = 0; i < 90; i++) {
    const author = randomItem(MOCK_AUTHORS);
    const category = randomItem(MOCK_CATEGORIES);
    const template = randomItem(sampleTweets);
    
    // Simulate duplicates and expired content
    const isDuplicate = i % 15 === 0;
    const isExpired = i % 20 === 0 || template.text.includes('Ends in') || template.text.includes('discount');
    
    let url = isDuplicate ? 'https://github.com/facebook/react' : `${template.url}?v=${i}`;
    if (isDuplicate && i % 2 === 0) url = 'https://nextjs.org/docs'; // specific duplicates

    const postDate = randomDate(threeYearsAgo, now);
    const bookmarkedDate = new Date(postDate.getTime() + randomInt(1, 100) * 86400000); // bookmarked 1-100 days after post
    
    const bookmarkId = crypto.randomUUID();

    await db.insert(bookmarks).values({
      id: bookmarkId,
      tweetId: `100000${i}`,
      url: url,
      text: `${template.text} (ID: ${i})`,
      authorName: author.name,
      authorUsername: author.username,
      postDate: postDate,
      importedDate: now,
      bookmarkedDate: bookmarkedDate,
      year: postDate.getFullYear(),
      language: 'en',
      contentType: template.type,
      status: 'unreviewed',
      usefulnessScore: isExpired ? randomInt(0, 20) : template.score + randomInt(-10, 10),
      confidenceScore: randomInt(50, 100),
      outdatedFlag: isExpired,
      duplicateFlag: isDuplicate,
      categoryId: category.id,
    });

    // Rastgele etiket ekle
    const tagCount = randomInt(1, 3);
    const shuffledTags = [...dbTags].sort(() => 0.5 - Math.random());
    for (let j = 0; j < tagCount; j++) {
      await db.insert(bookmarkTags).values({
        bookmarkId: bookmarkId,
        tagId: shuffledTags[j].id,
      }).onConflictDoNothing();
    }
  }

  console.log('Seed işlemi tamamlandı! 90 yer işareti eklendi.');
}

main().catch(console.error);
