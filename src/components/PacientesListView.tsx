import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { neonDataService } from '../lib/dataService';
import type { Paciente } from '../lib/dataService';
import type { NutricionistaUser } from '../lib/auth';

interface PacientesListViewProps {
  user: NutricionistaUser;
  onSelectPaciente: (id: string) => void;
}

export const PacientesListView: React.FC<PacientesListViewProps> = ({
  user,
  onSelectPaciente,
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
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Pacientes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie todos os seus pacientes cadastrados
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-8 h-8 border-3 border-nutri-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Buscando pacientes no Neon...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Nenhum paciente encontrado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtrados.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPaciente(p.id)}
                className="py-4 px-3 flex items-center justify-between hover:bg-slate-50/80 rounded-2xl cursor-pointer transition group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-nutri-100 text-nutri-800 font-bold flex items-center justify-center text-sm">
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-nutri-700 transition">
                      {p.nome}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      {p.email && <span>{p.email}</span>}
                      {p.telefone && <span>{p.telefone}</span>}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-nutri-600 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Abrir ficha <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
