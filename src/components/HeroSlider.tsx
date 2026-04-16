import React, { useState, useEffect } from 'react';
import heroLogo from '@/assets/hero-logo.png';

const slides = [
  '/images/hero-moscow-night.png',
];

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="tdr-hero">
      {slides.map((slide, index) => (
        <div
          key={index}
          className="tdr-hero-slide transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${slide})`,
            opacity: currentSlide === index ? 1 : 0,
          }}
        />
      ))}
      
      <div className="tdr-hero-overlay">
        <img 
          src={heroLogo} 
          alt="Tour de Russie 2026" 
          className="w-[350px] max-w-[90%] h-auto"
        />
      </div>
    </section>
  );
};

export default HeroSlider;
