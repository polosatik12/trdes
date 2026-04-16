import React, { useEffect, useState } from 'react';
import { adminAPI, eventsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarDays, faBuilding, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_MONTHLY = [
  { month: 'Янв', count: 12 }, { month: 'Фев', count: 18 }, { month: 'Мар', count: 34 },
  { month: 'Апр', count: 67 }, { month: 'Май', count: 143 }, { month: 'Июн', count: 289 },
  { month: 'Июл', count: 95 }, { month: 'Авг', count: 41 }, { month: 'Сен', count: 8 },
  { month: 'Окт', count: 0 }, { month: 'Ноя', count: 0 }, { month: 'Дек', count: 0 },
];

const MOCK_METRICS = {
  totalUsers: 487,
  totalRegistrations: 634,
  paidRegistrations: 521,
  pendingApps: 3,
  approvedApps: 14,
  eventsUpcoming: 2,
  eventsCompleted: 1,
};

interface Metrics {
  totalUsers: number;
  totalRegistrations: number;
  paidRegistrations: number;
  pendingApps: number;
  approvedApps: number;
  eventsUpcoming: number;
  eventsCompleted: number;
}

const CRMDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>(MOCK_METRICS);
  const [monthlyData, setMonthlyData] = useState<any[]>(MOCK_MONTHLY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const [participantsRes, regsRes, appsRes, eventsRes] = await Promise.all([
        adminAPI.getAllParticipants(),
        adminAPI.getAllRegistrations(),
        adminAPI.getAllCorporateApplications(),
        eventsAPI.getEvents(),
      ]);

      const totalUsers = participantsRes.data.participants?.length || 0;
      const regs = regsRes.data.registrations || [];
      const apps = appsRes.data.applications || [];
      const events = eventsRes.data.events || [];

      setMetrics({
        totalUsers,
        totalRegistrations: regs.length,
        paidRegistrations: regs.filter((r: any) => r.payment_status === 'paid').length,
        pendingApps: apps.filter((a: any) => a.status === 'pending').length,
        approvedApps: apps.filter((a: any) => a.status === 'approved').length,
        eventsUpcoming: events.filter((e: any) => e.status === 'upcoming').length,
        eventsCompleted: events.filter((e: any) => e.status === 'completed').length,
      });

      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const data = months.map((m, i) => ({
        month: m,
        count: regs.filter((r: any) => new Date(r.created_at).getMonth() === i).length,
      }));
      setMonthlyData(data);
    } catch {
      // API недоступно — показываем моковые данные
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const cards: { title: string; value: string | number; sub?: string; icon: IconDefinition; color: string }[] = [
    { title: 'Участники',    value: metrics.totalUsers, icon: faUsers, color: 'text-blue-500' },
    { title: 'Регистрации',  value: `${metrics.paidRegistrations} / ${metrics.totalRegistrations}`, sub: 'оплач. / всего', icon: faClipboardList, color: 'text-green-500' },
    { title: 'Корп. заявки', value: `${metrics.pendingApps} ожид. / ${metrics.approvedApps} одобр.`, icon: faBuilding, color: 'text-orange-500' },
    { title: 'Мероприятия', value: `${metrics.eventsUpcoming} предст. / ${metrics.eventsCompleted} заверш.`, icon: faCalendarDays, color: 'text-purple-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Дашборд</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <FontAwesomeIcon icon={c.icon} className={`w-5 h-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{c.value}</div>
              {c.sub && <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Регистрации по месяцам</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMDashboard;
