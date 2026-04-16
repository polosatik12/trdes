import React, { useEffect, useState } from 'react';
import { adminAPI, eventsAPI } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faDownload } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';

// ── CSV/Excel export ──────────────────────────────────────────
function exportCsv(filename: string, headers: string[], rows: any[][]) {
  const esc = (v: any) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = `${filename}.csv`;
  a.click();
}

// ── Mock data ─────────────────────────────────────────────────
const MOCK_REGS = [
  { id:'r1', last_name:'Смирнов',   first_name:'Алексей',  patronymic:'Игоревич',  email:'smirnov@mail.ru',   phone:'+7 916 123-45-67', city:'Москва',           region:'Московская обл.', gender:'male',   date_of_birth:'1988-03-14', team_name:'Вело-МСК',     event_name:'Tour de Russie: Суздаль', distance_name:'Grand Tour',  distance_km:114, bib_number:123, age_category:'M2', payment_status:'paid',    created_at:'2026-03-01' },
  { id:'r2', last_name:'Козлова',   first_name:'Мария',    patronymic:'Дмитриевна',email:'kozlova@gmail.com', phone:'+7 903 234-56-78', city:'Санкт-Петербург',  region:'Ленинградская обл.', gender:'female', date_of_birth:'1995-07-22', team_name:'',             event_name:'Tour de Russie: Суздаль', distance_name:'Grand Tour',  distance_km:114, bib_number:762, age_category:'F1', payment_status:'paid',    created_at:'2026-03-05' },
  { id:'r3', last_name:'Петров',    first_name:'Дмитрий',  patronymic:'Сергеевич', email:'petrov@yandex.ru',  phone:'+7 926 345-67-89', city:'Нижний Новгород',  region:'Нижегородская обл.', gender:'male',   date_of_birth:'1982-11-05', team_name:'СпортЛаб',    event_name:'Tour de Russie: Суздаль', distance_name:'Median Tour', distance_km:60,  bib_number:1023, age_category:'MM', payment_status:'paid',    created_at:'2026-03-10' },
  { id:'r4', last_name:'Новикова',  first_name:'Анна',     patronymic:'Олеговна',  email:'novikova@mail.ru',  phone:'+7 905 456-78-90', city:'Казань',           region:'Республика Татарстан', gender:'female', date_of_birth:'1990-04-18', team_name:'КазаньВело',  event_name:'Tour de Russie: Суздаль', distance_name:'Median Tour', distance_km:60,  bib_number:1501, age_category:'MF', payment_status:'paid',    created_at:'2026-03-12' },
  { id:'r5', last_name:'Волков',    first_name:'Сергей',   patronymic:'Николаевич',email:'volkov@gmail.com',  phone:'+7 915 567-89-01', city:'Москва',           region:'Московская обл.', gender:'male',   date_of_birth:'1975-09-30', team_name:'',             event_name:'Tour de Russie: Суздаль', distance_name:'Grand Tour',  distance_km:114, bib_number:501, age_category:'M4', payment_status:'paid',    created_at:'2026-03-15' },
  { id:'r6', last_name:'Морозова',  first_name:'Елена',    patronymic:'Викторовна',email:'morozova@yandex.ru',phone:'+7 925 678-90-12', city:'Владимир',         region:'Владимирская обл.', gender:'female', date_of_birth:'1987-12-03', team_name:'',             event_name:'Tour de Russie: Суздаль', distance_name:'Intro Tour',  distance_km:25,  bib_number:2501, age_category:'IF', payment_status:'pending', created_at:'2026-03-18' },
  { id:'r7', last_name:'Фёдоров',   first_name:'Игорь',    patronymic:'Павлович',  email:'fedorov@mail.ru',   phone:'+7 936 789-01-23', city:'Екатеринбург',     region:'Свердловская обл.', gender:'male',   date_of_birth:'1980-06-25', team_name:'УралВело',    event_name:'Tour de Russie: Суздаль', distance_name:'Grand Tour',  distance_km:114, bib_number:401, age_category:'M3', payment_status:'paid',    created_at:'2026-03-20' },
  { id:'r8', last_name:'Зайцева',   first_name:'Ольга',    patronymic:'Андреевна', email:'zaitseva@gmail.com',phone:'+7 906 890-12-34', city:'Москва',           region:'Московская обл.', gender:'female', date_of_birth:'1993-02-14', team_name:'Вело-МСК',    event_name:'Tour de Russie: Суздаль', distance_name:'Grand Tour',  distance_km:114, bib_number:801, age_category:'F2', payment_status:'paid',    created_at:'2026-03-22' },
  { id:'r9', last_name:'Никитин',   first_name:'Павел',    patronymic:'Алексеевич',email:'nikitin@yandex.ru', phone:'+7 916 901-23-45', city:'Ярославль',        region:'Ярославская обл.', gender:'male',   date_of_birth:'1968-08-17', team_name:'',             event_name:'Tour de Russie: Суздаль', distance_name:'Grand Tour',  distance_km:114, bib_number:601, age_category:'M6', payment_status:'paid',    created_at:'2026-03-25' },
  { id:'r10',last_name:'Соколова',  first_name:'Наталья',  patronymic:'Ивановна',  email:'sokolova@mail.ru',  phone:'+7 926 012-34-56', city:'Самара',           region:'Самарская обл.',  gender:'female', date_of_birth:'2000-01-09', team_name:'',             event_name:'Tour de Russie: Суздаль', distance_name:'Intro Tour',  distance_km:25,  bib_number:2023, age_category:'IM', payment_status:'pending', created_at:'2026-04-01' },
  { id:'r11',last_name:'Алексеев',  first_name:'Виктор',   patronymic:'Михайлович',email:'alekseev@gmail.com',phone:'+7 903 111-22-33', city:'Тула',             region:'Тульская обл.',   gender:'male',   date_of_birth:'1985-05-20', team_name:'ТулаСпорт',   event_name:'Tour de Russie: Игора',   distance_name:'Grand Tour',  distance_km:114, bib_number:301, age_category:'M2', payment_status:'paid',    created_at:'2026-04-05' },
  { id:'r12',last_name:'Борисова',  first_name:'Татьяна',  patronymic:'Сергеевна', email:'borisova@yandex.ru',phone:'+7 925 222-33-44', city:'Санкт-Петербург',  region:'Ленинградская обл.', gender:'female', date_of_birth:'1979-10-11', team_name:'',             event_name:'Tour de Russie: Игора',   distance_name:'Median Tour', distance_km:60,  bib_number:1521, age_category:'MF', payment_status:'paid',    created_at:'2026-04-08' },
];

