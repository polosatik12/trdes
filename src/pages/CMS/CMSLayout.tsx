import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Newspaper, Image, ChevronRight, Ticket, Bike, GalleryHorizontal } from 'lucide-react';

interface CMSLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Страницы',   path: '/cms',            exact: true },
  { icon: Newspaper,       label: 'Новости',     path: '/cms/news' },
  { icon: Image,           label: 'Медиатека',   path: '/cms/media' },
  { icon: Ticket, label: 'Промокоды',  path: '/cms/promo-codes' },
  { icon: Bike,             label: 'Дистанции', path: '/cms/distances' },
  { icon: GalleryHorizontal, label: 'Галерея',   path: '/cms/gallery' },
];

const CMSLayout: React.FC<CMSLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    navigate('/cms/login');
  };

  const user = JSON.parse(localStorage.getItem('cms_user') || '{}');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#003051] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold">Tour de Russie</h1>
          <p className="text-sm text-white/60 mt-1">Админ панель</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 mb-2">
            <span>{user.username}</span>
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{user.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white w-full rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/cms" className="hover:text-gray-700">CMS</Link>
            {title && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">{title}</span>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default CMSLayout;
