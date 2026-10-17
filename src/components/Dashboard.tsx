import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardView } from './DashboardView';
import { PacientesListView } from './PacientesListView';
import { PacienteDetalhes } from './PacienteDetalhes';
import { NovoPacienteForm } from './NovoPacienteForm';
import type { NutricionistaUser } from '../lib/auth';

interface DashboardProps {
  user: NutricionistaUser;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'pacientes'>('dashboard');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  const [isCreatingPaciente, setIsCreatingPaciente] = useState(false);

  const handleSelectPaciente = (pacienteId: string) => {
    setSelectedPacienteId(pacienteId);
    setIsCreatingPaciente(false);
  };

  const handleBackToDashboard = () => {
    setSelectedPacienteId(null);
    setIsCreatingPaciente(false);
  };

  const handleNovoPaciente = () => {
    setCurrentTab('pacientes');
    setSelectedPacienteId(null);
    setIsCreatingPaciente(true);
  };

  const handlePacienteCadastrado = (novoPacienteId: string) => {
    setIsCreatingPaciente(false);
    setSelectedPacienteId(novoPacienteId);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Menu Lateral Fixo com opções Dashboard e Pacientes e Logo Nutrifull */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedPacienteId(null);
          setIsCreatingPaciente(false);
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
        ) : isCreatingPaciente ? (
          <NovoPacienteForm
            user={user}
            onSuccess={handlePacienteCadastrado}
            onCancel={() => setIsCreatingPaciente(false)}
          />
        ) : currentTab === 'dashboard' ? (
          <DashboardView
            user={user}
            onSelectPaciente={handleSelectPaciente}
            onNavigateToPacientes={() => {
              setCurrentTab('pacientes');
              setSelectedPacienteId(null);
              setIsCreatingPaciente(false);
            }}
          />
        ) : (
          <PacientesListView
            user={user}
            onSelectPaciente={handleSelectPaciente}
            onNovoPaciente={handleNovoPaciente}
          />
        )}
      </main>
    </div>
  );
};
