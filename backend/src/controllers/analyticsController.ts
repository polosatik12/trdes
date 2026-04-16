/**
 * Analytics Controller
 * GET /api/admin/analytics/overview       — сводка
 * GET /api/admin/analytics/geography      — профиль и география
 * GET /api/admin/analytics/activity       — активность и сегментация
 * GET /api/admin/analytics/events         — событийная аналитика
 * GET /api/admin/analytics/finance        — финансовый контроль
 * GET /api/admin/analytics/export         — экспорт CSV
 */

import { Request, Response } from 'express';
import { query } from '../utils/db';

// ─────────────────────────────────────────────
// OVERVIEW — сводные метрики для главного экрана
// ─────────────────────────────────────────────
export const getOverview = async (_req: Request, res: Response) => {
  const [users, regs, paid, events, revenue] = await Promise.all([
    query(`SELECT COUNT(*) AS cnt FROM users`),
    query(`SELECT COUNT(*) AS cnt FROM event_registrations`),
    query(`SELECT COUNT(*) AS cnt FROM event_registrations WHERE payment_status = 'paid'`),
    query(`SELECT
             COUNT(*) FILTER (WHERE status = 'upcoming')  AS upcoming,
             COUNT(*) FILTER (WHERE status = 'completed') AS completed
           FROM events`),
    query(`SELECT COALESCE(SUM(amount_kopecks),0) AS total,
                  COALESCE(SUM(amount_kopecks) FILTER (WHERE status='paid'),0) AS paid
           FROM payments`),
  ]);

  // Регистрации по месяцам текущего года
  const monthly = await query(`
    SELECT
      EXTRACT(MONTH FROM created_at)::int AS month,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid
    FROM event_registrations
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    GROUP BY month
    ORDER BY month
  `);

  res.json({
    users:         Number(users.rows[0].cnt),
    registrations: Number(regs.rows[0].cnt),
    paid:          Number(paid.rows[0].cnt),
    conversion:    regs.rows[0].cnt > 0
                     ? Math.round(Number(paid.rows[0].cnt) / Number(regs.rows[0].cnt) * 100)
                     : 0,
    eventsUpcoming:  Number(events.rows[0].upcoming),
    eventsCompleted: Number(events.rows[0].completed),
    revenueGross:    Number(revenue.rows[0].total),
    revenuePaid:     Number(revenue.rows[0].paid),
    monthly: monthly.rows.map(r => ({
      month: Number(r.month),
      total: Number(r.total),
      paid:  Number(r.paid),
    })),
  });
};

// ─────────────────────────────────────────────
// GEOGRAPHY — профиль участников и география
// ─────────────────────────────────────────────
export const getGeography = async (_req: Request, res: Response) => {
  const [genderDist, ageDist, cityDist, countryDist] = await Promise.all([

    // Пол
    query(`
      SELECT gender, COUNT(*) AS cnt
      FROM profiles
      WHERE gender IS NOT NULL
      GROUP BY gender
    `),

    // Возрастные группы (на 31 декабря текущего года)
    query(`
      SELECT
        CASE
          WHEN age < 18  THEN 'до 18'
          WHEN age < 30  THEN '18–29'
          WHEN age < 40  THEN '30–39'
          WHEN age < 50  THEN '40–49'
          WHEN age < 60  THEN '50–59'
          ELSE '60+'
        END AS age_group,
        COUNT(*) AS cnt
      FROM (
        SELECT
          DATE_PART('year', AGE(
            MAKE_DATE(EXTRACT(YEAR FROM NOW())::int, 12, 31),
            date_of_birth
          )) AS age
        FROM profiles
        WHERE date_of_birth IS NOT NULL
      ) t
      GROUP BY age_group
      ORDER BY age_group
    `),

    // Топ-15 городов
    query(`
      SELECT COALESCE(city, 'Не указан') AS city, COUNT(*) AS cnt
      FROM profiles
      GROUP BY city
      ORDER BY cnt DESC
      LIMIT 15
    `),

    // Гражданство / страна
    query(`
      SELECT COALESCE(country, 'Не указана') AS country, COUNT(*) AS cnt
      FROM profiles
      GROUP BY country
      ORDER BY cnt DESC
      LIMIT 20
    `),
  ]);

  res.json({
    gender:  genderDist.rows.map(r => ({ label: r.gender === 'male' ? 'Мужчины' : 'Женщины', value: Number(r.cnt) })),
    age:     ageDist.rows.map(r => ({ label: r.age_group, value: Number(r.cnt) })),
    cities:  cityDist.rows.map(r => ({ label: r.city, value: Number(r.cnt) })),
    countries: countryDist.rows.map(r => ({ label: r.country, value: Number(r.cnt) })),
  });
};

