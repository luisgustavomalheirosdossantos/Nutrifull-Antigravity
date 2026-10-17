import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarDays, 
  ClockAlert, 
  RefreshCw, 
  ChevronRight, 
  UserCheck, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { neonDataService } from '../lib/dataService';
import type { DashboardMetrics } from '../lib/dataService';
import type { NutricionistaUser } from '../lib/auth';

interface DashboardViewProps {
  user: NutricionistaUser;
  onSelectPaciente: (pacienteId: string) => void;
  onNavigateToPacientes: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onSelectPaciente,
  onNavigateToPacientes,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await neonDataService.getDashboardData(user.id, user.email);
      setMetrics(data);
    } catch (err) {
      console.error('Falha ao carregar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user.id, user.email]);

  const handleSeedExample = async () => {
    setSeeding(true);
    try {
      await neonDataService.criarPacienteExemplo(user.id, user.email);
      await fetchMetrics();
    } catch (err) {
      console.error('Erro ao adicionar exemplo:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho da Área Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visão geral em tempo real dos seus atendimentos e pacientes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs disabled:opacity-60"
            title="Atualizar dados em tempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-nutri-600' : ''}`} />
            <span>Atualizar</span>
          </button>

          {metrics.totalPacientes === 0 && (
            <button
              onClick={handleSeedExample}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-nutri-50 dark:bg-nutri-950/60 border border-nutri-200 dark:border-nutri-800 text-nutri-700 dark:text-nutri-400 text-xs font-semibold hover:bg-nutri-100 dark:hover:bg-nutri-900/60 transition shadow-xs disabled:opacity-60"
            >
              <Plus className="w-3.5 h-3.5 text-nutri-600 dark:text-nutri-400" />
              <span>{seeding ? 'Gerando...' : 'Adicionar Paciente Teste'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid com os 3 Cards de Informação Obrigatórios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 — Total de pacientes ativos */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-100/60 dark:shadow-none hover:shadow-lg transition duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Card 1 • Pacientes
              </span>
              <div className="p-3 rounded-2xl bg-nutri-50 dark:bg-nutri-950/60 text-nutri-600 dark:text-nutri-400">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-3">
              Total de pacientes ativos
            </h3>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {loading ? '...' : metrics.totalPacientes}
              </span>
              <span className="text-xs text-nutri-600 dark:text-nutri-400 font-semibold bg-nutri-50 dark:bg-nutri-950/60 px-2 py-0.5 rounded-full">
                Cadastrados
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Vinculados ao seu perfil</span>
            <button
              onClick={onNavigateToPacientes}
              className="text-nutri-600 dark:text-nutri-400 hover:text-nutri-700 font-semibold inline-flex items-center gap-1 hover:underline"
            >
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2 — Consultas da semana */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-100/60 dark:shadow-none hover:shadow-lg transition duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Card 2 • Agenda
              </span>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CalendarDays className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-3">
              Consultas da semana
            </h3>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {loading ? '...' : metrics.consultasSemana}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Semana atual
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Segunda a Domingo</span>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Tempo real</span>
          </div>
        </div>

        {/* Card 3 — Pacientes sem retorno */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-100/60 dark:shadow-none hover:shadow-lg transition duration-200 flex flex-col justify-between md:row-span-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Card 3 • Acompanhamento
              </span>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <ClockAlert className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-3">
              Pacientes sem retorno
            </h3>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {loading ? '...' : metrics.pacientesSemRetorno.length}
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                &gt; 30 dias sem retorno
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span>Atenção prioritária</span>
          </div>
        </div>
      </div>

      {/* Seção Detalhada da Lista do Card 3: Pacientes sem retorno */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-100/60 dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ClockAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Lista de Pacientes sem Retorno
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Última consulta realizada há mais de 30 dias e sem próximo retorno agendado
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-3 border-nutri-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Consultando banco de dados no Neon...</p>
            </div>
          ) : metrics.pacientesSemRetorno.length === 0 ? (
            <div className="py-12 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-3.5 rounded-2xl bg-nutri-50 dark:bg-nutri-950/60 text-nutri-600 dark:text-nutri-400 mb-3 shadow-xs">
                <UserCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">
                Nenhum paciente sem retorno no momento
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
                Excelente trabalho! Todos os seus pacientes tiveram consultas recentes ou possuem retorno devidamente programado.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics.pacientesSemRetorno.map((paciente) => (
                <button
                  key={paciente.id}
                  onClick={() => onSelectPaciente(paciente.id)}
                  className="w-full py-4 px-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 rounded-2xl transition duration-150 group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-sm group-hover:bg-amber-200 dark:group-hover:bg-amber-900 transition">
                      {paciente.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-nutri-700 dark:group-hover:text-nutri-400 transition">
                        {paciente.nome}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Última consulta: {paciente.ultimaConsulta || 'Não informada'}
                        {paciente.diasSemConsulta !== undefined && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium ml-2">
                            ({paciente.diasSemConsulta} dias atrás)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 hidden sm:inline-block">
                      Sem retorno agendado
                    </span>
                    <span className="text-xs text-nutri-600 dark:text-nutri-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                      Ver perfil <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
