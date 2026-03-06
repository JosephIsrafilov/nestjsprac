import { memo, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
  SquareTerminal,
  Moon,
  Sun,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/auth.store";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { getInitialTheme, setTheme, type ThemeMode } from "../../lib/theme";

export const Sidebar = memo(() => {
  const { user, logout, isAdmin } = useAuthStore();
  const { t } = useTranslation();
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  const navItems = useMemo(
    () => [
      { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
      { to: "/projects", label: t("nav.projects"), icon: FolderKanban },
      { to: "/tasks", label: t("nav.tasks"), icon: CheckSquare },
    ],
    [t],
  );

  const adminItems = useMemo(
    () => [{ to: "/users", label: t("nav.users"), icon: Users }],
    [t],
  );

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setThemeState(nextTheme);
  };

  return (
    <aside className="flex h-screen w-20 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] sm:w-72">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-5 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white shadow-sm">
          <SquareTerminal className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div className="hidden sm:block">
          <p className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            TaskManager
          </p>
          <p className="text-xs text-[var(--text-faint)]">Team workspace</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors sm:justify-start",
                  isActive
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]",
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                {t("nav.admin")}
              </p>
            </div>
            <div className="space-y-1.5">
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors sm:justify-start",
                      isActive
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]",
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

      <div className="space-y-3 border-t border-[var(--border)] px-3 py-4">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] sm:justify-start"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {user?.name}
            </p>
            <p className="truncate text-xs capitalize text-[var(--text-faint)]">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] sm:justify-start"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t("nav.signOut")}</span>
        </button>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
