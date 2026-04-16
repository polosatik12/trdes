import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import logoHeader from '@/assets/logo-header.svg';

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuToggle }) => {
  const { profile, user } = useAuth();

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Пользователь';
  };

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center h-16 px-4 lg:px-6">
        <div className="flex-1 flex items-center">
          <button
            className="lg:hidden p-2 text-primary"
            onClick={onMenuToggle}
          >
            <FontAwesomeIcon icon={faBars} className="w-[22px] h-[22px]" />
          </button>
        </div>

        <Link to="/" className="flex items-center">
          <img src={logoHeader} alt="Tour de Russie" className="h-9" />
        </Link>

        <div className="flex-1 flex items-center justify-end gap-3">
          <Avatar className="h-8 w-8 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium text-foreground">
            {getDisplayName()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
