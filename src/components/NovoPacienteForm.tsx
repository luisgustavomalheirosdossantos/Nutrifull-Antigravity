import React, { useState, useMemo } from 'react';
import { 
  User, 
  Activity, 
  Coffee, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Plus,
  X
} from 'lucide-react';
import { neonDataService } from '../lib/dataService';
import type { NovoPacientePayload } from '../lib/dataService';
import type { NutricionistaUser } from '../lib/auth';

interface NovoPacienteFormProps {
  user: NutricionistaUser;
  onSuccess: (pacienteId: string) => void;
  onCancel: () => void;
}

const OBJETIVOS_OPCOES = [
  'Emagrecer',
  'Ganhar massa',
  'Controlar diabetes',
  'Saúde geral',
  'Performance esportiva',
  'Reeducação alimentar',
];

const NIVEIS_ATIVIDADE = [
  'Sedentário',
  'Levemente ativo',
  'Moderadamente ativo',
  'Muito ativo',
  'Extremamente ativo',
];

const PATOLOGIAS_OPCOES = [
  'Diabetes',
  'Hipertensão',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'Síndrome do ovário policístico',
  'Doença celíaca',
  'Colesterol alto',
];

const RESTRICOES_OPCOES = [
  'Lactose',
  'Glúten',
  'Açúcar',
  'Carne vermelha',
  'Frutos do mar',
];

const ALERGIAS_OPCOES = [
  'Amendoim',
  'Leite',
  'Ovo',
  'Soja',
  'Trigo',
  'Frutos do mar',
];

