import React, { useEffect, useRef } from 'react';
import { Hexagon, DashedConnector, DotMarker, DiagonalStripes } from './DecorativeElements';

const AboutBlock: React.FC = () => {
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
      { threshold: 0.2 }
    );

    const elements = sectionRef.current?.querySelectorAll('.tdr-fade-in');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-white py-20 md:py-28 px-6 md:px-10 overflow-hidden">
      {/* Background decorations */}
      <DiagonalStripes />
      
      {/* Floating hexagons */}
      <div className="absolute top-10 right-10 opacity-20">
        <Hexagon size="lg" variant="gradient" />
      </div>
      <div className="absolute bottom-20 right-32 opacity-15">
        <Hexagon size="md" variant="outline" />
      </div>
      <div className="absolute top-1/2 left-4 opacity-10">
        <Hexagon size="sm" variant="filled" />
      </div>
      
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="flex">
          {/* Accent line with dot markers */}
          <div className="relative mr-6 md:mr-10 flex-shrink-0">
            <div className="w-1 h-full tdr-fade-in btn-gradient" />
            <DotMarker className="absolute -left-1.5 top-0" variant="primary" />
            <DotMarker className="absolute -left-1.5 bottom-0" variant="secondary" />
          </div>
          
          <div className="max-w-3xl">
            <div className="mb-8">
              <h2 className="tdr-fade-in font-extrabold text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight leading-tight text-secondary">
                Что такое<br />
                <span className="text-primary">Tour de Russie?</span>
              </h2>
            </div>
            
            <div className="tdr-fade-in tdr-stagger-1 space-y-5">
              <p className="text-base md:text-lg text-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Tour de Russie</span> — это современная культура велозаездов. 
                Продуманные маршруты, высокий уровень организации и сообщество людей, 
                выбирающих движение как ценность.
              </p>
              
              <p className="text-base md:text-lg text-foreground leading-relaxed">
                Каждый этап — событие, объединяющее спортсменов разного уровня. 
                От новичков до мастеров — каждый найдёт свою дистанцию и свой вызов.
              </p>
            </div>
            
            {/* Stats row with hexagon accents */}
            <div className="mt-12 grid grid-cols-3 gap-6 tdr-fade-in tdr-stagger-2">
              <div className="relative">
                <Hexagon size="sm" variant="gradient" className="absolute -top-2 -left-2 opacity-30" />
                <div className="relative z-10">
                  <div className="text-3xl md:text-4xl font-bold text-secondary">10+</div>
                  <div className="text-sm text-foreground mt-1">этапов</div>
                </div>
              </div>
              <div className="relative">
                <Hexagon size="sm" variant="gradient" className="absolute -top-2 -left-2 opacity-30" />
                <div className="relative z-10">
                  <div className="text-3xl md:text-4xl font-bold text-secondary">5000+</div>
                  <div className="text-sm text-foreground mt-1">участников</div>
                </div>
              </div>
              <div className="relative">
                <Hexagon size="sm" variant="gradient" className="absolute -top-2 -left-2 opacity-30" />
                <div className="relative z-10">
                  <div className="text-3xl md:text-4xl font-bold text-secondary">15</div>
                  <div className="text-sm text-foreground mt-1">городов</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutBlock;
