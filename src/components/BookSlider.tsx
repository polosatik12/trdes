import React, { useState } from 'react';
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

const pages = [
  { left: collage1, right: collage2 },
  { left: collage3, right: collage4 },
  { left: collage5, right: collage6 },
  { left: collage7, right: collage8 },
  { left: collage9, right: collage1 },
];

const BOOK_W = 'min(560px, 85vw)';
const BOOK_H = 'min(380px, 58vw)';
const DEPTH = 18; // px — book thickness

const BookSlider: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const goNext = () => {
    if (currentPage < pages.length - 1) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Scene with perspective */}
      <div style={{ perspective: '1400px', perspectiveOrigin: '50% 40%' }}>
        {/* 3D book body */}
        <div
          style={{
            width: BOOK_W,
            height: BOOK_H,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(8deg) rotateY(-6deg)',
            transition: 'transform 0.4s ease',
          }}
        >
          {/* === BACK COVER === */}
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              background: 'linear-gradient(160deg, #5c4a12 0%, #4a3a0e 100%)',
              transform: `translateZ(-${DEPTH}px)`,
              boxShadow: '10px 14px 40px rgba(0,0,0,0.5)',
            }}
          />

          {/* === SPINE (left edge) === */}
          <div
            className="absolute top-0 bottom-0"
            style={{
              width: `${DEPTH}px`,
              left: 0,
              transformOrigin: 'left center',
              transform: 'rotateY(90deg)',
              background: 'linear-gradient(to bottom, #7a6520, #5c4a12 30%, #6b5818 60%, #7a6520)',
              borderRadius: '2px 0 0 2px',
            }}
          />

          {/* === BOTTOM EDGE (pages thickness) === */}
          <div
            className="absolute left-0 right-0"
            style={{
              height: `${DEPTH}px`,
              bottom: 0,
              transformOrigin: 'bottom center',
              transform: 'rotateX(-90deg)',
              background: `repeating-linear-gradient(
                to right,
                #f5efd8 0px,
                #efe6cc 1px,
                #f5efd8 2px
              )`,
              borderBottom: '2px solid #c4b080',
            }}
          />

          {/* === TOP EDGE === */}
          <div
            className="absolute left-0 right-0"
            style={{
              height: `${DEPTH}px`,
              top: 0,
              transformOrigin: 'top center',
              transform: 'rotateX(90deg)',
              background: `repeating-linear-gradient(
                to right,
                #f5efd8 0px,
                #efe6cc 1px,
                #f5efd8 2px
              )`,
              borderTop: '2px solid #c4b080',
            }}
          />

          {/* === RIGHT EDGE (pages) === */}
          <div
            className="absolute top-0 bottom-0"
            style={{
              width: `${DEPTH}px`,
              right: 0,
              transformOrigin: 'right center',
              transform: 'rotateY(-90deg)',
              background: `repeating-linear-gradient(
                to bottom,
                #f5efd8 0px,
                #efe6cc 1px,
                #f5efd8 2px
              )`,
              borderRight: '2px solid #c4b080',
            }}
          />

          {/* === FRONT COVER (the visible face) === */}
          <div
            className="absolute inset-0 rounded-sm overflow-hidden"
            style={{
              transform: 'translateZ(0px)',
              background: 'linear-gradient(135deg, #8B7320 0%, #6B5518 25%, #8B7320 50%, #A08828 75%, #8B7320 100%)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            {/* Gold emboss frame */}
            <div className="absolute inset-[5px] sm:inset-[7px] rounded-[2px]"
              style={{
                border: '1.5px solid rgba(200, 180, 90, 0.5)',
                boxShadow: 'inset 0 0 8px rgba(139, 115, 32, 0.3)',
              }}
            />

            {/* Inner page area */}
            <div
              className="absolute inset-[8px] sm:inset-[10px] rounded-[1px] overflow-hidden"
              style={{
                background: 'linear-gradient(to right, #f8f3e0 0%, #fdfaf0 46%, #d8d0b4 49%, #c8c0a0 50%, #d8d0b4 51%, #fdfaf0 54%, #f8f3e0 100%)',
              }}
            >
              {/* Pages content */}
              <div className="relative w-full h-full">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentPage}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({
                        rotateY: dir > 0 ? 60 : -60,
                        opacity: 0,
                      }),
                      center: {
                        rotateY: 0,
                        opacity: 1,
                      },
                      exit: (dir: number) => ({
                        rotateY: dir > 0 ? -60 : 60,
                        opacity: 0,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute inset-0 flex"
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: direction > 0 ? 'left center' : 'right center',
                    }}
                  >
                    {/* Left page */}
                    <div className="w-1/2 h-full p-[6px] sm:p-3 md:p-4">
                      <div className="w-full h-full overflow-hidden rounded-[1px]"
                        style={{ boxShadow: 'inset 0 0 6px rgba(0,0,0,0.08)' }}>
                        <img
                          src={pages[currentPage].left}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Right page */}
                    <div className="w-1/2 h-full p-[6px] sm:p-3 md:p-4">
                      <div className="w-full h-full overflow-hidden rounded-[1px]"
                        style={{ boxShadow: 'inset 0 0 6px rgba(0,0,0,0.08)' }}>
                        <img
                          src={pages[currentPage].right}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Center spine shadow */}
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-[6px] -translate-x-1/2 z-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.02), rgba(0,0,0,0.12))',
                  }}
                />

                {/* Page edge shadows */}
                <div className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background: `
                      linear-gradient(to right, rgba(0,0,0,0.07) 0%, transparent 4%, transparent 96%, rgba(0,0,0,0.07) 100%),
                      linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, transparent 3%, transparent 97%, rgba(0,0,0,0.04) 100%)
                    `,
                  }}
                />

                {/* Page number */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] sm:text-[11px] text-[#8B6914]/40 z-30 italic font-serif">
                  {currentPage + 1} / {pages.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className="p-2 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground font-medium italic">
          Листай фотокнигу
        </span>
        <button
          onClick={goNext}
          disabled={currentPage === pages.length - 1}
          className="p-2 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BookSlider;
