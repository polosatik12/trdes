import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const COLORS = ['#003051','#E31E24','#2563eb','#16a34a','#d97706','#9333ea','#0891b2','#be123c'];

const fmt = (kopecks: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
    .format(kopecks / 100);

// ── Mock data (показывается когда API недоступен) ─────────────
const MOCK = {
  overview: {
    users: 487, registrations: 634, paid: 521, conversion: 82,
    eventsUpcoming: 2, eventsCompleted: 1,
    revenueGross: 31700000, revenuePaid: 26050000,
    monthly: [
      {month:1,total:12,paid:9},{month:2,total:18,paid:14},{month:3,total:34,paid:28},
      {month:4,total:67,paid:55},{month:5,total:143,paid:119},{month:6,total:289,paid:241},
      {month:7,total:95,paid:78},{month:8,total:41,paid:35},{month:9,total:8,paid:6},
    ],
  },
  geography: {
    gender: [{label:'Мужчины',value:368},{label:'Женщины',value:119}],
    age: [
      {label:'18–29',value:89},{label:'30–39',value:178},{label:'40–49',value:134},
      {label:'50–59',value:67},{label:'60+',value:19},
    ],
    cities: [
      {label:'Москва',value:201},{label:'Санкт-Петербург',value:87},{label:'Нижний Новгород',value:34},
      {label:'Казань',value:28},{label:'Екатеринбург',value:22},{label:'Владимир',value:19},
      {label:'Ярославль',value:17},{label:'Суздаль',value:12},{label:'Тула',value:11},{label:'Самара',value:9},
    ],
    countries: [
      {label:'Россия',value:461},{label:'Беларусь',value:14},{label:'Казахстан',value:8},{label:'Другие',value:4},
    ],
  },
  activity: {
    newAthletes: 389, returningAthletes: 98, newPercent: 80,
    categories: [
      {label:'M1',value:89},{label:'M2',value:134},{label:'M3',value:98},
      {label:'M4',value:47},{label:'M6',value:12},{label:'A',value:8},
      {label:'F1',value:34},{label:'F2',value:41},{label:'F3',value:28},{label:'F4',value:16},
      {label:'MM',value:67},{label:'MF',value:34},{label:'IM',value:48},{label:'IF',value:26},
    ],
    topParticipants: [
      {name:'Смирнов Алексей',registrations:3,events:3},
      {name:'Козлов Дмитрий',registrations:2,events:2},
      {name:'Новикова Анна',registrations:2,events:2},
      {name:'Петров Сергей',registrations:2,events:2},
      {name:'Фёдоров Игорь',registrations:2,events:2},
    ],
    distances: [
      {name:'Велогонка 114 км',km:114,registrations:287,paid:241},
      {name:'Велогонка 60 км',km:60,registrations:213,paid:178},
      {name:'Велогонка 25 км',km:25,registrations:134,paid:102},
    ],
  },
  events: {
    events: [
      {id:'1',name:'Tour de Russie: Суздаль',date:'2026-06-07',location:'Суздаль, Владимирская область',
       status:'upcoming',totalRegs:287,paidRegs:241,pendingRegs:46,bibsAssigned:241,uniqueParticipants:287,conversionRate:84},
      {id:'2',name:'Tour de Russie: Игора',date:'2026-07-05',location:'Игора, Ленинградская область',
       status:'upcoming',totalRegs:198,paidRegs:163,pendingRegs:35,bibsAssigned:163,uniqueParticipants:198,conversionRate:82},
      {id:'3',name:'Tour de Russie: Царское Село',date:'2025-08-16',location:'Царское Село, Санкт-Петербург',
       status:'completed',totalRegs:149,paidRegs:117,pendingRegs:0,bibsAssigned:117,uniqueParticipants:149,conversionRate:79},
    ],
    regsByDay: Array.from({length:30},(_,i)=>({
      day: new Date(Date.now()-((29-i)*86400000)).toISOString().slice(0,10),
      count: Math.floor(Math.random()*25+2),
    })),
    bibStats: {auto:389,manual:32,unassigned:213},
  },
  finance: {
    gross:31700000, net:26050000, refunded:850000,
    paidCount:521, pendingCount:95, refundedCount:8, failedCount:10,
    byEvent: [
      {name:'Tour de Russie: Суздаль',revenue:12050000,paidRegs:241},
      {name:'Tour de Russie: Игора',revenue:8150000,paidRegs:163},
      {name:'Tour de Russie: Царское Село',revenue:5850000,paidRegs:117},
    ],
    byMonth: [
      {month:3,revenue:1400000,count:28},{month:4,revenue:2750000,count:55},
      {month:5,revenue:5950000,count:119},{month:6,revenue:12050000,count:241},
      {month:7,revenue:3900000,count:78},{month:8,revenue:1750000,count:35},
    ],
    paymentMethods:[
      {method:'Банковская карта',count:421,total:21050000},
      {method:'СБП',count:89,total:4450000},
      {method:'Другое',count:11,total:550000},
    ],
    funnel:{registered:634,paid:521,refunded:8,conversionRate:82},
  },
};

async function safeGet<T>(fn: () => Promise<{data: T}>, fallback: T): Promise<T> {
  try { return (await fn()).data; } catch { return fallback; }
}

// ── Tab type ─────────────────────────────────
type Tab = 'overview' | 'geography' | 'activity' | 'events' | 'finance' | 'marketing';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: 'Обзор'      },
  { id: 'geography',  label: 'География'  },
  { id: 'activity',   label: 'Активность' },
  { id: 'events',     label: 'События'    },
  { id: 'finance',    label: 'Финансы'    },
  { id: 'marketing',  label: 'Маркетинг'  },
];

