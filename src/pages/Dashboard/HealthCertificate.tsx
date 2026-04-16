import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { healthCertificatesAPI } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCalendarDays, faTriangleExclamation, faCircleCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Certificate {
  id: string;
  issued_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'pending';
  document_url: string | null;
}

const HealthCertificate: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [issuedDate, setIssuedDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (user) fetchCertificate();
  }, [user]);

  const fetchCertificate = async () => {
    try {
      const { data } = await healthCertificatesAPI.getUserCertificates();
      if (data.certificates && data.certificates.length > 0) {
        const cert = data.certificates[0];
        setCertificate(cert);
        setIssuedDate(cert.issued_date);
        setExpiryDate(cert.expiry_date);
      }
    } catch (error) {
      console.error('Error fetching certificate:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !issuedDate || !expiryDate) return;

    setSaving(true);

    const documentUrl = certificate?.document_url || null;
    const today = new Date().toISOString().split('T')[0];
    const status = expiryDate < today ? 'expired' : 'active';

    const payload = {
      issued_date: issuedDate,
      expiry_date: expiryDate,
      status: status,
      document_url: documentUrl,
    };

    try {
      if (certificate) {
        await healthCertificatesAPI.updateCertificate(certificate.id, payload);
        toast({ title: 'Справка обновлена!' });
      } else {
        await healthCertificatesAPI.createCertificate(payload);
        toast({ title: 'Справка добавлена!' });
      }
      await fetchCertificate();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: certificate ? 'Не удалось обновить справку' : 'Не удалось сохранить справку',
        variant: 'destructive'
      });
    }

    setSaving(false);
  };

  const getDaysUntilExpiry = () => {
    if (!certificate) return null;
    const expiry = new Date(certificate.expiry_date);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = () => {
    if (!certificate) return null;
    const days = getDaysUntilExpiry();
    if (certificate.status === 'expired' || (days !== null && days < 0)) {
      return <Badge variant="destructive">Истекла</Badge>;
    }
    if (days !== null && days <= 30) {
      return <Badge className="bg-orange-500">Истекает через {days} дн.</Badge>;
    }
    return <Badge className="bg-green-500">Действительна</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Справка о здоровье</h1>
          <p className="text-muted-foreground mt-1">Справка требуется для участия в соревнованиях</p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
            Не забудьте принести оригинал и копию справки на мероприятие
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} spin className="h-8 w-8 text-primary" />
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${certificate?.status === 'active' ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                      <FontAwesomeIcon icon={faHeart} className={`h-5 w-5 ${certificate?.status === 'active' ? 'text-green-500' : 'text-orange-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Статус справки</p>
                      {certificate ? (
                        <p className="text-sm text-muted-foreground">
                          Действительна до {new Date(certificate.expiry_date).toLocaleDateString('ru-RU')}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Не загружена</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge()}
                </div>
              </CardContent>
            </Card>

            {certificate && getDaysUntilExpiry() !== null && getDaysUntilExpiry()! <= 30 && getDaysUntilExpiry()! > 0 && (
              <Card className="border-orange-500/50 bg-orange-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-700 dark:text-orange-400">Справка скоро истекает</p>
                      <p className="text-sm text-orange-600 dark:text-orange-300/80 mt-1">
                        Обновите справку о здоровье, чтобы продолжить участвовать в мероприятиях
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{certificate ? 'Обновить справку' : 'Добавить справку'}</CardTitle>
                <CardDescription>Укажите даты справки</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issued_date">Дата выдачи</Label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faCalendarDays} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="issued_date"
                          type="date"
                          value={issuedDate}
                          onChange={(e) => setIssuedDate(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry_date">Дата окончания</Label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faCalendarDays} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="expiry_date"
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCircleCheck} className="mr-2 h-4 w-4" />
                        {certificate ? 'Обновить' : 'Сохранить'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HealthCertificate;
