import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  type: 'individual' | 'corporate';
  created_at: string;
}

const MOCK: ContactRequest[] = [
  { id:'1', name:'Смирнов Алексей',        email:'smirnov@mail.ru',      phone:'+7 916 123-45-67', message:'Хочу узнать подробнее про Grand Tour. Какие требования к велосипеду?',                                                    type:'individual', created_at:'2026-04-14T09:15:00Z' },
  { id:'2', name:'ООО «ВелоТех»',          email:'info@velotech.ru',      phone:'+7 495 234-56-78', message:'Интересует корпоративное участие для 12 сотрудников. Возможна ли скидка и выставление счёта на юридическое лицо?',       type:'corporate',  created_at:'2026-04-13T14:30:00Z' },
  { id:'3', name:'Козлова Мария',           email:'kozlova@gmail.com',     phone:null,               message:'Подскажите, можно ли зарегистрироваться на Median Tour если я никогда не участвовала в велогонках?',                      type:'individual', created_at:'2026-04-12T11:00:00Z' },
  { id:'4', name:'Петров Дмитрий',          email:'petrov@yandex.ru',      phone:'+7 926 345-67-89', message:'Когда откроется регистрация на Суздаль? Хочу успеть записаться на Grand Tour.',                                          type:'individual', created_at:'2026-04-11T16:20:00Z' },
  { id:'5', name:'Газпром Нефть',           email:'sport@gazprom.ru',      phone:'+7 812 456-78-90', message:'Корпоративная программа для 25 участников. Нужны именные стартовые пакеты и отдельная зона для команды.',                type:'corporate',  created_at:'2026-04-10T10:45:00Z' },
  { id:'6', name:'Новикова Анна',           email:'novikova@mail.ru',      phone:'+7 905 567-89-01', message:'Есть ли медицинский пункт на трассе? У меня аллергия на укусы насекомых.',                                              type:'individual', created_at:'2026-04-09T08:30:00Z' },
];

const CRMCorporateApps: React.FC = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contact')
      .then(({ data }) => {
        const list = data.requests || [];
        setRequests(list.length ? list : MOCK);
      })
      .catch(() => setRequests(MOCK))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Заявки</h2>
        <p className="text-sm text-muted-foreground mt-1">Всего: {requests.length}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Заявок пока нет</div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-card rounded-xl border shadow-sm p-5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{r.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    r.type === 'corporate'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {r.type === 'corporate' ? 'Юр. лицо' : 'Физ. лицо'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{r.email}</span>
                {r.phone && <span>{r.phone}</span>}
              </div>

              <p className="text-sm bg-muted/40 rounded-lg p-3">{r.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CRMCorporateApps;
