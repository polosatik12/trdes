import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cmsPagesAPI, cmsBlocksAPI } from '@/lib/cmsApi';
import CMSLayout from './CMSLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  ArrowLeft,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

const BLOCK_TYPES = [
  { value: 'hero', label: 'Hero-баннер', desc: 'Главный баннер с заголовком и фоном' },
  { value: 'text_section', label: 'Текстовая секция', desc: 'Заголовок + текст + опционально картинка' },
  { value: 'image_slider', label: 'Слайдер изображений', desc: 'Карусель фото с автопрокруткой' },
  { value: 'image_gallery', label: 'Галерея', desc: 'Сетка изображений' },
  { value: 'card_grid', label: 'Сетка карточек', desc: 'Карточки с картинками и текстом' },
  { value: 'info_bar', label: 'Инфо-панель', desc: 'Панель с иконками и значениями' },
  { value: 'cta_banner', label: 'CTA-баннер', desc: 'Призыв к действию с кнопкой' },
  { value: 'partners_grid', label: 'Сетка партнёров', desc: 'Логотипы партнёров' },
  { value: 'embed', label: 'Вставка (embed)', desc: 'Встраивание видео, карты и т.д.' },
  { value: 'spacer', label: 'Отступ', desc: 'Пустое пространство' },
];

const DEFAULT_BLOCK_DATA: Record<string, Record<string, unknown>> = {
  hero: { title: 'Заголовок', subtitle: 'Подзаголовок', backgroundImage: '', ctaText: 'Подробнее', ctaLink: '/' },
  text_section: { title: 'Заголовок', content: 'Текст содержимого...', image: '', alignment: 'left' },
  image_slider: { images: [{ src: '', alt: '' }], autoPlay: true, speed: 5000 },
  image_gallery: { images: [{ src: '', alt: '' }], columns: 3 },
  card_grid: { title: 'Заголовок секции', cards: [{ image: '', title: 'Карточка', text: 'Описание', link: '/' }] },
  info_bar: { items: [{ icon: '', label: 'Метка', value: 'Значение' }] },
  cta_banner: { title: 'Призыв', subtitle: 'Подзаголовок', buttonText: 'Кнопка', buttonLink: '/', backgroundImage: '' },
  partners_grid: { title: 'Наши партнёры', partners: [{ logo: '', name: 'Партнёр', url: '' }] },
  embed: { url: '', type: 'video', title: 'Вставка' },
  spacer: { height: 40 },
};

interface Block {
  id?: string;
  page_id?: string;
  block_type: string;
  sort_order: number;
  data: Record<string, unknown>;
  is_visible: boolean;
  _expanded?: boolean;
}

const CMSEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { navigate('/cms'); return; }
    loadPage();
  }, [id]);

  const loadPage = async () => {
    try {
      const { data } = await cmsPagesAPI.getById(id!);
      setPage(data.page);
      const loadedBlocks = data.blocks.map((b: Block, i: number) => ({
        ...b,
        _expanded: false,
      }));
      setBlocks(loadedBlocks);
    } catch {
      toast.error('Ошибка загрузки страницы');
    } finally {
      setLoading(false);
    }
  };

  const addBlock = (type: string) => {
    const newBlock: Block = {
      block_type: type,
      sort_order: blocks.length,
      data: { ...DEFAULT_BLOCK_DATA[type] || {} },
      is_visible: true,
      _expanded: true,
    };
    setBlocks([...blocks, newBlock]);
    setShowBlockPicker(false);
  };

  const updateBlockData = (blockIndex: number, field: string, value: unknown) => {
    const updated = [...blocks];
    updated[blockIndex] = {
      ...updated[blockIndex],
      data: { ...updated[blockIndex].data, [field]: value },
    };
    setBlocks(updated);
  };

  const updateBlockDataNested = (blockIndex: number, arrayField: string, itemIndex: number, field: string, value: unknown) => {
    const updated = [...blocks];
    const array = [...(updated[blockIndex].data[arrayField] as any[])];
    array[itemIndex] = { ...array[itemIndex], [field]: value };
    updated[blockIndex] = { ...updated[blockIndex], data: { ...updated[blockIndex].data, [arrayField]: array } };
    setBlocks(updated);
  };

  const addArrayItem = (blockIndex: number, arrayField: string, template: Record<string, unknown>) => {
    const updated = [...blocks];
    const array = [...(updated[blockIndex].data[arrayField] as any[]), { ...template }];
    updated[blockIndex] = { ...updated[blockIndex], data: { ...updated[blockIndex].data, [arrayField]: array } };
    setBlocks(updated);
  };

  const removeArrayItem = (blockIndex: number, arrayField: string, itemIndex: number) => {
    const updated = [...blocks];
    const array = [...(updated[blockIndex].data[arrayField] as any[])];
    array.splice(itemIndex, 1);
    updated[blockIndex] = { ...updated[blockIndex], data: { ...updated[blockIndex].data, [arrayField]: array } };
    setBlocks(updated);
  };

  const toggleBlock = (index: number) => {
    setEditingBlock(editingBlock === blocks[index].id || `new-${index}` ? null : blocks[index].id || `new-${index}`);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (from: number, direction: 'up' | 'down') => {
    const to = direction === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= blocks.length) return;
    const updated = [...blocks];
    [updated[from], updated[to]] = [updated[to], updated[from]];
    setBlocks(updated);
  };

  const saveAll = async () => {
    if (!page) return;
    setSaving(true);
    try {
      // Update page sort_order and save each block
      const updatedBlockIds: string[] = [];

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockData = {
          page_id: page.id,
          block_type: block.block_type,
          sort_order: i,
          data: block.data,
          is_visible: block.is_visible,
        };

        if (block.id) {
          await cmsBlocksAPI.update(block.id, { sort_order: i, data: block.data, is_visible: block.is_visible });
          updatedBlockIds.push(block.id);
        } else {
          const { data } = await cmsBlocksAPI.create(blockData);
          updatedBlockIds.push(data.block.id);
        }
      }

      toast.success('Страница сохранена');
      loadPage();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const renderBlockFields = (block: Block, blockIndex: number) => {
    const d = block.data;

    switch (block.block_type) {
      case 'hero':
      case 'cta_banner':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Заголовок</Label>
              <Input value={(d.title as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'title', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{block.block_type === 'hero' ? 'Подзаголовок' : 'Подзаголовок'}</Label>
              <Input value={(d.subtitle as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'subtitle', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">URL фона</Label>
              <Input value={(d.backgroundImage as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'backgroundImage', e.target.value)} placeholder="/uploads/cms/..." />
              <p className="text-xs text-gray-400 mt-1">Загрузите фото в Медиатеке и вставьте URL</p>
            </div>
            <div>
              <Label className="text-xs">Текст кнопки</Label>
              <Input value={String(d.ctaText || d.buttonText || '')} onChange={(e) => updateBlockData(blockIndex, block.block_type === 'hero' ? 'ctaText' : 'buttonText', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Ссылка кнопки</Label>
              <Input value={String(d.ctaLink || d.buttonLink || '')} onChange={(e) => updateBlockData(blockIndex, block.block_type === 'hero' ? 'ctaLink' : 'buttonLink', e.target.value)} />
            </div>
          </div>
        );

      case 'text_section':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Заголовок</Label>
              <Input value={(d.title as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'title', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Содержимое</Label>
              <Textarea value={(d.content as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'content', e.target.value)} rows={6} />
            </div>
            <div>
              <Label className="text-xs">URL изображения (опционально)</Label>
              <Input value={(d.image as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'image', e.target.value)} placeholder="/uploads/cms/..." />
            </div>
            <div>
              <Label className="text-xs">Выравнивание</Label>
              <Select value={(d.alignment as string) || 'left'} onValueChange={(v) => updateBlockData(blockIndex, 'alignment', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Слева</SelectItem>
                  <SelectItem value="center">По центру</SelectItem>
                  <SelectItem value="right">Справа</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'image_slider':
      case 'image_gallery':
        const images = (d.images as Array<{ src: string; alt: string }>) || [];
        return (
          <div className="space-y-3">
            <Label className="text-xs">Изображения</Label>
            {images.map((img, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input value={img.src} onChange={(e) => updateBlockDataNested(blockIndex, 'images', i, 'src', e.target.value)} placeholder="URL изображения" className="text-xs" />
                <Input value={img.alt} onChange={(e) => updateBlockDataNested(blockIndex, 'images', i, 'alt', e.target.value)} placeholder="Alt" className="text-xs w-24" />
                <button onClick={() => removeArrayItem(blockIndex, 'images', i)} className="p-1.5 text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addArrayItem(blockIndex, 'images', { src: '', alt: '' })}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Добавить изображение
            </Button>
            {block.block_type === 'image_slider' && (
              <div className="flex items-center justify-between mt-2">
                <Label className="text-xs">Автопрокрутка</Label>
                <Switch
                  checked={d.autoPlay as boolean}
                  onCheckedChange={(v) => updateBlockData(blockIndex, 'autoPlay', v)}
                />
              </div>
            )}
            {block.block_type === 'image_gallery' && (
              <div>
                <Label className="text-xs">Колонок</Label>
                <Select value={String(d.columns || 3)} onValueChange={(v) => updateBlockData(blockIndex, 'columns', parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 'card_grid':
        const cards = (d.cards as Array<{ image: string; title: string; text: string; link: string }>) || [];
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Заголовок секции</Label>
              <Input value={(d.title as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'title', e.target.value)} />
            </div>
            <Label className="text-xs">Карточки</Label>
            {cards.map((card, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Карточка {i + 1}</span>
                  <button onClick={() => removeArrayItem(blockIndex, 'cards', i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Input value={card.title} onChange={(e) => updateBlockDataNested(blockIndex, 'cards', i, 'title', e.target.value)} placeholder="Заголовок" className="text-xs" />
                <Textarea value={card.text} onChange={(e) => updateBlockDataNested(blockIndex, 'cards', i, 'text', e.target.value)} placeholder="Текст" rows={2} className="text-xs" />
                <Input value={card.image} onChange={(e) => updateBlockDataNested(blockIndex, 'cards', i, 'image', e.target.value)} placeholder="URL изображения" className="text-xs" />
                <Input value={card.link} onChange={(e) => updateBlockDataNested(blockIndex, 'cards', i, 'link', e.target.value)} placeholder="Ссылка" className="text-xs" />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addArrayItem(blockIndex, 'cards', { image: '', title: 'Карточка', text: 'Описание', link: '/' })} className="text-xs">
              <Plus className="w-3 h-3 mr-1" /> Добавить карточку
            </Button>
          </div>
        );

      case 'info_bar':
        const items = (d.items as Array<{ icon: string; label: string; value: string }>) || [];
        return (
          <div className="space-y-3">
            <Label className="text-xs">Элементы</Label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input value={item.label} onChange={(e) => updateBlockDataNested(blockIndex, 'items', i, 'label', e.target.value)} placeholder="Метка" className="text-xs" />
                <Input value={item.value} onChange={(e) => updateBlockDataNested(blockIndex, 'items', i, 'value', e.target.value)} placeholder="Значение" className="text-xs" />
                <Input value={item.icon} onChange={(e) => updateBlockDataNested(blockIndex, 'items', i, 'icon', e.target.value)} placeholder="Иконка" className="text-xs w-20" />
                <button onClick={() => removeArrayItem(blockIndex, 'items', i)} className="p-1.5 text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addArrayItem(blockIndex, 'items', { icon: '', label: 'Метка', value: 'Значение' })} className="text-xs">
              <Plus className="w-3 h-3 mr-1" /> Добавить элемент
            </Button>
          </div>
        );

      case 'partners_grid':
        const partners = (d.partners as Array<{ logo: string; name: string; url: string }>) || [];
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Заголовок</Label>
              <Input value={(d.title as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'title', e.target.value)} />
            </div>
            <Label className="text-xs">Партнёры</Label>
            {partners.map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input value={p.name} onChange={(e) => updateBlockDataNested(blockIndex, 'partners', i, 'name', e.target.value)} placeholder="Название" className="text-xs" />
                <Input value={p.logo} onChange={(e) => updateBlockDataNested(blockIndex, 'partners', i, 'logo', e.target.value)} placeholder="URL лого" className="text-xs" />
                <Input value={p.url} onChange={(e) => updateBlockDataNested(blockIndex, 'partners', i, 'url', e.target.value)} placeholder="URL" className="text-xs" />
                <button onClick={() => removeArrayItem(blockIndex, 'partners', i)} className="p-1.5 text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addArrayItem(blockIndex, 'partners', { logo: '', name: 'Партнёр', url: '' })} className="text-xs">
              <Plus className="w-3 h-3 mr-1" /> Добавить партнёра
            </Button>
          </div>
        );

      case 'embed':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Заголовок</Label>
              <Input value={(d.title as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'title', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">URL встраивания</Label>
              <Input value={(d.url as string) || ''} onChange={(e) => updateBlockData(blockIndex, 'url', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Тип</Label>
              <Select value={(d.type as string) || 'video'} onValueChange={(v) => updateBlockData(blockIndex, 'type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Видео</SelectItem>
                  <SelectItem value="map">Карта</SelectItem>
                  <SelectItem value="iframe">iFrame</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div>
            <Label className="text-xs">Высота (px)</Label>
            <Input
              type="number"
              value={d.height as number || 40}
              onChange={(e) => updateBlockData(blockIndex, 'height', parseInt(e.target.value))}
            />
          </div>
        );

      default:
        return <p className="text-sm text-gray-400">Неизвестный тип блока</p>;
    }
  };

  if (loading) {
    return (
      <CMSLayout title="Редактор">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003051]" />
        </div>
      </CMSLayout>
    );
  }

  if (!page) {
    return (
      <CMSLayout title="Редактор">
        <p className="text-gray-500">Страница не найдена</p>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout title={`Редактор: ${page.title}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/cms')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Назад
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{page.title}</h2>
            <p className="text-sm text-gray-400">/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={saveAll} disabled={saving} className="bg-[#003051] hover:bg-[#004a7c]">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить всё'}
          </Button>
        </div>
      </div>

      {/* Blocks list */}
      <div className="space-y-3">
        {blocks.map((block, index) => {
          const blockDef = BLOCK_TYPES.find(b => b.value === block.block_type);
          const blockKey = block.id || `new-${index}`;
          const isExpanded = editingBlock === blockKey;

          return (
            <div
              key={blockKey}
              className={`bg-white rounded-xl border transition-all ${
                !block.is_visible ? 'opacity-60 border-dashed' : 'border-gray-200'
              }`}
            >
              {/* Block header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleBlock(index)}
              >
                <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                <span className="text-sm font-medium text-gray-500 w-6 text-center">{index + 1}</span>
                <span className="text-sm font-medium text-gray-900 flex-1">{blockDef?.label || block.block_type}</span>
                <Badge variant={block.is_visible ? 'outline' : 'secondary'} className="text-xs">
                  {block.is_visible ? 'Виден' : 'Скрыт'}
                </Badge>
                <button
                  onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }}
                  disabled={index === blocks.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setBlocks(prev => { const u = [...prev]; u[index] = { ...u[index], is_visible: !u[index].is_visible }; return u; }); }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {block.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeBlock(index); }}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {/* Block content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  {renderBlockFields(block, index)}
                </div>
              )}
            </div>
          );
        })}

        {blocks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-400 mb-4">Нет блоков. Добавьте первый.</p>
            <Button onClick={() => setShowBlockPicker(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Добавить блок
            </Button>
          </div>
        )}

        {blocks.length > 0 && (
          <Button
            onClick={() => setShowBlockPicker(true)}
            variant="outline"
            className="w-full border-dashed border-2 border-gray-300 text-gray-500 hover:border-[#003051] hover:text-[#003051]"
          >
            <Plus className="w-4 h-4 mr-2" /> Добавить блок
          </Button>
        )}
      </div>

      {/* Block type picker dialog */}
      {showBlockPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowBlockPicker(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Выберите тип блока</h3>
            <div className="grid grid-cols-2 gap-3">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.value}
                  onClick={() => addBlock(bt.value)}
                  className="p-4 text-left rounded-xl border border-gray-200 hover:border-[#003051] hover:bg-blue-50/50 transition-all"
                >
                  <div className="font-medium text-sm text-gray-900">{bt.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{bt.desc}</div>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setShowBlockPicker(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}
    </CMSLayout>
  );
};

export default CMSEditor;
