import { useTranslation } from '@/hooks/useTranslation';
import { UserProfile } from '@/types/auth';

interface UseUserProfileManagementProps {
  user: UserProfile | null;
  onUpdate: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  onDelete: (uid: string, name: string) => Promise<void>;
  onClose: () => void;
}

export function useUserProfileManagement({
  user,
  onUpdate,
  onDelete,
  onClose
}: UseUserProfileManagementProps) {
  const { t } = useTranslation();

  const handleEditName = async () => {
    if (!user) return;
    const newName = prompt(t('admin.modal.actions.edit_name'), user.displayName || '');
    if (newName && newName !== user.displayName) {
      await onUpdate(user.uid, { displayName: newName });
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    await onUpdate(user.uid, { disabled: !user.disabled });
  };

  const handleChangeRole = async (newRole: string) => {
    if (!user) return;
    if (confirm(t('admin.modal.actions.change_role', newRole))) {
      await onUpdate(user.uid, { role: newRole as 'user' | 'admin' });
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (confirm(t('admin.users.delete.confirm', user.displayName || 'User'))) {
      await onDelete(user.uid, user.displayName || 'User');
      onClose();
    }
  };

  return {
    handleEditName,
    handleToggleStatus,
    handleChangeRole,
    handleDeleteUser
  };
}
