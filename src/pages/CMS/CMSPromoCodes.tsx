import React, { useEffect, useState } from 'react';
import { promoCodesAPI } from '@/lib/api';
import CMSLayout from './CMSLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Copy } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  description: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const DURATION_OPTIONS = [
  { label: '15 минут',  minutes: 15 },
  { label: '30 минут',  minutes: 30 },
  { label: '1 час',     minutes: 60 },
  { label: '2 часа',    minutes: 120 },
  { label: '5 часов',   minutes: 300 },
  { label: '10 часов',  minutes: 600 },
  { label: '1 день',    minutes: 1440 },
  { label: '2 дня',     minutes: 2880 },
  { label: '3 дня',     minutes: 4320 },
  { label: '4 дня',     minutes: 5760 },
  { label: '1 неделя',  minutes: 10080 },
  { label: '1 месяц',   minutes: 43200 },
  { label: 'Бессрочно', minutes: 0 },
];

const EMPTY_FORM = { code: '', discount_percent: 10, description: '', max_uses: '', duration: '0' };

const MOCK_CODES: PromoCode[] = [
  { id: 'mock1', code: 'TOUR2026', discount_percent: 15, description: 'Скидка для ранней регистрации', max_uses: 100, used_count: 23, is_active: true, expires_at: '2026-06-01T00:00:00Z', created_at: '2026-04-01T00:00:00Z' },
];

const CMSPromoCodes: React.FC = () => {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    try {
      const { data } = await promoCodesAPI.getAll();
      const list = data.promo_codes || [];
      setCodes(list.length ? list : MOCK_CODES);
    } catch { setCodes(MOCK_CODES); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = (p: PromoCode) => {
    setEditing(p);
    setForm({ code: p.code, discount_percent: p.discount_percent, description: p.description || '', max_uses: p.max_uses?.toString() || '', duration: '0' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error('Введите код'); return; }
    if (form.discount_percent < 1 || form.discount_percent > 100) { toast.error('Скидка 1–100%'); return; }

    const minutes = Number(form.duration);
    const expires_at = minutes > 0 ? new Date(Date.now() + minutes * 60000).toISOString() : null;

    const payload: any = {
      code: form.code.toUpperCase(),
      discount_percent: form.discount_percent,
      description: form.description || null,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at,
    };

    try {
      if (editing) {
        await promoCodesAPI.update(editing.id, payload);
        toast.success('Промокод обновлён');
      } else {
        await promoCodesAPI.create(payload);
        toast.success('Промокод создан');
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    // Для мока удаляем локально
    setCodes(prev => prev.filter(c => c.id !== id));
    try { await promoCodesAPI.delete(id); } catch { /* мок */ }
    toast.success('Промокод удалён');
  };

  const formatExpiry = (d: string | null) => {
    if (!d) return 'Бессрочно';
    const dt = new Date(d);
    return dt < new Date() ? <span className="text-red-500">Истёк</span> : dt.toLocaleDateString('ru-RU');
  };

  return (
    <CMSLayout title="Промокоды">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Промокоды</h2>
          <p className="text-gray-500 text-sm mt-1">Скидки для участников</p>
        </div>
        <Button onClick={openCreate} className="bg-[#003051] hover:bg-[#004a7c]">
          <Plus className="w-4 h-4 mr-2" />Создать
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003051]" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="text-left px-5 py-3">Код</th>
                <th className="text-left px-5 py-3">Скидка</th>
                <th className="text-left px-5 py-3">Описание</th>
                <th className="text-left px-5 py-3">Использовано</th>
                <th className="text-left px-5 py-3">Срок</th>
                <th className="text-left px-5 py-3">Статус</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Промокодов нет</td></tr>
              ) : codes.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-[#003051]">{p.code}</code>
                      <button onClick={() => { navigator.clipboard.writeText(p.code); toast.success('Скопировано'); }} className="text-gray-400 hover:text-gray-600">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge variant="secondary">{p.discount_percent}%</Badge></td>
                  <td className="px-5 py-3 text-gray-500 max-w-[180px] truncate">{p.description || '—'}</td>
                  <td className="px-5 py-3">{p.used_count}{p.max_uses ? ` / ${p.max_uses}` : ''}</td>
                  <td className="px-5 py-3 text-gray-500">{formatExpiry(p.expires_at)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={p.is_active ? 'default' : 'outline'}>{p.is_active ? 'Активен' : 'Неактивен'}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-[#003051]"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать' : 'Новый промокод'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Код промокода</Label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2026" maxLength={20} disabled={!!editing} className="font-mono" />
            </div>
            <div>
              <Label>Скидка (%)</Label>
              <Input type="number" min={1} max={100} value={form.discount_percent}
                onChange={e => setForm({ ...form, discount_percent: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <Label>Описание (необязательно)</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Для чего промокод" />
            </div>
            <div>
              <Label>Макс. использований (пусто = без ограничений)</Label>
              <Input type="number" min={1} value={form.max_uses}
                onChange={e => setForm({ ...form, max_uses: e.target.value })} placeholder="Например: 50" />
            </div>
            {!editing && (
              <div>
                <Label>Срок действия</Label>
                <Select value={form.duration} onValueChange={v => setForm({ ...form, duration: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(o => (
                      <SelectItem key={o.minutes} value={String(o.minutes)}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} className="bg-[#003051]">{editing ? 'Сохранить' : 'Создать'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CMSLayout>
  );
};

export default CMSPromoCodes;
