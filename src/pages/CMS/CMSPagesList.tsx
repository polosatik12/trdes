import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cmsPagesAPI } from '@/lib/cmsApi';
import CMSLayout from './CMSLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const CMSPagesList: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({ slug: '', title: '', is_published: true });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const { data } = await cmsPagesAPI.getAll();
      setPages(data.pages);
    } catch {
      toast.error('Ошибка загрузки страниц');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!newPage.slug || !newPage.title) {
      toast.error('Заполните все поля');
      return;
    }
    try {
      const { data } = await cmsPagesAPI.create(newPage);
      toast.success('Страница создана');
      setDialogOpen(false);
      setNewPage({ slug: '', title: '', is_published: true });
      loadPages();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка создания страницы');
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Удалить страницу? Все блоки будут удалены.')) return;
    try {
      await cmsPagesAPI.delete(id);
      toast.success('Страница удалена');
      loadPages();
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  return (
    <CMSLayout title="Страницы">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Страницы сайта</h2>
          <p className="text-gray-500 text-sm mt-1">Управление страницами и их блоками</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#003051] hover:bg-[#004a7c]">
          <Plus className="w-4 h-4 mr-2" />
          Новая страница
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003051]" />
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Нет страниц. Создайте первую.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <Link to={`/cms/pages/${page.id}`} className="font-medium text-gray-900 hover:text-[#003051]">
                    {page.title}
                  </Link>
                  <p className="text-sm text-gray-400 mt-0.5">/{page.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={page.is_published ? 'default' : 'secondary'} className="text-xs">
                  {page.is_published ? 'Опубликовано' : 'Черновик'}
                </Badge>
                <span className="text-sm text-gray-400">{page.block_count || 0} блоков</span>
                <Link
                  to={`/cms/pages/${page.id}`}
                  className="p-2 text-gray-400 hover:text-[#003051] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDeletePage(page.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-[#003051] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая страница</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Название</Label>
              <Input
                value={newPage.title}
                onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                placeholder="Главная"
              />
            </div>
            <div>
              <Label>Слаг (URL)</Label>
              <Input
                value={newPage.slug}
                onChange={(e) => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="home"
              />
              <p className="text-xs text-gray-400 mt-1">Только латиница, цифры и дефисы</p>
            </div>
            <div className="flex items-center justify-between">
              <Label>Опубликовать сразу</Label>
              <Switch
                checked={newPage.is_published}
                onCheckedChange={(v) => setNewPage({ ...newPage, is_published: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleCreatePage} className="bg-[#003051]">Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CMSLayout>
  );
};

export default CMSPagesList;
