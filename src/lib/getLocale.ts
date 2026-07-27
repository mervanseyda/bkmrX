import { cookies } from 'next/headers';
import { Locale } from './i18n';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value as Locale;
  return locale === 'tr' ? 'tr' : 'en';
}
