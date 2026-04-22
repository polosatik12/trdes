import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI } from '@/lib/api';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';

const CATEGORIES = [
'А 18+', 'М1 18-29', 'М2 30-39', 'М3 40-49', 'М4 50-59', 'М5 60+', 'FA 18+', 'F1 18-29', 'F2 30-39', 'F3 40-54', 'F4 55+'] as
const;

function getDisplayDistanceName(backendName: string): string {
  const mapping: Record<string, string> = {
    'Велогонка 114 км': 'Grand Tour',
    'Велогонка 60 км': 'Median Tour',
    'Велогонка 25 км': 'Intro Tour',
  };
  return mapping[backendName] || backendName;
}

function getDistanceColor(distanceId: string): string {
  if (distanceId === 'grand') return '#e61c56';
  if (distanceId === 'median') return '#fec800';
  if (distanceId === 'intro') return '#62b22f';
  return '#003051';
}

function getAgeCategory(dateOfBirth: string | null, gender: string | null): string {
  if (!dateOfBirth || !gender) return 'А 18+';
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || m === 0 && today.getDate() < birth.getDate()) age--;

  if (gender === 'male') {
    if (age < 30) return 'М1 18-29';
    if (age < 40) return 'М2 30-39';
    if (age < 50) return 'М3 40-49';
    if (age < 60) return 'М4 50-59';
    return 'М5 60+';
  }
  // female
  if (age < 30) return 'F1 18-29';
  if (age < 40) return 'F2 30-39';
  if (age < 55) return 'F3 40-54';
  return 'F4 55+';
}

const ITEMS_PER_PAGE = 20;

// Hardcoded cities for Results page
const CITIES = [
  {
    date: '7 июня 2026',
    location: 'Суздаль',
    titleLocation: 'Суздаль, Владимирская область',
    image: '/images/hero-1.jpg',
    locationMatch: 'Суздаль',
    distances: [
      { id: 'grand', name: 'Велогонка 114 км' },
      { id: 'median', name: 'Велогонка 60 км' },
    ],
  },
  {
    date: '5 июля 2026',
    location: 'Ленинградская область\nИгора',
    titleLocation: 'Игора, Ленинградская область',
    image: '/images/igora-hero.jpg',
    locationMatch: 'Игора',
    distances: [
      { id: 'grand', name: 'Велогонка 114 км' },
      { id: 'median', name: 'Велогонка 60 км' },
      { id: 'intro', name: 'Велогонка 25 км' },
    ],
  },
  {
    date: '16 августа 2026',
    location: 'Санкт-Петербург\nЦарское Село',
    titleLocation: 'Царское Село, Санкт-Петербург',
    image: '/images/pushkin-hero.jpg',
    locationMatch: 'Царское Село',
    distances: [
      { id: 'grand', name: 'Велогонка 114 км' },
      { id: 'median', name: 'Велогонка 60 км' },
      { id: 'intro', name: 'Велогонка 25 км' },
    ],
  },
];

