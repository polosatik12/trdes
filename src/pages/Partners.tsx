import React, { useEffect } from 'react';
import HeaderNew from '../components/HeaderNew';
import FooterNew from '../components/FooterNew';

import gazpromMezhregiongaz from '../assets/partners/gazprom-mezhregiongaz.jpg';
import rostelecom from '../assets/partners/rostelecom.png';
import bankRossiya from '../assets/partners/bank-rossiya.png';
import gazpromNeft from '../assets/partners/gazprom-neft.png';
import interRao from '../assets/partners/inter-rao.jpg';
import delovayaRossiya from '../assets/partners/delovaya-rossiya.jpg';
import rzhd from '../assets/partners/rzhd.png';
import sogazMedicina from '../assets/partners/sogaz-medicina.png';
import sogaz from '../assets/partners/sogaz.png';

// Company partners (12 logos)
const companyPartners = [
  { src: gazpromMezhregiongaz, alt: 'Газпром Межрегионгаз' },
  { src: rostelecom, alt: 'Ростелеком' },
  { src: rzhd, alt: 'РЖД' },
  { src: sogaz, alt: 'СОГАЗ' },
  { src: sogazMedicina, alt: 'СОГАЗ Медицина' },
  { src: delovayaRossiya, alt: 'Деловая Россия' },
  { src: '/images/partners/academy-of-life.png', alt: 'Академия Жизни' },
  { src: '/images/partners/teremok.png', alt: 'Теремок' },
  { src: '/images/partners/rm-travel.png', alt: 'R&M Travel' },
  { src: '/images/partners/spbgu.png', alt: 'Санкт-Петербургский государственный университет' },
  { src: '/images/partners/new-partner-1.jpg', alt: 'Новый партнер 1' },
  { src: '/images/partners/new-partner-2.jpg', alt: 'Новый партнер 2' }
];

// Government supporters (4 logos with coats of arms)
const governmentSupporters = [
  { src: '/images/partners/moscow-coat-of-arms.png', alt: 'Правительство Москвы' },
  { src: '/images/partners/leningrad-oblast-coat-of-arms.png', alt: 'Правительство Ленинградской области' },
  { src: '/images/partners/vladimir-oblast-coat-of-arms.png', alt: 'Правительство Владимирской области' },
  { src: '/images/partners/saint-petersburg-coat-of-arms.png', alt: 'Правительство Санкт-Петербурга' }
];

const Partners: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNew />

      <main className="flex-1 tdr-page">
        <div className="tdr-container">
          <h1 className="font-extrabold text-base uppercase tracking-tight text-foreground mb-12">Партнеры</h1>

          {/* Company Partners - 13 logos in 5 columns on desktop */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {companyPartners.map((partner, index) => (
              <div key={index} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-19.2px)]">
                <img
                  src={partner.src}
                  alt={partner.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-20 object-contain"
                />
              </div>
            ))}
          </div>

          {/* Government Supporters Section - 4 logos with coats of arms */}
          <h2 className="font-bold text-lg uppercase tracking-tight text-foreground mb-8 text-center">При поддержке</h2>
          <div className="flex flex-wrap justify-center gap-8 mb-16 max-w-6xl mx-auto">
            {governmentSupporters.map((supporter, index) => (
              <div key={index} className="flex flex-col items-center justify-start text-center w-[calc(50%-16px)] sm:w-[calc(25%-24px)]">
                <div className="w-32 h-32 flex items-center justify-center mb-4">
                  <img
                    src={supporter.src}
                    alt={supporter.alt}
                    loading="lazy"
                    decoding="async"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="font-bold text-sm uppercase tracking-tight text-foreground leading-tight px-2">{supporter.alt}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <FooterNew />
    </div>
  );
};

export default Partners;
