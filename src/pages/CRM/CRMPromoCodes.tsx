import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, promoCodesAPI } from '@/lib/api';
import CRMLayout from './CRMLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

const CRMPromoCodes: React.FC = () => {
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [description, setDescription] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [autoGenerate, setAutoGenerate] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: userData } = await authAPI.getCurrentUser();
      const roles = userData.user.roles || [];
      const hasAccess = roles.some((r: any) => r.role === 'admin' || r.role === 'organizer');
      if (!hasAccess) {
        navigate('/crm');
        return;
      }
      loadPromoCodes();
    } catch {
      navigate('/crm/login');
    }
  };

  const loadPromoCodes = async () => {
    try {
      const { data } = await promoCodesAPI.getAll();
      setPromoCodes(data.promo_codes || []);
    } catch (error) {
      toast.error('Ошибка загрузки промокодов');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPromo(null);
    setCode('');
    setDiscountPercent(10);
    setDescription('');
    setMaxUses('');
    setExpiresAt('');
    setIsActive(true);
    setAutoGenerate(true);
    setDialogOpen(true);
  };

  const openEditDialog = (promo: PromoCode) => {
    setEditingPromo(promo);
    setCode(promo.code);
    setDiscountPercent(promo.discount_percent);
    setDescription(promo.description || '');
    setMaxUses(promo.max_uses?.toString() || '');
    setExpiresAt(promo.expires_at ? new Date(promo.expires_at).toISOString().slice(0, 16) : '');
    setIsActive(promo.is_active);
    setAutoGenerate(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (discountPercent < 1 || discountPercent > 100) {
      toast.error('Скидка должна быть от 1 до 100%');
      return;
    }

    const data: any = {
      discount_percent: discountPercent,
      description: description || null,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt || null,
    };

    if (!autoGenerate) {
      data.code = code.toUpperCase();
    }

    try {
      if (editingPromo) {
        await promoCodesAPI.update(editingPromo.id, {
          ...data,
          is_active: isActive,
        });
        toast.success('Промокод обновлён');
      } else {
        const result = await promoCodesAPI.create(data);
        toast.success(`Промокод создан: ${result.data.promo_code.code}`);
      }
      setDialogOpen(false);
      loadPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить промокод?')) return;
    try {
      await promoCodesAPI.delete(id);
      toast.success('Промокод удалён');
      loadPromoCodes();
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Промокод скопирован');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Бессрочно';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <CRMLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Промокоды</h1>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Создать промокод
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Скидка</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Использовано</TableHead>
                <TableHead>Срок</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Промокоды не созданы
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-primary">{promo.code}</code>
                        <button
                          onClick={() => copyCode(promo.code)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Копировать"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{promo.discount_percent}%</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {promo.description || '—'}
                    </TableCell>
                    <TableCell>
                      {promo.used_count}
                      {promo.max_uses && ` / ${promo.max_uses}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(promo.expires_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.is_active ? 'default' : 'outline'}>
                        {promo.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(promo)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promo.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Редактировать промокод' : 'Создать промокод'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!editingPromo && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-generate"
                  checked={autoGenerate}
                  onCheckedChange={(v) => setAutoGenerate(v === true)}
                />
                <Label htmlFor="auto-generate">Автогенерация кода</Label>
              </div>
            )}

            {!autoGenerate && !editingPromo && (
              <div className="space-y-2">
                <Label>Код промокода</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Например: SUMMER2026"
                  maxLength={20}
                />
              </div>
            )}

            {editingPromo && (
              <div className="space-y-2">
                <Label>Код промокода</Label>
                <Input value={code} disabled className="font-mono" />
              </div>
            )}

            <div className="space-y-2">
              <Label>Скидка (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание промокода"
              />
            </div>

            <div className="space-y-2">
              <Label>Макс. использований (пусто = без ограничений)</Label>
              <Input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Например: 100"
              />
            </div>

            <div className="space-y-2">
              <Label>Срок действия (пусто = бессрочно)</Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {editingPromo && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(v === true)}
                />
                <Label htmlFor="is-active">Активен</Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {editingPromo ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default CRMPromoCodes;
