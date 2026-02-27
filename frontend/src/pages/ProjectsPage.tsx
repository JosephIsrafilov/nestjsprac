import { memo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getProjects, createProject } from '../services/api.service';
import { extractErrorMessage } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import { formatDate } from '../lib/utils';

export const ProjectsPage = memo(() => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => createProject({ name, description }),
    onSuccess: () => {
      toast.success(t('projects.created'));
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setOpen(false);
      setName('');
      setDescription('');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to create project.'));
    },
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('projects.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('projects.count', { count: projects?.length ?? 0 })}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('projects.newProject')}
        </Button>
      </div>

      {projects?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <FolderKanban className="h-12 w-12 text-slate-300" />
          <div>
            <p className="text-sm font-medium text-slate-600">{t('projects.noProjectsTitle')}</p>
            <p className="text-xs text-slate-400">{t('projects.noProjectsHint')}</p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('projects.createProject')}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects?.map((project) => (
            <Card
              key={project.id}
              className="p-6 hover:shadow-md transition-shadow cursor-default"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <FolderKanban className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs text-slate-400">#{project.id}</span>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-slate-900 text-sm">{project.name}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {project.description || t('projects.noDescription')}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(project.createdAt)}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('projects.modalTitle')}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
          className="space-y-4"
        >
          <Input
            label={t('projects.nameLabel')}
            placeholder={t('projects.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">{t('projects.descLabel')}</label>
            <textarea
              rows={3}
              placeholder={t('projects.descPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              {t('projects.cancel')}
            </Button>
            <Button type="submit" loading={isPending} disabled={!name.trim()}>
              {t('projects.createProject')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
});

ProjectsPage.displayName = 'ProjectsPage';
