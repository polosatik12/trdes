import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileCompletion from '@/components/dashboard/ProfileCompletion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faTrophy, faFileLines, faHeart, faArrowRight, faUser, faUsers, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { registrationsAPI, healthCertificatesAPI, corporateAccountsAPI } from '@/lib/api';
import api from '@/lib/api';

const Dashboard: React.FC = () => {
  const { profile, user } = useAuth();

  // Fetch corporate members for corporate accounts
  const { data: membersData } = useQuery({
    queryKey: ['corporate-members'],
    queryFn: async () => {
      const { data } = await corporateAccountsAPI.getMembers();
      return data.members || [];
    },
    enabled: profile?.participation_type === 'corporate',
  });

  const membersCount = membersData?.length || 0;

  // Fetch user registrations
  const { data: registrations, isLoading: loadingRegistrations } = useQuery({
    queryKey: ['user-registrations'],
    queryFn: async () => {
      const { data } = await registrationsAPI.getUserRegistrations();
      console.log('Fetched registrations:', data);
      return data.registrations || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Fetch health certificates
  const { data: healthCerts, isLoading: loadingHealthCerts } = useQuery({
    queryKey: ['user-health-certificates'],
    queryFn: async () => {
      const { data } = await healthCertificatesAPI.getUserCertificates();
      console.log('Fetched health certificates:', data);
      return data.certificates || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Fetch consents status from profile
  const { data: consentsData, isLoading: loadingProfile } = useQuery({
    queryKey: ['user-profile-consents'],
    queryFn: async () => {
      const { data } = await api.get('/profile/consents');
      return data.consents || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const getName = () => {
    if (profile?.first_name) return profile.first_name;
    if (user?.email) return user.email.split('@')[0];
    return 'участник';
  };

  // Calculate stats
  const upcomingEvent = registrations?.find((reg: any) => {
    const eventDate = new Date(reg.event?.date);
    return eventDate > new Date();
  });

  const totalParticipations = registrations?.length || 0;

  const hasValidHealthCert = healthCerts?.some((cert: any) => {
    if (cert.status !== 'active' && cert.status !== 'approved') return false;
    const expiryDate = new Date(cert.expiry_date);
    return expiryDate > new Date();
  });

  // Extract consents from profile data
  const signedConsents = (consentsData || []).map((c: any) => c.consent_type);
  const requiredConsents = ['personal_data_consent', 'privacy_policy', 'waiver', 'photo_consent', 'terms_of_service'];
  const allConsentsGiven = requiredConsents.every(t => signedConsents.includes(t));

  const healthCertStatus = hasValidHealthCert ? 'Загружена' : 'Не указаны даты';
  const documentsStatus = allConsentsGiven ? 'Подписаны' : 'Требуется подпись';

  // Show loading state
  const isLoading = loadingRegistrations || loadingHealthCerts || loadingProfile;

  // For corporate accounts, show different dashboard
  const isCorporate = profile?.participation_type === 'corporate';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {getGreeting()}, {getName()}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Добро пожаловать в ваш личный кабинет Tour de Russie
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isCorporate ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Сотрудников</p>
                      <p className="font-semibold text-foreground">{membersCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <FontAwesomeIcon icon={faBuilding} className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Организация</p>
                      <p className="font-semibold text-foreground">{profile?.team_name || '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ближайшее событие</p>
                      <p className="font-semibold text-foreground">
                        {upcomingEvent ? upcomingEvent.event?.name : 'Нет регистраций'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <FontAwesomeIcon icon={faTrophy} className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Всего заездов</p>
                      <p className="font-semibold text-foreground">{totalParticipations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Справка о здоровье</p>
                  <p className="font-semibold text-foreground">{healthCertStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <FontAwesomeIcon icon={faFileLines} className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Документы</p>
                  <p className="font-semibold text-foreground">{documentsStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile completion */}
          <div className="lg:col-span-1">
            <ProfileCompletion />
            
            <Link to="/dashboard/profile" className="block mt-4">
              <Button variant="outline" className="w-full">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 mr-2" />
                Редактировать профиль
              </Button>
            </Link>
          </div>

          {/* Quick actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCorporate ? 'Управление командой' : 'Быстрые действия'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isCorporate ? (
                  <>
                    <Link
                      to="/dashboard/members"
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Управление сотрудниками</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5 text-muted-foreground" />
                    </Link>

                    <Link
                      to="/calendar"
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Зарегистрировать сотрудников</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5 text-muted-foreground" />
                    </Link>

                    <Link
                      to="/dashboard/health"
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-foreground">Справки о здоровье</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/calendar"
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Зарегистрироваться на мероприятие</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5 text-muted-foreground" />
                    </Link>

                    <Link
                      to="/dashboard/health"
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-foreground">Указать даты справки</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5 text-muted-foreground" />
                    </Link>

                    <Link
                      to="/dashboard/documents"
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faFileLines} className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-foreground">Подписать документы</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
