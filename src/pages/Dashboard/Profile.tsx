import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

const Profile: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    patronymic: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    country: 'Россия',
    region: '',
    city: '',
    participation_type: '',
    team_name: '',
  });

  const corporateTeams = [
    'Газпром Межрегионгаз',
    'Газпром Нефть',
    'Банк Россия',
    'Ростелеком',
    'РЖД',
    'Интер РАО',
    'СОГАЗ',
    'СОГАЗ Медицина',
    'Деловая Россия',
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        patronymic: profile.patronymic || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
        gender: profile.gender || '',
        phone: profile.phone || '',
        country: profile.country || 'Россия',
        region: profile.region || '',
        city: profile.city || '',
        participation_type: profile.participation_type || '',
        team_name: profile.team_name || '',
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);

    try {
      await profileAPI.updateProfile({
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        patronymic: formData.patronymic || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender as 'male' | 'female' | null || null,
        phone: formData.phone || null,
        country: formData.country || null,
        region: formData.region || null,
        city: formData.city || null,
        participation_type: formData.participation_type || null,
        team_name: formData.participation_type === 'team' ? (formData.team_name || null) : null,
      });

      toast({
        title: 'Успешно!',
        description: 'Профиль сохранён',
      });
      await refreshProfile();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.response?.data?.error || 'Не удалось сохранить профиль',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Мой профиль</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
              <CardDescription>
                Заполните информацию для участия в мероприятиях
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last_name">Фамилия *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Иванов"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_name">Имя *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="Иван"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patronymic">Отчество</Label>
                <Input
                  id="patronymic"
                  value={formData.patronymic}
                  onChange={(e) => handleChange('patronymic', e.target.value)}
                  placeholder="Иванович"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Дата рождения *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Пол *</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите пол" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мужской</SelectItem>
                      <SelectItem value="female">Женский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email нельзя изменить
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Местоположение</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Регион</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    placeholder="Московская область"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Город *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Москва"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Тип участия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Формат участия *</Label>
                <Select
                  value={formData.participation_type}
                  onValueChange={(value) => {
                    handleChange('participation_type', value);
                    if (value === 'individual') {
                      handleChange('team_name', '');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите формат" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Индивидуальный участник</SelectItem>
                    <SelectItem value="team">Выступает в команде</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.participation_type === 'team' && (
                <div className="space-y-2">
                  <Label>Команда *</Label>
                  <Select
                    value={formData.team_name}
                    onValueChange={(value) => handleChange('team_name', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите команду" />
                    </SelectTrigger>
                    <SelectContent>
                      {corporateTeams.map((team) => (
                        <SelectItem key={team} value={team}>{team}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2 h-4 w-4" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
