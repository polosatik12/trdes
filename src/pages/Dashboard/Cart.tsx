import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faCartShopping, faSpinner } from '@fortawesome/free-solid-svg-icons';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { paymentsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CartItem {
  eventSlug: string;
  eventName: string;
  routeName: string;
  distance: string;
  price: number;
  originalPrice?: number;
  promoCode?: string | null;
  promoDiscount?: number;
  city: string;
  requirements: string[];
}

const Cart: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tdr_cart');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
  }, []);

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    localStorage.setItem('tdr_cart', JSON.stringify(updated));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Войдите в систему для оплаты');
      navigate('/auth');
      return;
    }

    if (items.length === 0) return;

    setLoading(true);
    try {
      const { data } = await paymentsAPI.createPayment(items);

      // Clear cart
      localStorage.removeItem('tdr_cart');
      setItems([]);

      // Redirect to Robokassa
      window.location.href = data.paymentUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка создания платежа');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="font-extrabold text-2xl text-foreground mb-6">
          Корзина
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faCartShopping} className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-lg">Корзина пуста</p>
            <p className="text-muted-foreground text-sm mt-1">
              Выберите дистанцию на странице мероприятия
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={`${item.eventSlug}-${item.routeName}-${idx}`}
                className="bg-background border border-border p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {item.routeName} — {item.distance}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.eventName}</p>
                  <p className="text-sm text-muted-foreground">Город: {item.city}</p>
                  {item.promoCode && (
                    <p className="text-xs text-green-600 mt-1">
                      Промокод {item.promoCode}: -{item.promoDiscount}%
                      {item.originalPrice && (
                        <span className="line-through text-muted-foreground ml-2">
                          {item.originalPrice.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-bold text-lg text-secondary">
                    {item.price.toLocaleString('ru-RU')} ₽
                  </span>
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-destructive hover:text-destructive/80 transition-colors p-1"
                    aria-label="Удалить"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="font-medium text-foreground">Итого</span>
              <span className="font-extrabold text-2xl text-secondary">
                {total.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full bg-[hsl(201,72%,30%)] hover:bg-[hsl(201,72%,37%)] text-white font-bold uppercase tracking-wider py-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
                  Переход к оплате...
                </>
              ) : (
                'Оплатить'
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cart;
