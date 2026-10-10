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
  email?: string;
  data_nascimento?: string;
  created_at?: string;
}

export const neonDataService = {
  getSql() {
    if (!databaseUrl) {
      throw new Error('VITE_NEON_DATABASE_URL não configurada.');
    }
    return neon(databaseUrl);
  },

  async getDashboardData(nutricionistaId: string, email?: string): Promise<DashboardMetrics> {
    const sql = this.getSql();

    // Resolver ID do nutricionista a partir do email se necessário
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

    try {
      // 1. Total de pacientes cadastrados pela nutricionista logada
      const totalPacientesRes = await sql`
        SELECT COUNT(*)::int as total
        FROM public.pacientes
        WHERE nutricionista_id = ${resolvedNutriId};
      `;
      const totalPacientes = totalPacientesRes[0]?.total || 0;

      // 2. Consultas registradas na semana atual (segunda a domingo ou últimos 7 dias)
      const consultasSemanaRes = await sql`
        SELECT COUNT(*)::int as total
        FROM public.consultas c
        JOIN public.pacientes p ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${resolvedNutriId}
          AND c.data_consulta >= date_trunc('week', CURRENT_DATE)
          AND c.data_consulta <= date_trunc('week', CURRENT_DATE) + interval '6 days';
      `;
      const consultasSemana = consultasSemanaRes[0]?.total || 0;

      // 3. Pacientes sem retorno:
      // Última consulta foi há mais de 30 dias e não possuem próximo retorno agendado (ou próximo_retorno é NULL / no passado)
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
        console.warn('Erro ao consultar id do nutricionista:', err);
      }
    }

    try {
      const rows = await sql`
        SELECT id, nutricionista_id, nome, telefone, email, data_nascimento, created_at
        FROM public.pacientes
        WHERE nutricionista_id = ${resolvedNutriId}
        ORDER BY nome ASC;
      `;
      return rows as Paciente[];
    } catch (err) {
      console.error('Erro ao listar pacientes no Neon:', err);
      return [];
    }
  },

  async criarPacienteExemplo(nutricionistaId: string, email?: string): Promise<void> {
    const sql = this.getSql();
    let resolvedNutriId = nutricionistaId;
    if (email) {
      const nutriRows = await sql`
        SELECT id FROM public.nutricionistas WHERE email = ${email} OR id = ${nutricionistaId} LIMIT 1;
      `;
      if (nutriRows.length > 0) {
        resolvedNutriId = nutriRows[0].id;
      }
    }

    // Cria um paciente para teste imediato
    const paciente = await sql`
      INSERT INTO public.pacientes (nutricionista_id, nome, email, telefone, peso_inicial, altura)
      VALUES (${resolvedNutriId}, 'Ana Beatriz Santos', 'ana.santos@email.com', '(11) 98765-4321', 65.5, 1.68)
      RETURNING id;
    `;

    if (paciente.length > 0) {
      const pacId = paciente[0].id;
      // Insere uma consulta antiga há 45 dias sem retorno agendado para validar o card 3
      await sql`
        INSERT INTO public.consultas (paciente_id, data_consulta, peso, observacoes)
        VALUES (${pacId}, CURRENT_DATE - INTERVAL '45 days', 65.5, 'Primeira consulta de avaliação.');
      `;
      // Insere uma consulta nesta semana para validar o card 2
      await sql`
        INSERT INTO public.consultas (paciente_id, data_consulta, peso, observacoes)
        VALUES (${pacId}, CURRENT_DATE, 64.8, 'Retorno da semana.');
      `;
    }
  }
};
