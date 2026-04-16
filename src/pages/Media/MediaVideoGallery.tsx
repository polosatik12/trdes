import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';
import api from '@/lib/api';

const eventNames: Record<string, string> = {
  suzdal: 'Суздаль',
  igora: 'Игора',
  pushkin: 'Царское Село',
};

// Извлекает YouTube embed URL из любой ссылки
function toEmbedUrl(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}

const MOCK_VIDEOS = [
  { id:'1', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', title:'Обзор Grand Tour 2025' },
  { id:'2', url:'https://www.youtube.com/embed/dQw4w9WgXcQ', title:'Финиш Суздаль 2025' },
];

const MediaVideoGallery: React.FC = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/media-gallery?event_slug=${eventSlug}&type=video`)
      .then(({ data }) => setVideos(data.items?.length ? data.items : MOCK_VIDEOS))
      .catch(() => setVideos(MOCK_VIDEOS))
      .finally(() => setLoading(false));
  }, [eventSlug]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />
      <main className="pt-24 md:pt-28 flex-1">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 md:py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/media" className="hover:text-foreground">Медиа</Link>
            <span>/</span>
            <span className="text-foreground">Видео — {eventNames[eventSlug || ''] || eventSlug}</span>
          </div>
          <h1 className="font-extrabold text-base uppercase tracking-tight text-foreground mb-8">
            Видео — {eventNames[eventSlug || ''] || eventSlug}
          </h1>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : videos.length === 0 ? (
            <div className="flex justify-center py-20 text-muted-foreground">Видео будут добавлены позже</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map(v => (
                <div key={v.id} className="space-y-2">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe src={toEmbedUrl(v.url)} title={v.title || ''}
                      className="w-full h-full" allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  </div>
                  {v.title && <p className="text-sm text-muted-foreground">{v.title}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <FooterNew />
    </div>
  );
};

export default MediaVideoGallery;
