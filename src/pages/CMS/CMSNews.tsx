import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cmsNewsAPI, cmsBlocksAPI } from '@/lib/cmsApi';
import CMSLayout from './CMSLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  blocks?: any[];
}

const CMSNews: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({ title: '', slug: '', is_published: false, content: '', imageUrl: '' });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data } = await cmsNewsAPI.getAll();
      setNews(data.news);
    } catch {
      toast.error('Ошибка загрузки новостей');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingNews(null);
    setFormData({ title: '', slug: '', is_published: false, content: '', imageUrl: '' });
    setDialogOpen(true);
  };

  const openEdit = async (item: NewsItem) => {
    setEditingNews(item);
    try {
      const { data } = await cmsNewsAPI.getById(item.id);
      const blocks = data.blocks || [];
      const contentBlock = blocks.find((b: any) => b.block_type === 'text_section');
      const imageBlock = blocks.find((b: any) => b.block_type === 'hero');
      setFormData({
        title: data.news.title,
        slug: data.news.slug.replace('news/', ''),
        is_published: data.news.is_published,
        content: contentBlock?.data?.content || '',
        imageUrl: imageBlock?.data?.backgroundImage || '',
      });
    } catch {
      setFormData({ title: item.title, slug: item.slug.replace('news/', ''), is_published: item.is_published, content: '', imageUrl: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast.error('Заполните заголовок и слаг');
      return;
    }
    try {
      if (editingNews) {
        await cmsNewsAPI.update(editingNews.id, {
          title: formData.title,
          slug: formData.slug,
          is_published: formData.is_published,
        });

        // Update blocks
        if (editingNews.blocks) {
          for (const block of editingNews.blocks) {
            if (block.block_type === 'text_section') {
              await cmsBlocksAPI.update(block.id, { data: { title: formData.title, content: formData.content } });
            }
            if (block.block_type === 'hero') {
              await cmsBlocksAPI.update(block.id, { data: { title: formData.title, backgroundImage: formData.imageUrl } });
            }
          }
        } else {
          // Create blocks for new news
          const heroRes = await cmsBlocksAPI.create({
            page_id: editingNews.id,
            block_type: 'hero',
            sort_order: 0,
            data: { title: formData.title, backgroundImage: formData.imageUrl },
          });
          await cmsBlocksAPI.create({
            page_id: editingNews.id,
            block_type: 'text_section',
            sort_order: 1,
            data: { title: formData.title, content: formData.content, alignment: 'left' },
          });
        }

        toast.success('Новость обновлена');
      } else {
        const { data } = await cmsNewsAPI.create({
          title: formData.title,
          slug: formData.slug,
          is_published: formData.is_published,
        });

        const newsId = data.news.id;
        await cmsBlocksAPI.create({
          page_id: newsId,
          block_type: 'hero',
          sort_order: 0,
          data: { title: formData.title, backgroundImage: formData.imageUrl },
        });
        await cmsBlocksAPI.create({
          page_id: newsId,
          block_type: 'text_section',
          sort_order: 1,
          data: { title: formData.title, content: formData.content, alignment: 'left' },
        });

        toast.success('Новость создана');
      }
      setDialogOpen(false);
      loadNews();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить новость?')) return;
    try {
      await cmsNewsAPI.delete(id);
      toast.success('Новость удалена');
      loadNews();
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  return (
    <CMSLayout title="Новости">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Новости</h2>
          <p className="text-gray-500 text-sm mt-1">Управление новостями сайта</p>
        </div>
        <Button onClick={openNew} className="bg-[#003051] hover:bg-[#004a7c]">
          <Plus className="w-4 h-4 mr-2" />
          Новая новость
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003051]" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Нет новостей. Создайте первую.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {news.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">/{item.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={item.is_published ? 'default' : 'secondary'} className="text-xs">
                  {item.is_published ? 'Опубликовано' : 'Черновик'}
                </Badge>
                <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('ru-RU')}</span>
                <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-[#003051]">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingNews ? 'Редактировать новость' : 'Новая новость'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Заголовок</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label>Слаг</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="nazvanie-novosti"
              />
            </div>
            <div>
              <Label>URL обложки</Label>
              <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="/uploads/cms/..." />
            </div>
            <div>
              <Label>Содержимое</Label>
              <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={8} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Опубликовать</Label>
              <Switch checked={formData.is_published} onCheckedChange={(v) => setFormData({ ...formData, is_published: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} className="bg-[#003051]">Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CMSLayout>
  );
};

export default CMSNews;
