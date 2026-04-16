import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import newsTitleSvg from '@/assets/news-title.svg';
import { newsItems } from '@/data/news';


const upcomingEvents = [
{ date: '7 июня', title: 'Tour de Russie', location: 'Суздаль', link: '/events/suzdal' },
  { date: '5 июля', title: 'Tour de Russie', location: 'Ленинградская область\nИгора', link: '/events/igora' },
  { date: '16 августа', title: 'Tour de Russie', location: 'Санкт-Петербург\nЦарское Село', link: '/events/pushkin' },
];


const NewsFeed: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

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
    <section ref={sectionRef} className="tdr-section">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,340px)] gap-8 mb-4 tdr-fade-in">
        <img src={newsTitleSvg} alt="Наши новости" className="h-[40px] md:h-[50px] lg:h-[60px] w-auto block" />
        <div className="hidden lg:flex items-center gap-2 self-end">
           <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 20, color: 'hsl(201, 100%, 16%)' }} />
          <h3 className="font-bold text-lg text-foreground uppercase tracking-tight">
            Ближайшие события
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,340px)] gap-8 items-stretch">
        {/* Left: News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.slice(0, 3).map((item, index) =>
          <Link
            key={item.id}
            to={`/news/${item.slug}`}
            className={`bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full tdr-fade-in tdr-stagger-${index + 1} cursor-pointer`}>

                <OptimizedImage
              src={item.image}
              isBackground
              backgroundSize={item.id === 3 ? '130%' : 'cover'}
              className="h-[200px]" />

                <div className="p-6 flex flex-col flex-1">
                  <span className="text-sm font-semibold text-foreground">{item.date}</span>
                  <h3 className="font-bold text-lg mt-2 mb-3 text-foreground font-mono whitespace-pre-line">{item.title}</h3>
                  <p className="text-sm leading-relaxed mb-4 font-semibold text-foreground whitespace-pre-line">{item.excerpt}</p>
                   <span className="inline-flex items-center gap-2 text-secondary font-bold text-sm hover:gap-3 transition-all mt-auto">
                     Читать далее <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 16 }} />
                   </span>
                </div>
              </Link>
          )}
        </div>

        {/* Right: Upcoming Events */}
        <aside className="tdr-fade-in lg:-mt-1 flex flex-col">
          {/* "Все новости" button — above events on mobile/tablet, hidden on desktop */}
          <div className="text-center mb-6 lg:hidden tdr-fade-in">
            <Link to="/news" className="tdr-btn tdr-btn-outline">
              Все новости
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-3 lg:hidden">
            <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 20 }} className="text-primary" />
            <h3 className="font-bold text-lg text-foreground uppercase tracking-tight">
              Ближайшие события
            </h3>
          </div>

          <div className="rounded-lg p-4 bg-card flex-1 flex flex-col justify-between" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)' }}>
            <div className="flex flex-col gap-4">
              {upcomingEvents.map((event, index) =>
              <Link
                key={index}
                to={event.link}
                className="flex items-stretch overflow-hidden rounded-lg border border-border shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 group">

                  <div
                  className="flex items-center justify-center px-3 py-4 min-w-[90px] max-w-[90px] text-center aspect-square"
                  style={{ backgroundColor: 'hsl(202, 100%, 16%)' }}>

                    <span className="font-semibold text-sm text-white whitespace-nowrap">
                      {event.date}
                    </span>
                  </div>
                  <div className="bg-card flex-1 px-4 py-4 flex flex-col justify-center shadow-inner">
                    <span className="text-xs font-semibold text-foreground">{event.title}</span>
                    <span className="font-bold text-base text-foreground group-hover:text-secondary transition-colors whitespace-pre-line">
                      {event.location}
                    </span>
                  </div>
                </Link>
              )}
            </div>

            <div className="mt-6">
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 text-foreground font-bold text-sm hover:gap-3 transition-all">

                Весь календарь <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 16 }} />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* "Все новости" button — desktop only, below the grid */}
      <div className="text-center mt-12 tdr-fade-in hidden lg:block">
        <Link to="/news" className="tdr-btn tdr-btn-outline">
          Все новости
        </Link>
      </div>
    </section>);

};

export default NewsFeed;