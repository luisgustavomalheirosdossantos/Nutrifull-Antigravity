import React from 'react';
import { Logo } from './Logo';
import { LayoutDashboard, Users, LogOut, HeartPulse, Sun, Moon } from 'lucide-react';
import { authService } from '../lib/auth';
import { useTheme } from '../lib/ThemeContext';
import type { NutricionistaUser } from '../lib/auth';

interface SidebarProps {
  currentTab: 'dashboard' | 'pacientes';
  onSelectTab: (tab: 'dashboard' | 'pacientes') => void;
  user: NutricionistaUser;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-screen sticky top-0 transition-colors duration-200">
      {/* Topo com Logo Nutrifull */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Logo size="md" />
      </div>

      {/* Menu de Navegação Lateral Fixo */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition duration-150 ${
            currentTab === 'dashboard'
              ? 'bg-nutri-50 dark:bg-nutri-950/60 text-nutri-700 dark:text-nutri-400 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <LayoutDashboard
            className={`w-5 h-5 ${
              currentTab === 'dashboard' ? 'text-nutri-600 dark:text-nutri-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('pacientes')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition duration-150 ${
            currentTab === 'pacientes'
              ? 'bg-nutri-50 dark:bg-nutri-950/60 text-nutri-700 dark:text-nutri-400 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Users
            className={`w-5 h-5 ${
              currentTab === 'pacientes' ? 'text-nutri-600 dark:text-nutri-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span>Pacientes</span>
        </button>
      </nav>

      {/* Botão de Alternância de Tema Claro/Escuro */}
      <div className="px-4 py-2">
        <button
          onClick={toggleTheme}
          type="button"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-nutri-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>{theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>

      {/* Perfil & Ação de Sair no Rodapé da Sidebar */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-nutri-600 to-emerald-400 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate mt-0.5 leading-tight">
              {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair do sistema"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-nutri-700 dark:text-nutri-400 font-medium">
          <HeartPulse className="w-3.5 h-3.5 text-nutri-600 dark:text-nutri-400" />
          <span>Nutrifull Pro v1.0</span>
        </div>
      </div>
    </aside>
  );
};
