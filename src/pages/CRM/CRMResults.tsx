import React, { useEffect, useState } from 'react';
import { adminAPI, eventsAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface EventWithCounts {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  registrations_count: number;
  results_count: number;
}

const CRMResults: React.FC = () => {
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: eventsData } = await eventsAPI.getEvents();
        const events = eventsData.events || [];

        const enriched: EventWithCounts[] = [];
        for (const ev of events) {
          const [regsRes, resultsRes] = await Promise.all([
            adminAPI.getAllRegistrations(ev.id),
            eventsAPI.getEventResults(ev.id),
          ]);
          enriched.push({
            ...ev,
            registrations_count: regsRes.data.registrations?.length || 0,
            results_count: resultsRes.data.results?.length || 0,
          });
        }
        setEvents(enriched);
      } catch (error) {
        console.error('Error loading events:', error);
      }
      setLoading(false);
    };
    load();
  }, []);

  const loadResults = async (eventId: string) => {
    setSelectedEvent(eventId);
    setLoadingResults(true);
    try {
      const { data } = await eventsAPI.getEventResults(eventId);
      setResults(data.results || []);
    } catch (error) {
      console.error('Error loading results:', error);
    }
    setLoadingResults(false);
  };

  const statusLabels: Record<string, string> = {
    upcoming: 'Предстоящее',
    ongoing: 'Идёт',
    completed: 'Завершено',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Результаты</h2>
        <p className="text-sm text-muted-foreground mt-1">Мероприятия и их результаты</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Нет мероприятий</div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <button
                onClick={() => loadResults(ev.id)}
                className="w-full text-left p-5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{ev.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ev.location} · {new Date(ev.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{ev.registrations_count} рег.</Badge>
                    <Badge variant="secondary">{ev.results_count} рез.</Badge>
                    <Badge variant={ev.status === 'completed' ? 'default' : 'outline'}>
                      {statusLabels[ev.status] || ev.status}
                    </Badge>
                  </div>
                </div>
              </button>

              {selectedEvent === ev.id && (
                <div className="border-t p-5">
                  {loadingResults ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                  ) : results.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Результаты пока не опубликованы</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Место</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Дистанция</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Категория</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Место в кат.</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Время</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r) => (
                          <tr key={r.id} className="border-b last:border-0">
                            <td className="px-4 py-2 font-medium">{r.place || '—'}</td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {r.event_distances?.name} ({r.event_distances?.distance_km} км)
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">{r.category || '—'}</td>
                            <td className="px-4 py-2 text-muted-foreground">{r.category_place || '—'}</td>
                            <td className="px-4 py-2 text-muted-foreground">{String(r.finish_time) || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CRMResults;
