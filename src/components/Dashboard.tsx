import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardView } from './DashboardView';
import { PacientesListView } from './PacientesListView';
import { PacienteDetalhes } from './PacienteDetalhes';
import type { NutricionistaUser } from '../lib/auth';

interface DashboardProps {
  user: NutricionistaUser;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'pacientes'>('dashboard');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);

  const handleSelectPaciente = (pacienteId: string) => {
    setSelectedPacienteId(pacienteId);
  };

  const handleBackToDashboard = () => {
    setSelectedPacienteId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Menu Lateral Fixo com opções Dashboard e Pacientes e Logo Nutrifull */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedPacienteId(null);
        }}
        user={user}
        onLogout={onLogout}
      />

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 min-w-0 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        {selectedPacienteId ? (
          <PacienteDetalhes
            pacienteId={selectedPacienteId}
            onBack={handleBackToDashboard}
          />
        ) : currentTab === 'dashboard' ? (
          <DashboardView
            user={user}
            onSelectPaciente={handleSelectPaciente}
            onNavigateToPacientes={() => {
              setCurrentTab('pacientes');
              setSelectedPacienteId(null);
            }}
          />
        ) : (
          <PacientesListView
            user={user}
            onSelectPaciente={handleSelectPaciente}
          />
        )}
      </main>
    </div>
  );
};
