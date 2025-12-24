'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(email, password);
        router.push('/');
      } else {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }

        await authService.register(email, password);
        router.push('/');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao autenticar';
      setError(errorMessage);
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-totoro-blue/10 to-totoro-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-totoro-blue/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-totoro-gray mb-2">
              🌿 Obojima Utilities
            </h1>
            <p className="text-totoro-blue">
              {isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-totoro-orange/10 border border-totoro-orange/30 rounded-lg text-totoro-orange text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(val) => setEmail(String(val))}
              placeholder="seu@email.com"
              label="Email"
              className="w-full"
            />

            <Input
              type="password"
              value={password}
              onChange={(val) => setPassword(String(val))}
              placeholder="••••••••"
              label="Senha"
              className="w-full"
            />

            {!isLogin && (
              <Input
                type="password"
                value={confirmPassword}
                onChange={(val) => setConfirmPassword(String(val))}
                placeholder="••••••••"
                label="Confirmar Senha"
                className="w-full"
              />
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || !email || !password || (!isLogin && password !== confirmPassword)}
              className="mt-6"
            >
              {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-totoro-blue hover:text-totoro-blue/80 transition-colors"
            >
              {isLogin
                ? 'Não tem uma conta? Criar conta'
                : 'Já tem uma conta? Fazer login'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-totoro-gray/70">
          <p>
            Seus dados serão sincronizados na nuvem e estarão disponíveis em qualquer dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
}