const Results: React.FC = () => {
  const [showCitySelection, setShowCitySelection] = useState(true);
  const [selectedCity, setSelectedCity] = useState<typeof CITIES[0] | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedDistanceId, setSelectedDistanceId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('А 18+');
  const [page, setPage] = useState(1);

  // Fetch events
  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await eventsAPI.getEvents();
      return data.events;
    }
  });

  const activeEvent = events?.find((e) => e.id === selectedEventId) ?? events?.[0];
  const activeEventId = activeEvent?.id;

  // Fetch distances for event
  const { data: distances } = useQuery({
    queryKey: ['event_distances', activeEventId],
    queryFn: async () => {
      const { data } = await eventsAPI.getEventDistances(activeEventId!);
      console.log('Fetched distances:', data.distances);
      return data.distances;
    },
    enabled: !!activeEventId
  });

  const FALLBACK_DISTANCES = selectedCity?.distances ?? [];

  const displayDistances = distances?.length ? distances : FALLBACK_DISTANCES;
  const activeDistance = displayDistances?.find((d) => d.id === selectedDistanceId) ?? displayDistances?.[0];
  const activeDistanceId = activeDistance?.id;
  const isCompleted = activeEvent?.status === 'completed';

  // Display name for the distance (bold part of the title)
  const distanceDisplayName = getDisplayDistanceName(activeDistance?.name ?? '');

  // Fetch registrations (for participant list)
  const { data: registrations, isLoading: loadingRegs } = useQuery({
    queryKey: ['event_registrations', activeEventId, activeDistanceId],
    queryFn: async () => {
      const { data } = await eventsAPI.getEventResults(activeEventId!, activeDistanceId);
      return data.registrations || [];
    },
    enabled: !!activeEventId && !!activeDistanceId && !isCompleted
  });

  // Fetch results (for completed events)
  const { data: results, isLoading: loadingResults } = useQuery({
    queryKey: ['event_results', activeEventId, activeDistanceId],
    queryFn: async () => {
      const { data } = await eventsAPI.getEventResults(activeEventId!, activeDistanceId);
      return data.results || [];
    },
    enabled: !!activeEventId && !!activeDistanceId && isCompleted
  });

  // Filter by category
  const filteredParticipants = useMemo(() => {
    if (!registrations) return [];
    return registrations.filter((reg) => {
      if (selectedCategory === 'А 18+') return true;
      const profile = reg.profile as any;
      if (!profile) return false;
      return getAgeCategory(profile.date_of_birth, profile.gender) === selectedCategory;
    });
  }, [registrations, selectedCategory]);

  const filteredResults = useMemo(() => {
    if (!results) return [];
    if (selectedCategory === 'А 18+') return results;
    return results.filter((r) => r.category === selectedCategory);
  }, [results, selectedCategory]);

  const currentItems = isCompleted ? filteredResults : filteredParticipants;
  const totalPages = Math.max(1, Math.ceil(currentItems.length / ITEMS_PER_PAGE));
  const paginatedItems = currentItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const isLoading = isCompleted ? loadingResults : loadingRegs;

  // Reset page on filter change
  React.useEffect(() => {setPage(1);}, [selectedCategory, activeDistanceId]);

  // Auto-select first distance when distances load
  React.useEffect(() => {
    if (displayDistances?.length) setSelectedDistanceId(displayDistances[0].id);
  }, [distances]);

  const handleCitySelect = (cityLocationMatch: string) => {
    // Find the city from CITIES array
    const city = CITIES.find(c => c.locationMatch === cityLocationMatch);

    if (city) {
      setSelectedCity(city);
    }

    // Find event that matches the selected city
    const normalizeString = (str: string) =>
      str.toLowerCase().replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();

    const normalizedMatch = normalizeString(cityLocationMatch);

    const matchedEvent = events?.find(e => {
      const normalizedLocation = normalizeString(e.location);
      return normalizedLocation.includes(normalizedMatch) ||
             normalizedMatch.includes(normalizedLocation);
    });

    // Always proceed to show the results view
    setSelectedEventId(matchedEvent?.id || null);
    setShowCitySelection(false);
    setSelectedDistanceId(null);
    setPage(1);
  };

  const handleBackToSelection = () => {
    setShowCitySelection(true);
    setSelectedCity(null);
    setSelectedEventId(null);
    setSelectedDistanceId(null);
    setSelectedCategory('А 18+');
    setPage(1);
  };

  const formatTime = (interval: string | null) => {
    if (!interval) return '—';
    return interval;
  };

  const getFullName = (profile: any) => {
    if (!profile) return '—';
    return [profile.last_name, profile.first_name, profile.patronymic].filter(Boolean).join(' ') || '—';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />

      <main className="flex-1 pt-24 md:pt-28 pb-16">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 md:py-6">
          {/* Page Title */}
          <h1 className="font-extrabold text-base uppercase tracking-tight text-foreground mb-6 md:mb-8">
            Результаты
          </h1>

          {/* City Selection View */}
          {showCitySelection && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {CITIES.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleCitySelect(city.locationMatch)}
                  className="bg-card overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 group flex flex-col h-full text-left"
                >
                  {/* City Photo */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={city.image}
                      alt={city.location}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* City Info */}
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <p className="font-bold text-lg md:text-xl text-foreground group-hover:text-secondary transition-colors duration-200 mb-3 whitespace-pre-line min-h-[72px]">
                      {city.location}
                    </p>
                    <span className="inline-block font-semibold text-sm text-white bg-[#003051] px-3 py-1.5 rounded mt-auto self-start">
                      {city.date}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Results View */}
          {!showCitySelection && (
            <>
              {/* Back Button */}
              <button
                onClick={handleBackToSelection}
                className="mb-6 text-primary hover:text-primary/80 font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                ← Вернуться к выбору города
              </button>


              {/* Title */}
              {selectedCity && (
                <h1 className="text-center text-xl md:text-2xl lg:text-3xl text-[#003051] mb-8 tracking-tight">
                  <span className="font-extrabold uppercase">{distanceDisplayName}</span>
                  <span className="font-light">, {selectedCity.titleLocation}, {selectedCity.date} г.</span>
                </h1>
              )}

              {/* Distance tabs */}
              {displayDistances.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {displayDistances.map((d) => {
                    const color = getDistanceColor(d.id);
                    const isActive = activeDistanceId === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => { setSelectedDistanceId(d.id); setPage(1); }}
                        style={isActive
                          ? { backgroundColor: color, borderColor: color, color: '#fff' }
                          : { backgroundColor: 'transparent', borderColor: color, color: color }
                        }
                        className="px-5 py-2 text-sm font-bold uppercase tracking-wide transition-colors border"
                      >
                        {getDisplayDistanceName(d.name)}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Category tabs */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#003051] text-white'
                        : 'bg-transparent text-[#003051] hover:bg-[#003051]/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sub-header */}
              <div className="bg-[#003051]/5 py-3 px-4 text-center mb-6">
                <p className="font-bold text-sm md:text-base text-[#003051] tracking-wide uppercase">
                  Список участников
                </p>
              </div>

              {/* Pagination top */}
              {selectedEventId && totalPages > 1 && (
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="text-muted-foreground">Страницы:</span>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-2 py-1 ${page === p ? 'font-bold text-foreground' : 'text-primary hover:underline'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#003051]/20">
                      <th className="text-left py-3 px-4 font-bold w-20 text-foreground">Место</th>
                      <th className="text-left py-3 px-4 font-bold w-24 text-foreground">Номер</th>
                      <th className="text-left py-3 px-4 font-bold text-foreground">Участник</th>
                      <th className="text-left py-3 px-4 font-bold w-48 text-foreground">Команда/регион</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedEventId ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-muted-foreground">
                          Данные скоро появятся
                        </td>
                      </tr>
                    ) : isLoading ? (
                      <tr>
                        <td colSpan={isCompleted ? 5 : 4} className="text-center py-16 text-muted-foreground">
                          Загрузка...
                        </td>
                      </tr>
                    ) : currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={isCompleted ? 5 : 4} className="text-center py-16 text-muted-foreground">
                          Нет данных
                        </td>
                      </tr>
                    ) : isCompleted ? (
                      paginatedItems.map((result: any, idx: number) => {
                        const profile = result.registration?.profile;
                        return (
                          <tr key={result.id} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}>
                            <td className="py-2.5 px-4">{selectedCategory === 'А 18+' ? result.place : result.category_place}</td>
                            <td className="py-2.5 px-4">{result.registration?.bib_number ?? '—'}</td>
                            <td className="py-2.5 px-4">{getFullName(profile)}</td>
                            <td className="py-2.5 px-4">{formatTime(result.finish_time)}</td>
                            <td className="py-2.5 px-4">{profile?.team_name || profile?.region || ''}</td>
                          </tr>
                        );
                      })
                    ) : (
                      paginatedItems.map((reg: any, idx: number) => {
                        const profile = reg.profile;
                        const rowNumber = (page - 1) * ITEMS_PER_PAGE + idx + 1;
                        return (
                          <tr key={reg.id} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}>
                            <td className="py-2.5 px-4">{rowNumber}</td>
                            <td className="py-2.5 px-4">{reg.bib_number ?? '—'}</td>
                            <td className="py-2.5 px-4">{getFullName(profile)}</td>
                            <td className="py-2.5 px-4">{profile?.team_name || profile?.region || ''}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination bottom */}
              {selectedEventId && totalPages > 1 && (
                <div className="flex items-center gap-2 mt-6 text-sm justify-center">
                  {page > 1 && (
                    <button onClick={() => setPage(page - 1)} className="text-primary hover:underline">← Пред.</button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-2 py-1 ${page === p ? 'font-bold text-foreground' : 'text-primary hover:underline'}`}
                    >
                      {p}
                    </button>
                  ))}
                  {page < totalPages && (
                    <button onClick={() => setPage(page + 1)} className="text-primary hover:underline">След. →</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <FooterNew />
    </div>
  );
};

export default Results;