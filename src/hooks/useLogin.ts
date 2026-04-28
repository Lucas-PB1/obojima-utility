'use client';
import { db } from '@/config/firebase';
import { UserUtils } from '@/lib/userUtils';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { useTranslation } from '@/hooks/useTranslation';

export function useLogin() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(email, password);
        router.push('/');
      } else {
        if (password !== confirmPassword) {
          setError(t('auth.validation.passwordMismatch'));
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError(t('auth.validation.passwordMinLength'));
          setLoading(false);
          return;
        }

        const cred = await authService.register(email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email: email,
          displayName: UserUtils.getFallbackName(email),
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });

        router.push('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao autenticar';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await authService.loginWithGoogle();
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.google.error');
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t('auth.reset.emailRequired'));
      return;
    }

    setLoading(true);

    try {
      await authService.sendPasswordReset(trimmedEmail);
      setSuccessMessage(t('auth.reset.sent'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.reset.error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    successMessage,
    handleSubmit,
    handleGoogleLogin,
    handlePasswordReset,
    toggleMode
  };
}
