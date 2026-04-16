import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const YandexCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get('code');
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast({ title: 'Ошибка входа', description: 'Яндекс отклонил авторизацию', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (code) {
      // Фронтенд получил code от Яндекса — отправляем на бэкенд
      fetch(`${API_URL}/auth/yandex/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Ошибка обмена кода');
          return res.json();
        })
        .then((data) => handleToken(data.token))
        .catch(() => {
          toast({ title: 'Ошибка входа', description: 'Не удалось войти через Яндекс', variant: 'destructive' });
          navigate('/auth');
        });
      return;
    }

    if (token) {
      // Бэкенд сделал redirect с token (запасной вариант)
      handleToken(token);
      return;
    }

    toast({ title: 'Ошибка входа', description: 'Не удалось войти через Яндекс', variant: 'destructive' });
    navigate('/auth');
  }, []);

  async function handleToken(token: string) {
    if (!token) {
      toast({ title: 'Ошибка', description: 'Токен не получен', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    localStorage.setItem('auth_token', token);

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      toast({ title: 'Добро пожаловать!', description: 'Вы успешно вошли через Яндекс' });
      navigate('/dashboard');
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить данные пользователя', variant: 'destructive' });
      navigate('/auth');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Вход через Яндекс...</p>
      </div>
    </div>
  );
};

export default YandexCallback;
