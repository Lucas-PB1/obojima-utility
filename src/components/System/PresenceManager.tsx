"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { socialService } from '@/services/socialService';
import { useSettingsContext } from '@/contexts/SettingsContext';

export function PresenceManager() {
  const { isInitialized } = useSettingsContext();
  const pathname = usePathname();

  useEffect(() => {
    socialService.updateHeartbeat();

    const interval = setInterval(() => {
      socialService.updateHeartbeat();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
