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

const MOCK_PHOTOS = [
  { id:'1', url:'/images/hero-1.jpg',      title:'Старт Grand Tour' },
  { id:'2', url:'/images/slider-4.jpg',    title:'Финиш' },
  { id:'3', url:'/images/igora-hero.jpg',  title:'Трасса' },
  { id:'4', url:'/images/pushkin-hero.jpg',title:'Награждение' },
];

const MediaPhotoGallery: React.FC = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/media-gallery?event_slug=${eventSlug}&type=photo`)
      .then(({ data }) => setPhotos(data.items?.length ? data.items : MOCK_PHOTOS))
      .catch(() => setPhotos(MOCK_PHOTOS))
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
            <span className="text-foreground">Фото — {eventNames[eventSlug || ''] || eventSlug}</span>
          </div>
          <h1 className="font-extrabold text-base uppercase tracking-tight text-foreground mb-8">
            Фото — {eventNames[eventSlug || ''] || eventSlug}
          </h1>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : photos.length === 0 ? (
            <div className="flex justify-center py-20 text-muted-foreground">Фото будут добавлены позже</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map(p => (
                <button key={p.id} onClick={() => setLightbox(p.url)}
                  className="aspect-square overflow-hidden rounded-lg group">
                  <img src={p.url} alt={p.title || ''} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <img src={lightbox} className="max-h-[90vh] max-w-[90vw] object-contain" />
          <button className="absolute top-4 right-4 text-white text-3xl leading-none">×</button>
        </div>
      )}

      <FooterNew />
    </div>
  );
};

export default MediaPhotoGallery;
