import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import HeaderNew from '../../components/HeaderNew';
import FooterNew from '../../components/FooterNew';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { promoCodesAPI } from '@/lib/api';

interface RegistrationCard {
  routeName: string;
  distance: string;
  requirements: string[];
  timeLimitNote?: string;
  price: number;
  priceLabel: string;
}

interface EventRegistrationProps {
  slug: string;
  eventName: string;
  city: string;
  registrationCards: RegistrationCard[];
  borderColors: string[];
  backUrl: string;
}

const EventRegistration: React.FC<EventRegistrationProps> = ({
  slug,
  eventName,
  city,
  registrationCards,
  borderColors,
  backUrl,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<RegistrationCard | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [vipExpanded, setVipExpanded] = useState(false);
  const [vipSelected, setVipSelected] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const isSuzdal = slug === 'suzdal';

  const handleApplyPromo = async () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError('Введите промокод');
      return;
    }
    try {
      const { data } = await promoCodesAPI.validate(code);
      setPromoDiscount(data.discount_percent);
      setPromoApplied(true);
    } catch (error: any) {
      setPromoError(error.response?.data?.error || 'Промокод не найден');
      setPromoDiscount(0);
      setPromoApplied(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoApplied(false);
    setPromoError('');
  };

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleParticipate = (cardIndex: number) => {
    setSelectedCard(registrationCards[cardIndex]);
    setAgreed(false);
    setConfirmOpen(true);
  };

  const handleProceedToCart = () => {
    if (!selectedCard) return;
    const basePrice = parseInt(selectedCard.priceLabel.replace(/[^\d]/g, ''));
    const vipPrice = !isSuzdal && vipSelected ? 7000 : 0;
    // Discount applies only to base price, VIP is always full price
    const discountedBase = promoApplied
      ? Math.round(basePrice * (1 - promoDiscount / 100))
      : basePrice;
    const totalPrice = discountedBase + vipPrice;

    const cartItem = {
      eventSlug: slug,
      eventName,
      routeName: selectedCard.routeName,
      distance: selectedCard.distance,
      price: totalPrice,
      originalPrice: basePrice + vipPrice,
      promoCode: promoApplied ? promoCode.toUpperCase() : null,
      promoDiscount: promoApplied ? promoDiscount : 0,
      city,
      requirements: selectedCard.requirements,
    };

    const stored = localStorage.getItem('tdr_cart');
    const cart = stored ? JSON.parse(stored) : [];
    cart.push(cartItem);
    localStorage.setItem('tdr_cart', JSON.stringify(cart));

    setConfirmOpen(false);
    navigate('/dashboard/cart');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />

      <section className="flex-1 pt-36 md:pt-40 pb-16 md:pb-20 bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
            Назад к мероприятию
          </Link>

          <h1 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-2 text-center font-mono">
            Регистрация
          </h1>
          <p className="text-center text-muted-foreground mb-10">{eventName}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {registrationCards.map((card, idx) => (
              <div key={card.routeName} className="bg-background border border-border flex flex-col">
                <div className="px-6 py-3" style={{ backgroundColor: borderColors[idx] }}>
                  <h3 className="font-bold text-white uppercase text-center text-xl font-mono">
                    {card.routeName} {card.distance}
                  </h3>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <ul className="space-y-2 text-sm text-foreground mb-4">
                      {card.requirements.map((req) => (
                        <li key={req}>• {req}</li>
                      ))}
                    </ul>
                    {card.timeLimitNote && (
                      <p className="text-destructive font-semibold text-xs mb-6">
                        Внимание: {card.timeLimitNote}
                      </p>
                    )}
                    <div className="mb-4">
                      <span className="font-extrabold text-3xl text-primary">{card.priceLabel}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleParticipate(idx)}
                    className="mt-auto w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-sm py-3 transition-colors"
                  >
                    Участвовать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterNew />

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-xl uppercase text-primary tracking-wide">
              Подтверждение выбора
            </DialogTitle>
            <DialogDescription>Проверьте условия участия перед покупкой</DialogDescription>
          </DialogHeader>

          {selectedCard && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-foreground mb-1">
                  {selectedCard.routeName} — {selectedCard.distance}
                </p>
                <p className="text-sm text-muted-foreground">Город: {city}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Требования:</p>
                <ul className="space-y-1 text-sm text-foreground">
                  {selectedCard.requirements.map((req) => (
                    <li
                      key={req}
                      className={req.includes('Лимит') ? 'text-destructive font-semibold' : ''}
                    >
                      • {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Insurance Button */}
              <div className="border-t border-border pt-4">
                <a
                  href="https://shop.sogaz.ru/corp/d6x113/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  Купить страховку
                </a>
              </div>

              {/* VIP Section — hidden for Suzdal */}
              {!isSuzdal && (
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setVipExpanded(!vipExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={vipSelected}
                      onCheckedChange={(checked) => setVipSelected(checked === true)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="font-bold text-foreground">Выбрать VIP Пакет</span>
                  </div>
                  <FontAwesomeIcon
                    icon={vipExpanded ? faChevronUp : faChevronDown}
                    className="text-muted-foreground"
                  />
                </button>

                {vipExpanded && (
                  <div className="p-4 bg-background space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">VIP Пакет включает:</p>
                      <span className="font-bold text-lg text-primary">7 000 ₽</span>
                    </div>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Завтрак в VIP шатре</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>VIP парковка</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Регистрация в VIP стойке</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              )}

              {/* Promo Code Section */}
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground mb-2">Промокод</p>
                {!promoApplied ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError('');
                      }}
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    />
                    <Button
                      onClick={handleApplyPromo}
                      variant="outline"
                      className="shrink-0"
                    >
                      Применить
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <div>
                      <span className="text-sm font-semibold text-green-700">{promoCode.toUpperCase()}</span>
                      <span className="text-sm text-green-600 ml-2">— скидка {promoDiscount}%</span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Убрать
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-sm text-destructive mt-1">{promoError}</p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Стоимость</span>
                <span className="font-extrabold text-2xl text-primary">
                  {(() => {
                    const basePrice = parseInt(selectedCard.priceLabel.replace(/[^\d]/g, ''));
                    const vipPrice = !isSuzdal && vipSelected ? 7000 : 0;
                    const discountedBase = promoApplied
                      ? Math.round(basePrice * (1 - promoDiscount / 100))
                      : basePrice;
                    return `${(discountedBase + vipPrice).toLocaleString('ru-RU')} ₽`;
                  })()}
                </span>
              </div>

              <div className="flex items-start gap-3 border-t border-border pt-4">
                <Checkbox
                  id={`agree-${slug}`}
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                />
                <label
                  htmlFor={`agree-${slug}`}
                  className="text-sm text-foreground leading-snug cursor-pointer"
                >
                  С условиями ознакомлен и подтверждаю
                </label>
              </div>

              <Button
                onClick={handleProceedToCart}
                disabled={!agreed}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider"
              >
                Перейти к покупке
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventRegistration;
