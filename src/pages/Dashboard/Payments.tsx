import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { paymentsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faReceipt, faCheckCircle, faClock, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

interface Payment {
  id: string;
  robokassa_inv_id: number | null;
  amount_kopecks: number;
  description: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  metadata: any;
}

interface PaymentsProps {
  status?: 'success' | 'failed';
}

const Payments: React.FC<PaymentsProps> = ({ status: routeStatus }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const paymentStatus = routeStatus || searchParams.get('status') || undefined;

  useEffect(() => {
    loadPayments();
  }, [user]);

  const loadPayments = async () => {
    if (!user) return;
    try {
      const { data } = await paymentsAPI.getUserPayments();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'pending': return <FontAwesomeIcon icon={faClock} className="text-orange-500" />;
      case 'failed': return <FontAwesomeIcon icon={faXmarkCircle} className="text-red-500" />;
      default: return <FontAwesomeIcon icon={faClock} className="text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачено';
      case 'pending': return 'Ожидание';
      case 'failed': return 'Ошибка';
      case 'refunded': return 'Возврат';
      default: return status;
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">История платежей</h1>
          <p className="text-muted-foreground mt-1">
            Все ваши транзакции и стартовые взносы
          </p>
        </div>

        {/* Payment status notification */}
        {paymentStatus === 'success' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
              <div>
                <p className="font-semibold text-green-800">Оплата прошла успешно!</p>
                <p className="text-sm text-green-600">Ваша регистрация подтверждена</p>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStatus === 'failed' && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <FontAwesomeIcon icon={faXmarkCircle} className="text-red-500 text-xl" />
              <div>
                <p className="font-semibold text-red-800">Оплата не прошла</p>
                <p className="text-sm text-red-600">Попробуйте оплатить ещё раз</p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FontAwesomeIcon icon={faCreditCard} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Нет платежей
              </h3>
              <p className="text-muted-foreground">
                История ваших платежей будет отображаться здесь после оплаты стартовых взносов
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium text-foreground">{payment.description}</p>
                        {payment.metadata?.cart?.map((item: any, i: number) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {item.eventName} — {item.distance}
                          </p>
                        ))}
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                          {payment.paid_at && ` · Оплачен: ${new Date(payment.paid_at).toLocaleDateString('ru-RU')}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {(payment.amount_kopecks / 100).toLocaleString('ru-RU')} ₽
                      </p>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {getStatusLabel(payment.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
