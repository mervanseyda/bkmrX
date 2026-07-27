import { ImportClient } from './ImportClient';
import { getLocale } from '@/lib/getLocale';
import { getDict } from '@/lib/i18n';

export default async function ImportPage() {
  const locale = await getLocale();
  const dict = getDict(locale).import;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{dict.title}</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-2">{dict.desc}</p>
      </div>

      <ImportClient dict={dict} />
      
    </div>
  );
}
