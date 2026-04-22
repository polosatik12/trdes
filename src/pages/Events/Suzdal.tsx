import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faXmark, faArrowUpRightFromSquare, faLocationDot, faWifi, faCar, faUtensils, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import HeaderNew from '../../components/HeaderNew';
import FooterNew from '../../components/FooterNew';

// Import images
import heroImage from '../../assets/events/suzdal-race-hero.png';
import cityAerial from '../../assets/events/suzdal-city-aerial.jpg';
import kremlinImage from '../../assets/events/suzdal-kremlin.jpg';
import woodenMuseum from '../../assets/events/suzdal-wooden-museum.jpg';
import monasteryImage from '../../assets/events/suzdal-monastery.jpg';
import suzdalCrest from '../../assets/events/suzdal-crest.png';

// Slider images
import sliderImage1 from '../../assets/events/suzdal-cyclists-1.jpg';
import sliderImage2 from '../../assets/events/suzdal-cyclists-2.jpg';
import sliderImage3 from '../../assets/events/suzdal-cyclists-3.jpg';
import sliderImage4 from '../../assets/events/suzdal-cyclists-4.jpg';
import sliderImage5 from '../../assets/events/suzdal-cyclists-5.jpg';

const galleryImages = [kremlinImage, woodenMuseum, monasteryImage];
const sliderImages = [sliderImage1, sliderImage2, sliderImage3, sliderImage4, sliderImage5];

const hotels = [
{
  name: 'ГТК Суздаль',
  address: 'Суздаль, ул. Коровники, 45',
  description: 'Крупный туристический комплекс с разнообразными номерами, конференц-залами, тремя ресторанами, бассейном и спортивными объектами.',
  details: 'Главный туристический комплекс Суздаль предлагает широкий выбор размещения: таунхаусы на 4-8 человек, студии, стандартные номера и люксы. На территории работают три ресторана, лобби-бар и спорт-бар. Для активного отдыха: бассейн, сауны, боулинг, бильярд, теннисные корты, аквапарк Suzdal AQUA и спортивный комплекс Suzdal ARENA. Идеально подходит для участников велозаезда и их семей.',
  amenities: ['Wi-Fi', 'Ресторан', 'Бассейн', 'Спорт-комплекс'],
  bookingUrl: 'https://gtksuzdal.ru/booking/',
  image: '/images/gtk-suzdal-hotel.jpg'
},
{
  name: 'Суздаль дом',
  address: 'Суздаль, различные локации',
  description: 'Коллекция гостевых домов с индивидуальным дизайном. Вместимость от 5 до 11 гостей. Полностью оборудованные кухни, консьерж-сервис.',
  details: 'Суздаль дом — это пять уникальных гостевых домов (Янтарный, Синий, Зелёный, Жёлтый, Рубиновый) с авторским дизайном и домашней атмосферой. Каждый дом оснащён полноценной кухней, Wi-Fi, Smart TV, парковкой и зоной барбекю. Консьерж-сервис, организация экскурсий и кейтеринг от ресторана «Гостиный Двор». Идеально для групп и семей, участвующих в велозаезде.',
  amenities: ['Wi-Fi', 'Кухня', 'Парковка', 'Барбекю'],
  bookingUrl: 'https://suzdal-dvor.ru/gostevoy-dom',
  image: '/images/suzdal-dom-hotel.jpg'
},
{
  name: 'Генеральская дача',
  address: 'Суздаль, ул. Алексея Лебедева, 5',
  description: 'Бутик-отель VIP-класса в историческом здании XV века. Шесть категорий номеров площадью 32-75 м². Ресторан, русская баня, летняя веранда.',
  details: 'Генеральская дача — бутик-отель на месте бывших военных кварталов князя Пожарского. Шесть категорий номеров названы в честь русских военачальников эпохи 1812 года. Премиальные матрасы, кровати king-size, винтажная мебель. На территории: ресторан, дровяная русская баня, летняя веранда. Индивидуальный подход к каждому гостю, трансфер, организация экскурсий.',
  amenities: ['Wi-Fi', 'Ресторан', 'Баня', 'Трансфер'],
  bookingUrl: 'https://general-suzdal.ru/nomernoj-fond/',
  image: '/images/generalskaya-dacha-hotel.jpg'
}];

