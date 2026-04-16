import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { corporateAccountsAPI } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faTrash, faEdit, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@/components/ui/badge';

interface CorporateMember {
  id: string;
  first_name: string;
  last_name: string;
  patronymic: string | null;
  date_of_birth: string;
  gender: 'male' | 'female';
  phone: string;
  email: string | null;
  position: string | null;
  status: 'active' | 'inactive' | 'banned';
  company_short_name: string;
}

const CorporateMembers: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    patronymic: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    position: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });

  // Fetch corporate members
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['corporate-members'],
    queryFn: async () => {
      const { data } = await corporateAccountsAPI.getMembers();
      return data.members as CorporateMember[];
    },
    enabled: profile?.participation_type === 'corporate',
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (memberData: any) => {
      const { data } = await corporateAccountsAPI.addMember(memberData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-members'] });
      toast({ title: 'Успешно!', description: 'Участник добавлен' });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.response?.data?.error || 'Не удалось добавить участника',
        variant: 'destructive',
      });
    },
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      await corporateAccountsAPI.deleteMember(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-members'] });
      toast({ title: 'Успешно!', description: 'Участник удалён' });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.response?.data?.error || 'Не удалось удалить участника',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      patronymic: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      email: '',
      position: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.gender || !formData.phone) {
      toast({ title: 'Ошибка', description: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }

    addMemberMutation.mutate({
      ...formData,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender as 'male' | 'female',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активен', variant: 'default' as const },
      inactive: { label: 'Неактивен', variant: 'secondary' as const },
      banned: { label: 'Заблокирован', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (profile?.participation_type !== 'corporate') {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Эта страница доступна только для корпоративных аккаунтов.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Сотрудники компании</h1>
            <p className="text-muted-foreground mt-1">
              Управление участниками корпоративного аккаунта
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#003051] hover:bg-[#003051]/90">
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                Добавить сотрудника
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавить сотрудника</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Фамилия *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      placeholder="Иванов"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="first_name">Имя *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      placeholder="Иван"
                      required
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
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Пол *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                      required
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="employee@company.ru"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    placeholder="Менеджер"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Экстренный контакт</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_name">ФИО</Label>
                      <Input
                        id="emergency_name"
                        value={formData.emergency_contact_name}
                        onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                        placeholder="Иванова Мария"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency_phone">Телефон</Label>
                      <Input
                        id="emergency_phone"
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency_relationship">Кем приходится</Label>
                      <Input
                        id="emergency_relationship"
                        value={formData.emergency_contact_relationship}
                        onChange={(e) => handleChange('emergency_contact_relationship', e.target.value)}
                        placeholder="Супруга"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#003051] hover:bg-[#003051]/90"
                    disabled={addMemberMutation.isPending}
                  >
                    {addMemberMutation.isPending ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />
                        Добавление...
                      </>
                    ) : (
                      'Добавить'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
              Список сотрудников
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <FontAwesomeIcon icon={faSpinner} spin className="h-8 w-8 text-muted-foreground" />
              </div>
            ) : membersData && membersData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Дата рождения</TableHead>
                    <TableHead>Пол</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersData.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.last_name} {member.first_name} {member.patronymic}
                      </TableCell>
                      <TableCell>
                        {new Date(member.date_of_birth).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        {member.gender === 'male' ? 'М' : 'Ж'}
                      </TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>{member.position || '-'}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMemberMutation.mutate(member.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FontAwesomeIcon icon={faUsers} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Список сотрудников пуст</p>
                <p className="text-sm">Добавьте первого сотрудника, чтобы начать регистрацию на мероприятия</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CorporateMembers;
