import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoHeader from '@/assets/logo-header.svg';
import HeaderNew from '../components/HeaderNew';
import FooterNew from '../components/FooterNew';

const Calendar: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const events = [
    { date: '7 июня 2026', title: 'Tour de Russie', location: 'Суздаль', image: '/images/hero-1.jpg', link: '/events/suzdal' },
    { date: '5 июля 2026', title: 'Tour de Russie', location: 'Ленинградская область\nИгора', image: '/images/igora-hero.jpg', link: '/events/igora' },
    { date: '16 августа 2026', title: 'Tour de Russie', location: 'Санкт-Петербург\nЦарское Село', image: '/images/pushkin-hero.jpg', link: '/events/pushkin' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />
      
       <main className="pt-24 md:pt-28 flex-1">
         <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 md:py-6">
            {/* Page Title */}
            <h1 className="font-extrabold text-base uppercase tracking-tight text-foreground mb-6 md:mb-8">
              Календарь
            </h1>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {events.map((event, index) => (
              <Link
                key={index}
                to={event.link}
                className="bg-card overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 group flex flex-col h-full"
              >
                {/* Event Photo */}
                <div className="h-48 overflow-hidden">
                   <img
                    src={event.image}
                    alt={event.location}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                
                 {/* Event Info */}
                 <div className="p-5 md:p-6 flex flex-col flex-1">
                   <p className="font-bold text-lg md:text-xl text-foreground group-hover:text-secondary transition-colors duration-200 mb-3 whitespace-pre-line min-h-[72px]">
                     {event.location}
                   </p>
                  <span className="inline-block font-semibold text-sm text-white bg-[#003051] px-3 py-1.5 rounded mt-auto self-start">
                    {event.date}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
      </main>
      
      <FooterNew />
    </div>
  );
};

export default Calendar;
