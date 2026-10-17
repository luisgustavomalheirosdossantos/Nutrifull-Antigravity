import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL || '';

export interface DashboardMetrics {
  totalPacientes: number;
  consultasSemana: number;
  pacientesSemRetorno: {
    id: string;
    nome: string;
    diasSemConsulta?: number;
    ultimaConsulta?: string;
  }[];
}

export interface Paciente {
  id: string;
  nutricionista_id: string;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  data_nascimento?: string;
  sexo?: string;
  peso_inicial?: number;
  altura?: number;
  objetivos?: string[];
  objetivo_texto?: string;
  nivel_atividade?: string;
  patologias?: string[];
  restricoes_alimentares?: string[];
  alergias?: string[];
  medicamentos?: string;
  suplementos?: string;
  refeicoes_por_dia?: number;
  horario_acorda?: string;
  horario_dorme?: string;
  litros_agua?: number;
  atividade_fisica?: boolean;
  atividade_fisica_descricao?: string;
  observacoes?: string;
  created_at?: string;
  // Campos calculados/agregados na listagem
  ultima_consulta?: string;
  objetivo_display?: string;
}

export interface NovoPacientePayload {
  nome: string;
  data_nascimento?: string;
  sexo?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  peso_inicial?: number;
  altura?: number;
  objetivos?: string[];
  objetivo_texto?: string;
  nivel_atividade?: string;
  patologias?: string[];
  restricoes_alimentares?: string[];
  alergias?: string[];
  medicamentos?: string;
  suplementos?: string;
  refeicoes_por_dia?: number;
  horario_acorda?: string;
  horario_dorme?: string;
  litros_agua?: number;
  atividade_fisica?: boolean;
  atividade_fisica_descricao?: string;
  observacoes?: string;
}

