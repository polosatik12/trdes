import React, { useEffect } from 'react';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import chuchaCoffee from '@/assets/chucha-sitting-coffee.png';

export interface ChuchaPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
}

const chuchaPosts: ChuchaPost[] = [
  {
    id: 1,
    slug: 'first-pedals',
    title: 'Первые педали Чучи',
    excerpt: 'Мы все когда-то так начинали. С\u00A0искренним азартом и\u00A0бесстрашием! Велоспорт доступен всем.',
    date: '2025',
    image: '/images/news/chucha-first-pedals.jpg',
    category: 'История',
  },
  {
    id: 2,
    slug: 'chucha-boris-astoria',
    title: 'Чуча и Борис.\nВстреча в «Астории»',
    excerpt: 'Чуча собирает свою первую команду. Встретился с\u00A0другом Борисом в\u00A0легендарном отеле «Астория» в\u00A0Санкт-Петербурге.',
    date: '27 января 2026',
    image: '/images/chucha/chucha-boris-astoria.jpg',
    category: 'Закулисье',
  },
  {
    id: 3,
    slug: 'chucha-bike-shop',
    title: 'Чуча в веломагазине',
    excerpt: 'Первый визит Чучи в\u00A0велосипедный магазин. Пора присмотреться к\u00A0спортивному инвентарю.',
    date: '11 марта 2026',
    image: '/images/chucha/chucha-bike-shop.jpg',
    category: 'Закулисье',
  },
  {
    id: 4,
    slug: 'chucha-podium-dreams',
    title: 'Мечты о\u00A0первом месте',
    excerpt: 'Первые мечты о\u00A0первом месте\u00A0— пока в\u00A0качестве болельщика на\u00A0велотреке.',
    date: '11 марта 2026',
    image: '/images/chucha/chucha-podium.jpg',
    category: 'Спорт',
  },
];

const ChuchaWorld: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNew />

      <main className="flex-1">
        {/* Hero */}
        <section className="tdr-section pt-8 pb-12 md:pt-12 md:pb-16">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex-1">
              <h1 className="tdr-page-title mb-4">Мир Чучи</h1>
              <p className="text-lg md:text-xl text-foreground/80 max-w-xl leading-relaxed">
                Добро пожаловать в&nbsp;мир Чучи&nbsp;— основателя Tour&nbsp;de&nbsp;Russie.
                Здесь вы найдёте его заметки, истории из&nbsp;путешествий и&nbsp;закулисье проекта.
              </p>
            </div>
            <div className="w-48 md:w-64 flex-shrink-0 mt-6 md:mt-10 md:mr-24">
              <img
                src={chuchaCoffee}
                alt="Чуча с кофе"
                className="w-full h-auto -scale-x-100"
              />
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="tdr-section pt-0 pb-16 md:pb-24">
          {chuchaPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {chuchaPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col rounded-lg"
                >
                  <div className="h-[250px] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: '50% 70%' }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                      {post.category}
                    </span>
                    <span className="text-sm font-semibold text-foreground/60 mb-1">
                      {post.date}
                    </span>
                    <h3 className="font-bold text-lg mt-1 mb-3 text-foreground font-mono whitespace-pre-line">
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed font-semibold text-foreground/80">
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🚴</div>
              <h2 className="text-2xl font-bold text-foreground mb-3 font-mono">
                Скоро здесь появятся публикации
              </h2>
              <p className="text-foreground/60 text-lg max-w-md mx-auto">
                Чуча готовит интересные истории, заметки и&nbsp;новости. Следите за&nbsp;обновлениями!
              </p>
            </div>
          )}
        </section>
      </main>

      <FooterNew />
    </div>
  );
};

export default ChuchaWorld;
