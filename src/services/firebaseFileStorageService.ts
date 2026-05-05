import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { isDevMode } from '@/features/dev-mode';

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

class FirebaseFileStorageService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getAvatarExtension(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && /^[a-z0-9]+$/.test(extension)) return extension;

    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/webp') return 'webp';
    if (file.type === 'image/gif') return 'gif';
    return 'jpg';
  }

  validateAvatarFile(file: File): string | null {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return 'settings.account.profile.upload.validation.type';
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      return 'settings.account.profile.upload.validation.size';
    }

    return null;
  }

  async uploadUserAvatar(userId: string, file: File): Promise<string> {
    if (!this.isClient()) {
      throw new Error('Upload só pode ser feito no cliente');
    }

    const validationKey = this.validateAvatarFile(file);
    if (validationKey) {
      throw new Error(validationKey);
    }

    if (isDevMode()) {
      return URL.createObjectURL(file);
    }

    const extension = this.getAvatarExtension(file);
    const avatarRef = ref(storage, `users/${userId}/avatars/profile.${extension}`);

    await uploadBytes(avatarRef, file, {
      contentType: file.type,
      customMetadata: {
        owner: userId
      }
    });

    return getDownloadURL(avatarRef);
  }
}

export const firebaseFileStorageService = new FirebaseFileStorageService();
