import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faCircleCheck, faCircle, faSpinner, faDownload } from '@fortawesome/free-solid-svg-icons';

interface Consent {
  consent_type: string;
  accepted_at: string;
  document_version: string;
}

const consentTypes = [
  {
    type: 'personal_data_consent',
    title: 'Согласие на обработку персональных данных',
    description: 'Согласие на обработку и хранение ваших персональных данных',
    downloadUrl: '/documents/personal-data-consent.pdf',
    downloadName: 'Согласие_на_обработку_персональных_данных.pdf',
  },
  {
    type: 'privacy_policy',
    title: 'Политика конфиденциальности',
    description: 'Ознакомление с политикой обработки персональных данных',
    downloadUrl: '/documents/privacy-policy.pdf',
    downloadName: 'Политика_конфиденциальности.pdf',
  },
  {
    type: 'waiver',
    title: 'Дисклеймер (отказ от ответственности)',
    description: 'Подтверждение осведомлённости о рисках и отказ от претензий',
    downloadUrl: '/documents/disclaimer-waiver.pdf',
    downloadName: 'Заявление_об_отказе_от_ответственности.pdf',
  },
  {
    type: 'photo_consent',
    title: 'Согласие на фото/видео',
    description: 'Разрешение на использование вашего изображения в материалах мероприятия',
    downloadUrl: '/documents/photo-consent.pdf',
    downloadName: 'Согласие_на_использование_изображения.pdf',
  },
  {
    type: 'terms_of_service',
    title: 'Условия использования',
    description: 'Согласие с правилами и условиями платформы Tour de Russie',
    downloadUrl: '/documents/terms-of-service.pdf',
    downloadName: 'Пользовательское_соглашение.pdf',
  },
];

const Documents: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConsents();
    }
  }, [user]);

  const fetchConsents = async () => {
    try {
      const { data } = await api.get('/profile/consents');
      setConsents(data.consents || []);
    } catch (error) {
      console.error('Error fetching consents:', error);
    }
    setLoading(false);
  };

  const isConsentSigned = (type: string) => {
    return consents.some(c => c.consent_type === type);
  };

  const getConsentDate = (type: string) => {
    const consent = consents.find(c => c.consent_type === type);
    if (consent) {
      return new Date(consent.accepted_at).toLocaleDateString('ru-RU');
    }
    return null;
  };

  const handleSign = async (type: string) => {
    if (!user) return;

    setSigning(type);

    try {
      await api.post('/profile/consents', {
        consent_type: type,
        document_version: '1.0',
      });

      toast({
        title: 'Успешно!',
        description: 'Документ подписан',
      });
      await fetchConsents();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подписать документ',
        variant: 'destructive',
      });
    }

    setSigning(null);
  };

  const signedCount = consents.length;
  const totalCount = consentTypes.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Документы и согласия</h1>
          <p className="text-muted-foreground mt-1">
            Подпишите необходимые документы для участия в мероприятиях
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faFileLines} className="h-5 w-5 text-primary" />
                <span className="font-medium">Статус подписания</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {signedCount} / {totalCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} spin className="h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {consentTypes.map((consent) => {
              const signed = isConsentSigned(consent.type);
              const date = getConsentDate(consent.type);

              return (
                <Card key={consent.type}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {signed ? (
                          <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <FontAwesomeIcon icon={faCircle} className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground">{consent.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {consent.description}
                          </p>
                          {signed && date && (
                            <p className="text-xs text-green-600 mt-2">
                              Подписано: {date}
                            </p>
                          )}
                          {consent.downloadUrl && (
                            <a
                              href={consent.downloadUrl}
                              download={consent.downloadName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
                              onClick={(e) => {
                                e.preventDefault();
                                fetch(consent.downloadUrl!)
                                  .then(res => res.blob())
                                  .then(blob => {
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = consent.downloadName || 'document.pdf';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  });
                              }}
                            >
                              <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                              Скачать документ
                            </a>
                          )}
                        </div>
                      </div>

                      {!signed && (
                        <Button
                          size="sm"
                          onClick={() => handleSign(consent.type)}
                          disabled={signing === consent.type}
                        >
                          {signing === consent.type ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4" />
                          ) : (
                            'Подписать'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Documents;