// ─────────────────────────────────────────────
// ACTIVITY — активность и сегментация
// ─────────────────────────────────────────────
export const getActivity = async (_req: Request, res: Response) => {
  const [categoryDist, newVsReturning, multiParticipants, distanceDist] = await Promise.all([

    // Распределение по категориям
    query(`
      SELECT
        COALESCE(age_category, 'Без категории') AS category,
        COUNT(*) AS cnt
      FROM event_registrations
      GROUP BY age_category
      ORDER BY cnt DESC
    `),

    // Новые vs повторные (участвовали в >1 событии)
    query(`
      SELECT
        COUNT(*) FILTER (WHERE event_count = 1) AS new_athletes,
        COUNT(*) FILTER (WHERE event_count > 1)  AS returning_athletes
      FROM (
        SELECT user_id, COUNT(DISTINCT event_id) AS event_count
        FROM event_registrations
        GROUP BY user_id
      ) t
    `),

    // Топ участников по количеству регистраций
    query(`
      SELECT
        p.first_name, p.last_name,
        COUNT(r.id) AS registrations,
        COUNT(DISTINCT r.event_id) AS events
      FROM event_registrations r
      JOIN profiles p ON r.user_id = p.id
      GROUP BY p.id, p.first_name, p.last_name
      ORDER BY registrations DESC
      LIMIT 10
    `),

    // Распределение по дистанциям
    query(`
      SELECT
        d.name AS distance_name,
        d.distance_km,
        COUNT(r.id) AS registrations,
        COUNT(r.id) FILTER (WHERE r.payment_status = 'paid') AS paid
      FROM event_registrations r
      JOIN event_distances d ON r.distance_id = d.id
      GROUP BY d.id, d.name, d.distance_km
      ORDER BY registrations DESC
    `),
  ]);

  const nr = newVsReturning.rows[0];
  const total = Number(nr.new_athletes) + Number(nr.returning_athletes);

  res.json({
    categories: categoryDist.rows.map(r => ({ label: r.category, value: Number(r.cnt) })),
    newAthletes:       Number(nr.new_athletes),
    returningAthletes: Number(nr.returning_athletes),
    newPercent:        total > 0 ? Math.round(Number(nr.new_athletes) / total * 100) : 0,
    topParticipants: multiParticipants.rows.map(r => ({
      name:          `${r.last_name || ''} ${r.first_name || ''}`.trim() || 'Без имени',
      registrations: Number(r.registrations),
      events:        Number(r.events),
    })),
    distances: distanceDist.rows.map(r => ({
      name:          r.distance_name,
      km:            r.distance_km,
      registrations: Number(r.registrations),
      paid:          Number(r.paid),
    })),
  });
};

