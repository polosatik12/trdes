import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import ForgotPasswordForm from './ForgotPasswordForm';
import api from '@/lib/api';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Ошибка входа',
        description: error.message === 'Invalid login credentials'
          ? 'Неверный email или пароль'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Добро пожаловать!', description: 'Вы успешно вошли в систему' });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  if (showForgot) {
    return <ForgotPasswordForm onBack={() => setShowForgot(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="champion@tourderussie.ru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <div className="relative">
          <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
            minLength={6}
          />
          <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
          </button>
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Забыли пароль?
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-[#003051] hover:bg-[#003051]/90 text-white" disabled={loading}>
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
            Вход...
          </>
        ) : (
          'Войти'
        )}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">или</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={async () => {
          try {
            const { data } = await api.get('/auth/yandex/url');
            window.location.href = data.authUrl;
          } catch (error) {
            toast({
              title: 'Ошибка',
              description: 'Не удалось получить ссылку для входа через Яндекс',
              variant: 'destructive',
            });
          }
        }}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="4" fill="#FC3F1D"/>
          <path d="M13.32 7.2H12.4c-1.47 0-2.24.7-2.24 1.85 0 1.3.57 1.9 1.74 2.7l.97.65-2.76 4.4H8.5l2.56-4.07c-1.48-1.05-2.32-2.07-2.32-3.6C8.74 7.1 9.95 6 12.37 6H15v10.8h-1.68V7.2z" fill="white"/>
        </svg>
        Войти через Яндекс
      </Button>
    </form>
  );
};

export default LoginForm;