const borderColors = ['#fec800', '#e61c56'];

const routes = [
  { name: 'Median Tour', distance: '60 км', elevation: '~420 м', desc: 'Основой для маршрута в Суздале является круг протяжённостью чуть менее 60-ти километров, плюс расстояние от старта и обратно. Среднюю дистанцию MEDIAN Tour 60к выбирают участники, которые ещё не готовы к GRAND Tour 114k, но имеющие желание испытать свои возможности в живописных окрестностях Суздаля. На отметке 57 километров от старта, на развилке следует повернуть направо по указателю финиш 60к.', mapType: 'mapmagic' as const, mapmagicUrl: 'https://mapmagic.app/embed?routes=07ZMz2V&title=MEDIAN+Tour+SUZDAL+60k' },
  { name: 'Grand Tour', distance: '114 км', elevation: '~850 м', desc: 'Полная дистанция протяжённостью 114 километров с набором высоты 850 метров, рассчитана на хорошо подготовленных спортсменов. После преодоления первого круга на отметке 57 км от старта на развилке следует повернуть налево по указателю 114 км второй круг. Соответственно после второго круга, на этой ключевой развилке следует сделать уже правый поворот в сторону финиша.', warning: 'Для участников дистанции 114 км присутствует лимит времени, по достижении которого контролёры начинают направлять участников в сторону финиша после первого круга.', mapType: 'wikiloc' as const, wikilocId: '244754075' }];

