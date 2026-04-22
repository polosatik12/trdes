import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faXmark, faArrowUpRightFromSquare, faLocationDot, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import HeaderNew from '../../components/HeaderNew';
import FooterNew from '../../components/FooterNew';

const sliderImages = ['/images/pushkin-hero.jpg', '/images/pushkin-slider-1.jpg', '/images/pushkin-slider-2.jpg', '/images/pushkin-slider-3.jpg', '/images/pushkin-slider-4.jpg', '/images/pushkin-slider-5.jpg', '/images/pushkin-slider-6.jpg'];
const galleryImages = ['/images/pushkin-new-1.jpg', '/images/pushkin-new-2.jpg', '/images/pushkin-new-3.jpg'];

const hotels = [
{
  name: 'Отель «Астория»',
  address: 'Санкт-Петербург, Большая Морская ул., 39',
  description: 'Легендарный отель класса люкс в историческом центре Санкт-Петербурга. Рестораны, спа-центр, вид на Исаакиевский собор.',
  details: 'Роскошный отель Astoria от Rocco Forte Hotels расположен в самом сердце Санкт-Петербурга. Элегантные номера с видом на Исаакиевский собор и Мариинский дворец. Ресторан Astoria, спа-центр, организация мероприятий. Идеальное расположение для участников велозаезда.',
  amenities: ['Wi-Fi', 'Ресторан', 'SPA', 'Завтрак'],
  bookingUrl: 'https://www.roccofortehotels.ru',
  image: '/images/astoria-hotel.jpg'
},
{
  name: 'Отель «Англетер»',
  address: 'Санкт-Петербург, Малая Морская ул., 24',
  description: 'Исторический отель на Исаакиевской площади. Мраморные ванные комнаты, вид на внутренний сад, ресторан.',
  details: 'Отель Angleterre от Rocco Forte Hotels на Исаакиевской площади. Уютные номера с паркетными полами и пастельными тонами. Мраморные ванные комнаты, вид на Исаакиевский собор. Ресторан, возможность размещения с домашними животными. Удобное расположение в центре города.',
  amenities: ['Wi-Fi', 'Ресторан', 'Вид на собор', 'Pet-friendly'],
  bookingUrl: 'https://www.angleterrehotel.ru',
  image: '/images/angleterre-hotel.jpg'
},
{
  name: 'Hilton Saint Petersburg ExpoForum',
  address: 'Санкт-Петербург, Петербургское шоссе, д. 62/1',
  description: 'Современный отель на территории выставочного комплекса ExpoForum, в 3 км от аэропорта Пулково. Рестораны, SPA-салон, бассейн.',
  details: 'Отель расположен на территории выставочного комплекса ExpoForum. Предлагает высокий уровень сервиса с номерами различных категорий, включая семейные номера. Проживание включает 1 час ежедневного доступа к гидро-термальному комплексу. Бесплатный трансфер между аэропортом, отелем и станцией метро «Московская». Бесплатная парковка для гостей.',
  amenities: ['Wi-Fi', 'Ресторан', 'SPA', 'Бассейн', 'Трансфер', 'Pet-friendly'],
  bookingUrl: 'https://hiltonexpoforum.ru',
  image: '/images/hilton-expoforum-hotel.jpg'
}];

const routes = [
{ name: 'Intro Tour', distance: '22 км', elevation: '~100 м', desc: 'Короткая дистанция этапа в Пушкине составляет 1 круг с протяженность 22 километра, с небольшим набором высоты около 100 метров, что говорит о том, что это самый легкий маршрут в серии Tour de Rissie 2026. Участникам остается только любоваться видами и внимательно следить за указателями дистанции.', mapType: 'wikiloc' as const, wikilocId: '258172512' },
{ name: 'Median Tour', distance: '46 км', elevation: '~220 м', desc: 'Участникам средней дистанции предстоит преодолеть два круга, общая протяженность которых составляет 46 километров с набором высоты 220 метров. В виду не значительных градиентов и дорожных развязок трасса получается скоростной и техничной. На открытых участках трассы может присутствовать боковой ветер.', mapType: 'wikiloc' as const, wikilocId: '258160507' },
{ name: 'Grand Tour', distance: '95 км', elevation: '~450 м', desc: 'Максимальная дистанция составляет 4 круга с протяженностью 95 километров и набором высоты 450 метров. Рекомендуем выбирать GRAND Tour таким участникам, которые хорошо готов к движению в большой группе на гоночной скорости около 35-45 км/ч.', warning: 'На данной дистанции присутствует лимит времени. Если держатся в основных группах, то проблем с попаданием в лимит не будет. Участники, не вписавшиеся по времени, получат сокращение дистанции, которая составит 3 круга - 71 км. Место и результат в протоколе будет с отметкой - минус круг.', mapType: 'wikiloc' as const, wikilocId: '258155661' }];

