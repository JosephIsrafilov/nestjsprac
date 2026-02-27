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
    <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={cn(
            'rounded-md px-2 py-1 text-xs font-semibold transition-colors',
            current === code
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-100'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
