import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSpinner, faBuilding, faShieldHalved, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { authAPI, corporateAccountsAPI, profileAPI } from '@/lib/api';

type Step = 'form' | 'code';

const CorporateRegisterForm: React.FC = () => {
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Corporate data
  const [companyFullName, setCompanyFullName] = useState('');
  const [companyShortName, setCompanyShortName] = useState('');
  const [ogrn, setOgrn] = useState('');
  const [inn, setInn] = useState('');
  const [kpp, setKpp] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorPhone, setCoordinatorPhone] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyFullName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите полное наименование компании', variant: 'destructive' });
      return;
    }
    if (!companyShortName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите краткое наименование компании', variant: 'destructive' });
      return;
    }
    if (!ogrn.trim() || ogrn.length !== 13) {
      toast({ title: 'Ошибка', description: 'ОГРН должен содержать 13 цифр', variant: 'destructive' });
      return;
    }
    if (!inn.trim() || (inn.length !== 10 && inn.length !== 12)) {
      toast({ title: 'Ошибка', description: 'ИНН должен содержать 10 или 12 цифр', variant: 'destructive' });
      return;
    }
    if (!kpp.trim() || kpp.length !== 9) {
      toast({ title: 'Ошибка', description: 'КПП должен содержать 9 цифр', variant: 'destructive' });
      return;
    }
    if (!bankDetails.trim()) {
      toast({ title: 'Ошибка', description: 'Введите банковские реквизиты', variant: 'destructive' });
      return;
    }
    if (!postalAddress.trim()) {
      toast({ title: 'Ошибка', description: 'Введите адрес для корреспонденции', variant: 'destructive' });
      return;
    }
    if (!coordinatorName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите ФИО координатора', variant: 'destructive' });
      return;
    }
    if (!coordinatorPhone.trim()) {
      toast({ title: 'Ошибка', description: 'Введите телефон координатора', variant: 'destructive' });
      return;
    }
    if (!coordinatorEmail.trim()) {
      toast({ title: 'Ошибка', description: 'Введите email координатора', variant: 'destructive' });
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
      toast({ title: 'Ошибка', description: 'Пароль должен содержать хотя бы один спецсимвол', variant: 'destructive' });
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
      toast({ title: 'Ошибка', description: error.response?.data?.error || 'Не удалось отправить код подтверждения', variant: 'destructive' });
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
            await profileAPI.updateProfile({ participation_type: 'corporate' });
            await refreshProfile();
            // Create corporate account
            await corporateAccountsAPI.createAccount({
              company_full_name: companyFullName,
              company_short_name: companyShortName,
              ogrn,
              inn,
              kpp,
              bank_details: bankDetails,
              postal_address: postalAddress,
              coordinator_name: coordinatorName,
              coordinator_phone: coordinatorPhone,
              coordinator_email: coordinatorEmail,
            });
          } catch (corpError: any) {
            console.error('Failed to create corporate account:', corpError);
            toast({
              title: 'Предупреждение',
              description: 'Аккаунт создан, но данные организации не сохранены. Обратитесь в поддержку.',
              variant: 'destructive',
            });
          }
        }
        toast({ title: 'Регистрация успешна!', description: 'Корпоративный аккаунт создан' });
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Ошибка проверки кода';
      toast({ title: 'Ошибка', description: errorMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="bg-[#003051]/5 p-4 rounded-lg">
          <h3 className="font-semibold text-[#003051] mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faBuilding} className="h-4 w-4" />
            Данные организации
          </h3>

          <div className="space-y-2">
            <Label htmlFor="company-full-name">Полное наименование *</Label>
            <Input
              id="company-full-name"
              type="text"
              placeholder="Общество с ограниченной ответственностью &quot;Ромашка&quot;"
              value={companyFullName}
              onChange={(e) => setCompanyFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-short-name">Краткое наименование *</Label>
            <Input
              id="company-short-name"
              type="text"
              placeholder="ООО &quot;Ромашка&quot;"
              value={companyShortName}
              onChange={(e) => setCompanyShortName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ogrn">ОГРН *</Label>
              <Input
                id="ogrn"
                type="text"
                inputMode="numeric"
                maxLength={13}
                placeholder="13 цифр"
                value={ogrn}
                onChange={(e) => setOgrn(e.target.value.replace(/\D/g, '').slice(0, 13))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inn">ИНН *</Label>
              <Input
                id="inn"
                type="text"
                inputMode="numeric"
                maxLength={12}
                placeholder="10 или 12 цифр"
                value={inn}
                onChange={(e) => setInn(e.target.value.replace(/\D/g, '').slice(0, 12))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kpp">КПП *</Label>
              <Input
                id="kpp"
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="9 цифр"
                value={kpp}
                onChange={(e) => setKpp(e.target.value.replace(/\D/g, '').slice(0, 9))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-details">Банковские реквизиты *</Label>
            <Input
              id="bank-details"
              type="text"
              placeholder="БИК, расчетный счет, банк"
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal-address">Адрес для корреспонденции *</Label>
            <Input
              id="postal-address"
              type="text"
              placeholder="123456, г. Москва, ул. Примерная, д. 1"
              value={postalAddress}
              onChange={(e) => setPostalAddress(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="bg-[#003051]/5 p-4 rounded-lg">
          <h3 className="font-semibold text-[#003051] mb-3">Координатор от организации</h3>

          <div className="space-y-2">
            <Label htmlFor="coordinator-name">ФИО координатора *</Label>
            <Input
              id="coordinator-name"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={coordinatorName}
              onChange={(e) => setCoordinatorName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coordinator-phone">Телефон *</Label>
              <Input
                id="coordinator-phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={coordinatorPhone}
                onChange={(e) => setCoordinatorPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinator-email">Email *</Label>
              <Input
                id="coordinator-email"
                type="email"
                placeholder="coordinator@company.ru"
                value={coordinatorEmail}
                onChange={(e) => setCoordinatorEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-[#003051]/5 p-4 rounded-lg">
          <h3 className="font-semibold text-[#003051] mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
            Данные для входа
          </h3>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email для входа *</Label>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-email"
                type="email"
                placeholder="company@tourderussie.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Пароль *</Label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Мин. 8 символов, A-a, спецсимвол"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Подтвердите пароль *</Label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="h-4 w-4" />
              </button>
            </div>
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
            <a href="/documents/terms-of-service.pdf" className="text-[#003051] hover:underline font-medium">
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
            <a href="/documents/privacy-policy.pdf" className="text-[#003051] hover:underline font-medium">
              политику конфиденциальности
            </a>
          </Label>
        </div>

        <Button type="submit" className="w-full bg-[#003051] hover:bg-[#003051]/90 text-white" disabled={loading}>
          {loading ? (
            <><FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />Отправка кода...</>
          ) : (
            'Зарегистрировать организацию'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CorporateRegisterForm;
