import { UserProfile, UserRole } from '@/types/auth';
import { Column } from '@/components/ui/DataTable/types';
import { useTranslation } from '@/hooks/useTranslation';

interface UseUserTableColumnsProps {
  onUpdate: (uid: string, updates: Partial<UserProfile>) => void;
  onDelete: (uid: string, name: string) => void;
}

export function useUserTableColumns({ onUpdate, onDelete }: UseUserTableColumnsProps) {
  const { t } = useTranslation();

  const columns: Column<UserProfile>[] = [
    {
      key: 'photoURL',
      label: '',
      sortable: false,
      width: '50px',
      render: (val) => (
        <div className="w-8 h-8 rounded-full bg-totoro-gray/10 overflow-hidden">
          {val ? (
            <img src={val as string} alt="Avatar" className="w-full h-full object-cover" />
          ) : null}
        </div>
      )
    },
    {
      key: 'displayName',
      label: t('admin.users.col.name'),
      sortable: true,
      render: (val) =>
        val ? (
          String(val)
        ) : (
          <span className="text-foreground/40 italic">{t('admin.users.noName')}</span>
        )
    },
    {
      key: 'email',
      label: t('admin.users.col.email'),
      sortable: true,
      render: (val) =>
        val ? (
          String(val)
        ) : (
          <span className="text-foreground/40 italic">{t('admin.users.noEmail')}</span>
        )
    },
    {
      key: 'role',
      label: t('admin.users.col.role'),
      sortable: true,
      render: (val, item) => (
        <select
          value={val as string}
          onChange={(e) => {
            const newRole = e.target.value as UserRole;
            if (
              confirm(
                t(
                  'admin.users.role.change.confirm',
                  item.displayName || t('admin.users.fallbackName'),
                  newRole
                )
              )
            ) {
              onUpdate(item.uid, { role: newRole });
            }
          }}
          className={`px-2 py-1 rounded text-xs font-bold border-none outline-none cursor-pointer
            ${val === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}
          `}
        >
          <option value="user">{t('admin.users.role.user')}</option>
          <option value="admin">{t('admin.users.role.admin')}</option>
        </select>
      )
    },
    {
      key: 'lastLogin',
      label: t('admin.users.col.lastLogin'),
      sortable: true,
      render: (val) => (val ? new Date(val as string).toLocaleDateString() : '-')
    },
    {
      key: 'isAuthActive',
      label: t('admin.users.col.status'),
      sortable: true,
      render: (val, item) => (
        <div className="flex flex-col gap-1">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block text-center ${
              val === false ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'
            }`}
          >
            {val === false ? t('admin.users.status.orphaned') : t('admin.users.status.active')}
          </span>
          {item.disabled && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600 text-center">
              {t('admin.users.status.disabled')}
            </span>
          )}
        </div>
      )
    },

  ];

  return columns;
}
