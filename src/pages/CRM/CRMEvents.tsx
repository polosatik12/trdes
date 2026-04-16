import React, { useEffect, useState } from 'react';
import { adminAPI, eventsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';

interface Ev {
  id: string; name: string; date: string; location: string; status: string;
}
interface Dist {
  id: string; event_id: string; name: string; distance_km: number; price_kopecks: number;
}

const statusLabels: Record<string, string> = { upcoming: 'Предстоящее', ongoing: 'Идёт', completed: 'Завершено' };

const CRMEvents: React.FC = () => {
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ev | null>(null);
  const [form, setForm] = useState({ name: '', date: '', location: '', status: 'upcoming' });

  const [distOpen, setDistOpen] = useState<string | null>(null);
  const [distances, setDistances] = useState<Dist[]>([]);
  const [distForm, setDistForm] = useState({ name: '', distance_km: '', price_kopecks: '' });

  const load = async () => {
    try {
      const { data } = await eventsAPI.getEvents();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', date: '', location: '', status: 'upcoming' }); setDialogOpen(true); };
  const openEdit = (ev: Ev) => { setEditing(ev); setForm({ name: ev.name, date: ev.date, location: ev.location, status: ev.status }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name || !form.date || !form.location) { toast.error('Заполните все поля'); return; }
    try {
      if (editing) {
        await adminAPI.updateEvent(editing.id, form);
        toast.success('Мероприятие обновлено');
      } else {
        await adminAPI.createEvent(form);
        toast.success('Мероприятие создано');
      }
      setDialogOpen(false);
      load();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить мероприятие?')) return;
    try {
      await adminAPI.deleteEvent(id);
      toast.success('Удалено');
      load();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const loadDistances = async (eventId: string) => {
    if (distOpen === eventId) { setDistOpen(null); return; }
    setDistOpen(eventId);
    try {
      const { data } = await eventsAPI.getEventDistances(eventId);
      setDistances(data.distances || []);
    } catch (error) {
      console.error('Error loading distances:', error);
    }
    setDistForm({ name: '', distance_km: '', price_kopecks: '' });
  };

  const addDistance = async () => {
    if (!distOpen || !distForm.name || !distForm.distance_km) { toast.error('Заполните поля'); return; }
    try {
      await adminAPI.createDistance(distOpen, {
        name: distForm.name,
        distance_km: Number(distForm.distance_km),
        price_kopecks: Number(distForm.price_kopecks) || 0,
      });
      toast.success('Дистанция добавлена');
      const eid = distOpen;
      setDistOpen(null);
      setTimeout(() => loadDistances(eid), 100);
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const removeDist = async (id: string) => {
    if (!distOpen) return;
    try {
      await adminAPI.deleteDistance(id);
      toast.success('Дистанция удалена');
      const eid = distOpen;
      setDistOpen(null);
      setTimeout(() => loadDistances(eid), 100);
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Мероприятия</h2>
          <p className="text-sm text-muted-foreground mt-1">Всего: {events.length}</p>
        </div>
        <Button onClick={openCreate}><FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-1" /> Создать</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Нет мероприятий</div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="cursor-pointer flex-1" onClick={() => loadDistances(ev.id)}>
                  <h3 className="font-semibold">{ev.name}</h3>
                  <p className="text-sm text-muted-foreground">{ev.location} · {new Date(ev.date).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ev.status === 'completed' ? 'default' : 'outline'}>{statusLabels[ev.status] || ev.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(ev)}><FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(ev.id)}><FontAwesomeIcon icon={faTrashCan} className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>

              {distOpen === ev.id && (
                <div className="border-t p-4 bg-muted/20 space-y-3">
                  <h4 className="font-medium text-sm">Дистанции</h4>
                  {distances.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет дистанций</p>
                  ) : (
                    <div className="space-y-1">
                      {distances.map(d => (
                        <div key={d.id} className="flex items-center justify-between bg-card rounded p-2 text-sm">
                          <span>{d.name} — {d.distance_km} км · {(d.price_kopecks / 100).toLocaleString('ru-RU')} ₽</span>
                          <Button size="icon" variant="ghost" onClick={() => removeDist(d.id)}><FontAwesomeIcon icon={faXmark} className="w-3 h-3" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1"><Label className="text-xs">Название</Label><Input value={distForm.name} onChange={e => setDistForm(p => ({ ...p, name: e.target.value }))} /></div>
                    <div className="w-24"><Label className="text-xs">Км</Label><Input type="number" value={distForm.distance_km} onChange={e => setDistForm(p => ({ ...p, distance_km: e.target.value }))} /></div>
                    <div className="w-28"><Label className="text-xs">Цена (коп.)</Label><Input type="number" value={distForm.price_kopecks} onChange={e => setDistForm(p => ({ ...p, price_kopecks: e.target.value }))} /></div>
                    <Button size="sm" onClick={addDistance}><FontAwesomeIcon icon={faPlus} className="w-3 h-3 mr-1" />Добавить</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Редактировать' : 'Создать'} мероприятие</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Название</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Дата</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            <div><Label>Локация</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
            <div>
              <Label>Статус</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Предстоящее</SelectItem>
                  <SelectItem value="ongoing">Идёт</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Сохранить' : 'Создать'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMEvents;
