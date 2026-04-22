import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { corporateAccountsAPI, eventsAPI, registrationsAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUsersRectangle } from '@fortawesome/free-solid-svg-icons';

interface Member { id: string; last_name: string; first_name: string; patronymic: string | null; }
interface Distance { id: string; name: string; distance_km: number; price_kopecks: number; }

const CorporateRegistration: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [eventId, setEventId] = useState('');
  const [selected, setSelected] = useState<Record<string, string>>({}); // member_id → distance_id
  const [loading, setLoading] = useState(false);

  const { data: events } = useQuery({
    queryKey: ['events-active'],
    queryFn: async () => { const { data } = await eventsAPI.getEvents('active'); return data.events as any[]; },
  });

  const { data: distances } = useQuery({
    queryKey: ['distances', eventId],
    queryFn: async () => { const { data } = await eventsAPI.getEventDistances(eventId); return data.distances as Distance[]; },
    enabled: !!eventId,
  });

  const { data: members } = useQuery({
    queryKey: ['corporate-members'],
    queryFn: async () => { const { data } = await corporateAccountsAPI.getMembers(); return data.members as Member[]; },
    enabled: profile?.participation_type === 'corporate',
  });

  const toggleMember = (memberId: string) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[memberId] !== undefined) delete next[memberId];
      else next[memberId] = distances?.[0]?.id || '';
      return next;
    });
  };

  const setAllDistance = (distanceId: string) => {
    setSelected(prev => {
      const next = { ...prev };
      for (const id of Object.keys(next)) next[id] = distanceId;
      return next;
    });
  };

  const totalKopecks = Object.entries(selected).reduce((sum, [, distId]) => {
    const d = distances?.find(d => d.id === distId);
    return sum + (d?.price_kopecks || 0);
  }, 0);

  const handlePay = async () => {
    const membersPayload = Object.entries(selected)
      .filter(([, distId]) => distId)
      .map(([member_id, distance_id]) => ({ member_id, distance_id }));

    if (membersPayload.length === 0) {
      toast({ title: 'Ошибка', description: 'Выберите хотя бы одного участника', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await registrationsAPI.createCorporateGroup({ event_id: eventId, members: membersPayload });
      window.location.href = data.paymentUrl;
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e.response?.data?.error || 'Не удалось создать регистрацию', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (profile?.participation_type !== 'corporate') {
    return <DashboardLayout><Card><CardContent className="p-6 text-muted-foreground">Доступно только для корпоративных аккаунтов.</CardContent></Card></DashboardLayout>;
  }

  const selectedCount = Object.keys(selected).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Регистрация команды</h1>
          <p className="text-muted-foreground mt-1">Выберите событие, участников и дистанции</p>
        </div>

        <Card>
          <CardHeader><CardTitle>1. Выберите событие</CardTitle></CardHeader>
          <CardContent>
            <Select value={eventId} onValueChange={v => { setEventId(v); setSelected({}); }}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Выберите событие" />
              </SelectTrigger>
              <SelectContent>
                {events?.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name} — {new Date(e.date).toLocaleDateString('ru-RU')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {eventId && distances && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>2. Участники и дистанции</CardTitle>
                {selectedCount > 0 && distances.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Всем выбранным:</span>
                    <Select onValueChange={setAllDistance}>
                      <SelectTrigger className="w-40 h-8"><SelectValue placeholder="Дистанция" /></SelectTrigger>
                      <SelectContent>
                        {distances.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!members || members.length === 0 ? (
                <p className="text-muted-foreground text-sm">Нет сотрудников. Добавьте их в разделе «Сотрудники».</p>
              ) : (
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <Checkbox
                        id={m.id}
                        checked={m.id in selected}
                        onCheckedChange={() => toggleMember(m.id)}
                      />
                      <Label htmlFor={m.id} className="flex-1 cursor-pointer font-medium">
                        {m.last_name} {m.first_name} {m.patronymic || ''}
                      </Label>
                      {m.id in selected && (
                        <Select value={selected[m.id]} onValueChange={v => setSelected(p => ({ ...p, [m.id]: v }))}>
                          <SelectTrigger className="w-48 h-8">
                            <SelectValue placeholder="Дистанция" />
                          </SelectTrigger>
                          <SelectContent>
                            {distances.map(d => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name} — {(d.price_kopecks / 100).toLocaleString('ru-RU')} ₽
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedCount > 0 && (
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Итого: {(totalKopecks / 100).toLocaleString('ru-RU')} ₽</p>
                <p className="text-sm text-muted-foreground">{selectedCount} участников</p>
              </div>
              <Button className="bg-[#003051] hover:bg-[#003051]/90" onClick={handlePay} disabled={loading}>
                {loading ? <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4 mr-2" /> : <FontAwesomeIcon icon={faUsersRectangle} className="h-4 w-4 mr-2" />}
                Оплатить
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CorporateRegistration;