// ─────────────────────────────────────────────
// EVENTS — событийная аналитика
// ─────────────────────────────────────────────
export const getEventAnalytics = async (_req: Request, res: Response) => {
  const [eventStats, regsByDay, bibStats] = await Promise.all([

    // Статистика по каждому событию
    query(`
      SELECT
        e.id,
        e.name,
        e.date,
        e.location,
        e.status,
        COUNT(r.id)                                              AS total_regs,
        COUNT(r.id) FILTER (WHERE r.payment_status = 'paid')    AS paid_regs,
        COUNT(r.id) FILTER (WHERE r.payment_status = 'pending') AS pending_regs,
        COUNT(r.id) FILTER (WHERE r.bib_number IS NOT NULL)     AS bibs_assigned,
        COUNT(DISTINCT r.user_id)                               AS unique_participants
      FROM events e
      LEFT JOIN event_registrations r ON r.event_id = e.id
      GROUP BY e.id
      ORDER BY e.date DESC
    `),

    // Пики регистрации (по дням, последние 90 дней)
    query(`
      SELECT
        DATE(created_at) AS day,
        COUNT(*) AS cnt
      FROM event_registrations
      WHERE created_at >= NOW() - INTERVAL '90 days'
      GROUP BY day
      ORDER BY day
    `),

    // Статус номеров
    query(`
      SELECT
        COUNT(*) FILTER (WHERE bib_number IS NOT NULL AND bib_number_manual = false) AS auto_assigned,
        COUNT(*) FILTER (WHERE bib_number IS NOT NULL AND bib_number_manual = true)  AS manual_assigned,
        COUNT(*) FILTER (WHERE bib_number IS NULL)                                    AS unassigned
      FROM event_registrations
    `),
  ]);

  res.json({
    events: eventStats.rows.map(r => ({
      id:                  r.id,
      name:                r.name,
      date:                r.date,
      location:            r.location,
      status:              r.status,
      totalRegs:           Number(r.total_regs),
      paidRegs:            Number(r.paid_regs),
      pendingRegs:         Number(r.pending_regs),
      bibsAssigned:        Number(r.bibs_assigned),
      uniqueParticipants:  Number(r.unique_participants),
      conversionRate:      r.total_regs > 0
                             ? Math.round(Number(r.paid_regs) / Number(r.total_regs) * 100)
                             : 0,
    })),
    regsByDay: regsByDay.rows.map(r => ({
      day:   r.day,
      count: Number(r.cnt),
    })),
    bibStats: {
      auto:      Number(bibStats.rows[0].auto_assigned),
      manual:    Number(bibStats.rows[0].manual_assigned),
      unassigned: Number(bibStats.rows[0].unassigned),
    },
  });
};

// ─────────────────────────────────────────────
// FINANCE — финансовый контроль и конверсия
// ─────────────────────────────────────────────
export const getFinance = async (_req: Request, res: Response) => {
  const [summary, byEvent, byMonth, paymentMethods, funnelData] = await Promise.all([

    // Сводка
    query(`
      SELECT
        COALESCE(SUM(amount_kopecks), 0)                                      AS gross,
        COALESCE(SUM(amount_kopecks) FILTER (WHERE status = 'paid'), 0)       AS net,
        COALESCE(SUM(amount_kopecks) FILTER (WHERE status = 'refunded'), 0)   AS refunded,
        COUNT(*) FILTER (WHERE status = 'paid')     AS paid_count,
        COUNT(*) FILTER (WHERE status = 'pending')  AS pending_count,
        COUNT(*) FILTER (WHERE status = 'refunded') AS refunded_count,
        COUNT(*) FILTER (WHERE status = 'failed')   AS failed_count
      FROM payments
    `),

    // Выручка по событиям
    query(`
      SELECT
        e.name AS event_name,
        COALESCE(SUM(p.amount_kopecks) FILTER (WHERE p.status = 'paid'), 0) AS revenue,
        COUNT(r.id) FILTER (WHERE r.payment_status = 'paid') AS paid_regs
      FROM events e
      LEFT JOIN event_registrations r ON r.event_id = e.id
      LEFT JOIN payments p ON p.user_id = r.user_id AND p.status = 'paid'
      GROUP BY e.id, e.name
      ORDER BY revenue DESC
    `),

    // Выручка по месяцам текущего года
    query(`
      SELECT
        EXTRACT(MONTH FROM paid_at)::int AS month,
        COALESCE(SUM(amount_kopecks), 0) AS revenue,
        COUNT(*) AS count
      FROM payments
      WHERE status = 'paid'
        AND EXTRACT(YEAR FROM paid_at) = EXTRACT(YEAR FROM NOW())
      GROUP BY month
      ORDER BY month
    `),

    // Методы оплаты
    query(`
      SELECT
        COALESCE(robokassa_payment_method, 'Не указан') AS method,
        COUNT(*) AS cnt,
        SUM(amount_kopecks) AS total
      FROM payments
      WHERE status = 'paid'
      GROUP BY method
      ORDER BY cnt DESC
    `),

    // Воронка: зарегистрировались → оплатили
    query(`
      SELECT
        COUNT(*) AS registered,
        COUNT(*) FILTER (WHERE payment_status = 'paid')    AS paid,
        COUNT(*) FILTER (WHERE payment_status = 'refunded') AS refunded
      FROM event_registrations
    `),
  ]);

  const s = summary.rows[0];
  const f = funnelData.rows[0];

  res.json({
    gross:          Number(s.gross),
    net:            Number(s.net),
    refunded:       Number(s.refunded),
    paidCount:      Number(s.paid_count),
    pendingCount:   Number(s.pending_count),
    refundedCount:  Number(s.refunded_count),
    failedCount:    Number(s.failed_count),

    byEvent: byEvent.rows.map(r => ({
      name:    r.event_name,
      revenue: Number(r.revenue),
      paidRegs: Number(r.paid_regs),
    })),

    byMonth: byMonth.rows.map(r => ({
      month:   Number(r.month),
      revenue: Number(r.revenue),
      count:   Number(r.count),
    })),

    paymentMethods: paymentMethods.rows.map(r => ({
      method: r.method,
      count:  Number(r.cnt),
      total:  Number(r.total),
    })),

    funnel: {
      registered: Number(f.registered),
      paid:       Number(f.paid),
      refunded:   Number(f.refunded),
      conversionRate: f.registered > 0
        ? Math.round(Number(f.paid) / Number(f.registered) * 100)
        : 0,
    },
  });
};