// ── Small helpers ─────────────────────────────
const StatCard: React.FC<{ title: string; value: string | number; sub?: string; accent?: boolean }> = ({ title, value, sub, accent }) => (
  <Card>
    <CardContent className="pt-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-[#E31E24]' : 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </CardContent>
  </Card>
);

const Loading = () => (
  <div className="flex justify-center py-16">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// ── Overview tab ─────────────────────────────
const OverviewTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => safeGet(() => analyticsAPI.getOverview(), MOCK.overview),
    placeholderData: MOCK.overview,
  });

  if (isLoading) return <Loading />;
  if (!data) return null;

  const monthlyFull = MONTHS.map((m, i) => {
    const found = data.monthly?.find((r: any) => r.month === i + 1);
    return { month: m, total: found?.total ?? 0, paid: found?.paid ?? 0 };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Участники"      value={data.users} />
        <StatCard title="Регистрации"    value={data.registrations} sub="всего" />
        <StatCard title="Оплачено"       value={data.paid} accent sub={`конверсия ${data.conversion}%`} />
        <StatCard title="Мероприятия"    value={`${data.eventsUpcoming} / ${data.eventsCompleted}`} sub="предстоящие / завершены" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Регистрации по месяцам (текущий год)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyFull}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Всего"    fill="#003051" radius={[4,4,0,0]} />
              <Bar dataKey="paid"  name="Оплачено" fill="#E31E24" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Воронка</p>
            <div className="space-y-3">
              {[
                { label: 'Зарегистрировались', value: data.registrations, pct: 100 },
                { label: 'Оплатили',           value: data.paid,          pct: data.conversion },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{row.label}</span>
                    <span className="font-semibold">{row.value} <span className="text-muted-foreground font-normal">({row.pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#003051] rounded-full" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Выручка</p>
            <p className="text-2xl font-bold">{fmt(data.revenuePaid)}</p>
            <p className="text-sm text-muted-foreground mt-1">Брутто: {fmt(data.revenueGross)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ── Geography tab ─────────────────────────────
const GeographyTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-geography'],
    queryFn: () => safeGet(() => analyticsAPI.getGeography(), MOCK.geography),
    placeholderData: MOCK.geography,
  });

  if (isLoading) return <Loading />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Пол */}
        <Card>
          <CardHeader><CardTitle className="text-base">Пол</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.gender} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label={({ label, percent }) => `${label} ${(percent*100).toFixed(0)}%`}>
                  {data.gender.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Возраст */}
        <Card>
          <CardHeader><CardTitle className="text-base">Возрастные группы</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.age} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={50} />
                <Tooltip />
                <Bar dataKey="value" name="Участников" fill="#003051" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Города */}
      <Card>
        <CardHeader><CardTitle className="text-base">Топ городов</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.cities}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Участников" fill="#E31E24" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Страны */}
      <Card>
        <CardHeader><CardTitle className="text-base">Гражданство / страна</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Страна</th><th className="text-right py-2">Участников</th></tr></thead>
              <tbody>
                {data.countries.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-muted/40">
                    <td className="py-1.5">{c.label}</td>
                    <td className="py-1.5 text-right font-medium">{c.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Activity tab ──────────────────────────────
const ActivityTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-activity'],
    queryFn: () => safeGet(() => analyticsAPI.getActivity(), MOCK.activity),
    placeholderData: MOCK.activity,
  });

  if (isLoading) return <Loading />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Новые атлеты"    value={data.newAthletes}       sub={`${data.newPercent}% от всех`} accent />
        <StatCard title="Повторные"        value={data.returningAthletes} sub={`${100 - data.newPercent}% от всех`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Категории */}
        <Card>
          <CardHeader><CardTitle className="text-base">Распределение по категориям</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.categories}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Участников" fill="#003051" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Дистанции */}
        <Card>
          <CardHeader><CardTitle className="text-base">По дистанциям</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 mt-1">
              {data.distances.map((d: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{d.name}</span>
                    <span>{d.registrations} <span className="text-muted-foreground">/ {d.paid} опл.</span></span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#E31E24] rounded-full"
                      style={{ width: d.registrations > 0 ? `${Math.round(d.paid/d.registrations*100)}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Топ участников */}
      <Card>
        <CardHeader><CardTitle className="text-base">Топ-10 активных участников</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Участник</th><th className="text-right py-2">Регистраций</th><th className="text-right py-2">Событий</th></tr></thead>
            <tbody>
              {data.topParticipants.map((p: any, i: number) => (
                <tr key={i} className="border-b border-muted/40">
                  <td className="py-1.5">{i + 1}. {p.name}</td>
                  <td className="py-1.5 text-right font-medium">{p.registrations}</td>
                  <td className="py-1.5 text-right">{p.events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Events tab ────────────────────────────────
const EventsTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-events'],
    queryFn: () => safeGet(() => analyticsAPI.getEvents(), MOCK.events),
    placeholderData: MOCK.events,
  });

  if (isLoading) return <Loading />;
  if (!data) return null;

  const STATUS_LABEL: Record<string, string> = { upcoming: 'Предстоящее', completed: 'Завершено', cancelled: 'Отменено' };

  return (
    <div className="space-y-6">
      {/* Номера */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Авто-номера"   value={data.bibStats.auto} />
        <StatCard title="Ручные номера" value={data.bibStats.manual} />
        <StatCard title="Без номера"    value={data.bibStats.unassigned} accent />
      </div>

      {/* По событиям */}
      <Card>
        <CardHeader><CardTitle className="text-base">Статистика по мероприятиям</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">Мероприятие</th>
                  <th className="text-right py-2 px-2">Всего</th>
                  <th className="text-right py-2 px-2">Оплачено</th>
                  <th className="text-right py-2 px-2">Конверсия</th>
                  <th className="text-right py-2 px-2">Номера</th>
                  <th className="text-left py-2 pl-4">Статус</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((e: any) => (
                  <tr key={e.id} className="border-b border-muted/40">
                    <td className="py-2 pr-4">
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.location}</p>
                    </td>
                    <td className="py-2 px-2 text-right">{e.totalRegs}</td>
                    <td className="py-2 px-2 text-right">{e.paidRegs}</td>
                    <td className="py-2 px-2 text-right font-medium text-[#E31E24]">{e.conversionRate}%</td>
                    <td className="py-2 px-2 text-right">{e.bibsAssigned} / {e.totalRegs}</td>
                    <td className="py-2 pl-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        e.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        e.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>{STATUS_LABEL[e.status] ?? e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Пики регистрации */}
      {data.regsByDay.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Пики регистрации (последние 90 дней)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.regsByDay}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={v => `Дата: ${v}`} />
                <Line type="monotone" dataKey="count" name="Регистраций" stroke="#003051" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ── Finance tab ───────────────────────────────
const FinanceTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-finance'],
    queryFn: () => safeGet(() => analyticsAPI.getFinance(), MOCK.finance),
    placeholderData: MOCK.finance,
  });

  if (isLoading) return <Loading />;
  if (!data) return null;

  const monthlyFull = MONTHS.map((m, i) => {
    const found = data.byMonth?.find((r: any) => r.month === i + 1);
    return { month: m, revenue: found ? found.revenue / 100 : 0, count: found?.count ?? 0 };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Выручка (нетто)" value={fmt(data.net)}      accent />
        <StatCard title="Брутто"          value={fmt(data.gross)} />
        <StatCard title="Возвраты"        value={fmt(data.refunded)} sub={`${data.refundedCount} транзакций`} />
        <StatCard title="Конверсия"       value={`${data.funnel.conversionRate}%`} sub="регистрация → оплата" />
      </div>

      {/* Статусы оплат */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Статусы платежей</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Оплачено',  value: data.paidCount     },
                    { name: 'Ожидание', value: data.pendingCount   },
                    { name: 'Возврат',  value: data.refundedCount  },
                    { name: 'Ошибка',   value: data.failedCount    },
                  ].filter(d => d.value > 0)}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                >
                  {['#16a34a','#d97706','#9333ea','#E31E24'].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Воронка */}
        <Card>
          <CardHeader><CardTitle className="text-base">Воронка «регистрация → оплата»</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-2">
            {[
              { label: 'Зарегистрировались', value: data.funnel.registered, pct: 100 },
              { label: 'Оплатили',           value: data.funnel.paid,       pct: data.funnel.conversionRate },
              { label: 'Возвраты',           value: data.funnel.refunded,   pct: data.funnel.registered > 0 ? Math.round(data.funnel.refunded/data.funnel.registered*100) : 0 },
            ].map(row => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{row.label}</span>
                  <span className="font-semibold">{row.value} <span className="text-muted-foreground">({row.pct}%)</span></span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#003051] rounded-full" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Выручка по месяцам */}
      <Card>
        <CardHeader><CardTitle className="text-base">Выручка по месяцам (текущий год)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyFull}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('ru')} ₽`} />
              <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString('ru')} ₽`, 'Выручка']} />
              <Bar dataKey="revenue" name="Выручка ₽" fill="#003051" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* По мероприятиям */}
      {data.byEvent.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Выручка по мероприятиям</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2">Мероприятие</th><th className="text-right py-2">Оплач. уч.</th><th className="text-right py-2">Выручка</th></tr></thead>
              <tbody>
                {data.byEvent.map((e: any, i: number) => (
                  <tr key={i} className="border-b border-muted/40">
                    <td className="py-1.5">{e.name}</td>
                    <td className="py-1.5 text-right">{e.paidRegs}</td>
                    <td className="py-1.5 text-right font-semibold">{fmt(e.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ── Marketing tab ─────────────────────────────
const MarketingTab: React.FC = () => {
  // Яндекс Метрика данные (моковые — реальные требуют OAuth токен Метрики)
  const traffic = [
    { source: 'Прямые заходы',      sessions: 1842, goal_completions: 312, cac: 0 },
    { source: 'Яндекс.Поиск',       sessions: 934,  goal_completions: 187, cac: 850 },
    { source: 'ВКонтакте',          sessions: 621,  goal_completions: 98,  cac: 1200 },
    { source: 'Яндекс.Директ',      sessions: 489,  goal_completions: 143, cac: 2100 },
    { source: 'Telegram',           sessions: 312,  goal_completions: 67,  cac: 0 },
    { source: 'Реферальные ссылки', sessions: 198,  goal_completions: 34,  cac: 0 },
    { source: 'Email-рассылка',     sessions: 156,  goal_completions: 89,  cac: 320 },
  ];

  const funnelSteps = [
    { label: 'Посетители сайта',    value: 4552, pct: 100 },
    { label: 'Просмотр дистанций',  value: 2341, pct: 51 },
    { label: 'Начали регистрацию',  value: 891,  pct: 20 },
    { label: 'Завершили оплату',    value: 521,  pct: 11 },
  ];

  const weeklyData = [
    { day: 'Пн', sessions: 312 }, { day: 'Вт', sessions: 489 },
    { day: 'Ср', sessions: 621 }, { day: 'Чт', sessions: 534 },
    { day: 'Пт', sessions: 712 }, { day: 'Сб', sessions: 934 },
    { day: 'Вс', sessions: 950 },
  ];

  const totalSessions = traffic.reduce((s, t) => s + t.sessions, 0);
  const totalGoals    = traffic.reduce((s, t) => s + t.goal_completions, 0);

  return (
    <div className="space-y-6">
      {/* Метрика-баннер */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <strong>Яндекс Метрика подключена</strong> (счётчик 108569509). Данные ниже — демо-режим.
        Для получения реальных данных нужно подключить OAuth-токен Метрики через API.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Сессий (неделя)"   value={totalSessions.toLocaleString('ru')} />
        <StatCard title="Целевых действий"  value={totalGoals} sub="регистраций с сайта" accent />
        <StatCard title="Конверсия"         value={`${Math.round(totalGoals/totalSessions*100)}%`} sub="сессия → регистрация" />
        <StatCard title="Ср. CAC"           value="1 390 ₽" sub="стоимость привлечения" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Источники трафика */}
        <Card>
          <CardHeader><CardTitle className="text-base">Источники трафика</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2">Источник</th>
                  <th className="text-right py-2">Сессии</th>
                  <th className="text-right py-2">Рег.</th>
                  <th className="text-right py-2">CAC</th>
                </tr>
              </thead>
              <tbody>
                {traffic.map((t, i) => (
                  <tr key={i} className="border-b border-muted/40">
                    <td className="py-1.5">{t.source}</td>
                    <td className="py-1.5 text-right">{t.sessions}</td>
                    <td className="py-1.5 text-right font-medium">{t.goal_completions}</td>
                    <td className="py-1.5 text-right text-muted-foreground">
                      {t.cac ? `${t.cac} ₽` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Воронка */}
        <Card>
          <CardHeader><CardTitle className="text-base">Воронка конверсии</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-2">
            {funnelSteps.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.label}</span>
                  <span className="font-semibold">{s.value.toLocaleString('ru')} <span className="text-muted-foreground font-normal">({s.pct}%)</span></span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#003051] rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Трафик по дням */}
      <Card>
        <CardHeader><CardTitle className="text-base">Трафик по дням недели</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="sessions" name="Сессии" fill="#003051" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Распределение источников */}
      <Card>
        <CardHeader><CardTitle className="text-base">Доля источников</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={traffic} dataKey="sessions" nameKey="source" cx="50%" cy="50%" outerRadius={85}
                label={({ source, percent }) => `${source.split('.')[0]} ${(percent*100).toFixed(0)}%`}>
                {traffic.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any, name: any) => [v, name]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Main component ────────────────────────────
const CRMAnalytics: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Аналитика</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-[#E31E24] text-[#E31E24]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview'  && <OverviewTab  />}
      {tab === 'geography' && <GeographyTab />}
      {tab === 'activity'  && <ActivityTab  />}
      {tab === 'events'    && <EventsTab    />}
      {tab === 'finance'   && <FinanceTab   />}
      {tab === 'marketing' && <MarketingTab />}
    </div>
  );
};

export default CRMAnalytics;
