import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faXmark, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import HeaderNew from '../../components/HeaderNew';
import FooterNew from '../../components/FooterNew';

// Import images
import heroImage from '../../assets/events/moscow-race-hero.jpg';

// Slider images
import sliderImage1 from '../../assets/events/moscow-cyclists-1.jpg';
import sliderImage2 from '../../assets/events/moscow-cyclists-2.jpg';
import sliderImage3 from '../../assets/events/moscow-cyclists-3.jpg';
import sliderImage4 from '../../assets/events/moscow-cyclists-4.jpg';

const sliderImages = [sliderImage1, sliderImage2, sliderImage3, sliderImage4];

const borderColors = ['#fec800', '#62b22f', '#e61c56'];

const routes = [
  {
    name: 'Intro Tour',
    distance: '33 км',
    elevation: '~180 м',
    desc: 'Самая короткая дистанция этапа составляет 33 километра с набором высоты 180 метров. Отличный вариант для любителей велосипедных прогулок по живописным набережным столицы.',
    ridewithgpsId: '53069912'
  },
  {
    name: 'Median Tour',
    distance: '66 км',
    elevation: '~360 м',
    desc: 'Средняя дистанция составляет два круга с набором 360 метров. В режиме велогонки многим любителям и такая дистанция покажется не простой в виду особенностей московской дорожной архитектуры. Следует быть особенно внимательными в наиболее опасных местах и развязках.',
    ridewithgpsId: '53069912'
  },
  {
    name: 'Grand Tour',
    distance: '100 км',
    elevation: '~540 м',
    desc: 'Три круга с петлей вокруг Кремля возможно не самое тяжелое испытание для участников серии соревнований Tour de Russie. Но любая гонка всегда требует большого внимания и концентрации от участников в виду высоких скоростей, которые развиваются на относительно ровной дистанции. Живописные виды столицы являются большим бонусом для участников каждого заезда.',
    ridewithgpsId: '53069912'
  }
];

