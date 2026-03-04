import { memo, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
  CheckCheck,
  Moon,
  Sun,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth.store';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { getInitialTheme, setTheme, type ThemeMode } from '../../lib/theme';

export const Sidebar = memo(() => {
  const { user, logout, isAdmin } = useAuthStore();
  const { t } = useTranslation();
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  const navItems = useMemo(
    () => [
      { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
      { to: '/projects', label: t('nav.projects'), icon: FolderKanban },
      { to: '/tasks', label: t('nav.tasks'), icon: CheckSquare },
    ],
    [t],
  );

  const adminItems = useMemo(
    () => [{ to: '/users', label: t('nav.users'), icon: Users }],
    [t],
  );

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setThemeState(nextTheme);
  };

  return (
    <aside className="relative z-20 flex h-screen w-20 shrink-0 flex-col border-r border-slate-800/80 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 sm:w-72">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-10 h-44 w-44 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute bottom-20 -left-8 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative flex items-center gap-3 border-b border-slate-800 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-600/30">
          <CheckCheck className="h-5 w-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-base font-semibold tracking-tight">TaskManager</p>
          <p className="text-xs text-slate-400">Team workspace</p>
        </div>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-1.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:justify-start',
                  isActive
                    ? 'bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </div>

        {isAdmin() && (
          <>
            <div className="hidden sm:block px-2 pb-2 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t('nav.admin')}
              </p>
            </div>
            <div className="space-y-1.5">
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:justify-start',
                      isActive
                        ? 'bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-900/40'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="relative space-y-3 border-t border-slate-800 px-4 py-4">
        <div className="hidden sm:block"><LanguageSwitcher /></div>

        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-center sm:justify-start gap-3 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="hidden sm:inline">{theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}</span>
        </button>

        <div className="hidden sm:flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/65 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-100">{user?.name}</p>
            <p className="truncate text-xs capitalize text-slate-400">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800/70 hover:text-slate-100 sm:justify-start"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t('nav.signOut')}</span>
        </button>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
