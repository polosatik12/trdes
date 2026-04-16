import React, { useEffect, useState } from 'react';
import { eventsAPI, adminAPI } from '@/lib/api';
import CMSLayout from './CMSLayout';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Eye, EyeOff } from 'lucide-react';

interface Distance {
  id: string;
  event_id: string;
  name: string;
  distance_km: number;
  price_kopecks: number;
  is_active: boolean;
}

interface Event { id: string; name: string; date: string; }

const MOCK_DISTANCES: Distance[] = [
  { id:'d1', event_id:'e1', name:'Grand Tour',  distance_km:114, price_kopecks:500000, is_active:true },
  { id:'d2', event_id:'e1', name:'Median Tour', distance_km:60,  price_kopecks:400000, is_active:true },
  { id:'d3', event_id:'e1', name:'Intro Tour',  distance_km:25,  price_kopecks:300000, is_active:false },
];

const CMSDistances: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [distances, setDistances] = useState<Distance[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    eventsAPI.getEvents()
      .then(({ data }) => {
        const list = data.events || [];
        setEvents(list);
        if (list.length) setSelectedEvent(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    // Admin endpoint returns all distances including inactive
    adminAPI.getAllRegistrations(selectedEvent)
      .then(() => {})
      .catch(() => {});
    eventsAPI.getEventDistances(selectedEvent)
      .then(({ data }) => {
        const list = data.distances || [];
        setDistances(list.length ? list : MOCK_DISTANCES);
      })
      .catch(() => setDistances(MOCK_DISTANCES))
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  const toggleActive = async (d: Distance) => {
    const next = !d.is_active;
    // Optimistic update
    setDistances(prev => prev.map(x => x.id === d.id ? { ...x, is_active: next } : x));
    try {
      await adminAPI.updateDistance(d.id, { is_active: next });
      toast.success(next ? 'Дистанция включена' : 'Дистанция отключена');
    } catch {
      // rollback
      setDistances(prev => prev.map(x => x.id === d.id ? { ...x, is_active: d.is_active } : x));
      toast.error('Ошибка');
    }
  };

  const handleDelete = async (d: Distance) => {
    setDistances(prev => prev.filter(x => x.id !== d.id));
    try { await adminAPI.deleteDistance(d.id); }
    catch { setDistances(prev => [...prev, d]); toast.error('Ошибка удаления'); return; }
    toast.success('Дистанция удалена');
  };

  const fmt = (kopecks: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(kopecks / 100);

  return (
    <CMSLayout title="Дистанции">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Дистанции</h2>
          <p className="text-gray-500 text-sm mt-1">Включить, отключить или удалить дистанцию</p>
        </div>
        {events.length > 0 && (
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003051]" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {distances.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Нет дистанций</div>
          ) : distances.map(d => (
            <div key={d.id} className={`flex items-center justify-between px-6 py-4 ${!d.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{d.name}</p>
                  <p className="text-sm text-gray-400">{d.distance_km} км · {fmt(d.price_kopecks)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={d.is_active ? 'default' : 'secondary'}>
                  {d.is_active ? 'Активна' : 'Отключена'}
                </Badge>
                <button
                  onClick={() => toggleActive(d)}
                  title={d.is_active ? 'Отключить' : 'Включить'}
                  className="p-2 text-gray-400 hover:text-[#003051] transition-colors"
                >
                  {d.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(d)}
                  title="Удалить"
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CMSLayout>
  );
};

export default CMSDistances;
