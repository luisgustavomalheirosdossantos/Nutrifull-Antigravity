import React, { useState, useEffect } from 'react';
import { Search, UserPlus, ChevronRight, User, Calendar, Target } from 'lucide-react';
import { neonDataService } from '../lib/dataService';
import type { Paciente } from '../lib/dataService';
import type { NutricionistaUser } from '../lib/auth';

interface PacientesListViewProps {
  user: NutricionistaUser;
  onSelectPaciente: (id: string) => void;
  onNovoPaciente: () => void;
}

export const PacientesListView: React.FC<PacientesListViewProps> = ({
  user,
  onSelectPaciente,
  onNovoPaciente,
}) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const data = await neonDataService.getPacientes(user.id, user.email);
        setPacientes(data);
      } catch (err) {
        console.error('Erro ao listar pacientes:', err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [user.id, user.email]);

  const filtrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Topo com Título e Botão Novo Paciente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Pacientes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie e acompanhe todos os pacientes cadastrados
          </p>
        </div>

        <button
          onClick={onNovoPaciente}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-nutri-600 dark:bg-nutri-500 text-white text-sm font-bold hover:bg-nutri-700 dark:hover:bg-nutri-600 transition shadow-md shadow-nutri-600/20 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Paciente</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
        {/* Campo de busca por nome no topo da listagem */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar paciente por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Listagem */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
            <div className="w-8 h-8 border-3 border-nutri-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Buscando pacientes no Neon...</p>
          </div>
        ) : pacientes.length === 0 ? (
          <div className="py-16 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="p-3.5 rounded-2xl bg-nutri-50 dark:bg-nutri-950/60 text-nutri-600 dark:text-nutri-400 mb-3 shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
              Nenhum paciente cadastrado ainda
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1 mb-4">
              Comece adicionando seu primeiro paciente para registrar avaliações e consultas.
            </p>
            <button
              onClick={onNovoPaciente}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nutri-600 text-white text-xs font-bold hover:bg-nutri-700 transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Primeiro Paciente</span>
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            Nenhum paciente encontrado com o termo "{searchTerm}".
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtrados.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPaciente(p.id)}
                className="py-4 px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 rounded-2xl cursor-pointer transition group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-nutri-100 to-emerald-50 dark:from-nutri-950 dark:to-emerald-950 text-nutri-800 dark:text-nutri-300 font-extrabold flex items-center justify-center text-sm shrink-0 border border-nutri-200/60 dark:border-nutri-800/60 shadow-xs group-hover:scale-105 transition-transform">
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-nutri-700 dark:group-hover:text-nutri-400 transition">
                      {p.nome}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {/* Objetivo */}
                      <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Target className="w-3.5 h-3.5 text-nutri-600 dark:text-nutri-400 shrink-0" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {p.objetivo_display || 'Sem objetivo cadastrado'}
                        </span>
                      </span>

                      {/* Data da última consulta */}
                      <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>
                          Última consulta:{' '}
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                            {p.ultima_consulta || 'Nenhuma consulta'}
                          </strong>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <span className="text-xs text-nutri-600 dark:text-nutri-400 font-semibold group-hover:translate-x-1 transition flex items-center gap-1">
                    Ver perfil <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

