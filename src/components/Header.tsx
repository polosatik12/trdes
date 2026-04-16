import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000]">
      {/* Top bar - darker blue */}
      <div className="h-[32px] bg-[#1e4976] flex items-center justify-end px-10">
        {/* All links together on the right */}
        <div className="flex items-center gap-5">
          <Link 
            to="/corporate" 
            className={`text-white text-[13px] font-normal tracking-wide ${isActive('/corporate') ? 'text-cyan-300' : 'hover:text-cyan-200'}`}
          >
            Корпоративное сообщество
          </Link>
          <Link 
            to="/reglament" 
            className={`text-white text-[13px] font-normal ${isActive('/reglament') ? 'text-cyan-300' : 'hover:text-cyan-200'}`}
          >
            Регламент
          </Link>
          <Link 
            to="/partners" 
            className={`text-white text-[13px] font-normal ${isActive('/partners') ? 'text-cyan-300' : 'hover:text-cyan-200'}`}
          >
            Партнеры
          </Link>
          <Link 
            to="/contact" 
            className={`text-white text-[13px] font-normal ${isActive('/contact') ? 'text-cyan-300' : 'hover:text-cyan-200'}`}
          >
            Контакт
          </Link>
          
          {/* VK icon */}
          <a 
            href="https://vk.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-[24px] h-[24px] rounded bg-[#4a76a8] flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <svg width="14" height="9" viewBox="0 0 24 14" fill="white">
              <path d="M23.5 1.2c.2-.5 0-.9-.7-.9h-2.4c-.6 0-.9.3-1 .6 0 0-1.2 2.9-2.9 4.8-.6.5-.8.7-1.1.7-.2 0-.4-.2-.4-.6V1.2c0-.6-.2-.9-.7-.9H10c-.4 0-.6.3-.6.6 0 .6.9.7.9 2.4v3.7c0 .8-.1.9-.5.9-.8 0-2.8-2.9-4-6.3-.2-.6-.4-.9-1-.9H2.4c-.7 0-.8.3-.8.6 0 .7.8 3.9 3.8 8.2 2 2.8 4.9 4.4 7.5 4.4 1.6 0 1.7-.3 1.7-.9v-2.1c0-.7.1-.8.6-.8.4 0 1 .1 2.4 1.5 1.6 1.6 1.9 2.4 2.8 2.4h2.4c.7 0 1-.3.8-1-.2-.7-.9-1.6-2-2.8-.5-.6-1.3-1.3-1.6-1.7-.4-.5-.3-.7 0-1.1 0 0 2.8-4 3.1-5.3z"/>
            </svg>
          </a>
        </div>
      </div>
      
      {/* Main navigation bar - lighter blue */}
      <div className="h-[58px] bg-[#2b5a8a] flex items-center px-10">
        
        {/* Main Navigation */}
        <nav className="flex items-center gap-7 ml-8 flex-1">
          <Link 
            to="/calendar" 
            className={`text-white text-[13px] font-medium tracking-wide uppercase ${isActive('/calendar') ? 'text-cyan-200' : 'hover:text-cyan-200'}`}
          >
            КАЛЕНДАРЬ
          </Link>
          <a 
            href="#results" 
            className="text-white text-[13px] font-medium tracking-wide uppercase hover:text-cyan-200"
          >
            РЕЗУЛЬТАТЫ
          </a>
          <a 
            href="#media" 
            className="text-white text-[13px] font-medium tracking-wide uppercase hover:text-cyan-200 flex items-center gap-1"
          >
            МЕДИА
            <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" className="ml-0.5 opacity-70">
              <path d="M4 5L0 0h8L4 5z"/>
            </svg>
          </a>
          <a 
            href="#shop" 
            className="text-white text-[13px] font-medium tracking-wide uppercase hover:text-cyan-200"
          >
            МАГАЗИН
          </a>
          <a 
            href="#chucha" 
            className="text-white text-[13px] font-medium tracking-wide uppercase hover:text-cyan-200"
          >
            ЧУЧА
          </a>
        </nav>
        
        {/* Login button - outlined style */}
        <button className="bg-white text-[#1a3a5c] px-6 py-2 text-[13px] font-medium hover:bg-gray-100 transition-colors">
          Вход
        </button>
      </div>
    </header>
  );
};

export default Header;
