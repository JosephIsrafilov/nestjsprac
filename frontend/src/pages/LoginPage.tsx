import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CheckCheck } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-600/45">
            <CheckCheck className="h-9 w-9 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">{t("login.title")}</h1>
            <p className="mt-2 text-sm text-slate-300/80">{t("login.subtitle")}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-300/20 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="email">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input h-11 w-full rounded-xl border border-indigo-200/25 bg-slate-800/75 px-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
                placeholder={t("login.emailPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="password">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input h-11 w-full rounded-xl border border-indigo-200/25 bg-slate-800/75 px-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
                placeholder={t("login.passwordPlaceholder")}
              />
            </div>

            <Button type="submit" loading={loading} className="mt-6 h-11 w-full">
              {t("login.submit")}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-indigo-300/20 bg-slate-900/65 p-4">
            <p className="text-center text-xs text-slate-400">{t("login.defaultCredentials")}</p>
            <p className="mt-1 text-center text-xs font-mono text-slate-300">admin@example.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
