import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  ArrowLeft, 
  History
} from 'lucide-react';
import { neonDataService } from '../lib/dataService';

interface PacienteDetalhesProps {
  pacienteId: string;
  onBack: () => void;
}

export const PacienteDetalhes: React.FC<PacienteDetalhesProps> = ({
  pacienteId,
  onBack,
}) => {
  const [paciente, setPaciente] = useState<any>(null);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const sql = neonDataService.getSql();
        const pacRes = await sql`
          SELECT * FROM public.pacientes WHERE id = ${pacienteId} LIMIT 1;
        `;
        if (pacRes.length > 0) {
          setPaciente(pacRes[0]);
        }

        const consRes = await sql`
          SELECT * FROM public.consultas 
          WHERE paciente_id = ${pacienteId} 
          ORDER BY data_consulta DESC;
        `;
        setConsultas(consRes);
      } catch (err) {
        console.error('Erro ao carregar detalhes do paciente:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [pacienteId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-3 border-nutri-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Carregando perfil do paciente...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center">
        <p className="text-slate-600">Paciente não encontrado.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-nutri-600 text-white rounded-xl text-sm font-semibold hover:bg-nutri-700 transition"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-nutri-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Dashboard</span>
        </button>
      </div>

      {/* Header do Paciente */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-nutri-600 to-emerald-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-nutri-600/20">
            {paciente.nome?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{paciente.nome}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
              {paciente.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {paciente.email}
                </span>
              )}
              {paciente.telefone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {paciente.telefone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Paciente Ativo
          </span>
        </div>
      </div>

      {/* Grid de Informações e Histórico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dados Básicos */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-nutri-600" />
            Dados Cadastrais
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Peso Inicial</span>
              <span className="font-semibold text-slate-800">
                {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : 'Não registrado'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Altura</span>
              <span className="font-semibold text-slate-800">
                {paciente.altura ? `${paciente.altura} m` : 'Não registrada'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Nível Atividade</span>
              <span className="font-semibold text-slate-800">
                {paciente.nivel_atividade || 'Moderado'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Cadastrado em</span>
              <span className="font-semibold text-slate-800">
                {paciente.created_at ? new Date(paciente.created_at).toLocaleDateString('pt-BR') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Histórico de Consultas */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4 text-nutri-600" />
            Histórico de Consultas
          </h2>

          {consultas.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Nenhuma consulta registrada para este paciente ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {consultas.map((c) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(c.data_consulta).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.observacoes || 'Sem observações'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-nutri-700">
                      {c.peso ? `${c.peso} kg` : ''}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Retorno: {c.proximo_retorno ? new Date(c.proximo_retorno).toLocaleDateString('pt-BR') : 'Não agendado'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
