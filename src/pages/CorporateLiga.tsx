import React, { useEffect } from 'react';
import HeaderNew from '../components/HeaderNew';
import FooterNew from '../components/FooterNew';
import CorporateApplicationForm from '../components/CorporateApplicationForm';

import gazpromMezhregiongaz from '../assets/partners/gazprom-mezhregiongaz.jpg';
import rostelecom from '../assets/partners/rostelecom.png';
import bankRossiya from '../assets/partners/bank-rossiya.png';
import gazpromNeft from '../assets/partners/gazprom-neft.png';
import interRao from '../assets/partners/inter-rao.jpg';
import delovayaRossiya from '../assets/partners/delovaya-rossiya.jpg';
import rzhd from '../assets/partners/rzhd.png';
import sogazMedicina from '../assets/partners/sogaz-medicina.png';
import sogaz from '../assets/partners/sogaz.png';

const corporateTeams = [
  { src: gazpromMezhregiongaz, alt: 'Газпром Межрегионгаз' },
  { src: gazpromNeft, alt: 'Газпром Нефть' },
  { src: bankRossiya, alt: 'Банк Россия' },
  { src: rostelecom, alt: 'Ростелеком' },
  { src: rzhd, alt: 'РЖД' },
  { src: interRao, alt: 'Интер РАО' },
  { src: sogaz, alt: 'СОГАЗ' },
  { src: sogazMedicina, alt: 'СОГАЗ Медицина' },
  { src: delovayaRossiya, alt: 'Деловая Россия' },
  { src: '/images/partners/academy-of-life.png', alt: 'Академия Жизни' },
  { src: '/images/partners/teremok.png', alt: 'Теремок' },
  { src: '/images/partners/rm-travel.png', alt: 'R&M Travel' },
  { src: '/images/partners/spbgu.png', alt: 'Санкт-Петербургский государственный университет' }
];


const CorporateLiga: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNew />

      <main className="flex-1 tdr-page">
        <div className="tdr-container">
          <h1 className="font-extrabold text-base uppercase tracking-tight text-foreground mb-6">Корпоративное сообщество</h1>
          
          <p className="text-[14px] leading-[1.7] mb-4 max-w-[900px] text-foreground">
            Отличительной особенностью нашего проекта является сильная Корпоративное сообщество. Впервые в&nbsp;истории российского велоспорта в&nbsp;одном заезде объединяются корпоративные команды ведущих компаний страны.
          </p>
          
          <p className="text-[14px] leading-[1.7] mb-4 max-w-[900px] text-foreground">
            Командное участие в&nbsp;Tour de&nbsp;Russie снижает порог входа в&nbsp;велоспорт, обеспечивает организационную и&nbsp;логистическую поддержку, помогает участникам быстрее освоиться и&nbsp;чувствовать себя увереннее на&nbsp;дистанции.
          </p>
          
          <p className="text-[14px] leading-[1.7] mb-8 max-w-[900px] text-foreground">
            Мы формируем широкое и&nbsp;открытое коммьюнити, выходящее за&nbsp;рамки отдельных компаний. Это среда общения, взаимной поддержки и&nbsp;обмена опытом, где встречаются корпоративные команды, индивидуальные участники, клубы и&nbsp;партнёры проекта.
          </p>
          
          {/* CTA: Присоединиться */}
          <div className="my-12 rounded-2xl bg-muted/50 border border-border p-8 sm:p-10 flex flex-col items-start gap-4 max-w-[900px]">
            <h2 className="font-extrabold text-base uppercase tracking-tight text-foreground">
              Присоединяйтесь к&nbsp;корпоративному сообществу
            </h2>
            <p className="text-[14px] leading-[1.7] text-foreground">
              Хотите выступить командой вашей компании? Оставьте заявку&nbsp;— мы свяжемся с&nbsp;вами, расскажем об&nbsp;условиях участия и&nbsp;поможем с&nbsp;организацией.
            </p>
            <p className="text-[14px] leading-[1.7] text-foreground">
              Для связи: <a href="mailto:corporate@tourderussie.ru" className="text-primary underline hover:no-underline font-bold font-mono">corporate@tourderussie.ru</a>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <a href="/auth" className="inline-flex items-center justify-center h-[50px] px-10 bg-[#003051] text-white font-semibold rounded-md hover:bg-[#003051]/90 transition-colors text-base">
                Зарегистрироваться
              </a>
              <CorporateApplicationForm />
            </div>
          </div>

          <h2 className="tdr-page-subtitle mt-12" style={{ color: '#000' }}> Наши корпоративные команды</h2>
          
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {corporateTeams.map((team, index) => (
              <div key={index} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-19.2px)]">
                <img
                  src={team.src}
                  alt={team.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-20 object-contain"
                />
              </div>
            ))}
          </div>

        </div>
      </main>
      
      <FooterNew />
    </div>);

};

export default CorporateLiga;