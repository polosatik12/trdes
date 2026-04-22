import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI, authAPI } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFloppyDisk, faPen } from '@fortawesome/free-solid-svg-icons';
import api from '@/lib/api';
import { russianRegions } from '@/data/russianCities';
import Combobox from '@/components/ui/combobox';

const Profile: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({ new_email: '', password: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState({ id: '', name: '', phone: '', relationship: '' });

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', patronymic: '', date_of_birth: '',
    gender: '', phone: '', country: 'Россия', region: '', city: '',
    participation_type: '', team_name: '',
  });

  const corporateTeams = [
    'Газпром Межрегионгаз', 'Газпром Нефть', 'Банк Россия', 'Ростелеком',
    'РЖД', 'Интер РАО', 'СОГАЗ', 'СОГАЗ Медицина', 'Деловая Россия',
  ];

  const amateurTeams = [
    '7 Холмов','Велопрактика','Велоспорт','Горные Вершины','Клуб Любителей',
    'Магадан СТ','Мангазея','МГФСО','МСК','ПРОФИКИЛЮБИТЕЛИ','ПЫХteam','ЯБайк',
    'Alex Team','BC Club','Black Sea cycling team','Class Team','Cyclica',
    'Desperados cycling','Essentuki CT','Etalon Team','Gazprom Triathlon Team',
    'HBFS','HotLine','I Love Cycling','Impulse Team','Lazy Riders','Legion CC',
    'MIB Club','Mosgorbike Team','Olympo Team','OTTO Superbike','Performance racers',
    'Queenz','Ralan','RCA','Rébellion','Serpantin','Skill Up','Slow Flow',
    'Time NEXT','TOP (Team Of Power)','U238','Vellstore','VeloStar',
    'VeterOK SBR Club','Volga Union','Voronezh CT','WEONSPORT','X-Team','Zubov Team',
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '', last_name: profile.last_name || '',
        patronymic: profile.patronymic || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
        gender: profile.gender || '', phone: profile.phone || '',
        country: profile.country || 'Россия', region: profile.region || '',
        city: profile.city || '', participation_type: profile.participation_type || '',
        team_name: profile.team_name || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    api.get('/profile/emergency-contacts').then(({ data }) => {
      if (data.contacts?.length > 0) {
        const c = data.contacts[0];
        setEmergencyContact({ id: c.id, name: c.name, phone: c.phone, relationship: c.relationship || '' });
      }
    }).catch(() => {});
  }, [user]);

  const handleChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileAPI.updateProfile({
        first_name: formData.first_name || null, last_name: formData.last_name || null,
        patronymic: formData.patronymic || null, date_of_birth: formData.date_of_birth || null,
        gender: formData.gender as 'male' | 'female' | null || null,
        phone: formData.phone || null, country: formData.country || null,
        region: formData.region || null, city: formData.city || null,
        participation_type: formData.participation_type || null,
        team_name: formData.participation_type === 'team' ? (formData.team_name || null) : null,
      });
      // Save emergency contact
      if (emergencyContact.name && emergencyContact.phone) {
        const payload = { name: emergencyContact.name, phone: emergencyContact.phone, relationship: emergencyContact.relationship || undefined };
        if (emergencyContact.id) {
          await api.put(`/profile/emergency-contacts/${emergencyContact.id}`, payload);
        } else {
          const { data } = await api.post('/profile/emergency-contacts', payload);
          setEmergencyContact(prev => ({ ...prev, id: data.contact.id }));
        }
      }
      toast({ title: 'Успешно!', description: 'Профиль сохранён' });
      await refreshProfile();
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.response?.data?.error || 'Не удалось сохранить профиль', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      await authAPI.changeEmail(emailForm.new_email, emailForm.password);
      toast({ title: 'Успешно!', description: 'Email изменён. Войдите заново.' });
      setEmailForm({ new_email: '', password: '' });
      setShowEmailForm(false);
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.response?.data?.error || 'Не удалось изменить email', variant: 'destructive' });
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Мой профиль</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
              <CardDescription>Заполните информацию для участия в мероприятиях</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">

                {/* ФИО */}
                <div className="space-y-2">
                  <Label>Фамилия *</Label>
                  <Input value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} placeholder="Иванов" />
                </div>
                <div className="space-y-2">
                  <Label>Имя *</Label>
                  <Input value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} placeholder="Иван" />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Отчество</Label>
                  <Input value={formData.patronymic} onChange={(e) => handleChange('patronymic', e.target.value)} placeholder="Иванович" />
                </div>

                {/* Дата / пол */}
                <div className="space-y-2">
                  <Label>Дата рождения *</Label>
                  <Input type="date" value={formData.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Пол *</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Выберите пол" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мужской</SelectItem>
                      <SelectItem value="female">Женский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Телефон / email */}
                <div className="space-y-2">
                  <Label>Телефон *</Label>
                  <Input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+7 (999) 123-45-67" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  {showEmailForm ? (
                    <div className="space-y-2">
                      <Input type="email" value={emailForm.new_email} onChange={(e) => setEmailForm(p => ({ ...p, new_email: e.target.value }))} placeholder="Новый email" required />
                      <Input type="password" value={emailForm.password} onChange={(e) => setEmailForm(p => ({ ...p, password: e.target.value }))} placeholder="Текущий пароль" required />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={handleChangeEmail} disabled={emailLoading}>
                          {emailLoading && <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-3 w-3" />}
                          Сохранить
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => { setShowEmailForm(false); setEmailForm({ new_email: '', password: '' }); }}>Отмена</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input value={user?.email || ''} disabled className="bg-muted" />
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowEmailForm(true)}>
                        <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Регион / город */}
                <div className="space-y-2">
                  <Label>Регион</Label>
                  <Combobox options={Object.keys(russianRegions).sort()} value={formData.region}
                    onChange={(v) => { handleChange('region', v); handleChange('city', ''); }}
                    placeholder="Введите регион..." />
                </div>
                <div className="space-y-2">
                  <Label>Город *</Label>
                  <Combobox options={russianRegions[formData.region] || []} value={formData.city}
                    onChange={(v) => handleChange('city', v)}
                    placeholder={formData.region ? 'Введите город...' : 'Сначала выберите регион'}
                    disabled={!formData.region} />
                </div>

                {/* Тип участия */}
                <div className="space-y-2">
                  <Label>Формат участия *</Label>
                  <Select value={formData.participation_type} onValueChange={(v) => { handleChange('participation_type', v); if (v === 'individual') handleChange('team_name', ''); }}>
                    <SelectTrigger><SelectValue placeholder="Выберите формат" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Индивидуальный участник</SelectItem>
                      <SelectItem value="team">Выступает в команде</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.participation_type === 'team' ? (
                  <div className="space-y-2">
                    <Label>Команда *</Label>
                    <Select value={formData.team_name} onValueChange={(v) => handleChange('team_name', v)}>
                      <SelectTrigger><SelectValue placeholder="Выберите команду" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_corp" disabled className="font-bold text-muted-foreground">— Корпоративная лига —</SelectItem>
                        {corporateTeams.map((team) => <SelectItem key={team} value={team}>{team}</SelectItem>)}
                        <SelectItem value="_amateur" disabled className="font-bold text-muted-foreground">— Любительская лига —</SelectItem>
                        {amateurTeams.map((team) => <SelectItem key={team} value={team}>{team}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : <div />}

                {/* Контакт для экстренной связи */}
                <div className="lg:col-span-2 border-t pt-4 mt-2">
                  <p className="font-semibold text-sm text-foreground mb-3">Контакт для экстренной связи</p>
                  <p className="text-xs text-muted-foreground mb-3">Человек, которому сообщат в случае чрезвычайной ситуации</p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>ФИО *</Label>
                      <Input value={emergencyContact.name} onChange={(e) => setEmergencyContact(p => ({ ...p, name: e.target.value }))} placeholder="Иванова Мария Ивановна" />
                    </div>
                    <div className="space-y-2">
                      <Label>Телефон *</Label>
                      <Input type="tel" value={emergencyContact.phone} onChange={(e) => setEmergencyContact(p => ({ ...p, phone: e.target.value }))} placeholder="+7 (999) 123-45-67" />
                    </div>
                    <div className="space-y-2">
                      <Label>Кем приходится</Label>
                      <Input value={emergencyContact.relationship} onChange={(e) => setEmergencyContact(p => ({ ...p, relationship: e.target.value }))} placeholder="Супруга" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={loading} size="lg">
                  {loading ? <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" /> : <FontAwesomeIcon icon={faFloppyDisk} className="mr-2 h-4 w-4" />}
                  {loading ? 'Сохранение...' : 'Сохранить профиль'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
