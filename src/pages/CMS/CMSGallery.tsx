import React, { useEffect, useState } from 'react';
import CMSLayout from './CMSLayout';
import { toast } from 'sonner';
import { Trash2, Upload } from 'lucide-react';
import api from '@/lib/api';

const EVENTS = [
  { slug: 'suzdal',  label: 'Суздаль' },
  { slug: 'igora',   label: 'Игора' },
  { slug: 'pushkin', label: 'Царское Село' },
];

const CMSGallery: React.FC = () => {
  const [eventSlug, setEventSlug] = useState('suzdal');
  const [type, setType] = useState<'photo' | 'video'>('photo');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/media-gallery?event_slug=${eventSlug}&type=${type}`)
      .then(({ data }) => setItems(data.items || []))
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [eventSlug, type]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('event_slug', eventSlug);
      fd.append('type', type);
      try {
        await api.post('/media-gallery/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        successCount++;
      } catch {
        toast.error(`Ошибка загрузки: ${file.name}`);
      }
    }
    setUploading(false);
    e.target.value = '';
    if (successCount > 0) { toast.success(`Загружено файлов: ${successCount}`); load(); }
  };

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try { await api.delete(`/media-gallery/${id}`); }
    catch { toast.error('Ошибка удаления'); load(); }
  };

  return (
    <CMSLayout title="Галерея">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Галерея</h2>
          <p className="text-gray-500 text-sm mt-1">Фото и видео для страницы Медиа</p>
        </div>
        <label className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer bg-[#003051] text-white hover:bg-[#004a7c] ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4" />
            {uploading ? 'Загрузка...' : 'Загрузить файл'}
            <input type="file" className="hidden" multiple
              accept={type === 'photo' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/quicktime,video/webm'}
              onChange={handleFileUpload} />
          </label>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select value={eventSlug} onChange={e => setEventSlug(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
          {EVENTS.map(ev => <option key={ev.slug} value={ev.slug}>{ev.label}</option>)}
        </select>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['photo', 'video'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${type === t ? 'bg-[#003051] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {t === 'photo' ? 'Фото' : 'Видео'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003051]" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 text-gray-400">
          Нет {type === 'photo' ? 'фотографий' : 'видео'}. Нажмите «Добавить».
        </div>
      ) : type === 'photo' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(item => (
            <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={item.url} alt={item.title || ''} className="w-full h-full object-cover" />
              <button onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
              {item.title && <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1.5 truncate">{item.title}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.title || item.url}</p>
                <p className="text-sm text-gray-400 truncate">{item.url}</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

    </CMSLayout>
  );
};

export default CMSGallery;
