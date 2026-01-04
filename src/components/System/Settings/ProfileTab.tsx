import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { authService } from '@/services/authService';
import { socialService } from '@/services/socialService';
import { User } from 'lucide-react';

interface ProfileTabProps {
  onClose: () => void;
}

export function ProfileTab({ onClose }: ProfileTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch true public data on mount
  useEffect(() => {
    async function loadPublicData() {
      if (user?.uid) {
        const publicData = await socialService.getPublicProfile(user.uid);
        if (publicData) {
          if (publicData.displayName) setDisplayName(publicData.displayName);
          if (publicData.photoURL) setPhotoURL(publicData.photoURL);
        }
      }
    }
    loadPublicData();
  }, [user?.uid]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (displayName !== user.displayName || photoURL !== user.photoURL) {
         await authService.updateProfile(displayName, photoURL);
      }
      if (newPassword && newPassword === confirmPassword) {
         await authService.updatePassword(newPassword);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
       {/* Profile Header */}
       <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-totoro-blue/10 to-transparent rounded-2xl border border-totoro-blue/20">
          <div className="w-20 h-20 rounded-full bg-white shadow-lg overflow-hidden mb-3 border-4 border-white/50">
              {(() => {
                const currentSrc = photoURL || user?.photoURL;
                let isValid = false;
                try {
                  if (currentSrc) {
                    new URL(currentSrc);
                    isValid = true;
                  }
                } catch {}
                
                return isValid && currentSrc ? (
                  <Image 
                    src={currentSrc} 
                    alt="Avatar" 
                    width={80} 
                    height={80} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-totoro-blue/20 text-totoro-blue text-2xl">
                    <User className="w-10 h-10" />
                  </div>
                );
              })()}
          </div>
          <h3 className="font-bold text-lg text-totoro-gray">{user?.displayName || 'User'}</h3>
          <p className="text-sm text-totoro-gray/60">{user?.email}</p>
       </div>

       <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-totoro-gray uppercase tracking-wider">{t('settings.profile.info')}</h4>
            <Input
              label={t('settings.profile.displayName')}
              value={displayName}
              onChange={(val) => setDisplayName(String(val))}
            />
            <Input
              label={t('settings.profile.photoURL')}
              value={photoURL}
              onChange={(val) => setPhotoURL(String(val))}
              placeholder="https://..."
            />
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-totoro-gray uppercase tracking-wider">{t('settings.profile.security')}</h4>
            <Input
              type="password"
              label={t('settings.profile.newPassword')}
              value={newPassword}
              onChange={(val) => setNewPassword(String(val))}
            />
            <Input
              type="password"
              label={t('settings.profile.confirmPassword')}
              value={confirmPassword}
              onChange={(val) => setConfirmPassword(String(val))}
            />
          </div>
       </div>
       
       <div className="flex justify-end pt-4">
         <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
           {saving ? t('common.saving') : t('settings.profile.save')}
         </Button>
       </div>
    </div>
  );
}
