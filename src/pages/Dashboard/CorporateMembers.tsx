import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { corporateAccountsAPI } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';
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

const emptyRow = () => ({ last_name: '', first_name: '', patronymic: '', date_of_birth: '', gender: '', phone: '', email: '', position: '' });

const CorporateMembers: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([emptyRow()]);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', patronymic: '', date_of_birth: '', gender: '',
    phone: '', email: '', position: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '',
  });

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['corporate-members'],
    queryFn: async () => {
      const { data } = await corporateAccountsAPI.getMembers();
      return data.members as CorporateMember[];
    },
    enabled: profile?.participation_type === 'corporate',
  });

  const addMemberMutation = useMutation({
    mutationFn: async (memberData: any) => {
      const { data } = await corporateAccountsAPI.addMember(memberData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-members'] });
      toast({ title: 'Успешно!', description: 'Участник добавлен' });
      setIsAddDialogOpen(false);
      setFormData({ first_name: '', last_name: '', patronymic: '', date_of_birth: '', gender: '', phone: '', email: '', position: '', emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '' });
    },
    onError: (error: any) => {
      toast({ title: 'Ошибка', description: error.response?.data?.error || 'Не удалось добавить участника', variant: 'destructive' });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => { await corporateAccountsAPI.deleteMember(id); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-members'] });
      toast({ title: 'Успешно!', description: 'Участник удалён' });
    },
    onError: (error: any) => {
      toast({ title: 'Ошибка', description: error.response?.data?.error || 'Не удалось удалить участника', variant: 'destructive' });
    },
  });

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = bulkRows.filter(r => r.last_name && r.first_name && r.date_of_birth && r.gender && r.phone);
    if (valid.length === 0) {
      toast({ title: 'Ошибка', description: 'Заполните хотя бы одну строку', variant: 'destructive' });
      return;
    }
    setBulkProgress({ done: 0, total: valid.length });
    let done = 0;
    for (const row of valid) {
      try { await corporateAccountsAPI.addMember(row); done++; setBulkProgress({ done, total: valid.length }); } catch {}
    }
    queryClient.invalidateQueries({ queryKey: ['corporate-members'] });
    toast({ title: 'Готово', description: `Добавлено ${done} из ${valid.length} участников` });
    setBulkProgress(null);
    setIsBulkDialogOpen(false);
    setBulkRows([emptyRow()]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.gender || !formData.phone) {
      toast({ title: 'Ошибка', description: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }
    addMemberMutation.mutate({ ...formData, gender: formData.gender as 'male' | 'female' });
  };

  const getStatusBadge = (status: string) => {
    const cfg = { active: { label: 'Активен', variant: 'default' as const }, inactive: { label: 'Неактивен', variant: 'secondary' as const }, banned: { label: 'Заблокирован', variant: 'destructive' as const } };
    const c = cfg[status as keyof typeof cfg] || cfg.inactive;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (profile?.participation_type !== 'corporate') {
    return (
      <DashboardLayout>
        <Card><CardContent className="p-6"><p className="text-muted-foreground">Эта страница доступна только для корпоративных аккаунтов.</p></CardContent></Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Сотрудники компании</h1>
            <p className="text-muted-foreground mt-1">Управление участниками корпоративного аккаунта</p>
          </div>
          <div className="flex gap-2">
            {/* Bulk add dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setBulkRows([emptyRow()])}>
                  <FontAwesomeIcon icon={faUsers} className="h-4 w-4 mr-2" />
                  Добавить несколько
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Массовое добавление участников</DialogTitle></DialogHeader>
                <form onSubmit={handleBulkSubmit} className="space-y-4 mt-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1 font-medium">Фамилия*</th>
                          <th className="text-left p-1 font-medium">Имя*</th>
                          <th className="text-left p-1 font-medium">Отчество</th>
                          <th className="text-left p-1 font-medium">Дата рожд.*</th>
                          <th className="text-left p-1 font-medium">Пол*</th>
                          <th className="text-left p-1 font-medium">Телефон*</th>
                          <th className="text-left p-1 font-medium">Email</th>
                          <th className="text-left p-1 font-medium">Должность</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkRows.map((row, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-1"><Input className="h-8 min-w-[90px]" value={row.last_name} onChange={e => setBulkRows(rows => rows.map((r,j) => j===i ? {...r, last_name: e.target.value} : r))} /></td>
                            <td className="p-1"><Input className="h-8 min-w-[90px]" value={row.first_name} onChange={e => setBulkRows(rows => rows.map((r,j) => j===i ? {...r, first_name: e.target.value} : r))} /></td>
                            <td className="p-1"><Input className="h-8 min-w-[90px]" value={row.patronymic} onChange={e => setBulkRows(rows => rows.map((r,j) => j===i ? {...r, patronymic: e.target.value} : r))} /></td>
                            <td className="p-1"><Input type="date" className="h-8 min-w-[120px]" value={row.date_of_birth} onChange={e => setBulkRows(rows => rows.map((r,j) => j===i ? {...r, date_of_birth: e.target.value} : r))} /></td>
                            <td className="p-1">
                              <Select value={row.gender} onValueChange={v => setBulkRows(rows => rows.map((r,j) => j===i ? {...r, gender: v} : r))}>
                                <SelectTrigger className="h-8 min-w-[80px]"><SelectValue placeholder="Пол" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">М</SelectItem>
                                  <SelectItem value="female">Ж</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-1"><Input className="h-8 min-w-[100px]" value={row.phone} onChange={e => setBulkRows(rows => rows.map((r,j) => j===i ? {...r, phone: e.target.value} : r))} /></td>
                            <td className="p-1"><Input className="h-8 min-w-[100px]" value={row.email} onChange={e => setBulkRows(rows => rows.map((r,j) => j===i ? {...r, email: e.target.value} : r))} /></td>
                            <td className="p-1"><Input className="h-8 min-w-[100px]" value={row.position} onChange={e => setBulkRows(rows => rows.map((r,j) => j===i ? {...r, position: e.target.value} : r))} /></td>
                            <td className="p-1">
                              {bulkRows.length > 1 && (
                                <button type="button" onClick={() => setBulkRows(rows => rows.filter((_,j) => j!==i))}>
                                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-destructive" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {bulkRows.length < 50 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setBulkRows(r => [...r, emptyRow()])}>
                      <FontAwesomeIcon icon={faPlus} className="h-3 w-3 mr-1" />
                      Ещё строка
                    </Button>
                  )}
                  {bulkProgress && (
                    <p className="text-sm text-muted-foreground">Добавлено {bulkProgress.done} из {bulkProgress.total}...</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Отмена</Button>
                    <Button type="submit" className="bg-[#003051] hover:bg-[#003051]/90" disabled={!!bulkProgress}>
                      {bulkProgress && <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4 mr-2" />}
                      Сохранить всех
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Single add dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#003051] hover:bg-[#003051]/90">
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                  Добавить сотрудника
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Добавить сотрудника</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Фамилия *</Label>
                      <Input id="last_name" value={formData.last_name} onChange={e => setFormData(p => ({...p, last_name: e.target.value}))} placeholder="Иванов" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Имя *</Label>
                      <Input id="first_name" value={formData.first_name} onChange={e => setFormData(p => ({...p, first_name: e.target.value}))} placeholder="Иван" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patronymic">Отчество</Label>
                    <Input id="patronymic" value={formData.patronymic} onChange={e => setFormData(p => ({...p, patronymic: e.target.value}))} placeholder="Иванович" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Дата рождения *</Label>
                      <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={e => setFormData(p => ({...p, date_of_birth: e.target.value}))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Пол *</Label>
                      <Select value={formData.gender} onValueChange={v => setFormData(p => ({...p, gender: v}))}>
                        <SelectTrigger><SelectValue placeholder="Выберите пол" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Мужской</SelectItem>
                          <SelectItem value="female">Женский</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} placeholder="+7 (999) 123-45-67" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} placeholder="employee@company.ru" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Должность</Label>
                    <Input id="position" value={formData.position} onChange={e => setFormData(p => ({...p, position: e.target.value}))} placeholder="Менеджер" />
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Экстренный контакт</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>ФИО</Label>
                        <Input value={formData.emergency_contact_name} onChange={e => setFormData(p => ({...p, emergency_contact_name: e.target.value}))} placeholder="Иванова Мария" />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон</Label>
                        <Input type="tel" value={formData.emergency_contact_phone} onChange={e => setFormData(p => ({...p, emergency_contact_phone: e.target.value}))} placeholder="+7 (999) 123-45-67" />
                      </div>
                      <div className="space-y-2">
                        <Label>Кем приходится</Label>
                        <Input value={formData.emergency_contact_relationship} onChange={e => setFormData(p => ({...p, emergency_contact_relationship: e.target.value}))} placeholder="Супруга" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
                    <Button type="submit" className="bg-[#003051] hover:bg-[#003051]/90" disabled={addMemberMutation.isPending}>
                      {addMemberMutation.isPending ? <><FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />Добавление...</> : 'Добавить'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
                      <TableCell className="font-medium">{member.last_name} {member.first_name} {member.patronymic}</TableCell>
                      <TableCell>{new Date(member.date_of_birth).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell>{member.gender === 'male' ? 'М' : 'Ж'}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>{member.position || '-'}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => deleteMemberMutation.mutate(member.id)}>
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-destructive" />
                        </Button>
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
