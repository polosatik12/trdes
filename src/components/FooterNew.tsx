import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const FooterNew: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setError('');
    if (!email || !email.includes('@')) {
      setError('Введите корректный email');
      return;
    }
    if (!consent) {
      setError('Необходимо согласие на получение рассылки');
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Вы подписались на новости!' });
      setOpen(false);
      setEmail('');
      setConsent(false);
    }, 1000);
  };

  return (
    <footer className="tdr-footer">
      <div className="tdr-footer-content">
        {/* Column 1 - Logo & Socials */}
        <div>
          <img
            src="/images/tdr-logo.png"
            alt="Tour de Russie"
            className="hidden sm:block h-[37px] w-auto mb-6"
            loading="eager"
            decoding="async" />
          
          
          <div className="tdr-social-icons mb-6">
            {/* VK */}
            <a href="https://vk.com" className="tdr-social-icon" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="11" viewBox="0 0 24 14" fill="currentColor">
                <path d="M23.5 1.2c.2-.5 0-.9-.7-.9h-2.4c-.6 0-.9.3-1 .6 0 0-1.2 2.9-2.9 4.8-.6.5-.8.7-1.1.7-.2 0-.4-.2-.4-.6V1.2c0-.6-.2-.9-.7-.9H10c-.4 0-.6.3-.6.6 0 .6.9.7.9 2.4v3.7c0 .8-.1.9-.5.9-.8 0-2.8-2.9-4-6.3-.2-.6-.4-.9-1-.9H2.4c-.7 0-.8.3-.8.6 0 .7.8 3.9 3.8 8.2 2 2.8 4.9 4.4 7.5 4.4 1.6 0 1.7-.3 1.7-.9v-2.1c0-.7.1-.8.6-.8.4 0 1 .1 2.4 1.5 1.6 1.6 1.9 2.4 2.8 2.4h2.4c.7 0 1-.3.8-1-.2-.7-.9-1.6-2-2.8-.5-.6-1.3-1.3-1.6-1.7-.4-.5-.3-.7 0-1.1 0 0 2.8-4 3.1-5.3z" />
              </svg>
            </a>
            {/* MAX */}
            <a href="https://max.ru" className="tdr-social-icon" target="_blank" rel="noopener noreferrer">
              <span className="text-[11px] font-extrabold tracking-tight leading-none">MAX</span>
            </a>
          </div>
          
          <a
            href="mailto:mail@tourderussie.ru"
            className="block text-[15px] hover:opacity-70">
            
            mail@tourderussie.ru
          </a>
        </div>
        
        {/* Column 2 - Links */}
        <div>
          <div className="tdr-footer-links mb-6">
            <Link to="/corporate">Корпоративное сообщество</Link>
            <Link to="/calendar">Календарь</Link>
            <Link to="/results">Результаты</Link>
            <Link to="/media">Медиа</Link>
          </div>
          <div className="tdr-footer-links">
            <Link to="/#about-section">О проекте</Link>
            <Link to="/contact">Контакты</Link>
            <Link to="/partners">Партнеры</Link>
            <Link to="/reglament">Регламент</Link>
          </div>
          <div className="flex md:justify-center mt-6">
            <button
              onClick={() => setOpen(true)}
              className="px-8 py-3 bg-transparent text-white font-extrabold text-xs uppercase tracking-widest border-2 border-white rounded-sm md:hover:bg-white md:hover:text-[hsl(var(--primary))] transition-all">
              
              Подписаться на новости
            </button>
          </div>
        </div>
        
        {/* Column 3 - Contact */}
        <div className="md:text-right">
          <p className="tdr-footer-text mb-6">Если чувствуете, что нам по пути или у вас есть идеи о сотрудничестве, напишите нам.

          </p>
          <Link to="/contact" className="inline-block px-8 py-3 bg-transparent text-white font-extrabold text-xs uppercase tracking-widest border-2 border-white rounded-sm md:hover:bg-white md:hover:!text-[#003051] transition-all">
            Обратная связь
          </Link>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Подписка на новости</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <Label htmlFor="subscribe-email" className="mb-1.5 block">Email</Label>
              <Input
                id="subscribe-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {setEmail(e.target.value);setError('');}} />
              
              {error && <p className="text-destructive text-sm mt-1">{error}</p>}
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="subscribe-consent"
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)} />
              
              <Label htmlFor="subscribe-consent" className="text-sm leading-snug cursor-pointer">
                Я согласен на получение{' '}
                <a
                  href="/documents/consent-advertising.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-70"
                  onClick={(e) => {
                    e.preventDefault();
                    fetch('/documents/consent-advertising.pdf').
                    then((res) => res.blob()).
                    then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'Согласие_на_получение_рекламной_информации.pdf';
                      a.click();
                      URL.revokeObjectURL(url);
                    });
                  }}>
                  
                  рекламной информации
                </a>
                {' '}(рассылки)
              </Label>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={!consent || loading}
              className="w-full py-3 bg-[hsl(var(--primary))] text-white font-extrabold text-xs uppercase tracking-widest rounded-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              
              {loading ? 'Отправка...' : 'Подписаться'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="tdr-footer-bottom">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="tdr-footer-copyright">
            © 2026 Tour de Russie. Все права защищены.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/70">
            <a
              href="/documents/public-offer-individual.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors">
              Публичная оферта (физ. лица)
            </a>
            <span className="hidden md:inline">•</span>
            <a
              href="/documents/public-offer-legal.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors">
              Публичная оферта (юр. лица)
            </a>
            <span className="hidden md:inline">•</span>
            <a
              href="/documents/terms-of-service.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors">
              Пользовательское соглашение
            </a>
            <span className="hidden md:inline">•</span>
            <a
              href="/documents/privacy-policy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors">
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </div>
    </footer>);

};

export default FooterNew;