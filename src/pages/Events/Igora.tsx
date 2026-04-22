import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faXmark, faArrowUpRightFromSquare, faLocationDot, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import HeaderNew from '../../components/HeaderNew';
import FooterNew from '../../components/FooterNew';

const sliderImages = ['/images/igora-hero.jpg', '/images/igora-slider-1.jpg', '/images/igora-slider-2.jpg', '/images/igora-slider-3.jpg'];
const galleryImages = [
  '/images/igora-photo-1.jpg',
  '/images/igora-photo-2.jpg',
  '/images/igora-photo-3.jpg',
  '/images/igora-photo-4.jpg',
  '/images/igora-photo-5.jpg',
  '/images/igora-photo-6.jpg',
  '/images/igora-photo-7.jpg',
];

const hotels = [
{
  name: 'Отель «Игора»',
  address: 'Ленинградская область, Приозерский р-н, пл. 69-й км, ул. Всесезонная, д. 1',
  description: 'В отеле представлены номера категорий «Стандарт» и «Люкс» в классическом стиле. Расположен в непосредственной близости от основных активностей курорта.',
  details: 'В отеле представлены номера категорий «Стандарт» и «Люкс» в классическом стиле. Расположен в непосредственной близости от основных активностей курорта.',
  amenities: ['Wi-Fi', 'Завтрак', 'Шаттл', 'Кондиционер'],
  bookingUrl: 'https://igora.ru/live/hotel/',
  image: '/images/igora-hotel-1.jpg'
},
{
  name: 'Отель «Игора. Времена года»',
  address: 'Ленинградская область, Приозерский р-н, курорт «Игора»',
  description: 'Стильные номера с лаконичным дизайном и собственной террасой в окружении хвойного леса.',
  details: 'Стильные номера с лаконичным дизайном и собственной террасой в окружении хвойного леса.',
  amenities: ['Wi-Fi', 'Терраса', 'Лес', 'Дизайн'],
  bookingUrl: 'https://igora.ru/live/hotel/',
  image: '/images/igora-hotel-2.jpg'
},
{
  name: 'Апарт-отель',
  address: 'Ленинградская область, Приозерский р-н, курорт «Игора»',
  description: 'Уютный апарт-отель вблизи озера с зоной кухни и гостиной – отличный вариант для семейного отдыха.',
  details: 'Уютный апарт-отель вблизи озера с зоной кухни и гостиной – отличный вариант для семейного отдыха.',
  amenities: ['Wi-Fi', 'Кухня', 'Озеро', 'Семейный'],
  bookingUrl: 'https://igora.ru/live/',
  image: '/images/igora-hotel-3.jpg'
},
{
  name: 'Коттеджи',
  address: 'Ленинградская область, Приозерский р-н, курорт «Игора»',
  description: 'Просторные коттеджи с двумя или тремя спальнями расположены в хвойном лесу.',
  details: 'Просторные коттеджи с двумя или тремя спальнями расположены в хвойном лесу.',
  amenities: ['Сауна', 'Камин', 'Кухня', 'Парковка'],
  bookingUrl: 'https://igora.ru/live/cottage/',
  image: '/images/igora-hotel-4.jpg'
}];

const routes = [
{ name: 'Intro Tour', distance: '32 км', elevation: '~500 м', desc: 'Кольцевая дистанция для начинающих имеет протяженность 36 километров с набором высоты 500 метров, что красноречиво говорит об рельефе местности. Преодолев 1 полный круг, на ключевом перекрестке, соответствующему 29-ти км от старта, следует двигаться прямо по указателю на финиш. Оставшиеся 2 с половиной километра до финиша идут с небольшим уклоном в гору.', mapType: 'wikiloc' as const, wikilocId: '258181186' },
{ name: 'Median Tour', distance: '60 км', elevation: '~850 м', desc: 'Средняя дистанция потребует еще больше сил и опыта от участников Tour de Russie. MEDIAN Tour составляет 2 круга по 30 километров каждый с набором высоты 850 метров, за всю дистанцию. После первых 30-ти километров, на ключевом перекрестке следует повернуть на лево, по указателю 60/86 км. После прохождения второго круга, в этом месте, необходимо двигаться прямо в сторону финиша. Финальные километры дистанции местами имеют градиент до 10 %.', mapType: 'wikiloc' as const, wikilocId: '258180702' },
{ name: 'Grand Tour', distance: '86 км', elevation: '~1200 м', desc: 'Полная дистанция GRAND Tour в «Игоре» имеет протяженность 86 километров с набором высоты 1200 метров, рассчитана на хорошо подготовленных спортсменов. Это максимальный набор из всех заездов сезона. После прохождения трех кругов на перекрестке с отметкой компьютера 83 километров от старта, следует двигаемся прямо в сторону финиша. На дистанции 86 км присутствует лимит времени.', warning: 'После двух кругов, участников, которые не впишутся по времени, контролеры будут направлять в сторону финиша. Место и результат в итоговом протоколе будет присуждаться с пометкой минус 1 круг.', mapType: 'wikiloc' as const, wikilocId: '258179651' }];

