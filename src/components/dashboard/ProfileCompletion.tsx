import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircle } from '@fortawesome/free-solid-svg-icons';

const ProfileCompletion: React.FC = () => {
  const { profile, user } = useAuth();
  const [hasEmergencyContact, setHasEmergencyContact] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      try {
        const { data } = await profileAPI.getEmergencyContacts();
        setHasEmergencyContact(data?.contacts?.length > 0);
      } catch (error) {
        console.error('Error checking emergency contacts:', error);
      }
    };
    check();
  }, [user]);

  const fields = [
    { key: 'first_name', label: 'Имя', completed: !!profile?.first_name },
    { key: 'last_name', label: 'Фамилия', completed: !!profile?.last_name },
    { key: 'phone', label: 'Телефон', completed: !!profile?.phone },
    { key: 'date_of_birth', label: 'Дата рождения', completed: !!profile?.date_of_birth },
    { key: 'gender', label: 'Пол', completed: !!profile?.gender },
    { key: 'city', label: 'Город', completed: !!profile?.city },
    { key: 'emergency_contact', label: 'Экстренный контакт', completed: hasEmergencyContact },
  ];

  const completedCount = fields.filter(f => f.completed).length;
  const percentage = Math.round((completedCount / fields.length) * 100);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Заполненность профиля</h3>
        <span className="text-2xl font-bold text-primary">{percentage}%</span>
      </div>

      <Progress value={percentage} className="h-2 mb-4" />

      <div className="grid grid-cols-2 gap-2">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center gap-2 text-sm">
            {field.completed ? (
              <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <FontAwesomeIcon icon={faCircle} className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className={field.completed ? 'text-foreground' : 'text-muted-foreground'}>
              {field.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletion;
