import React, { useState, useEffect, useCallback, useRef } from 'react';
import HeroImageEditor, { getHeroImageSettings, getHeroImageStyle, getHeroImageClass } from '@/components/HeroImageEditor';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import logoHeader from '@/assets/logo-header.svg';
import heroLogo from '@/assets/logo-header.svg';
import heroMoscowMap from '@/assets/hero-moscow-red-square.png';
import chuchaChair from '@/assets/chucha-sitting-coffee.png';
import chuchaArrow from '@/assets/chucha-arrow-new.svg';
import glavaZag from '@/assets/glava-zag.svg';
import HeaderNew from '@/components/HeaderNew';
import NewsFeed from '@/components/NewsFeed';
import FooterNew from '@/components/FooterNew';

// Lazy-load non-critical mascot title
import chuchaTitleSvg from '@/assets/chucha-title.svg';

const heroSlides = [
  { src: '/images/slider-4.jpg?v=3', position: '50% 50%' },
  { src: '/images/slider-1.jpg?v=3', position: '50% 50%' },
  { src: '/images/slider-2.jpg?v=3', position: '50% 50%' },
  { src: '/images/slider-5.jpg', position: '50% 60%' },
  { src: '/images/slider-6.jpg', position: '50% 50%' },
];


// Preload all slider images on module load
if (typeof window !== 'undefined') {
  heroSlides.forEach((slide) => {
    const img = new Image();
    img.src = slide.src;
  });
}