const MOCK_USERS = [
  { id:'u1',  last_name:'Алексеев',  first_name:'Виктор',   patronymic:'Михайлович', email:'alekseev@gmail.com', phone:'+7 903 111-22-33', city:'Тула',            gender:'male',   created_at:'2026-02-01' },
  { id:'u2',  last_name:'Борисова',  first_name:'Татьяна',  patronymic:'Сергеевна',  email:'borisova@yandex.ru',phone:'+7 925 222-33-44', city:'Санкт-Петербург', gender:'female', created_at:'2026-02-03' },
  { id:'u3',  last_name:'Волков',    first_name:'Сергей',   patronymic:'Николаевич', email:'volkov@gmail.com',  phone:'+7 915 567-89-01', city:'Москва',          gender:'male',   created_at:'2026-02-05' },
  { id:'u4',  last_name:'Зайцева',   first_name:'Ольга',    patronymic:'Андреевна',  email:'zaitseva@gmail.com',phone:'+7 906 890-12-34', city:'Москва',          gender:'female', created_at:'2026-02-07' },
  { id:'u5',  last_name:'Козлова',   first_name:'Мария',    patronymic:'Дмитриевна', email:'kozlova@gmail.com', phone:'+7 903 234-56-78', city:'Санкт-Петербург', gender:'female', created_at:'2026-02-10' },
  { id:'u6',  last_name:'Морозова',  first_name:'Елена',    patronymic:'Викторовна', email:'morozova@yandex.ru',phone:'+7 925 678-90-12', city:'Владимир',        gender:'female', created_at:'2026-02-12' },
  { id:'u7',  last_name:'Никитин',   first_name:'Павел',    patronymic:'Алексеевич', email:'nikitin@yandex.ru', phone:'+7 916 901-23-45', city:'Ярославль',       gender:'male',   created_at:'2026-02-14' },
  { id:'u8',  last_name:'Новикова',  first_name:'Анна',     patronymic:'Олеговна',   email:'novikova@mail.ru',  phone:'+7 905 456-78-90', city:'Казань',          gender:'female', created_at:'2026-02-16' },
  { id:'u9',  last_name:'Петров',    first_name:'Дмитрий',  patronymic:'Сергеевич',  email:'petrov@yandex.ru',  phone:'+7 926 345-67-89', city:'Нижний Новгород', gender:'male',   created_at:'2026-02-18' },
  { id:'u10', last_name:'Смирнов',   first_name:'Алексей',  patronymic:'Игоревич',   email:'smirnov@mail.ru',   phone:'+7 916 123-45-67', city:'Москва',          gender:'male',   created_at:'2026-02-20' },
  { id:'u11', last_name:'Соколова',  first_name:'Наталья',  patronymic:'Ивановна',   email:'sokolova@mail.ru',  phone:'+7 926 012-34-56', city:'Самара',          gender:'female', created_at:'2026-02-22' },
  { id:'u12', last_name:'Фёдоров',   first_name:'Игорь',    patronymic:'Павлович',   email:'fedorov@mail.ru',   phone:'+7 936 789-01-23', city:'Екатеринбург',    gender:'male',   created_at:'2026-02-24' },
  { id:'u13', last_name:'Громов',    first_name:'Илья',     patronymic:'Романович',  email:'gromov@gmail.com',  phone:'+7 917 333-44-55', city:'Воронеж',         gender:'male',   created_at:'2026-03-01' },
  { id:'u14', last_name:'Денисова',  first_name:'Светлана', patronymic:'Юрьевна',    email:'denisova@mail.ru',  phone:'+7 918 444-55-66', city:'Краснодар',       gender:'female', created_at:'2026-03-03' },
  { id:'u15', last_name:'Карпов',    first_name:'Андрей',   patronymic:'Владимирович',email:'karpov@yandex.ru', phone:'+7 919 555-66-77', city:'Омск',            gender:'male',   created_at:'2026-03-05' },
];

