import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SquareTerminal } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AUTH_TOKEN_KEY } from "../lib/constants";
import { login, getMe } from "../services/api.service";
import { useAuthStore } from "../store/auth.store";
import { Button } from "../components/ui/Button";
import { LanguageSwitcher } from "../components/ui/LanguageSwitcher";
import { extractErrorMessage } from "../lib/utils";

export function LoginPage() {
  const { token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { access_token } = await login(email, password);
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);
      const user = await getMe();
      setAuth(user, access_token);
      toast.success(t("login.welcome", { name: user.name }));
      navigate("/dashboard");
    } catch (err: unknown) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      toast.error(extractErrorMessage(err, t("login.error")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex md:h-screen items-center justify-center bg-[var(--bg-app)]">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[400px] p-6">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)] text-white shadow-sm mb-5">
            <SquareTerminal className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl tracking-tight font-bold text-[var(--text-primary)]">
            {t("login.title")}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {t("login.subtitle")}
          </p>
        </div>

        <div className="glass-panel rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--text-secondary)]" htmlFor="email">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
                placeholder={t("login.emailPlaceholder")}
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-semibold text-[var(--text-secondary)]" htmlFor="password">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
                placeholder={t("login.passwordPlaceholder")}
              />
            </div>

            <Button type="submit" loading={loading} className="mt-2 h-10 w-full bg-[var(--accent)] hover:bg-blue-700 text-white rounded-md font-semibold font-sans">
              {t("login.submit")}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-[var(--surface-soft)] p-4 border border-[var(--border)]">
            <p className="text-center text-[13px] text-[var(--text-muted)]">{t("login.defaultCredentials")}</p>
            <p className="mt-1 text-center text-[13px] font-mono font-medium text-[var(--text-secondary)]">admin@example.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