// ─────────────────────────────────────────────
// EXPORT CSV — экспорт данных участников
// ─────────────────────────────────────────────
export const exportCSV = async (req: Request, res: Response) => {
  const { event_id } = req.query;

  let queryText = `
    SELECT
      p.last_name,
      p.first_name,
      p.patronymic,
      p.date_of_birth,
      p.gender,
      p.city,
      p.region,
      p.country,
      COALESCE(p.team_name, '') AS team_name,
      u.email,
      p.phone,
      e.name AS event_name,
      e.date AS event_date,
      d.name AS distance_name,
      r.bib_number,
      r.age_category,
      r.payment_status,
      r.created_at AS registered_at
    FROM event_registrations r
    JOIN profiles p ON r.user_id = p.id
    JOIN users u ON r.user_id = u.id
    JOIN events e ON r.event_id = e.id
    JOIN event_distances d ON r.distance_id = d.id
  `;
  const params: any[] = [];

  if (event_id) {
    queryText += ' WHERE r.event_id = $1';
    params.push(event_id);
  }

  queryText += ' ORDER BY r.bib_number ASC NULLS LAST, p.last_name ASC';

  const result = await query(queryText, params);

  const headers = [
    'Фамилия','Имя','Отчество','Дата рождения','Пол','Город','Регион','Страна',
    'Команда','Email','Телефон','Мероприятие','Дата старта','Дистанция',
    'Номер','Категория','Статус оплаты','Дата регистрации',
  ];

  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = result.rows.map(r => [
    r.last_name, r.first_name, r.patronymic,
    r.date_of_birth ? new Date(r.date_of_birth).toLocaleDateString('ru-RU') : '',
    r.gender === 'male' ? 'М' : r.gender === 'female' ? 'Ж' : '',
    r.city, r.region, r.country, r.team_name,
    r.email, r.phone,
    r.event_name,
    r.event_date ? new Date(r.event_date).toLocaleDateString('ru-RU') : '',
    r.distance_name, r.bib_number, r.age_category,
    r.payment_status === 'paid' ? 'Оплачено' : r.payment_status === 'refunded' ? 'Возврат' : 'Ожидание',
    r.registered_at ? new Date(r.registered_at).toLocaleDateString('ru-RU') : '',
  ].map(escape).join(','));

  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="participants.csv"');
  res.send(csv);
};
