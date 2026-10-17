import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  ArrowLeft, 
  History,
  Activity,
  HeartPulse,
  Coffee,
  Calendar,
  MessageCircle
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
          Voltar para Pacientes
        </button>
      </div>
    );
  }

  // Idade
  let idadeText = '';
  if (paciente.data_nascimento) {
    const nasc = new Date(paciente.data_nascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    if (idade >= 0) idadeText = `${idade} anos`;
  }

  // IMC
  let imcText = '';
  if (paciente.peso_inicial && paciente.altura) {
    const p = Number(paciente.peso_inicial);
    const a = Number(paciente.altura);
    const altMetros = a > 3 ? a / 100 : a;
    if (altMetros > 0) {
      const calc = p / (altMetros * altMetros);
      imcText = `${calc.toFixed(1)} kg/m²`;
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-nutri-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Pacientes</span>
        </button>
      </div>

      {/* Header do Paciente */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-nutri-600 to-emerald-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-nutri-600/20 shrink-0">
            {paciente.nome?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">{paciente.nome}</h1>
              {paciente.sexo && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {paciente.sexo}
                </span>
              )}
            </div>

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
              {paciente.whatsapp && (
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {paciente.whatsapp}
                </span>
              )}
              {idadeText && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {idadeText}
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
        {/* Coluna 1: Dados Cadastrais & Clínicos */}
        <div className="space-y-6">
          {/* Dados Antropométricos */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-nutri-600" />
              Medidas & Avaliação
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Peso Inicial</span>
                <span className="font-semibold text-slate-800">
                  {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : 'Não registrado'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Altura</span>
                <span className="font-semibold text-slate-800">
                  {paciente.altura ? `${paciente.altura} cm` : 'Não registrada'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">IMC Inicial</span>
                <span className="font-bold text-nutri-700">
                  {imcText || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Nível Atividade</span>
                <span className="font-semibold text-slate-800">
                  {paciente.nivel_atividade || 'Não informado'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Cadastrado em</span>
                <span className="font-semibold text-slate-800">
                  {paciente.created_at ? new Date(paciente.created_at).toLocaleDateString('pt-BR') : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Hábitos & Rotina */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-nutri-600" />
              Hábitos de Vida
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Refeições / dia</span>
                <span className="font-semibold text-slate-800">
                  {paciente.refeicoes_por_dia ? `${paciente.refeicoes_por_dia} refeições` : 'Não informado'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Água diária</span>
                <span className="font-semibold text-slate-800">
                  {paciente.litros_agua ? `${paciente.litros_agua} litros` : 'Não informado'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Horário acorda</span>
                <span className="font-semibold text-slate-800">
                  {paciente.horario_acorda || 'Não informado'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Horário dorme</span>
                <span className="font-semibold text-slate-800">
                  {paciente.horario_dorme || 'Não informado'}
                </span>
              </div>
              <div className="py-1.5">
                <span className="text-slate-500 block mb-1">Atividade Física:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {paciente.atividade_fisica ? `Sim — ${paciente.atividade_fisica_descricao || 'Sem detalhes'}` : 'Não pratica'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2 e 3: Clínico Detalhado + Histórico */}
        <div className="md:col-span-2 space-y-6">
          {/* Objetivos, Patologias e Restrições */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-nutri-600" />
              Objetivos & Condições Clínicas
            </h2>

            {/* Objetivos */}
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Objetivos:</span>
              <div className="flex flex-wrap gap-1.5">
                {paciente.objetivos && Array.isArray(paciente.objetivos) && paciente.objetivos.length > 0 ? (
                  paciente.objetivos.map((obj: string) => (
                    <span key={obj} className="px-3 py-1 rounded-xl text-xs font-bold bg-nutri-50 text-nutri-800 border border-nutri-200">
                      {obj}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Nenhum objetivo selecionado</span>
                )}
              </div>
              {paciente.objetivo_texto && (
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <strong>Detalhes:</strong> {paciente.objetivo_texto}
                </p>
              )}
            </div>

            {/* Patologias */}
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Patologias / Condições:</span>
              <div className="flex flex-wrap gap-1.5">
                {paciente.patologias && Array.isArray(paciente.patologias) && paciente.patologias.length > 0 ? (
                  paciente.patologias.map((pat: string) => (
                    <span key={pat} className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      {pat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Nenhuma patologia registrada</span>
                )}
              </div>
            </div>

            {/* Restrições e Alergias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-1.5">Restrições Alimentares:</span>
                <div className="flex flex-wrap gap-1">
                  {paciente.restricoes_alimentares && Array.isArray(paciente.restricoes_alimentares) && paciente.restricoes_alimentares.length > 0 ? (
                    paciente.restricoes_alimentares.map((r: string) => (
                      <span key={r} className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Nenhuma</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 block mb-1.5">Alergias Alimentares:</span>
                <div className="flex flex-wrap gap-1">
                  {paciente.alergias && Array.isArray(paciente.alergias) && paciente.alergias.length > 0 ? (
                    paciente.alergias.map((a: string) => (
                      <span key={a} className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Nenhuma</span>
                  )}
                </div>
              </div>
            </div>

            {/* Medicamentos e Suplementos */}
            {(paciente.medicamentos || paciente.suplementos || paciente.observacoes) && (
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                {paciente.medicamentos && (
                  <div>
                    <strong className="text-slate-700 block mb-0.5">Medicamentos Contínuos:</strong>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{paciente.medicamentos}</p>
                  </div>
                )}
                {paciente.suplementos && (
                  <div>
                    <strong className="text-slate-700 block mb-0.5">Suplementos:</strong>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{paciente.suplementos}</p>
                  </div>
                )}
                {paciente.observacoes && (
                  <div>
                    <strong className="text-slate-700 block mb-0.5">Observações Gerais:</strong>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{paciente.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Histórico de Consultas */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
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
    </div>
  );
};