const Suzdal: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeRoute, setActiveRoute] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);
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
                Tour de Russie — Суздаль
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-white/90">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Дата</div>
                  <div className="text-sm font-semibold">7 июня 2026</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Место</div>
                  <div className="text-sm font-semibold">Суздаль, Владимирская обл.</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Дистанции</div>
                  <div className="text-sm font-semibold">60 / 114 км</div>
                </div>
              </div>
            </div>
            <Link
              to="/events/suzdal/registration"
              className="shrink-0 border-2 border-white text-white bg-transparent hover:bg-white/10 font-bold uppercase tracking-wider text-xs md:text-sm px-6 py-2 md:px-8 md:py-3 transition-colors">
              Регистрация
            </Link>
          </div>
          <div className="space-y-4 text-foreground text-base md:text-lg leading-relaxed">
            <p>
              Суздаль&nbsp;— первый этап серии велосипедных мероприятий Tour de&nbsp;Russie 2026 года. Древний город-музей под открытым небом станет великолепным фоном для вашего спортивного достижения.
            </p>
            <p>
              Трасса проходит через исторический центр города, мимо белокаменных монастырей, золотых куполов церквей и&nbsp;живописных полей Владимирской области. Участникам доступны две дистанции: Median Tour (60&nbsp;км) и&nbsp;Grand Tour (114&nbsp;км).
            </p>
            <p>
              Для регистрации необходима медицинская справка, страховка и&nbsp;соблюдение возрастного ценза. Подробные условия указаны на&nbsp;странице регистрации.
            </p>
            <p className="text-destructive font-bold">
              ВНИМАНИЕ! Количество участников на&nbsp;заезд в&nbsp;Суздале ограничено. В&nbsp;первую очередь регистрируются представители любительских команд по&nbsp;предварительным заявкам. После этого будет открыта дополнительная регистрация индивидуальных участников.
              <br />
              Всего 100&nbsp;спортсменов получат право участия в&nbsp;эксклюзивном мероприятии Tour de&nbsp;Russie&nbsp;— Суздаль.
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
                  alt={`Tour de Russie Суздаль ${currentSlide + idx + 1}`}
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

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
                     {route.warning && expandedRoute === idx && (
                       <p className="text-destructive font-bold text-sm mt-3">{route.warning}</p>
                     )}
                   </div>
                 </div>
               </div>);

            })}
           </div>

          <div className="w-full mb-8">
            {routes[activeRoute].mapType === 'mapmagic' ? (
              <iframe
                width="1200"
                height="700"
                src={routes[activeRoute].mapmagicUrl}
                title="Embeded MapMagic map with routes"
                style={{ display: 'block', maxWidth: '100%' }}
                frameBorder={0}
                allowFullScreen
              />
            ) : routes[activeRoute].mapType === 'wikiloc' ? (
              <div>
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
              <iframe
                key={routes[activeRoute].ridewithgpsId}
                src={`https://ridewithgps.com/embeds?type=route&id=${routes[activeRoute].ridewithgpsId}&metricUnits=true&sampleGraph=true`}
                width="100%"
                height={isMobile ? 450 : 700}
                style={{ border: 'none' }}
                scrolling="no"
                className="border border-border"
                title={`Карта маршрута ${routes[activeRoute].name}`} />
            )}
          </div>

          {activeRoute === 1 &&
          <div className="bg-destructive/10 border border-destructive/30 p-4 mb-8">
              <p className="text-destructive font-semibold text-sm">
                Внимание: дистанция GRAND TOUR имеет лимит времени, при достижении которого, контролеры начинают направлять участников в сторону финиша с сокращением дистанции.
              </p>
            </div>
          }

          <div className="text-center">
            <Link
              to="/events/suzdal/registration"
              className="inline-block bg-[hsl(201,100%,16%)] hover:bg-[hsl(201,100%,22%)] text-white font-bold uppercase tracking-wider text-sm px-10 py-3 transition-colors">
              Регистрация
            </Link>
          </div>
        </div>
      </section>

      {/* About Suzdal */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <h2 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-6 font-mono text-center">
            О Суздале
          </h2>
          <div className="space-y-4 text-foreground text-base md:text-lg leading-relaxed mb-10">
            <p>
              Суздаль&nbsp;— один из&nbsp;самых цельных исторических городов России, жемчужина Золотого кольца. Здесь почти нет современной высотной застройки, и&nbsp;силуэт формируют монастыри, кремль и&nbsp;десятки храмов XII–XVIII веков. Белокаменные ансамбли Владимиро-Суздальской земли включены в&nbsp;список Всемирного наследия ЮНЕСКО.
            </p>
            <p>
              Над поймой Каменки поднимаются стены Спасо-Евфимиева монастыря, купола Рождественского собора XIII века и&nbsp;силуэт Суздальского кремля. Город раскрывается панорамами: монастырские стены отражаются в&nbsp;воде, колокольни видны за&nbsp;линией лугов, пространство остаётся открытым и&nbsp;цельным.
            </p>
            <p>
              При этом Суздаль&nbsp;— не&nbsp;музейная декорация. В&nbsp;последние годы здесь появились современные бутик-отели, гастрономические проекты и&nbsp;рестораны, работающие с&nbsp;локальными продуктами и&nbsp;русской кухней в&nbsp;авторской интерпретации. Историческая среда дополняется качественной инфраструктурой, сохраняя баланс между прошлым и&nbsp;настоящим.
            </p>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible pb-2">
            {galleryImages.map((img, idx) =>
            <div key={idx} className="aspect-[4/3] overflow-hidden cursor-zoom-in min-w-[80vw] md:min-w-0 snap-start" onClick={() => setSelectedImage(img)}>
                <img
                src={img}
                alt={`Суздаль фото ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hotels */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <h2 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-10 text-center font-mono">
            Отели в Суздале
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotels.map((hotel) => {
              const isExpanded = expandedHotel === hotel.name;
              return (
                <div
                  key={hotel.name}
                  className="rounded-none overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card cursor-pointer border border-border"
                  onClick={() => setExpandedHotel(isExpanded ? null : hotel.name)}>

                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async" />
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
                        <a
                          href={hotel.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
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

export default Suzdal;
