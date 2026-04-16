import React from 'react';
import gazpromNeft from '../assets/partners/gazprom-neft.png';
import bankRossiya from '../assets/partners/bank-rossiya.png';
import rostelecom from '../assets/partners/rostelecom.png';
import sogaz from '../assets/partners/sogaz.png';
import rzhd from '../assets/partners/rzhd.svg';


const partners = [
  { src: gazpromNeft, alt: 'Газпром Нефть' },
  { src: bankRossiya, alt: 'Банк Россия' },
  { src: rostelecom, alt: 'Ростелеком' },
  { src: sogaz, alt: 'СОГАЗ' },
  { src: rzhd, alt: 'РЖД' },
];

const PartnersBar: React.FC = () => {
  return (
    <section className="tdr-partners">
      <div className="tdr-partners-grid flex items-center justify-center gap-8 md:gap-12 flex-wrap py-8 px-6">
        {partners.map((partner) => (
          <img
            key={partner.alt}
            src={partner.src}
            alt={partner.alt}
            className="h-10 md:h-14 w-auto object-contain"
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </section>
  );
};

export default PartnersBar;
