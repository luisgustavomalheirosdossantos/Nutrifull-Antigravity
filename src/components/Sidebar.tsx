import React from 'react';
import { Logo } from './Logo';
import { LayoutDashboard, Users, LogOut, HeartPulse } from 'lucide-react';
import { authService } from '../lib/auth';
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
  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Topo com Logo Nutrifull */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <Logo size="md" />
      </div>

      {/* Menu de Navegação Lateral Fixo */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition duration-150 ${
            currentTab === 'dashboard'
              ? 'bg-nutri-50 text-nutri-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard
            className={`w-5 h-5 ${
              currentTab === 'dashboard' ? 'text-nutri-600' : 'text-slate-400'
            }`}
          />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('pacientes')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition duration-150 ${
            currentTab === 'pacientes'
              ? 'bg-nutri-50 text-nutri-700 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Users
            className={`w-5 h-5 ${
              currentTab === 'pacientes' ? 'text-nutri-600' : 'text-slate-400'
            }`}
          />
          <span>Pacientes</span>
        </button>
      </nav>

      {/* Perfil & Ação de Sair no Rodapé da Sidebar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-nutri-600 to-emerald-400 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-tight">
              {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair do sistema"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-nutri-700 font-medium">
          <HeartPulse className="w-3.5 h-3.5 text-nutri-600" />
          <span>Nutrifull Pro v1.0</span>
        </div>
      </div>
    </aside>
  );
};
