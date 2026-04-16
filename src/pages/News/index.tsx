import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';
import OptimizedImage from '@/components/OptimizedImage';
import { newsItems } from '@/data/news';

const NewsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />
      <main className="flex-1 pt-28 pb-16">
        <div className="tdr-section">
          <div className="flex items-center gap-4 mb-2">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 20 }} />
            </Link>
            <h1 className="font-extrabold text-base text-foreground uppercase tracking-tight">
              Наши новости
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {newsItems.map((item) =>
            <Link
              key={item.id}
              to={`/news/${item.slug}`}
              className="bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer">

                <OptimizedImage src={item.image} isBackground backgroundSize={item.id === 3 ? '120%' : 'cover'} className="h-[250px]" style={{ backgroundPosition: 'top' }} />
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-sm font-medium text-foreground">{item.date}</span>
                  <h3 className="font-bold text-lg mt-2 mb-3 text-foreground font-mono whitespace-pre-line">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{item.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-secondary font-bold text-sm hover:gap-3 transition-all mt-auto">
                    Читать далее <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 16 }} />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </main>
      <FooterNew />
    </div>);

};

export default NewsPage;