import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import path from 'path';

// Migrate using the local drizzle directory
migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
console.log('Migrations applied successfully!');
