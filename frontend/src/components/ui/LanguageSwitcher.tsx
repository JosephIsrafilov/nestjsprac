import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "de", label: "DE" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2);

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-1">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            current === code
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/50"
              : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