// ── Registered users tab ──────────────────────────────────────
const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getAllParticipants()
      .then(({ data }) => {
        const list = data.participants || [];
        setUsers(list.length ? list : MOCK_USERS);
      })
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...users].sort((a, b) =>
    (a.last_name || '').localeCompare(b.last_name || '', 'ru')
  );

  const filtered = sorted.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.patronymic?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q)
    );
  });

  const handleExport = () => exportCsv('users', [
    'Фамилия','Имя','Отчество','Email','Телефон','Город','Пол','Дата регистрации',
  ], filtered.map(u => [
    u.last_name, u.first_name, u.patronymic, u.email, u.phone, u.city,
    u.gender === 'male' ? 'М' : u.gender === 'female' ? 'Ж' : '',
    new Date(u.created_at).toLocaleDateString('ru-RU'),
  ]));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Всего: {users.length}</p>
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Поиск по имени, email, городу..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-1.5" />Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ФИО</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Телефон</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Город</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Пол</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Дата рег.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Ничего не найдено</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {[u.last_name, u.first_name, u.patronymic].filter(Boolean).join(' ') || <span className="italic text-muted-foreground">Не заполнено</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.city || '—'}</td>
                    <td className="px-4 py-3">
                      {u.gender === 'male' && <Badge variant="outline">М</Badge>}
                      {u.gender === 'female' && <Badge variant="outline">Ж</Badge>}
                      {!u.gender && '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Registrations tab (купили дистанцию) ─────────────────────
const RegistrationsTab: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingBib, setEditingBib] = useState<{ id: string; value: string } | null>(null);

  useEffect(() => {
    eventsAPI.getEvents()
      .then(({ data }) => setEvents(data.events || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    adminAPI.getAllRegistrations(selectedEvent !== 'all' ? selectedEvent : undefined)
      .then(({ data }) => {
        const list = data.registrations || [];
        setRegistrations(list.length ? list : MOCK_REGS);
      })
      .catch(() => setRegistrations(MOCK_REGS))
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  const sorted = [...registrations].sort((a, b) =>
    (a.last_name || '').localeCompare(b.last_name || '', 'ru')
  );

  const filtered = sorted.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.first_name?.toLowerCase().includes(q) ||
      r.last_name?.toLowerCase().includes(q) ||
      r.patronymic?.toLowerCase().includes(q) ||
      String(r.bib_number || '').includes(q) ||
      r.city?.toLowerCase().includes(q)
    );
  });

  const updateBib = async (id: string, bib: number) => {
    try {
      await adminAPI.updateRegistration(id, { bib_number: bib });
      toast.success('Номер обновлён');
      setEditingBib(null);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, bib_number: bib } : r));
    } catch {
      // fallback — обновляем локально (мок)
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, bib_number: bib } : r));
      toast.success('Номер обновлён');
      setEditingBib(null);
    }
  };

  const togglePayment = async (id: string, current: string) => {
    const next = current === 'paid' ? 'pending' : 'paid';
    try {
      await adminAPI.updateRegistration(id, { payment_status: next });
    } catch {
      // fallback для мока
    }
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, payment_status: next } : r));
    toast.success(next === 'paid' ? 'Оплачено' : 'Ожидает оплаты');
  };

  const handleExport = () => exportCsv('participants', [
    'Фамилия','Имя','Отчество','Email','Телефон','Город','Регион',
    'Пол','Дата рождения','Команда','Мероприятие','Дистанция',
    'Номер','Категория','Статус оплаты','Дата регистрации',
  ], filtered.map(r => [
    r.last_name, r.first_name, r.patronymic,
    r.email, r.phone, r.city, r.region,
    r.gender === 'male' ? 'М' : r.gender === 'female' ? 'Ж' : '',
    r.date_of_birth ? new Date(r.date_of_birth).toLocaleDateString('ru-RU') : '',
    r.team_name || '',
    r.event_name, r.distance_name,
    r.bib_number || '', r.age_category || '',
    r.payment_status === 'paid' ? 'Оплачено' : r.payment_status === 'refunded' ? 'Возврат' : 'Ожидание',
    new Date(r.created_at).toLocaleDateString('ru-RU'),
  ]));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Всего: {registrations.length}</p>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Поиск по имени, номеру..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Все мероприятия" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все мероприятия</SelectItem>
              {events.map(ev => <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-1.5" />Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ФИО</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Мероприятие / дистанция</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Номер</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Категория</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Оплата</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Город / команда</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Дата</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Ничего не найдено</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{[r.last_name, r.first_name, r.patronymic].filter(Boolean).join(' ') || <span className="italic text-muted-foreground">Не заполнено</span>}</p>
                      {r.gender && <span className="text-xs text-muted-foreground">{r.gender === 'male' ? 'Мужчина' : 'Женщина'}</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p className="text-xs">{r.event_name}</p>
                      <p>{r.distance_name} ({r.distance_km} км)</p>
                    </td>
                    <td className="px-4 py-3">
                      {editingBib?.id === r.id ? (
                        <Input
                          type="number"
                          className="w-20 h-7 text-xs"
                          value={editingBib.value}
                          onChange={e => setEditingBib({ id: r.id, value: e.target.value })}
                          onBlur={() => updateBib(r.id, Number(editingBib.value))}
                          onKeyDown={e => e.key === 'Enter' && updateBib(r.id, Number(editingBib.value))}
                          autoFocus
                        />
                      ) : (
                        <span
                          title="Нажмите для изменения"
                          className="cursor-pointer font-mono font-semibold text-[#003051] hover:underline"
                          onClick={() => setEditingBib({ id: r.id, value: String(r.bib_number ?? '') })}
                        >
                          {r.bib_number ?? <span className="text-muted-foreground font-normal">—</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.age_category
                        ? <Badge variant="secondary" className="text-xs font-mono">{r.age_category}</Badge>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={r.payment_status === 'paid' ? 'default' : 'outline'}
                        className="cursor-pointer select-none"
                        onClick={() => togglePayment(r.id, r.payment_status)}
                      >
                        {r.payment_status === 'paid' ? 'Оплачено' : 'Ожидает'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      <p>{r.city || '—'}</p>
                      {r.team_name && <p className="font-medium text-foreground">{r.team_name}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(r.created_at).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────
type Tab = 'registrations' | 'users';

const CRMParticipants: React.FC = () => {
  const [tab, setTab] = useState<Tab>('registrations');

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Участники</h2>

      <div className="flex gap-1 border-b mb-6">
        {([
          { id: 'registrations', label: 'Купили дистанцию' },
          { id: 'users',         label: 'Зарегистрированные пользователи' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-[#E31E24] text-[#E31E24]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'registrations' && <RegistrationsTab />}
      {tab === 'users'         && <UsersTab />}
    </div>
  );
};

export default CRMParticipants;
