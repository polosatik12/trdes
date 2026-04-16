import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface CMSBlockRendererProps {
  block: {
    block_type: string;
    data: Record<string, unknown>;
  };
}

const CMSBlockRenderer: React.FC<CMSBlockRendererProps> = ({ block }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (block.block_type === 'image_slider' && block.data.autoPlay) {
      const images = (block.data.images as any[]) || [];
      if (images.length <= 1) return;
      const speed = (block.data.speed as number) || 5000;
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % images.length);
      }, speed);
      return () => clearInterval(interval);
    }
  }, [block.block_type, block.data.autoPlay, block.data.speed, block.data.images]);

  switch (block.block_type) {
    case 'hero': {
      const d = block.data;
      return (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {(d.backgroundImage as string) && (
            <div className="absolute inset-0 bg-black/40 z-10" />
          )}
          {(d.backgroundImage as string) && (
            <img
              src={d.backgroundImage as string}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{d.title as string}</h1>
            {(d.subtitle as string) && <p className="text-lg md:text-xl text-white/80 mb-8">{d.subtitle as string}</p>}
            {(d.ctaText as string) && (
              <Link
                to={d.ctaLink as string || '/'}
                className="inline-block bg-white text-[#003051] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {d.ctaText as string}
              </Link>
            )}
          </div>
        </section>
      );
    }

    case 'text_section': {
      const d = block.data;
      const align = (d.alignment as string) || 'left';
      return (
        <section className="py-16 px-4">
          <div className={`max-w-5xl mx-auto ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''}`}>
            {(d.title as string) && <h2 className="text-3xl font-bold text-gray-900 mb-4">{d.title as string}</h2>}
            {(d.content as string) && (
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">{d.content as string}</div>
            )}
            {(d.image as string) && (
              <img src={d.image as string} alt="" className="mt-6 rounded-xl max-w-full h-auto" />
            )}
          </div>
        </section>
      );
    }

    case 'image_slider': {
      const images = (block.data.images as Array<{ src: string; alt: string }>) || [];
      if (images.length === 0) return null;
      return (
        <section className="py-8 px-4">
          <div className="max-w-5xl mx-auto relative overflow-hidden rounded-2xl">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
              {images.map((img, i) => (
                <img key={i} src={img.src} alt={img.alt} className="w-full flex-shrink-0 aspect-video object-cover" />
              ))}
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeSlide ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'image_gallery': {
      const images = (block.data.images as Array<{ src: string; alt: string }>) || [];
      const columns = (block.data.columns as number) || 3;
      if (images.length === 0) return null;
      return (
        <section className="py-8 px-4">
          <div className={`max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-${columns} gap-4`}>
            {images.map((img, i) => (
              <img key={i} src={img.src} alt={img.alt} className="w-full aspect-square object-cover rounded-xl" />
            ))}
          </div>
        </section>
      );
    }

    case 'card_grid': {
      const d = block.data;
      const cards = (d.cards as Array<{ image: string; title: string; text: string; link: string }>) || [];
      if (cards.length === 0) return null;
      return (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {(d.title as string) && <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{d.title as string}</h2>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards.map((card, i) => (
                <Link key={i} to={card.link || '/'} className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {card.image && <img src={card.image} alt={card.title} className="w-full h-48 object-cover" />}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-500">{card.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'info_bar': {
      const items = (block.data.items as Array<{ icon: string; label: string; value: string }>) || [];
      if (items.length === 0) return null;
      return (
        <section className="py-8 px-4">
          <div className="max-w-5xl mx-auto flex flex-wrap gap-6 justify-center">
            {items.map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-[#003051]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'cta_banner': {
      const d = block.data;
      return (
        <section className="relative py-16 px-4 overflow-hidden">
          {(d.backgroundImage as string) && (
            <>
              <div className="absolute inset-0 bg-black/50 z-10" />
              <img src={d.backgroundImage as string} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </>
          )}
          <div className="relative z-20 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">{d.title as string}</h2>
            {(d.subtitle as string) && <p className="text-lg text-white/80 mb-8">{d.subtitle as string}</p>}
            {(d.buttonText as string) && (
              <Link
                to={d.buttonLink as string || '/'}
                className="inline-block bg-white text-[#003051] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {d.buttonText as string}
              </Link>
            )}
          </div>
        </section>
      );
    }

    case 'partners_grid': {
      const d = block.data;
      const partners = (d.partners as Array<{ logo: string; name: string; url: string }>) || [];
      if (partners.length === 0) return null;
      return (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {(d.title as string) && <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{d.title as string}</h2>}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
              {partners.map((p, i) => (
                <a key={i} href={p.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
                  {p.logo && <img src={p.logo} alt={p.name} className="max-h-16 object-contain" />}
                </a>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'embed': {
      const d = block.data;
      return (
        <section className="py-8 px-4">
          <div className="max-w-5xl mx-auto">
            {(d.title as string) && <h2 className="text-2xl font-bold text-gray-900 mb-4">{d.title as string}</h2>}
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe src={d.url as string} className="w-full h-full border-0" allowFullScreen />
            </div>
          </div>
        </section>
      );
    }

    case 'spacer': {
      return <div style={{ height: `${block.data.height || 40}px` }} />;
    }

    default:
      return null;
  }
};

export default CMSBlockRenderer;