export const neonDataService = {
  getSql() {
    if (!databaseUrl) {
      throw new Error('VITE_NEON_DATABASE_URL não configurada.');
    }
    return neon(databaseUrl);
  },

  async resolveNutricionistaId(nutricionistaId: string, email?: string): Promise<string> {
    const sql = this.getSql();
    let resolvedNutriId = nutricionistaId;
    if (email) {
      try {
        const nutriRows = await sql`
          SELECT id FROM public.nutricionistas WHERE email = ${email} OR id = ${nutricionistaId} LIMIT 1;
        `;
        if (nutriRows.length > 0) {
          resolvedNutriId = nutriRows[0].id;
        }
      } catch (err) {
        console.warn('Erro ao consultar id do nutricionista por email:', err);
      }
    }
    return resolvedNutriId;
  },

  async getDashboardData(nutricionistaId: string, email?: string): Promise<DashboardMetrics> {
    const sql = this.getSql();
    const resolvedNutriId = await this.resolveNutricionistaId(nutricionistaId, email);

    try {
      // 1. Total de pacientes cadastrados pela nutricionista logada
      const totalPacientesRes = await sql`
        SELECT COUNT(*)::int as total
        FROM public.pacientes
        WHERE nutricionista_id = ${resolvedNutriId};
      `;
      const totalPacientes = totalPacientesRes[0]?.total || 0;

      // 2. Consultas registradas na semana atual
      const consultasSemanaRes = await sql`
        SELECT COUNT(*)::int as total
        FROM public.consultas c
        JOIN public.pacientes p ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${resolvedNutriId}
          AND c.data_consulta >= date_trunc('week', CURRENT_DATE)
          AND c.data_consulta <= date_trunc('week', CURRENT_DATE) + interval '6 days';
      `;
      const consultasSemana = consultasSemanaRes[0]?.total || 0;

      // 3. Pacientes sem retorno (> 30 dias sem retorno agendado)
      const semRetornoRes = await sql`
        WITH ultimas_consultas AS (
          SELECT 
            c.paciente_id,
            MAX(c.data_consulta) as ultima_data,
            MAX(c.proximo_retorno) as proximo_retorno
          FROM public.consultas c
          JOIN public.pacientes p ON c.paciente_id = p.id
          WHERE p.nutricionista_id = ${resolvedNutriId}
          GROUP BY c.paciente_id
        )
        SELECT 
          p.id, 
          p.nome,
          uc.ultima_data as ultima_consulta,
          (CURRENT_DATE - uc.ultima_data) as dias_sem_consulta
        FROM public.pacientes p
        JOIN ultimas_consultas uc ON p.id = uc.paciente_id
        WHERE p.nutricionista_id = ${resolvedNutriId}
          AND uc.ultima_data < (CURRENT_DATE - INTERVAL '30 days')
          AND (uc.proximo_retorno IS NULL OR uc.proximo_retorno < CURRENT_DATE)
        ORDER BY uc.ultima_data ASC;
      `;

      const pacientesSemRetorno = semRetornoRes.map((row: any) => ({
        id: row.id,
        nome: row.nome,
        diasSemConsulta: row.dias_sem_consulta,
        ultimaConsulta: row.ultima_consulta ? new Date(row.ultima_consulta).toLocaleDateString('pt-BR') : undefined,
      }));

      return {
        totalPacientes,
        consultasSemana,
        pacientesSemRetorno,
      };
    } catch (error) {
      console.error('Erro ao buscar métricas do dashboard no Neon:', error);
      return {
        totalPacientes: 0,
        consultasSemana: 0,
        pacientesSemRetorno: [],
      };
    }
  },

  async getPacientes(nutricionistaId: string, email?: string): Promise<Paciente[]> {
    const sql = this.getSql();
    const resolvedNutriId = await this.resolveNutricionistaId(nutricionistaId, email);

    try {
      const rows = await sql`
        SELECT 
          p.*,
          (
            SELECT MAX(c.data_consulta)
            FROM public.consultas c
            WHERE c.paciente_id = p.id
          ) as ultima_consulta
        FROM public.pacientes p
        WHERE p.nutricionista_id = ${resolvedNutriId}
        ORDER BY p.nome ASC;
      `;

      return rows.map((r: any) => {
        // Obter resumo de objetivo para exibição
        let objetivo_display = 'Não especificado';
        if (r.objetivos && Array.isArray(r.objetivos) && r.objetivos.length > 0) {
          objetivo_display = r.objetivos.join(', ');
          if (r.objetivo_texto) {
            objetivo_display += ` (${r.objetivo_texto})`;
          }
        } else if (r.objetivo_texto) {
          objetivo_display = r.objetivo_texto;
        }

        return {
          ...r,
          peso_inicial: r.peso_inicial ? Number(r.peso_inicial) : undefined,
          altura: r.altura ? Number(r.altura) : undefined,
          litros_agua: r.litros_agua ? Number(r.litros_agua) : undefined,
          objetivo_display,
          ultima_consulta: r.ultima_consulta ? new Date(r.ultima_consulta).toLocaleDateString('pt-BR') : undefined,
        };
      }) as Paciente[];
    } catch (err) {
      console.error('Erro ao listar pacientes no Neon:', err);
      return [];
    }
  },

  async cadastrarPaciente(
    nutricionistaId: string,
    emailNutri: string | undefined,
    dados: NovoPacientePayload
  ): Promise<Paciente> {
    const sql = this.getSql();
    const resolvedNutriId = await this.resolveNutricionistaId(nutricionistaId, emailNutri);

    const rows = await sql`
      INSERT INTO public.pacientes (
        nutricionista_id,
        nome,
        data_nascimento,
        sexo,
        telefone,
        whatsapp,
        email,
        peso_inicial,
        altura,
        objetivos,
        objetivo_texto,
        nivel_atividade,
        patologias,
        restricoes_alimentares,
        alergias,
        medicamentos,
        suplementos,
        refeicoes_por_dia,
        horario_acorda,
        horario_dorme,
        litros_agua,
        atividade_fisica,
        atividade_fisica_descricao,
        observacoes
      )
      VALUES (
        ${resolvedNutriId},
        ${dados.nome.trim()},
        ${dados.data_nascimento || null},
        ${dados.sexo || null},
        ${dados.telefone || null},
        ${dados.whatsapp || null},
        ${dados.email || null},
        ${dados.peso_inicial !== undefined && !isNaN(dados.peso_inicial) ? dados.peso_inicial : null},
        ${dados.altura !== undefined && !isNaN(dados.altura) ? dados.altura : null},
        ${dados.objetivos && dados.objetivos.length > 0 ? dados.objetivos : null},
        ${dados.objetivo_texto || null},
        ${dados.nivel_atividade || null},
        ${dados.patologias && dados.patologias.length > 0 ? dados.patologias : null},
        ${dados.restricoes_alimentares && dados.restricoes_alimentares.length > 0 ? dados.restricoes_alimentares : null},
        ${dados.alergias && dados.alergias.length > 0 ? dados.alergias : null},
        ${dados.medicamentos || null},
        ${dados.suplementos || null},
        ${dados.refeicoes_por_dia !== undefined && !isNaN(dados.refeicoes_por_dia) ? dados.refeicoes_por_dia : null},
        ${dados.horario_acorda || null},
        ${dados.horario_dorme || null},
        ${dados.litros_agua !== undefined && !isNaN(dados.litros_agua) ? dados.litros_agua : null},
        ${dados.atividade_fisica !== undefined ? dados.atividade_fisica : null},
        ${dados.atividade_fisica_descricao || null},
        ${dados.observacoes || null}
      )
      RETURNING *;
    `;

    if (!rows || rows.length === 0) {
      throw new Error('Não foi possível salvar o paciente no Neon.');
    }

    return rows[0] as Paciente;
  },

  async criarPacienteExemplo(nutricionistaId: string, email?: string): Promise<void> {
    const sql = this.getSql();
    const resolvedNutriId = await this.resolveNutricionistaId(nutricionistaId, email);

    // Cria um paciente para teste imediato
    const paciente = await sql`
      INSERT INTO public.pacientes (
        nutricionista_id, 
        nome, 
        email, 
        telefone, 
        whatsapp,
        peso_inicial, 
        altura,
        objetivos,
        nivel_atividade
      )
      VALUES (
        ${resolvedNutriId}, 
        'Ana Beatriz Santos', 
        'ana.santos@email.com', 
        '(11) 98765-4321',
        '(11) 98765-4321',
        65.5, 
        168,
        ARRAY['Emagrecer', 'Reeducação alimentar'],
        'Moderadamente ativo'
      )
      RETURNING id;
    `;

    if (paciente.length > 0) {
      const pacId = paciente[0].id;
      // Insere consulta antiga há 45 dias
      await sql`
        INSERT INTO public.consultas (paciente_id, data_consulta, peso, observacoes)
        VALUES (${pacId}, CURRENT_DATE - INTERVAL '45 days', 65.5, 'Primeira consulta de avaliação.');
      `;
      // Insere consulta nesta semana
      await sql`
        INSERT INTO public.consultas (paciente_id, data_consulta, peso, observacoes)
        VALUES (${pacId}, CURRENT_DATE, 64.8, 'Retorno da semana.');
      `;
    }
  }
};
