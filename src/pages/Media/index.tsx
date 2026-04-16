import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const events = [
  { slug: 'suzdal', location: 'Суздаль', date: '7 июня 2026', image: '/images/hero-1.jpg' },
  { slug: 'igora', location: 'Ленинградская область\nИгора', date: '5 июля 2026', image: '/images/igora-hero.jpg' },
  { slug: 'pushkin', location: 'Санкт-Петербург\nЦарское Село', date: '16 августа 2026', image: '/images/pushkin-hero.jpg' },
];

const MediaPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />
      <main className="pt-24 md:pt-28 flex-1">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 md:py-6">
          <h1 className="font-extrabold text-base uppercase tracking-tight text-foreground mb-6 md:mb-8">
            Медиа
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {events.map((event) => (
              <button
                key={event.slug}
                onClick={() => setSelectedEvent(event)}
                className="bg-card overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 group flex flex-col h-full text-left cursor-pointer"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.location}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <p className="font-bold text-lg md:text-xl text-foreground group-hover:text-secondary transition-colors duration-200 mb-3 whitespace-pre-line min-h-[72px]">
                    {event.location}
                  </p>
                  <span className="inline-block font-semibold text-sm text-white bg-[#003051] px-3 py-1.5 rounded mt-auto self-start">
                    {event.date}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Modal: choose Photo or Video */}
      <Dialog modal={false} open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden border-0 rounded-sm">
          {/* Hero image header */}
          {selectedEvent && (
            <div className="relative h-36 overflow-hidden">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.location}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-lg whitespace-pre-line leading-tight">
                  {selectedEvent.location}
                </h3>
                <span className="text-white/70 text-xs font-semibold mt-1 block">{selectedEvent.date}</span>
              </div>
            </div>
          )}
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 p-5">
            <button
              onClick={() => { navigate(`/media/photo/${selectedEvent?.slug}`); setSelectedEvent(null); }}
              className="flex flex-col items-center gap-2.5 py-5 rounded-sm bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <span className="font-bold text-xs uppercase tracking-widest text-primary group-hover:text-primary-foreground transition-colors">Фото</span>
            </button>
            <button
              onClick={() => { navigate(`/media/video/${selectedEvent?.slug}`); setSelectedEvent(null); }}
              className="flex flex-col items-center gap-2.5 py-5 rounded-sm bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <span className="font-bold text-xs uppercase tracking-widest text-primary group-hover:text-primary-foreground transition-colors">Видео</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <FooterNew />
    </div>
  );
};

export default MediaPage;