const borderColors = ['#62b22f', '#fec800', '#e61c56'];

const Igora: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentGallerySlide, setCurrentGallerySlide] = useState(0);
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
  const maxGallerySlide = Math.max(0, galleryImages.length - itemsPerView);
  const nextGallerySlide = () => setCurrentGallerySlide((prev) => Math.min(prev + 1, maxGallerySlide));
  const prevGallerySlide = () => setCurrentGallerySlide((prev) => Math.max(prev - 1, 0));

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
          backgroundImage: `url(/images/igora-hero.jpg)`,
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
                Tour de Russie — Игора
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-white/90">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Дата</div>
                  <div className="text-sm font-semibold">5 июля 2026</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Место</div>
                  <div className="text-sm font-semibold">Игора, Ленинградская обл.</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 mb-0.5">Дистанции</div>
                  <div className="text-sm font-semibold">32 / 60 / 86 км</div>
                </div>
              </div>
            </div>
            <Link
              to="/events/igora/registration"
              className="shrink-0 border-2 border-white text-white bg-transparent hover:bg-white/10 font-bold uppercase tracking-wider text-xs md:text-sm px-6 py-2 md:px-8 md:py-3 transition-colors">
              Регистрация
            </Link>
          </div>
          <div className="space-y-4 text-foreground text-base md:text-lg leading-relaxed">
            <p>
              Спортивный курорт «Игора» все больше привлекает внимание велосипедистов в качестве участников спортивных мероприятий в Ленинградской области. В календаре Tour De Russie, этот этап стоит на втором по счету месте и не смотря на небольшие протяженности дистанций, имеет максимальные значения по перепаду высот. Основой для маршрута стал круг протяженностью около 30-ти километров, пролегающий мимо живописных озер по достаточно рельефным окрестностям. Круг не большой, но имеет достаточное количество подъемов и спусков, которые потребуют не мало сил и технических навыков от участников всех заездов.
            </p>
            <p>
              Для регистрации необходима медицинская справка, страховка и соблюдение возрастного
              ценза. Подробные условия указаны на странице регистрации.
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
                  <img src={img} alt={`Tour de Russie Игора ${currentSlide + idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
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
              const isAnyExpanded = expandedRoute !== null;
              return (
                <div key={route.name} className={`text-left border-2 transition-all rounded-none overflow-hidden flex flex-col ${idx === activeRoute ? 'bg-primary/5' : 'hover:border-opacity-50'}`} style={{ borderColor: borderColors[idx] }}>
                  <div className="px-6 py-3 cursor-pointer" style={{ backgroundColor: borderColors[idx] }} onClick={() => {setActiveRoute(idx);setExpandedRoute((prev) => prev === idx ? null : idx);}}>
                    <h3 className="font-bold text-white uppercase text-center text-xl font-mono">{route.name} {route.distance}</h3>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between cursor-pointer" onClick={() => {setExpandedRoute(isRouteExpanded ? null : idx);setActiveRoute(idx);}}>
                    <span className="text-sm font-bold text-muted-foreground">Набор высоты: {route.elevation}</span>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-muted-foreground transition-transform duration-300 ${isRouteExpanded ? 'rotate-180' : ''}`} style={{ fontSize: 14 }} />
                  </div>
                  <div className="transition-all duration-300">
                    <div className="px-6 pb-6">
                      <p className={`text-sm leading-relaxed font-semibold text-foreground whitespace-pre-line ${isAnyExpanded ? '' : 'line-clamp-2'}`}>{route.desc}</p>
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
          ) : routes[activeRoute].mapEmbed ? (
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
          ) : (
            <div className="w-full mb-8 bg-muted border border-border flex items-center justify-center" style={{ height: isMobile ? 300 : 400 }}>
              <p className="text-muted-foreground text-sm">Карта маршрута будет добавлена позже</p>
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
            <Link to="/events/igora/registration" className="inline-block bg-[hsl(201,100%,16%)] hover:bg-[hsl(201,100%,22%)] text-white font-bold uppercase tracking-wider text-sm px-10 py-3 transition-colors">
              Регистрация
            </Link>
          </div>
        </div>
      </section>

      {/* About Igora */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <h2 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-6 font-mono text-center">
            О Всесезонном курорте «Игора»
          </h2>
          <div className="space-y-4 text-foreground text-base md:text-lg leading-relaxed mb-10">
            <p>
              Курорт «Игора» расположен в 50 км от Санкт-Петербурга, в Ленинградской области. Он органично вписан в природный ландшафт, развитая инфраструктура открывает фантастические возможности для спорта, развлечений и отдыха в любое время года. Зимой здесь работают 10 горнолыжных склонов с трассами разного уровня сложности. Летом гостей ждет оборудованный пляж с шезлонгами, детский и взрослый бассейн с подогревом и масса развлечений на любой вкус: площадки для пляжного волейбола, футбола и большого тенниса, сап-борды и мини гольф. Круглый год на курорте открыт Ледовый дворец, где тренируются олимпийские чемпионы, работает школа хоккея и фигурного катания, керлинг и боулинг, а также есть возможность пролететь на одном из самых длинных троллеев на Северо-Западе.
            </p>
            <p>
              Гастрономическая карта курорта идеально дополняет все активности: рестораны и кафе с европейской, средиземноморской и авторской кухней с акцентом на локальные продукты региона. Для проживания гости могут выбрать один из форматов размещений: отель, апарт-отель рядом с озером, коттеджи с камином и сауной или отель «Игора. Времена года».
            </p>
            <p>
              После масштабной реновации на курорте открылся СПА-комплекс с панорамным бассейном — пространство нового формата, созданное для глубокого восстановления и внутреннего баланса. В СПА-пространстве можно попробовать индивидуальные программы восстановления, аутентичные ритуалы, а также забронировать приватные сьюты с хаммамом, контрастными купелями и баней.
            </p>
          </div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {galleryImages.slice(currentGallerySlide, currentGallerySlide + itemsPerView).map((img, idx) =>
                <div key={currentGallerySlide + idx} className="aspect-[4/3] overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(img)}>
                  <img src={img} alt={`Игора фото ${currentGallerySlide + idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                </div>
              )}
            </div>
            <button onClick={prevGallerySlide} disabled={currentGallerySlide === 0} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white shadow-md items-center justify-center hover:bg-muted transition-colors hidden md:flex disabled:opacity-30">
              <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 20 }} />
            </button>
            <button onClick={nextGallerySlide} disabled={currentGallerySlide >= maxGallerySlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white shadow-md items-center justify-center hover:bg-muted transition-colors hidden md:flex disabled:opacity-30">
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 20 }} />
            </button>
            <div className="flex justify-center items-center gap-2 mt-4">
              <button onClick={prevGallerySlide} disabled={currentGallerySlide === 0} className="md:hidden w-7 h-7 flex items-center justify-center rounded-full bg-foreground/10 disabled:opacity-30">
                <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: maxGallerySlide + 1 }).map((_, idx) =>
                  <button key={idx} onClick={() => setCurrentGallerySlide(idx)} className="rounded-full transition-all duration-300"
                    style={{ width: idx === currentGallerySlide ? 18 : 8, height: 8, background: idx === currentGallerySlide ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.2)' }} />
                )}
              </div>
              <button onClick={nextGallerySlide} disabled={currentGallerySlide >= maxGallerySlide} className="md:hidden w-7 h-7 flex items-center justify-center rounded-full bg-foreground/10 disabled:opacity-30">
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hotels */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <h2 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-10 text-center font-mono">
            Отели курорта «Игора»
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

export default Igora;