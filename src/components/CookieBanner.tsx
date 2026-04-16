import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';

const COOKIE_KEY = 'tdr_cookies_accepted';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible &&
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
        
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 text-sm leading-relaxed text-foreground">
              Мы используем файлы cookie для улучшения работы сайта и анализа трафика. Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
              <a
              href="/documents/cookie-policy.pdf"
              className="text-primary hover:underline font-medium"
              onClick={(e) => {
                e.preventDefault();
                fetch('/documents/cookie-policy.pdf').
                then((res) => res.blob()).
                then((blob) => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Политика_использования_куки_файлов.pdf';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                });
              }}>
              
                политикой использования куки
              </a>.
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button onClick={accept} size="sm" className="font-semibold">
                Принять
              </Button>
              <button
              onClick={accept}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Закрыть">
              
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

};

export default CookieBanner;