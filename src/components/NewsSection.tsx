import React from 'react';

const NewsSection: React.FC = () => {
  const news = [
    {
      image: '/images/news/suzdal.jpg',
      title: 'Tour de Russie в Суздале',
      text: '7 июня в городе Суздаль пройдет первый этап спортивных мероприятий Tour de Russie',
      date: '14 января 2026',
    },
    {
      image: '/images/news/moscow.jpg',
      title: 'Tour de Russie в Москве',
      text: '12 июня Москва примет второй этап спортивных мероприятий Tour de Russie',
      date: '14 января 2026',
    },
  ];

  const calendar = [
    { date: '7 июня', title: 'Tour de Russie', location: 'Суздаль' },
    { date: '5 июля', title: 'Tour de Russie', location: 'Игора' },
    { date: '16 августа', title: 'Tour de Russie', location: 'Царское Село' },
    { date: '2027', title: 'Tour de Russie', location: 'Москва' },
  ];

  return (
    <section className="py-16 px-10 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="tdr-page-title mb-8">Лента новостей</h2>
        
        <div className="grid grid-cols-[1fr_1fr_auto] gap-8">
          {/* News Cards */}
          <div className="flex flex-col gap-6">
            {news.slice(0, 1).map((item, index) => (
              <div key={index} className="tdr-news-card">
                <img src={item.image} alt={item.title} />
                <div className="tdr-news-card-content">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <a href="#" className="tdr-read-more">READ MORE &gt;&gt;</a>
                  <p className="tdr-news-date">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-6">
            {news.slice(1, 2).map((item, index) => (
              <div key={index} className="tdr-news-card">
                <img src={item.image} alt={item.title} />
                <div className="tdr-news-card-content">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <a href="#" className="tdr-read-more">READ MORE &gt;&gt;</a>
                  <p className="tdr-news-date">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mini Calendar */}
          <div className="tdr-calendar-mini w-[250px]">
            {calendar.map((item, index) => (
              <div key={index} className="tdr-calendar-item">
                <div className="tdr-calendar-date">{item.date}</div>
                <div className="tdr-calendar-info">
                  <h4>{item.title}</h4>
                  <p>{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button className="tdr-btn-primary mt-8">ВСЕ НОВОСТИ</button>
      </div>
    </section>
  );
};

export default NewsSection;
