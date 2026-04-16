import React, { useEffect, useRef, useState } from 'react';
import { FloatingHexagons, CornerAccent, MeshBackground } from './DecorativeElements';

const slides = ['/images/hero-moscow-night.png'];

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  // Preload images
  useEffect(() => {
    slides.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]));
      };
    });
  }, []);

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

    const elements = heroRef.current?.querySelectorAll('.tdr-fade-in, .tdr-fade-in-left, .tdr-fade-in-right');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Background slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={heroRef} className="tdr-hero relative overflow-hidden">
      {/* Background images slider */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000 will-change-[opacity]"
          style={{
            backgroundImage: loadedImages.has(index) ? `url(${slide})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: currentSlide === index ? 1 : 0,
            backgroundColor: 'hsl(201, 72%, 20%)',
          }}
        />
      ))}
      
      {/* Dark overlay for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.25) 100%)',
        }}
      />
      
      {/* Decorative elements */}
      <FloatingHexagons className="z-[5]" />
      <MeshBackground className="z-[4] opacity-30" />
      <CornerAccent position="top-left" className="z-[6]" />
      <CornerAccent position="bottom-right" className="z-[6]" />
      
      {/* Animated accent lines */}
      <div className="absolute top-1/4 left-0 w-32 h-1 bg-gradient-to-r from-primary to-transparent opacity-50 z-[5]" />
      <div className="absolute bottom-1/3 right-0 w-48 h-1 bg-gradient-to-l from-primary to-transparent opacity-40 z-[5]" />
      
      {/* Glowing orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] z-[3]" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary/15 rounded-full blur-[80px] z-[3]" />
      
      <div className="tdr-hero-content relative z-10 flex flex-col min-h-[calc(100vh-200px)] justify-center">
        <h1 className="tdr-hero-title tdr-fade-in-left text-white">
          <span>Выбери <span className="accent">Движение.</span></span>
          <br />
          <span>Выбери <span className="accent">Результат.</span></span>
        </h1>
        
        <p className="tdr-hero-subtitle tdr-fade-in mt-8 mb-12 !text-white/90">
          Современный любительский велоспорт и гонки нового формата. 
          Присоединяйся к сообществу Tour de Russie.
        </p>
        
      </div>
      
      {/* Slide indicators - bottom right (hidden when single slide) */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 right-8 flex gap-2 z-20 tdr-fade-in tdr-stagger-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-[hsl(170,75%,49%)] w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-white/70 text-xs uppercase tracking-widest font-medium">Скролл</span>
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
