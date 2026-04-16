import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import collage1 from '@/assets/collage/cyclist-1.jpg';
import collage2 from '@/assets/collage/cyclist-2.jpg';
import collage3 from '@/assets/collage/cyclist-3.jpg';
import collage4 from '@/assets/collage/cyclist-4.jpg';
import collage5 from '@/assets/collage/cyclist-5.jpg';
import collage6 from '@/assets/collage/cyclist-6.jpg';
import collage7 from '@/assets/collage/cyclist-7.jpg';
import collage8 from '@/assets/collage/cyclist-8.jpg';
import collage9 from '@/assets/collage/cyclist-9.jpg';

const slides = [collage1, collage2, collage3, collage4, collage5, collage6, collage7, collage8, collage9];

const GlassSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      go(diff > 0 ? 1 : -1);
    }
  };

  return (
    <div className="relative w-full max-w-[520px] mx-auto">
      {/* Glass frame */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          padding: '10px',
        }}
      >
        {/* Image area */}
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={current}
              src={slides[current]}
              alt=""
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 80 : -80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction > 0 ? -80 : 80, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Glass reflection overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)',
            }}
          />
        </div>

        {/* Bottom bar: dots + arrows */}
        <div className="flex items-center justify-between mt-2.5 px-1">
          <button
            onClick={() => go(-1)}
            className="p-1.5 rounded-full transition-colors"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 text-white/80" />
          </button>

          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  background: i === current
                    ? 'linear-gradient(90deg, hsl(170 75% 49%), hsl(201 72% 40%))'
                    : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            className="p-1.5 rounded-full transition-colors"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 text-white/80" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassSlider;
