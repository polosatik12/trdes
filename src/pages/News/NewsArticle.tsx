import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';
import OptimizedImage from '@/components/OptimizedImage';
import { newsItems } from '@/data/news';

const NewsArticle: React.FC = () => {
  const { slug } = useParams<{slug: string;}>();
  const article = newsItems.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return <Navigate to="/news" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium">

            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 16 }} />
            Назад к новостям
          </Link>

          <OptimizedImage
            src={article.image}
            isBackground
            backgroundSize={article.id === 3 ? '120%' : 'cover'}
            className="w-full h-[180px] xs:h-[220px] sm:h-[300px] md:h-[400px] rounded-lg mb-8"
          />

          <span className="text-sm font-medium text-foreground">{article.date}</span>
          <h1 className="md:text-3xl text-foreground mt-2 mb-6 font-mono font-bold text-xl">
            {article.title}
          </h1>

          <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-line text-base">
            {article.fullText}
          </div>

          <div className="mt-12">
            <Link
              to="/news"
              className="tdr-btn tdr-btn-outline">

              Все новости
            </Link>
          </div>
        </div>
      </main>
      <FooterNew />
    </div>);

};

export default NewsArticle;