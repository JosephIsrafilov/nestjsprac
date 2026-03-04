import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'de', label: 'DE' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2);

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/75 p-1 sm:border-slate-600 sm:bg-slate-800/65">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={cn(
            'rounded-lg px-2 py-1 text-xs font-semibold transition-colors',
            current === code
              ? 'bg-linear-to-r from-blue-600 to-cyan-500 text-white'
              : 'text-slate-300 hover:text-slate-100',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
