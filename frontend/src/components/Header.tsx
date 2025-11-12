import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className={`h-14 border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} 
      flex items-center justify-between px-4 sticky top-0 z-20`}>
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors
            ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          title={isDark ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* User Profile */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg
          ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
            flex items-center justify-center text-white font-semibold">
            {user?.name.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium hidden sm:inline">
            {user?.name || 'Usuário'}
          </span>
        </div>
      </div>
    </header>
  );
};
