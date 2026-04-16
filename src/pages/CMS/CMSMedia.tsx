import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cmsAssetsAPI } from '@/lib/cmsApi';
import CMSLayout from './CMSLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload,
  Image,
  FileText,
  Trash2,
  Copy,
  Search,
  Grid,
} from 'lucide-react';
import { toast } from 'sonner';

const CMSMedia: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'pdf'>('all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const { data } = await cmsAssetsAPI.getAll();
      setAssets(data.assets);
    } catch {
      toast.error('Ошибка загрузки файлов');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await cmsAssetsAPI.upload(file);
      }
      toast.success(`Загружено ${files.length} файл(ов)`);
      loadAssets();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить файл?')) return;
    try {
      await cmsAssetsAPI.delete(id);
      toast.success('Файл удалён');
      loadAssets();
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL скопирован');
  };

  const filteredAssets = assets.filter((a) => {
    const matchSearch = a.original_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'image' && a.mime_type.startsWith('image')) ||
      (filter === 'pdf' && a.mime_type === 'application/pdf');
    return matchSearch && matchFilter;
  });

  return (
    <CMSLayout title="Медиатека">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Медиатека</h2>
          <p className="text-gray-500 text-sm mt-1">Загрузка и управление файлами</p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-[#003051] hover:bg-[#004a7c]"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Загрузка...' : 'Загрузить файлы'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск файлов..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'image', 'pdf'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === f ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'image' ? 'Изображения' : 'PDF'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003051]" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Image className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Нет файлов. Загрузите первый.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Preview */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {asset.mime_type.startsWith('image') ? (
                  <img
                    src={asset.file_url}
                    alt={asset.original_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-gray-300" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                  <button
                    onClick={() => copyUrl(asset.file_url)}
                    className="p-2 bg-white rounded-lg text-gray-700 hover:text-[#003051] transition-colors"
                    title="Копировать URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs text-gray-700 truncate" title={asset.original_name}>
                  {asset.original_name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {(asset.file_size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </CMSLayout>
  );
};

export default CMSMedia;