const borderColors = ['#62b22f', '#fec800', '#e61c56'];

const Pushkin: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeRoute, setActiveRoute] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null);

  useEffect(() => {window.scrollTo(0, 0);}, []);

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
        className="relative pt-[88px] min-h-[35vh] md:min-h-[55vh]"
        style={{
          backgroundImage: `url(/images/pushkin-hero.jpg)`,
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
                Tour de Russie — Царское Село     
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-white/90">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Дата</div>
                  <div className="text-sm font-semibold">16 августа 2026</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Место</div>
                  <div className="text-sm font-semibold">Пушкин, Санкт-Петербург</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Дистанции</div>
                  <div className="text-sm font-semibold">22 / 46 / 95 км</div>
                </div>
              </div>
            </div>
            <Link
              to="/events/pushkin/registration"
              className="shrink-0 border-2 border-white text-white bg-transparent hover:bg-white/10 font-bold uppercase tracking-wider text-xs md:text-sm px-6 py-2 md:px-8 md:py-3 transition-colors">
              Регистрация
            </Link>
          </div>
          <div className="space-y-4 text-foreground text-base md:text-lg leading-relaxed">
            <p>Tour de Russie в Пушкине — спортивное мероприятие, дистанция которого проходит практически по территории Государственного музея-заповедника «Царское Село». И только поэтому стоит приехать сюда и принять участие в таком уникальном событии. Дистанция Велозаезда стартует в исторической части города-музея от главного входа в парковый ансамбль.</p>
            <p>
              В основе всех дистанций лежит круг протяженностью чуть более 20 километров. Маршрут проходит вокруг всего музейного комплекса, далее по Парковой улице мимо Орловских и Слоновьих ворот по границе парка. Через Кузьминское шоссе трасса выходит на Петербургское шоссе. Минуя большую развязку, через улицу Сарицкая, маршрут следует на петлю по Усть-Славянскому шоссе. После чего в обратном направлении возвращается к финишу, который находится на Петербургском шоссе, перед Египетскими воротами. Часть круга по Царскому селу имеет круговую направленность, а другая часть от Петербургского шоссе — реверсную.
            </p>
          </div>
        </div>
      </section>

      {/* Photo Slider */}
      <section className="py-12 bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" onTouchStart={handleSliderTouchStart} onTouchEnd={handleSliderTouchEnd}>
              {sliderImages.slice(currentSlide, currentSlide + itemsPerView).map((img, idx) =>
              <div key={currentSlide + idx} className="aspect-[4/3] overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(img)}>
                  <img src={img} alt={`Tour de Russie Пушкин ${currentSlide + idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                </div>
              )}
            </div>
            <button onClick={prevSlide} disabled={currentSlide === 0} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white shadow-md flex items-center justify-center hover:bg-muted transition-colors hidden md:flex disabled:opacity-30">
              <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 20 }} />
            </button>
            <button onClick={nextSlide} disabled={currentSlide >= maxSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white shadow-md flex items-center justify-center hover:bg-muted transition-colors hidden md:flex disabled:opacity-30">
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 20 }} />
            </button>
            <div className="flex justify-center items-center gap-2 mt-4">
              <button onClick={prevSlide} disabled={currentSlide === 0} className="md:hidden w-7 h-7 flex items-center justify-center rounded-full bg-foreground/10 disabled:opacity-30">
                <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: maxSlide + 1 }).map((_, idx) =>
                <button key={idx} onClick={() => setCurrentSlide(idx)} className="rounded-full transition-all duration-300"
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
                <div key={route.name} className={`text-left border-2 transition-all rounded-none overflow-hidden flex flex-col ${idx === activeRoute ? 'bg-primary/5' : 'hover:border-opacity-50'}`} style={{ borderColor: borderColors[idx] }}>
                  <div className="px-6 py-3 cursor-pointer" style={{ backgroundColor: borderColors[idx] }} onClick={() => {setActiveRoute(idx);setExpandedRoute((prev) => prev === idx ? null : idx);}}>
                    <h3 className="font-bold text-white uppercase text-center text-xl font-mono">{route.name} {route.distance}</h3>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between cursor-pointer" onClick={() => {setExpandedRoute(isRouteExpanded ? null : idx);setActiveRoute(idx);}}>
                    <span className="text-sm font-bold text-muted-foreground">Набор высоты: {route.elevation}</span>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-muted-foreground transition-transform duration-300 ${isRouteExpanded ? 'rotate-180' : ''}`} style={{ fontSize: 14 }} />
                  </div>
                  <div className={`transition-all duration-300`}>
                    <div className="px-6 pb-6">
                      <p className={`text-sm leading-relaxed font-semibold text-foreground whitespace-pre-line ${expandedRoute !== null ? '' : 'line-clamp-2'}`}>{route.desc}</p>
                      {route.warning && expandedRoute === idx && (
                        <p className="text-destructive font-bold text-sm mt-3">{route.warning}</p>
                      )}
                    </div>
                  </div>
                </div>);

            })}
          </div>

          {routes[activeRoute].mapType === 'wikiloc' ? (
            <div className="w-full mb-8">
              <iframe
                frameBorder="0"
                scrolling="no"
                src={`https://www.wikiloc.com/wikiloc/embedv2.do?id=${routes[activeRoute].wikilocId}&elevation=off&images=off&maptype=H`}
                width="100%"
                height={isMobile ? 400 : 500}
                className="border border-border"
                title={`Карта маршрута ${routes[activeRoute].name}`} />
              <div style={{ color: '#777', fontSize: '11px', lineHeight: '16px' }}>
                Powered by&nbsp;
                <a style={{ color: '#4C8C2B', fontSize: '11px', lineHeight: '16px' }} target="_blank" href="https://www.wikiloc.com">Wikiloc</a>
              </div>
            </div>
          ) : (
            <div className="w-full mb-8">
              <iframe
                key={routes[activeRoute].mapEmbed}
                src={routes[activeRoute].mapEmbed}
                width="100%"
                height={isMobile ? 500 : 700}
                style={{ border: 'none' }}
                scrolling="no"
                title={`Карта маршрута ${routes[activeRoute].name}`} />
            </div>
          )}

          {activeRoute === 2 &&
          <div className="bg-destructive/10 border border-destructive/30 p-4 mb-8">
              <p className="text-destructive font-semibold text-sm">
                Внимание: дистанция GRAND TOUR имеет лимит времени, при достижении которого, контролеры начинают направлять участников в сторону финиша с сокращением дистанции.
              </p>
            </div>
          }

          <div className="text-center">
            <Link to="/events/pushkin/registration" className="inline-block bg-[hsl(201,100%,16%)] hover:bg-[hsl(201,100%,22%)] text-white font-bold uppercase tracking-wider text-sm px-10 py-3 transition-colors">
              Регистрация
            </Link>
          </div>
        </div>
      </section>

      {/* About Pushkin */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <h2 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-6 font-mono text-center">
            О Пушкине
          </h2>
          <div className="space-y-4 text-foreground text-base md:text-lg leading-relaxed mb-10">
            <p>Царское Село (Пушкин) — это сейчас Санкт-Петербург, его южная, дворцовая часть. Район вырос вокруг загородной императорской резиденции и до сих пор сохраняет тот же масштаб: широкие перспективы, протяжённые аллеи, чёткая композиция улиц.

            </p>
            <p>
              Сердце Царского Села — Екатерининский дворец, созданный Бартоломео Растрелли. Его фасад растянут почти на 300 метров, а Янтарная комната остаётся одним из самых известных интерьеров России. Дворец не изолирован, он включён в живую ткань города: рядом университет, жилые кварталы, кафе.
            </p>
            <p>Екатерининский и Александровский парки образуют более 300 гектаров зелёной территории. Пруды, мосты, павильоны, регулярные и пейзажные участки создают ощущение продуманной среды, где архитектура и природа находятся в равновесии. Египетские ворота, построенные в 1820-е годы, встречают на въезде и подчёркивают исторический характер города.

            </p>
            <p>
              Пушкин — это Петербург вне плотной городской застройки: парадный, зелёный, собранный и при этом живой.
            </p>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible pb-2">
            {galleryImages.map((img, idx) =>
            <div key={idx} className="aspect-[4/3] overflow-hidden cursor-zoom-in min-w-[80vw] md:min-w-0 snap-start" onClick={() => setSelectedImage(img)}>
                <img src={img} alt={`Пушкин фото ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hotels */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <h2 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-10 text-center font-mono">
            Отели в Пушкине
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotels.map((hotel) => {
              const isExpanded = expandedHotel === hotel.name;
              return (
                <div key={hotel.name} className="rounded-none overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card cursor-pointer border border-border" onClick={() => setExpandedHotel(isExpanded ? null : hotel.name)}>
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                  </div>
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg text-primary">{hotel.name}</h3>
                      <FontAwesomeIcon icon={faChevronDown} className={`w-5 h-5 text-muted-foreground flex-shrink-0 mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 flex-shrink-0" />
                      {hotel.address}
                    </p>
                    <p className={`text-foreground text-sm leading-relaxed mt-2 ${expandedHotel ? '' : 'line-clamp-2'}`}>{hotel.description}</p>
                    <div className={`overflow-hidden transition-all duration-300 ${expandedHotel ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                      <div className="border-t border-border pt-4 space-y-3">
                        <p className="text-foreground text-sm leading-relaxed">{hotel.details}</p>
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.map((a) =>
                          <span key={a} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">{a}</span>
                          )}
                        </div>
                        <a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                          Забронировать
                          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>);

            })}
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

export default Pushkin;