const Moscow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeRoute, setActiveRoute] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const itemsPerView = isMobile ? 1 : 3;
  const maxSlide = Math.max(0, sliderImages.length - itemsPerView);
  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const sliderTouchX = useRef(0);
  const handleSliderTouchStart = (e: React.TouchEvent) => {sliderTouchX.current = e.touches[0].clientX;};
  const handleSliderTouchEnd = (e: React.TouchEvent) => {
    const diff = sliderTouchX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {diff > 0 ? nextSlide() : prevSlide();}
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />

      {/* Hero Section */}
      <section
        className="relative flex-1 pt-[88px] min-h-[35vh] md:min-h-[55vh]"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="absolute inset-0 bg-black/20" />
      </section>

      {/* Event Description */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          {/* Info Bar */}
          <div className="bg-[#003051] px-4 py-3 md:px-8 md:py-5 text-white flex flex-col md:flex-row items-center gap-3 md:gap-6 mb-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-extrabold text-lg md:text-2xl uppercase tracking-wide mb-1 md:mb-2">
                Tour de Russie — Москва
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-white/90">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Дата</div>
                  <div className="text-sm font-semibold">2027</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Место</div>
                  <div className="text-sm font-semibold">Лужники, Москва</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Дистанции</div>
                  <div className="text-sm font-semibold">33 / 66 / 100 км</div>
                </div>
              </div>
            </div>
            <Link
              to="/events/moscow/registration"
              className="shrink-0 border-2 border-white text-white bg-transparent hover:bg-white/10 font-bold uppercase tracking-wider text-xs md:text-sm px-6 py-2 md:px-8 md:py-3 transition-colors">
              Регистрация
            </Link>
          </div>
          <div className="space-y-4 text-foreground text-base md:text-lg leading-relaxed">
            <p>
              Мероприятие в Москве, уже согласовано и находится в ЕКП города. Стартовый город планируется на территории Лужников. Старт и финиш на улице Лужники.
            </p>
            <p>
              Трасса проходит по набережным Москва реки, по которым состоялось не мало гонок за всю историю отечественного велоспорта. Отличительной особенностью заезда будет проезд вокруг Кремля, по траектории одноименной легендарной гонки.
            </p>
            <p>
              К тому же направление движения будет против часовой стрелки и это внесет отдельный колорит в новизну ощущений от дистанции. Длина круга составляет 33 километра и в зависимости от их количества формируются три дистанции: 33 (1 круг); 66 (2 круга) и 100 километров (3 круга). Основной набор высоты осуществляется в районе петли вокруг Кремля. Остальная дистанция относительно плоская и соответственно скоростная.
            </p>
          </div>
        </div>
      </section>

      {/* Cyclists Photo Gallery */}
      <section className="py-12 bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" onTouchStart={handleSliderTouchStart} onTouchEnd={handleSliderTouchEnd}>
              {sliderImages.slice(currentSlide, currentSlide + itemsPerView).map((img, idx) =>
              <div key={currentSlide + idx} className="aspect-[4/3] overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(img)}>
                  <img
                  src={img}
                  alt={`Tour de Russie Москва ${currentSlide + idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async" />
                </div>
              )}
            </div>
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white shadow-md flex items-center justify-center hover:bg-muted transition-colors hidden md:flex disabled:opacity-30">
              <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 20 }} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide >= maxSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white shadow-md flex items-center justify-center hover:bg-muted transition-colors hidden md:flex disabled:opacity-30">
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 20 }} />
            </button>
            <div className="flex justify-center items-center gap-2 mt-4">
              <button onClick={prevSlide} disabled={currentSlide === 0} className="md:hidden w-7 h-7 flex items-center justify-center rounded-full bg-foreground/10 disabled:opacity-30">
                <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: maxSlide + 1 }).map((_, idx) =>
                <button key={idx} onClick={() => setCurrentSlide(idx)}
                className="rounded-full transition-all duration-300"
                style={{ width: idx === currentSlide ? 18 : 8, height: 8, background: idx === currentSlide ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.2)' }} />
                )}
              </div>
              <button onClick={nextSlide} disabled={currentSlide >= maxSlide} className="md:hidden w-7 h-7 flex items-center justify-center rounded-full bg-foreground/10 disabled:opacity-30">
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Distances / Route Maps */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <h2 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-10 text-center font-mono">
            Дистанции
          </h2>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
             {routes.map((route, idx) => {
              const isRouteExpanded = expandedRoute === idx;
              return (
                <div
                  key={route.name}
                  className={`text-left border-2 transition-all rounded-none overflow-hidden flex flex-col ${
                  idx === activeRoute ? 'bg-primary/5' : 'hover:border-opacity-50'}`
                  }
                  style={{ borderColor: borderColors[idx] }}>

                 <div className="px-6 py-3 cursor-pointer" style={{ backgroundColor: borderColors[idx] }}
                  onClick={() => {setActiveRoute(idx); setExpandedRoute(prev => prev === idx ? null : idx);}}>
                   <h3 className="font-bold text-white uppercase text-center text-xl font-mono">{route.name} {route.distance}</h3>
                 </div>

                 <div className="px-6 py-4 flex items-center justify-between cursor-pointer"
                  onClick={() => {setExpandedRoute(isRouteExpanded ? null : idx);setActiveRoute(idx);}}>
                   <span className="text-sm font-bold text-muted-foreground">Набор высоты: {route.elevation}</span>
                   <FontAwesomeIcon icon={faChevronDown} className={`text-muted-foreground transition-transform duration-300 ${isRouteExpanded ? 'rotate-180' : ''}`} style={{ fontSize: 14 }} />
                 </div>

                 <div className={`transition-all duration-300`}>
                   <div className="px-6 pb-6">
                     <p className={`text-sm leading-relaxed font-semibold text-foreground whitespace-pre-line ${expandedRoute !== null ? '' : 'line-clamp-2'}`}>{route.desc}</p>
                   </div>
                 </div>
               </div>);

            })}
           </div>

          <div className="w-full mb-8">
            <iframe
              key={routes[activeRoute].ridewithgpsId}
              src={`https://ridewithgps.com/embeds?type=route&id=${routes[activeRoute].ridewithgpsId}&metricUnits=true&sampleGraph=true`}
              width="100%"
              height={isMobile ? 450 : 700}
              style={{ border: 'none' }}
              scrolling="no"
              className="border border-border"
              title={`Карта маршрута ${routes[activeRoute].name}`} />
          </div>

          {activeRoute === 2 &&
          <div className="bg-destructive/10 border border-destructive/30 p-4 mb-8">
              <p className="text-destructive font-semibold text-sm">
                Внимание: дистанция GRAND TOUR имеет лимит времени, при достижении которого, контролеры начинают направлять участников в сторону финиша с сокращением дистанции.
              </p>
            </div>
          }

          <div className="text-center">
            <Link
              to="/events/moscow/registration"
              className="inline-block bg-[hsl(201,100%,16%)] hover:bg-[hsl(201,100%,22%)] text-white font-bold uppercase tracking-wider text-sm px-10 py-3 transition-colors">
              Регистрация
            </Link>
          </div>
        </div>
      </section>

      <FooterNew />

      {/* Lightbox */}
      {selectedImage &&
      <div className="fixed inset-0 z-[1100] bg-black/90 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-white/70 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setSelectedImage(null)}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 32 }} />
          </button>
          <img src={selectedImage} alt="Полноразмерное фото" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      }
    </div>);

};

export default Moscow;
