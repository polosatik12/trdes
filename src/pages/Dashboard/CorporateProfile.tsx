import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { corporateAccountsAPI } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faSpinner, faPen, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

const CorporateProfile: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: account, isLoading } = useQuery({
    queryKey: ['corporate-account'],
    queryFn: async () => {
      const { data } = await corporateAccountsAPI.getAccount();
      return data.account;
    },
    enabled: profile?.participation_type === 'corporate',
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => corporateAccountsAPI.updateAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-account'] });
      toast({ title: 'Сохранено', description: 'Данные организации обновлены' });
      setEditing(false);
    },
    onError: (e: any) => {
      toast({ title: 'Ошибка', description: e.response?.data?.error || 'Не удалось сохранить', variant: 'destructive' });
    },
  });

  const startEdit = () => {
    setForm({
      company_full_name: account?.company_full_name || '',
      company_short_name: account?.company_short_name || '',
      ogrn: account?.ogrn || '',
      inn: account?.inn || '',
      kpp: account?.kpp || '',
      bank_details: account?.bank_details || '',
      postal_address: account?.postal_address || '',
      coordinator_name: account?.coordinator_name || '',
      coordinator_phone: account?.coordinator_phone || '',
      coordinator_email: account?.coordinator_email || '',
    });
    setEditing(true);
  };

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  if (profile?.participation_type !== 'corporate') {
    return (
      <DashboardLayout>
        <Card><CardContent className="p-6 text-muted-foreground">Доступно только для корпоративных аккаунтов.</CardContent></Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Профиль организации</h1>
            <p className="text-muted-foreground mt-1">Реквизиты и контактные данные компании</p>
          </div>
          {!editing && !isLoading && (
            <Button onClick={startEdit} variant="outline">
              <FontAwesomeIcon icon={faPen} className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} spin className="h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBuilding} className="h-5 w-5" />
                  Данные организации
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Полное наименование" value={editing ? form.company_full_name : account?.company_full_name} editing={editing} onChange={f('company_full_name')} />
                <Field label="Краткое наименование" value={editing ? form.company_short_name : account?.company_short_name} editing={editing} onChange={f('company_short_name')} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="ОГРН" value={editing ? form.ogrn : account?.ogrn} editing={editing} onChange={f('ogrn')} maxLength={13} />
                  <Field label="ИНН" value={editing ? form.inn : account?.inn} editing={editing} onChange={f('inn')} maxLength={12} />
                  <Field label="КПП" value={editing ? form.kpp : account?.kpp} editing={editing} onChange={f('kpp')} maxLength={9} />
                </div>
                <Field label="Банковские реквизиты" value={editing ? form.bank_details : account?.bank_details} editing={editing} onChange={f('bank_details')} />
                <Field label="Адрес для корреспонденции" value={editing ? form.postal_address : account?.postal_address} editing={editing} onChange={f('postal_address')} />
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader><CardTitle>Координатор</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="ФИО" value={editing ? form.coordinator_name : account?.coordinator_name} editing={editing} onChange={f('coordinator_name')} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Телефон" value={editing ? form.coordinator_phone : account?.coordinator_phone} editing={editing} onChange={f('coordinator_phone')} />
                  <Field label="Email" value={editing ? form.coordinator_email : account?.coordinator_email} editing={editing} onChange={f('coordinator_email')} />
                </div>
              </CardContent>
            </Card>

            {editing && (
              <div className="flex gap-2 mt-4 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  <FontAwesomeIcon icon={faXmark} className="h-4 w-4 mr-2" />
                  Отмена
                </Button>
                <Button type="submit" className="bg-[#003051] hover:bg-[#003051]/90" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4 mr-2" /> : <FontAwesomeIcon icon={faCheck} className="h-4 w-4 mr-2" />}
                  Сохранить
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

const Field: React.FC<{ label: string; value?: string; editing: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; maxLength?: number }> = ({ label, value, editing, onChange, maxLength }) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {editing ? (
      <Input value={value || ''} onChange={onChange} maxLength={maxLength} />
    ) : (
      <p className="text-sm font-medium">{value || '—'}</p>
    )}
  </div>
);

export default CorporateProfile;
