import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBuilding, faChevronLeft, faChartLine } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Link } from 'react-router-dom';

const navItems: { to: string; label: string; icon: IconDefinition }[] = [
  { to: 'analytics',    label: 'Аналитика', icon: faChartLine },
  { to: 'participants', label: 'Участники', icon: faUsers },
  { to: 'corporate',    label: 'Заявки',    icon: faBuilding },
];

const CRMLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-60 bg-[#003051] text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-3">
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
            На сайт
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Аналитика</h1>
          <p className="text-xs text-white/50 mt-1">Tour de Russie</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default CRMLayout;
