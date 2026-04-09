import pl from './pl.json';
import en from './en.json';
import type { Language } from '../core/types';

const translations: Record<Language, Record<string, string>> = { pl, en };

export function t(key: string, lang: Language = 'pl'): string {
  return translations[lang]?.[key] ?? key;
}

export { pl, en };
