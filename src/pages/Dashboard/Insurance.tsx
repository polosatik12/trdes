import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';

const Insurance: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Страховка</h1>
          <p className="text-muted-foreground mt-1">
            Управление страховыми полисами для участия в мероприятиях
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <FontAwesomeIcon icon={faShieldHalved} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Нет активных страховок
            </h3>
            <p className="text-sm text-muted-foreground">
              Загрузите страховой полис для участия в мероприятиях Tour de Russie
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Insurance;
