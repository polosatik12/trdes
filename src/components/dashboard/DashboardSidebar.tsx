import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarDays, faFileLines, faHeart, faCreditCard, faHouse, faCartShopping, faRightFromBracket, faXmark, faShieldHalved, faUsers, faBuilding, faUsersRectangle } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { path: string; icon: IconDefinition; label: string; corporateOnly?: boolean }[] = [
  { path: '/dashboard', icon: faHouse, label: 'Главная' },
  { path: '/dashboard/profile', icon: faUser, label: 'Профиль' },
  { path: '/dashboard/members', icon: faUsers, label: 'Сотрудники', corporateOnly: true },
  { path: '/dashboard/corporate-profile', icon: faBuilding, label: 'Профиль организации', corporateOnly: true },
  { path: '/dashboard/corporate-registration', icon: faUsersRectangle, label: 'Регистрация команды', corporateOnly: true },
  { path: '/dashboard/participations', icon: faCalendarDays, label: 'Мои участия' },
  { path: '/dashboard/documents', icon: faFileLines, label: 'Документы' },
  { path: '/dashboard/health', icon: faHeart, label: 'Медицинский допуск' },
  { path: '/dashboard/payments', icon: faCreditCard, label: 'Платежи' },
  { path: '/dashboard/cart', icon: faCartShopping, label: 'Корзина' },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const isCorporate = profile?.participation_type === 'corporate';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
            <span className="font-semibold text-foreground">Меню</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                // Skip corporate-only items for non-corporate accounts
                if (item.corporateOnly && !isCorporate) {
                  return null;
                }

                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <FontAwesomeIcon icon={item.icon} className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5 shrink-0" />
              Выйти
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
