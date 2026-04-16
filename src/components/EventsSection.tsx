import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  distances: string[];
  link: string;
}

const events: Event[] = [
  {
    id: 1,
    title: 'Tour de Russie: Суздаль',
    date: '7 июня',
    location: 'Суздаль, Владимирская область',
    image: '/images/hero-1.jpg',
    distances: ['25 км', '60 км', '114 км'],
    link: '/events/suzdal',
  },
  {
    id: 2,
    title: 'Tour de Russie: Игора',
    date: '5 июля',
    location: 'Игора, Ленинградская область',
    image: '/images/igora-hero.jpg',
    distances: ['30 км', '70 км', '130 км'],
    link: '/events/igora',
  },
  {
    id: 3,
    title: 'Tour de Russie: Царское Село',
    date: '16 августа',
    location: 'Царское Село, Санкт-Петербург',
    image: '/images/pushkin-hero.jpg',
    distances: ['25 км', '55 км', '110 км'],
    link: '/events/pushkin',
  },
];

const EventsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.tdr-fade-in');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-muted py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="tdr-fade-in font-extrabold text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight leading-tight">
            <span className="text-secondary">Ближайшие</span>
            <br />
            <span className="text-primary">мероприятия</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {events.map((event, index) => (
            <article 
              key={event.id} 
              className={`tdr-fade-in tdr-stagger-${index + 1} bg-card overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300`}
            >
              <div className="relative">
                <OptimizedImage
                  src={event.image}
                  isBackground
                  className="h-48 md:h-56"
                />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 font-bold text-sm uppercase">
                  {event.date}
                </div>
              </div>
              
              <div className="p-5 md:p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 14 }} className="text-primary" />
                  <span>{event.location}</span>
                </div>
                
                <h3 className="font-bold text-lg md:text-xl text-foreground mb-4">
                  {event.title}
                </h3>
                
                <div className="flex flex-wrap gap-3 mb-5">
                  {event.distances.map((distance) => (
                    <span 
                      key={distance} 
                      className="text-sm font-medium text-muted-foreground"
                    >
                      {distance}
                    </span>
                  ))}
                </div>
                
                <button 
                  onClick={() => navigate(event.link)}
                  className="w-full btn-gradient font-bold text-sm uppercase tracking-wider py-3 transition-all duration-200">
                  Подробнее
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
