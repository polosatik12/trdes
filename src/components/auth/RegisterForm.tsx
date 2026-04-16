import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSpinner, faUser, faShieldHalved, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { differenceInYears, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { authAPI, profileAPI } from '@/lib/api';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import CorporateRegisterForm from './CorporateRegisterForm';

type Step = 'form' | 'code';

const RegisterForm: React.FC = () => {
  const [step, setStep] = useState<Step>('form');
  const [activeTab, setActiveTab] = useState<'individual' | 'corporate'>('individual');

  // Individual form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { signUp, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите имя', variant: 'destructive' });
      return;
    }
    if (!dateOfBirth) {
      toast({ title: 'Ошибка', description: 'Укажите дату рождения', variant: 'destructive' });
      return;
    }
    const age = differenceInYears(new Date(), new Date(dateOfBirth));
    if (age < 18) {
      toast({ title: 'Ошибка', description: 'Регистрация доступна только для лиц старше 18 лет', variant: 'destructive' });
      return;
    }
    if (password.length < 8) {
      toast({ title: 'Ошибка', description: 'Пароль должен содержать минимум 8 символов', variant: 'destructive' });
      return;
    }
    if (!/[A-ZА-ЯЁ]/.test(password)) {
      toast({ title: 'Ошибка', description: 'Пароль должен содержать хотя бы одну заглавную букву', variant: 'destructive' });
      return;
    }
    if (!/[a-zа-яё]/.test(password)) {
      toast({ title: 'Ошибка', description: 'Пароль должен содержать хотя бы одну строчную букву', variant: 'destructive' });
      return;
    }
    if (!/[^A-Za-zА-Яа-яЁё0-9]/.test(password)) {
      toast({ title: 'Ошибка', description: 'Пароль должен содержать хотя бы один спецсимвол (. - ! @ # и т.д.)', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Ошибка', description: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }
    if (!acceptTerms || !acceptPrivacy) {
      toast({ title: 'Ошибка', description: 'Необходимо принять условия использования и политику конфиденциальности', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await authAPI.sendVerificationCode(email);
      toast({ title: 'Код отправлен!', description: `Проверьте почту ${email}` });
      setStep('code');
      startResendCooldown();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.response?.data?.error || 'Не удалось отправить код подтверждения. Попробуйте ещё раз.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) {
      toast({ title: 'Ошибка', description: 'Введите 4-значный код', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyCode(email, code);

      const { error, data } = await signUp(email, password);
      if (error) {
        toast({ title: 'Ошибка регистрации', description: error.message, variant: 'destructive' });
      } else {
        if (data?.user) {
          try {
            await profileAPI.updateProfile({
              first_name: firstName.trim(),
              date_of_birth: dateOfBirth,
              participation_type: 'individual',
            });
          } catch (updateError: any) {
            console.error('Failed to update profile:', updateError);
            toast({
              title: 'Предупреждение',
              description: 'Регистрация успешна, но не удалось сохранить дополнительные данные. Заполните профиль в личном кабинете.',
              variant: 'destructive'
            });
          }
          await refreshProfile();
        }
        toast({ title: 'Регистрация успешна!', description: 'Добро пожаловать в Tour de Russie' });
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Ошибка проверки кода';
      toast({ title: 'Ошибка', description: errorMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- Шаг 2: Подтверждение кода ---
  if (step === 'code') {
    return (
      <form onSubmit={handleVerifyAndRegister} className="space-y-4">
        <div className="text-center mb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-[#003051]/10 rounded-full p-3">
              <FontAwesomeIcon icon={faShieldHalved} className="h-8 w-8 text-[#003051]" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Мы отправили 4-значный код на<br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verify-code">Код подтверждения</Label>
          <Input
            id="verify-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="0000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="text-center text-2xl tracking-[0.5em] font-bold"
            required
            autoFocus
          />
        </div>

        <Button type="submit" className="w-full bg-[#003051] hover:bg-[#003051]/90 text-white" disabled={loading}>
          {loading ? (
            <><FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />Проверка...</>
          ) : (
            'Подтвердить и зарегистрироваться'
          )}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => { setStep('form'); setCode(''); }}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Назад к форме
          </button>
          <button
            type="button"
            onClick={async () => {
              if (resendCooldown > 0) return;
              setLoading(true);
              try {
                await authAPI.sendVerificationCode(email);
                toast({ title: 'Код отправлен повторно' });
                startResendCooldown();
              } catch {
                toast({ title: 'Ошибка', description: 'Не удалось отправить код', variant: 'destructive' });
              } finally {
                setLoading(false);
              }
            }}
            disabled={resendCooldown > 0}
            className="text-[#003051] hover:underline disabled:text-muted-foreground disabled:cursor-default"
          >
            {resendCooldown > 0 ? `Снова (${resendCooldown}с)` : 'Отправить снова'}
          </button>
        </div>
      </form>
    );
  }

  // --- Шаг 1: Форма регистрации с вкладками ---
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'individual' | 'corporate')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
            Физическое лицо
          </TabsTrigger>
          <TabsTrigger value="corporate" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBuilding} className="h-4 w-4" />
            Юридическое лицо
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="mt-4">
          <form onSubmit={handleIndividualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-email"
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
              <Label htmlFor="register-name">Имя</Label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Ваше имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Дата рождения</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth
                      ? format(new Date(dateOfBirth), 'd MMMM yyyy', { locale: ru })
                      : 'Выберите дату рождения'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setDateOfBirth(format(date, 'yyyy-MM-dd'));
                      }
                    }}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                    locale={ru}
                    captionLayout="dropdown-buttons"
                    fromYear={1940}
                    toYear={new Date().getFullYear()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Пароль</Label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Мин. 8 символов, A-a, спецсимвол"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтвердите пароль</Label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                Я принимаю{' '}
                <a
                  href="/documents/terms-of-service.pdf"
                  className="text-[#003051] hover:underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    fetch('/documents/terms-of-service.pdf').then(res => res.blob()).then(blob => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'Пользовательское_соглашение.pdf';
                      document.body.appendChild(a); a.click();
                      document.body.removeChild(a); URL.revokeObjectURL(url);
                    });
                  }}
                >
                  условия использования
                </a>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy"
                checked={acceptPrivacy}
                onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
              />
              <Label htmlFor="privacy" className="text-sm text-muted-foreground leading-relaxed">
                Я принимаю{' '}
                <a
                  href="/documents/privacy-policy.pdf"
                  className="text-[#003051] hover:underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    fetch('/documents/privacy-policy.pdf').then(res => res.blob()).then(blob => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'Согласие_на_обработку_персональных_данных.pdf';
                      document.body.appendChild(a); a.click();
                      document.body.removeChild(a); URL.revokeObjectURL(url);
                    });
                  }}
                >
                  политику конфиденциальности
                </a>
              </Label>
            </div>

            <Button type="submit" className="w-full bg-[#003051] hover:bg-[#003051]/90 text-white" disabled={loading}>
              {loading ? (
                <><FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />Отправка кода...</>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="corporate" className="mt-4">
          <CorporateRegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegisterForm;
