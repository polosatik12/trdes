import React, { useState } from 'react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSpinner, faArrowLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

type Step = 'email' | 'code' | 'done';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.sendPasswordResetCode(email);
      setStep('code');
      toast({
        title: 'Код отправлен',
        description: 'Проверьте вашу почту — мы отправили 4-значный код',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.response?.data?.error || 'Не удалось отправить код',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword(email, code, newPassword);
      setStep('done');
      toast({
        title: 'Пароль изменён',
        description: 'Теперь вы можете войти с новым паролем',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.response?.data?.error || 'Не удалось сбросить пароль',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="space-y-4 text-center">
        <div className="py-6">
          <FontAwesomeIcon icon={faLock} className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Пароль успешно изменён</h3>
          <p className="text-sm text-muted-foreground">
            Используйте новый пароль для входа
          </p>
        </div>
        <Button
          onClick={onBack}
          className="w-full bg-[#003051] hover:bg-[#003051]/90 text-white"
        >
          Вернуться ко входу
        </Button>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleReset} className="space-y-4">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
          Назад
        </button>

        <div className="space-y-2">
          <Label htmlFor="code">Код подтверждения</Label>
          <Input
            id="code"
            type="text"
            placeholder="1234"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            required
            className="text-center text-2xl tracking-[0.5em] font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">Новый пароль</Label>
          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 pr-10"
              required
              minLength={6}
            />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full bg-[#003051] hover:bg-[#003051]/90 text-white" disabled={loading}>
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            'Сбросить пароль'
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
        Назад
      </button>

      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <div className="relative">
          <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-email"
            type="email"
            placeholder="champion@tourderussie.ru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Мы отправим 4-значный код на вашу почту
      </p>

      <Button type="submit" className="w-full bg-[#003051] hover:bg-[#003051]/90 text-white" disabled={loading}>
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
            Отправка...
          </>
        ) : (
          'Отправить код'
        )}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
