import { memo, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { getUsers, createUser } from '../services/api.service';
import { useAuthStore } from '../store/auth.store';
import { getRoleOptions } from '../lib/constants';
import { extractErrorMessage, formatDate } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import type { UserRole } from '../types';

export function UsersPage() {
  const { isAdmin } = useAuthStore();

  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  return <UsersContent />;
}

const UsersContent = memo(() => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');

  const roleOptions = useMemo(() => getRoleOptions(t), [t]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => createUser({ name, email, password, role }),
    onSuccess: () => {
      toast.success(t('users.created'));
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('member');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to create user.'));
    },
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('users.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('users.count', { count: users?.length ?? 0 })}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('users.addMember')}
        </Button>
      </div>

      {users?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-4">
          <Users className="h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-500">{t('users.noUsersYet')}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('users.colMember')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('users.colRole')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-500">
                    {t('users.colJoined')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users?.map((user) => {
                  const isAdmin = user.role === 'admin';
                  const roleIcon = isAdmin ? (
                    <Shield className="h-3.5 w-3.5 text-blue-600" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-slate-400" />
                  );
                  const roleClass = isAdmin ? 'text-blue-700 font-medium' : 'text-slate-600';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {roleIcon}
                          <span className={roleClass}>{t(`roles.${user.role}`)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{formatDate(user.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('users.modalTitle')}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
          className="space-y-4"
        >
          <Input
            label={t('users.nameLabel')}
            placeholder={t('users.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label={t('users.emailLabel')}
            type="email"
            placeholder={t('users.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('users.passwordLabel')}
            type="password"
            placeholder={t('users.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Select
            label={t('users.roleLabel')}
            options={roleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              {t('users.cancel')}
            </Button>
            <Button type="submit" loading={isPending}>
              {t('users.addMember')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
});

UsersContent.displayName = 'UsersContent';
