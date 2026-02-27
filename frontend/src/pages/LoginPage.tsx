import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AUTH_TOKEN_KEY } from '../lib/constants';
import { login, getMe } from '../services/api.service';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/Button';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { extractErrorMessage } from '../lib/utils';

export function LoginPage() {
  const { token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
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
      toast.success(t('login.welcome', { name: user.name }));
      navigate('/dashboard');
    } catch (err: unknown) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      toast.error(extractErrorMessage(err, t('login.error')));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/40">
            <CheckCheck className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{t('login.title')}</h1>
            <p className="mt-1 text-sm text-slate-400">{t('login.subtitle')}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">{t('login.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={t('login.emailPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">{t('login.password')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={t('login.passwordPlaceholder')}
              />
            </div>
            <Button type="submit" loading={loading} className="w-full h-10">
              {t('login.submit')}
            </Button>
          </form>

          <div className="mt-5 rounded-lg bg-white/5 border border-white/10 p-3">
            <p className="text-xs text-slate-500 text-center">{t('login.defaultCredentials')}</p>
            <p className="mt-0.5 text-xs text-center text-slate-400">
              admin@example.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