export const NovoPacienteForm: React.FC<NovoPacienteFormProps> = ({
  user,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Aba 1 - Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<'Feminino' | 'Masculino' | 'Outro' | ''>('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Aba 2 - Clínico
  const [pesoAtual, setPesoAtual] = useState<string>('');
  const [altura, setAltura] = useState<string>('');
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([]);
  const [objetivoTextoLivre, setObjetivoTextoLivre] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');

  // Patologias
  const [patologiasSelecionadas, setPatologiasSelecionadas] = useState<string[]>([]);
  const [patologiaExtra, setPatologiaExtra] = useState('');

  // Restrições alimentares
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<string[]>([]);
  const [restricaoExtra, setRestricaoExtra] = useState('');

  // Alergias alimentares
  const [alergiasSelecionadas, setAlergiasSelecionadas] = useState<string[]>([]);
  const [alergiaExtra, setAlergiaExtra] = useState('');

  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // Aba 3 - Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('');
  const [horarioAcorda, setHorarioAcorda] = useState('');
  const [horarioDorme, setHorarioDorme] = useState('');
  const [litrosAgua, setLitrosAgua] = useState<string>('');
  const [praticaAtividade, setPraticaAtividade] = useState<'sim' | 'nao' | ''>('');
  const [detalhesAtividade, setDetalhesAtividade] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Formatação de telefone / whatsapp
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Cálculo de Idade
  const idadeCalculada = useMemo(() => {
    if (!dataNascimento) return null;
    const nasc = new Date(dataNascimento);
    if (isNaN(nasc.getTime())) return null;
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade >= 0 ? idade : null;
  }, [dataNascimento]);

  // Cálculo de IMC (peso em kg, altura em cm)
  const imcInfo = useMemo(() => {
    const p = parseFloat(pesoAtual.replace(',', '.'));
    const a = parseFloat(altura.replace(',', '.'));
    if (!p || !a || p <= 0 || a <= 0) return null;

    // Altura informada em cm (ex: 175) -> em metros: 1.75
    const alturaMetros = a > 3 ? a / 100 : a;
    const imc = p / (alturaMetros * alturaMetros);
    if (isNaN(imc) || !isFinite(imc)) return null;

    let classificacao = '';
    let cor = 'text-slate-700';

    if (imc < 18.5) {
      classificacao = 'Abaixo do peso';
      cor = 'text-amber-600';
    } else if (imc < 25) {
      classificacao = 'Peso adequado';
      cor = 'text-nutri-600';
    } else if (imc < 30) {
      classificacao = 'Sobrepeso';
      cor = 'text-amber-600';
    } else if (imc < 35) {
      classificacao = 'Obesidade Grau I';
      cor = 'text-orange-600';
    } else {
      classificacao = 'Obesidade Grau II/III';
      cor = 'text-rose-600';
    }

    return {
      valor: imc.toFixed(1),
      classificacao,
      cor,
    };
  }, [pesoAtual, altura]);

  // Conversor inteligente de número para hora (ex: 6 -> 06:00, 630 -> 06:30, 23 -> 23:00)
  const formatTimeInput = (val: string): string => {
    const raw = val.trim().replace(/[^\d:]/g, '');
    if (raw.includes(':')) {
      const parts = raw.split(':');
      const h = parts[0].padStart(2, '0').slice(-2);
      const m = (parts[1] || '00').padEnd(2, '0').slice(0, 2);
      return `${h}:${m}`;
    }
    const num = raw.replace(/\D/g, '');
    if (!num) return '';
    if (num.length === 1 || num.length === 2) {
      const h = Math.min(23, parseInt(num, 10)).toString().padStart(2, '0');
      return `${h}:00`;
    }
    if (num.length === 3) {
      const h = num.slice(0, 1).padStart(2, '0');
      const m = num.slice(1, 3);
      return `${h}:${m}`;
    }
    if (num.length >= 4) {
      const h = num.slice(0, 2);
      const m = num.slice(2, 4);
      return `${h}:${m}`;
    }
    return val;
  };

  // Toggle helpers para listas com "Nenhum"
  const handleToggleMulti = (
    item: string, 
    list: string[], 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (item === 'Nenhum') {
      if (list.includes('Nenhum')) {
        setList([]);
      } else {
        setList(['Nenhum']);
      }
      return;
    }

    let updated = list.filter((x) => x !== 'Nenhum');
    if (updated.includes(item)) {
      updated = updated.filter((x) => x !== item);
    } else {
      updated.push(item);
    }
    setList(updated);
  };

  const handleAddCustomTag = (
    tag: string,
    setTag: (val: string) => void,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const updated = list.filter((x) => x !== 'Nenhum');
    if (!updated.includes(trimmed)) {
      updated.push(trimmed);
      setList(updated);
    }
    setTag('');
  };

  const handleRemoveTag = (
    item: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((prev) => prev.filter((x) => x !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nome.trim()) {
      setErrorMsg('O nome completo do paciente é obrigatório.');
      setActiveTab('pessoal');
      return;
    }

    setLoading(true);
    try {
      const payload: NovoPacientePayload = {
        nome: nome.trim(),
        data_nascimento: dataNascimento || undefined,
        sexo: sexo || undefined,
        telefone: telefone || undefined,
        whatsapp: whatsapp || undefined,
        email: email || undefined,
        peso_inicial: pesoAtual ? parseFloat(pesoAtual.replace(',', '.')) : undefined,
        altura: altura ? parseFloat(altura.replace(',', '.')) : undefined,
        objetivos: objetivosSelecionados,
        objetivo_texto: objetivoTextoLivre.trim() || undefined,
        nivel_atividade: nivelAtividade || undefined,
        patologias: patologiasSelecionadas,
        restricoes_alimentares: restricoesSelecionadas,
        alergias: alergiasSelecionadas,
        medicamentos: medicamentos.trim() || undefined,
        suplementos: suplementos.trim() || undefined,
        refeicoes_por_dia: refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : undefined,
        horario_acorda: horarioAcorda || undefined,
        horario_dorme: horarioDorme || undefined,
        litros_agua: litrosAgua ? parseFloat(litrosAgua.replace(',', '.')) : undefined,
        atividade_fisica: praticaAtividade === 'sim' ? true : praticaAtividade === 'nao' ? false : undefined,
        atividade_fisica_descricao: praticaAtividade === 'sim' ? detalhesAtividade.trim() : undefined,
        observacoes: observacoes.trim() || undefined,
      };

      const novo = await neonDataService.cadastrarPaciente(user.id, user.email, payload);
      setSuccessMsg('Paciente cadastrado com sucesso!');
      
      setTimeout(() => {
        onSuccess(novo.id);
      }, 700);
    } catch (err: any) {
      console.error('Erro ao cadastrar paciente:', err);
      setErrorMsg(err.message || 'Erro ao cadastrar paciente no Neon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
      {/* Top Header com Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-nutri-700 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para pacientes</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Novo Paciente
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Preencha os dados do paciente para iniciar o acompanhamento clínico
          </p>
        </div>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pessoal')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition duration-150 ${
            activeTab === 'pessoal'
              ? 'bg-nutri-600 text-white shadow-sm shadow-nutri-600/30'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>1. Pessoal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clinico')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition duration-150 ${
            activeTab === 'clinico'
              ? 'bg-nutri-600 text-white shadow-sm shadow-nutri-600/30'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>2. Clínico</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('habitos')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition duration-150 ${
            activeTab === 'habitos'
              ? 'bg-nutri-600 text-white shadow-sm shadow-nutri-600/30'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>3. Hábitos</span>
        </button>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        {/* ================= ABA 1: PESSOAL ================= */}
        {activeTab === 'pessoal' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Dados Pessoais</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Informações de contato e identificação do paciente
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nome completo (obrigatório) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silva Souza"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>

              {/* Data de Nascimento com cálculo automático de idade */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Data de Nascimento
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                  />
                  {idadeCalculada !== null && (
                    <span className="shrink-0 px-3 py-3 bg-nutri-50 text-nutri-800 border border-nutri-200 rounded-xl text-xs font-bold">
                      {idadeCalculada} anos
                    </span>
                  )}
                </div>
              </div>

              {/* Sexo (seleção única) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Sexo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Feminino', 'Masculino', 'Outro'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSexo(s)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                        sexo === s
                          ? 'bg-nutri-50 border-nutri-500 text-nutri-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  placeholder="(00) 0000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>

              {/* E-mail */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="paciente@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('clinico')}
                className="px-6 py-2.5 rounded-xl bg-nutri-600 text-white text-sm font-bold hover:bg-nutri-700 transition"
              >
                Próximo: Dados Clínicos →
              </button>
            </div>
          </div>
        )}

        {/* ================= ABA 2: CLÍNICO ================= */}
        {activeTab === 'clinico' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Avaliação Clínica</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Medidas antropométricas, objetivos, patologias e histórico
              </p>
            </div>

            {/* Medidas Antropométricas & IMC */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              {/* Peso atual */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Peso Atual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="70.5"
                    value={pesoAtual}
                    onChange={(e) => setPesoAtual(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    kg
                  </span>
                </div>
              </div>

              {/* Altura */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Altura
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    placeholder="170"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    cm
                  </span>
                </div>
              </div>

              {/* IMC Calculado (somente leitura) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  IMC (Automático)
                </label>
                <div className="h-[46px] px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-800">
                    {imcInfo ? `${imcInfo.valor} kg/m²` : '—'}
                  </span>
                  {imcInfo && (
                    <span className={`text-[11px] font-bold ${imcInfo.cor}`}>
                      {imcInfo.classificacao}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Objetivo (Múltipla escolha + texto livre) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Objetivos Principais
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {OBJETIVOS_OPCOES.map((obj) => {
                  const selected = objetivosSelecionados.includes(obj);
                  return (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => {
                        if (selected) {
                          setObjetivosSelecionados((prev) => prev.filter((x) => x !== obj));
                        } else {
                          setObjetivosSelecionados((prev) => [...prev, obj]);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                        selected
                          ? 'bg-nutri-600 border-nutri-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {obj}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="Objetivo adicional ou observação do objetivo..."
                value={objetivoTextoLivre}
                onChange={(e) => setObjetivoTextoLivre(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
              />
            </div>

            {/* Nível de atividade física (Seleção única) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Nível de Atividade Física
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {NIVEIS_ATIVIDADE.map((nv) => (
                  <button
                    key={nv}
                    type="button"
                    onClick={() => setNivelAtividade(nv)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      nivelAtividade === nv
                        ? 'bg-nutri-50 border-nutri-500 text-nutri-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {nv}
                  </button>
                ))}
              </div>
            </div>

            {/* Patologias ou condições de saúde */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Patologias ou Condições de Saúde
              </label>
              <div className="flex flex-wrap gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => handleToggleMulti('Nenhum', patologiasSelecionadas, setPatologiasSelecionadas)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    patologiasSelecionadas.includes('Nenhum')
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Nenhum
                </button>
                {PATOLOGIAS_OPCOES.map((pat) => {
                  const selected = patologiasSelecionadas.includes(pat);
                  return (
                    <button
                      key={pat}
                      type="button"
                      onClick={() => handleToggleMulti(pat, patologiasSelecionadas, setPatologiasSelecionadas)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        selected
                          ? 'bg-nutri-600 border-nutri-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pat}
                    </button>
                  );
                })}
                {patologiasSelecionadas
                  .filter((p) => !PATOLOGIAS_OPCOES.includes(p) && p !== 'Nenhum')
                  .map((custom) => (
                    <span
                      key={custom}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-nutri-100 text-nutri-800 border border-nutri-300"
                    >
                      {custom}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(custom, setPatologiasSelecionadas)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar outra patologia..."
                  value={patologiaExtra}
                  onChange={(e) => setPatologiaExtra(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag(patologiaExtra, setPatologiaExtra, patologiasSelecionadas, setPatologiasSelecionadas);
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomTag(patologiaExtra, setPatologiaExtra, patologiasSelecionadas, setPatologiasSelecionadas)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Restrições Alimentares */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Restrições Alimentares
              </label>
              <div className="flex flex-wrap gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => handleToggleMulti('Nenhum', restricoesSelecionadas, setRestricoesSelecionadas)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    restricoesSelecionadas.includes('Nenhum')
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Nenhum
                </button>
                {RESTRICOES_OPCOES.map((res) => {
                  const selected = restricoesSelecionadas.includes(res);
                  return (
                    <button
                      key={res}
                      type="button"
                      onClick={() => handleToggleMulti(res, restricoesSelecionadas, setRestricoesSelecionadas)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        selected
                          ? 'bg-nutri-600 border-nutri-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {res}
                    </button>
                  );
                })}
                {restricoesSelecionadas
                  .filter((r) => !RESTRICOES_OPCOES.includes(r) && r !== 'Nenhum')
                  .map((custom) => (
                    <span
                      key={custom}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-nutri-100 text-nutri-800 border border-nutri-300"
                    >
                      {custom}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(custom, setRestricoesSelecionadas)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar outra restrição alimentar..."
                  value={restricaoExtra}
                  onChange={(e) => setRestricaoExtra(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag(restricaoExtra, setRestricaoExtra, restricoesSelecionadas, setRestricoesSelecionadas);
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomTag(restricaoExtra, setRestricaoExtra, restricoesSelecionadas, setRestricoesSelecionadas)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Alergias Alimentares */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Alergias Alimentares
              </label>
              <div className="flex flex-wrap gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => handleToggleMulti('Nenhum', alergiasSelecionadas, setAlergiasSelecionadas)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    alergiasSelecionadas.includes('Nenhum')
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Nenhum
                </button>
                {ALERGIAS_OPCOES.map((ale) => {
                  const selected = alergiasSelecionadas.includes(ale);
                  return (
                    <button
                      key={ale}
                      type="button"
                      onClick={() => handleToggleMulti(ale, alergiasSelecionadas, setAlergiasSelecionadas)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        selected
                          ? 'bg-nutri-600 border-nutri-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {ale}
                    </button>
                  );
                })}
                {alergiasSelecionadas
                  .filter((a) => !ALERGIAS_OPCOES.includes(a) && a !== 'Nenhum')
                  .map((custom) => (
                    <span
                      key={custom}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-nutri-100 text-nutri-800 border border-nutri-300"
                    >
                      {custom}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(custom, setAlergiasSelecionadas)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar outra alergia alimentar..."
                  value={alergiaExtra}
                  onChange={(e) => setAlergiaExtra(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag(alergiaExtra, setAlergiaExtra, alergiasSelecionadas, setAlergiasSelecionadas);
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomTag(alergiaExtra, setAlergiaExtra, alergiasSelecionadas, setAlergiasSelecionadas)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Medicamentos e Suplementos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Medicamentos Contínuos
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Losartana 50mg pela manhã..."
                  value={medicamentos}
                  onChange={(e) => setMedicamentos(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Suplementos em Uso
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Whey protein pós-treino, Creatina 5g..."
                  value={suplementos}
                  onChange={(e) => setSuplementos(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('pessoal')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
              >
                ← Voltar para Pessoal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('habitos')}
                className="px-6 py-2.5 rounded-xl bg-nutri-600 text-white text-sm font-bold hover:bg-nutri-700 transition"
              >
                Próximo: Hábitos →
              </button>
            </div>
          </div>
        )}

        {/* ================= ABA 3: HÁBITOS ================= */}
        {activeTab === 'habitos' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Rotina & Hábitos</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rotina de sono, hidratação diária e atividades físicas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Quantas refeições faz por dia */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Quantas refeições faz por dia?
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Ex: 4"
                  value={refeicoesPorDia}
                  onChange={(e) => setRefeicoesPorDia(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>

              {/* Quantidade de água por dia */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Quantidade de água por dia
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 2.5"
                    value={litrosAgua}
                    onChange={(e) => setLitrosAgua(e.target.value)}
                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    litros
                  </span>
                </div>
              </div>

              {/* Horário que acorda */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>Horário que acorda</span>
                  <span className="text-[10px] font-normal lowercase text-slate-400">ex: 6 ou 630</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: 06:30"
                  value={horarioAcorda}
                  onChange={(e) => setHorarioAcorda(e.target.value)}
                  onBlur={() => setHorarioAcorda(formatTimeInput(horarioAcorda))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>

              {/* Horário que dorme */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>Horário que dorme</span>
                  <span className="text-[10px] font-normal lowercase text-slate-400">ex: 23 ou 2230</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: 23:00"
                  value={horarioDorme}
                  onChange={(e) => setHorarioDorme(e.target.value)}
                  onBlur={() => setHorarioDorme(formatTimeInput(horarioDorme))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>

              {/* Pratica atividade física (sim/não) */}
              <div className="sm:col-span-2 p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pratica atividade física?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPraticaAtividade('sim')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition ${
                      praticaAtividade === 'sim'
                        ? 'bg-nutri-600 border-nutri-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setPraticaAtividade('nao')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition ${
                      praticaAtividade === 'nao'
                        ? 'bg-nutri-600 border-nutri-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Não
                  </button>
                </div>

                {praticaAtividade === 'sim' && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Qual atividade física e frequência semanal?
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Musculação 4x na semana, corrida aos sábados"
                      value={detalhesAtividade}
                      onChange={(e) => setDetalhesAtividade(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                    />
                  </div>
                )}
              </div>

              {/* Observações gerais */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Observações Gerais
                </label>
                <textarea
                  rows={4}
                  placeholder="Informações complementares sobre o paciente, rotina de trabalho, viagens, preferências..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nutri-500/30 focus:border-nutri-600 transition"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('clinico')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
              >
                ← Voltar para Clínico
              </button>
            </div>
          </div>
        )}

        {/* Rodapé com Botão Salvar (visível em todas as abas) */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>O único campo obrigatório é o nome completo.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial px-8 py-3 rounded-xl bg-nutri-600 text-white text-sm font-bold hover:bg-nutri-700 shadow-md shadow-nutri-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Salvando no Neon...' : 'Salvar Paciente'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