const IndexPrototype6: React.FC = () => {
  const [heroSlide, setHeroSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [heroImgKey, setHeroImgKey] = useState(0);
  const [imgSettings, setImgSettings] = useState(getHeroImageSettings);
  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goSlide(diff > 0 ? 1 : -1);
  };

  const goSlide = useCallback((dir: number) => {
    setSlideDir(dir);
    setHeroSlide((prev) => (prev + dir + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideDir(1);
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlide]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <HeaderNew />

      {/* === TOP HERO BLOCK === */}
      <section className="relative overflow-hidden pt-[60px] lg:pt-[88px]">
        <div className="absolute inset-0 bg-[#003051]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, hsl(170 75% 49% / 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, hsl(201 72% 40% / 0.2) 0%, transparent 50%)
          `
        }} />

        <div className="relative aspect-[16/10] sm:aspect-[16/7] lg:aspect-[16/5] xl:aspect-[16/4] 2xl:aspect-[16/3.5]">
          <div className="absolute top-0 right-0 h-full flex items-center justify-center bg-[#0a1628]" style={{
            width: `${imgSettings.containerWidth}%`,
            clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 15% 100%)'
          }}>
            <img key={heroImgKey} src={heroMoscowMap} alt="Москва — Tour de Russie" className="absolute inset-0 w-full h-full object-cover lg:hidden" style={{ objectPosition: '50% 60%' }} loading="eager" decoding="async" onError={() => setHeroImgKey((k) => k + 1)} />
            <img key={`d-${heroImgKey}`} src={heroMoscowMap} alt="Москва — Tour de Russie" className={`hidden lg:block ${getHeroImageClass(imgSettings)}`} style={getHeroImageStyle(imgSettings)} loading="eager" decoding="async" />
            <div className="absolute inset-0 bg-[hsl(201,72%,20%)] opacity-30 mix-blend-multiply pointer-events-none" />
          </div>

          <div className="relative z-10 w-full px-2 md:px-6 lg:pl-[4.5%] lg:pr-[3%] py-3 lg:py-16 flex items-center h-full">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-0 sm:gap-2 lg:gap-4 max-w-[75%] sm:max-w-[50%] lg:max-w-lg"
              style={{ transform: 'skewX(-1deg)' }}>
              <h1 className="flex flex-col items-start italic leading-none w-full !font-light">
                <img src={glavaZag} alt="Новая глава" className="h-auto w-[65%] sm:w-[85%] md:w-[90%] lg:w-[100%] xl:w-[110%] max-w-none block object-left" />
                <span className="text-white !font-light sm:!font-extrabold text-[13px] sm:text-lg md:text-xl lg:text-3xl xl:text-4xl 2xl:text-5xl block mt-1 sm:mt-1 lg:mt-2 xl:mt-3 leading-[1.2] sm:leading-none">
                  <span className="whitespace-nowrap">российского велоспорта</span>
                  <br />
                  для любителей
                </span>
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Разделитель */}
      <div className="h-2 lg:h-3 bg-white w-full" />

      {/* === BOTTOM ROW (Slider) — CSS transitions instead of framer-motion === */}
      <section className="relative bg-white overflow-hidden">
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/7] lg:aspect-[16/3.5]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

          {/* Chucha on the left */}
          <div className="absolute inset-0 z-10" style={{ width: '38%' }}>
            <div className="absolute top-[2%] left-[1%] lg:top-[1%] lg:left-[8%] select-none pointer-events-none">
              <span className="text-[#003051] leading-tight whitespace-nowrap block" style={{ fontFamily: "'Marck Script', cursive", fontSize: 'clamp(0.65rem, 2.8vw, 3rem)' }}>
                Основатель Tour de Russie
              </span>
              <div className="flex items-end gap-0 lg:ml-[15%]" style={{ marginTop: '-2%' }}>
                <img src={chuchaArrow} alt="" className="w-[45%] sm:w-[35%] lg:w-[22%] h-auto" style={{ transform: 'rotate(5deg)' }} loading="lazy" decoding="async" />
              </div>
            </div>
            <img src={chuchaChair} alt="Чуча" className="absolute bottom-0 left-[20%] h-[65%] sm:left-[15%] sm:h-[70%] lg:left-[30%] lg:h-[85%] w-auto drop-shadow-2xl object-contain" loading="lazy" decoding="async" />
          </div>

          {/* Right side — Slider with CSS transitions (no framer-motion) */}
          <div className="absolute top-0 right-0 h-full block" style={{ width: '68%',
            clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 13% 100%)'
          }}>
            {heroSlides.map((slide, index) =>
            <img
              key={slide.src}
              src={slide.src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
              style={{ opacity: heroSlide === index ? 1 : 0, objectPosition: slide.position }}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async" />

            )}
            <div className="absolute inset-0 bg-[hsl(201,72%,20%)] opacity-30 mix-blend-multiply" />
          </div>

          {/* Slider controls */}
          <div className="absolute z-20 bottom-2 sm:bottom-4 lg:bottom-6 right-3 sm:right-6 lg:right-8 flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => goSlide(-1)}
              className="p-1.5 lg:p-2 rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-white/80" />
            </button>
            <div className="flex gap-1 lg:gap-1.5">
              {heroSlides.map((_, i) =>
              <button
                key={i}
                onClick={() => {setSlideDir(i > heroSlide ? 1 : -1);setHeroSlide(i);}}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === heroSlide ? 20 : 6,
                  height: 6,
                  background: i === heroSlide ?
                  'linear-gradient(90deg, hsl(170 75% 49%), hsl(201 72% 40%))' :
                  'rgba(255,255,255,0.3)'
                }} />
              )}
            </div>
            <button
              onClick={() => goSlide(1)}
              className="p-1.5 lg:p-2 rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-white/80" />
            </button>
          </div>
        </div>
      </section>

      {/* === НОВОСТИ === */}
      <NewsFeed />

      {/* === О ПРОЕКТЕ === */}
      <section id="about-section" className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-16">
          {/* Mobile GIF */}
          <div className="flex flex-col items-center gap-8 mb-10 lg:hidden">
            <img
              src="/images/tourderussie-animation.gif"
              alt="Tour de Russie"
              className="max-w-full md:max-w-[600px] h-auto"
              loading="lazy"
              decoding="async" />
          </div>

          {/* Unified line + text layout */}
          <div className="flex max-w-[1200px] mx-auto">
            <div className="w-1 flex-shrink-0 mr-4 md:mr-10 rounded-full" style={{ background: '#003051' }} />

            <div className="flex-1">
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
              <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className="lg:w-[50%] space-y-5 text-foreground font-medium">
                  <p className="text-base md:text-lg leading-relaxed text-foreground whitespace-pre-line">
                    {'Tour de\u00A0Russie\u00A0— это новая глава в\u00A0российском велоспорте исключительно для\u00A0любителей, серия велозаездов в\u00A0самых исторически значимых местах нашей страны.'}
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-foreground">
                    Мы создаём события, в&nbsp;которых важна не&nbsp;столько спортивная биография, сколько личный опыт. Участником может стать каждый, кто готов проехать свою дистанцию и&nbsp;стать частью большого движения. Мы не&nbsp;считаем секунды и&nbsp;разряды&nbsp;— мы создаём впечатления.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-foreground">
                    Каждое наше событие&nbsp;— это праздник: сам маршрут по&nbsp;уникальным трассам, музыка, семейные активности, город, который раскрывается по-новому. Это день, о&nbsp;котором вы будете вспоминать весь год.
                  </p>
                </motion.div>

                <div className="hidden lg:flex lg:w-[50%] flex-col items-start justify-start">
                  <div className="w-full flex justify-center">
                    <img
                      src="/images/tourderussie-animation.gif"
                      alt="Tour de Russie"
                      className="w-full h-auto rounded-lg"
                      loading="lazy"
                      decoding="async" />
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="space-y-5 mt-10 text-foreground font-medium">
                <p className="text-base md:text-lg leading-relaxed text-foreground">Мы выстраиваем Tour de&nbsp;Russie вокруг атмосферы и&nbsp;коммьюнити. Мы выбираем яркие локации, где ландшафт усиливает эмоцию старта и&nbsp;финиша. Нам важен командно-соревновательный дух, но без агрессивного соперничества. Основной акцент сделан на&nbsp;команды: коллеги, друзья, семьи. Мы культивируем взаимную поддержку, уважение и&nbsp;ощущение плеча рядом.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-foreground">
                  {'Отдельное направление проекта\u00A0— '}
                  <Link to="/corporate" className="text-primary font-semibold hover:underline font-serif">Корпоративное сообщество</Link>
                  {'. Компании формируют свои команды и\u00A0выходят на\u00A0старт вместе. Это инструмент внутренней сплочённости и\u00A0здоровой конкуренции, возможность проявиться в\u00A0непривычной роли, укрепить связи и\u00A0увидеть друг друга вне офисного контекста. Велоспорт становится площадкой для\u00A0доверия и\u00A0настоящей командной динамики.'}
                </p>
                <p className="text-base md:text-lg leading-relaxed text-foreground">{'И конечно\u00A0же, настроение задаёт наш основатель\u00A0— '}<Link to="/chucha-world" className="text-primary font-semibold hover:underline font-serif">Чуча</Link>{'. Это живая энергия Tour de\u00A0Russie: доброта, самоирония, открытость и\u00A0внимание к\u00A0людям.'}</p>
                <p className="text-base md:text-lg font-semibold leading-relaxed text-primary">
                  Мы ценим не&nbsp;только результат, но и&nbsp;путь к&nbsp;нему&nbsp;— с&nbsp;поддержкой, драйвом и&nbsp;ощущением общего дела.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <FooterNew />
    </div>);};

export default IndexPrototype6;