import React, { useEffect, useState } from 'react';
import { adminAPI, eventsAPI } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { exportToCsv } from '@/utils/exportCsv';

interface Reg {
  id: string;
  user_id: string;
  event_id: string;
  distance_id: string;
  bib_number: number | null;
  payment_status: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  distance_name: string;
  distance_km: number;
}

interface Ev { id: string; name: string; }

const CRMRegistrations: React.FC = () => {
  const [events, setEvents] = useState<Ev[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [registrations, setRegistrations] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBib, setEditingBib] = useState<{ id: string; value: string } | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data } = await eventsAPI.getEvents();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await adminAPI.getAllRegistrations(
          selectedEvent !== 'all' ? selectedEvent : undefined
        );
        setRegistrations(data.registrations || []);
      } catch (error) {
        console.error('Error loading registrations:', error);
      }
      setLoading(false);
    };
    load();
  }, [selectedEvent]);

  const updateBib = async (id: string, bib: number) => {
    try {
      await adminAPI.updateRegistration(id, { bib_number: bib });
      toast.success('Номер обновлён');
      setEditingBib(null);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, bib_number: bib } : r));
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const togglePayment = async (id: string, current: string) => {
    const next = current === 'paid' ? 'pending' : 'paid';
    try {
      await adminAPI.updateRegistration(id, { payment_status: next });
      toast.success(`Статус: ${next}`);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, payment_status: next } : r));
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleExport = () => {
    exportToCsv('registrations', ['ФИО', 'Дистанция', 'Номер', 'Оплата', 'Дата'], registrations.map(r => [
      `${r.last_name || ''} ${r.first_name || ''}`.trim() || 'Не заполнено',
      `${r.distance_name} (${r.distance_km} км)`,
      String(r.bib_number ?? ''),
      r.payment_status,
      new Date(r.created_at).toLocaleDateString('ru-RU'),
    ]));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Регистрации</h2>
          <p className="text-sm text-muted-foreground mt-1">Всего: {registrations.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-60"><SelectValue placeholder="Все мероприятия" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все мероприятия</SelectItem>
              {events.map(ev => <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}><FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-1" />CSV</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Участник</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Дистанция</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Номер</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Оплата</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Дата</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Нет регистраций</td></tr>
                ) : registrations.map(r => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {r.profiles?.last_name || ''} {r.profiles?.first_name || ''}
                      {!r.profiles?.first_name && !r.profiles?.last_name && <span className="text-muted-foreground italic">Не заполнено</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.event_distances ? `${r.event_distances.name} (${r.event_distances.distance_km} км)` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {editingBib?.id === r.id ? (
                        <Input
                          type="number"
                          className="w-20 h-7 text-xs"
                          value={editingBib.value}
                          onChange={e => setEditingBib({ id: r.id, value: e.target.value })}
                          onBlur={() => updateBib(r.id, Number(editingBib.value))}
                          onKeyDown={e => e.key === 'Enter' && updateBib(r.id, Number(editingBib.value))}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => setEditingBib({ id: r.id, value: String(r.bib_number ?? '') })}
                        >
                          {r.bib_number ?? <span className="text-muted-foreground">—</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={r.payment_status === 'paid' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => togglePayment(r.id, r.payment_status)}
                      >
                        {r.payment_status === 'paid' ? 'Оплачено' : 'Ожидает'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMRegistrations;
