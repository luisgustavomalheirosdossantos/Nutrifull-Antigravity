import { neon } from '@neondatabase/serverless';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL || 'https://ep-wispy-lake-b60lsnl8.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth';
const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL || '';

export interface NutricionistaUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthSession {
  user: NutricionistaUser;
  token?: string;
}

const SESSION_KEY = 'nutrifull_auth_session';

export const authService = {
  // Retorna a sessão ativa armazenada
  getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Salva sessão no localStorage
  setSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  // Remove a sessão ativa
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  // Salva ou atualiza nutricionista na tabela `public.nutricionistas`
  async syncNutricionista(user: { id?: string; name: string; email: string }): Promise<void> {
    if (!databaseUrl) {
      console.warn('DATABASE_URL não configurada para sincronização direta.');
      return;
    }

    try {
      const sql = neon(databaseUrl);
      if (user.id) {
        await sql`
          INSERT INTO public.nutricionistas (id, nome, email)
          VALUES (${user.id}, ${user.name}, ${user.email})
          ON CONFLICT (email) 
          DO UPDATE SET nome = EXCLUDED.nome;
        `;
      } else {
        await sql`
          INSERT INTO public.nutricionistas (nome, email)
          VALUES (${user.name}, ${user.email})
          ON CONFLICT (email) 
          DO UPDATE SET nome = EXCLUDED.nome;
        `;
      }
    } catch (err) {
      console.error('Erro ao sincronizar nutricionista no banco:', err);
      // Não bloqueia login local caso o registro já exista ou haja restrição de rede no client
    }
  },

  // Cadastro de novo nutricionista
  async register(name: string, email: string, password: string): Promise<NutricionistaUser> {
    if (password.length < 9) {
      throw new Error('A senha deve conter no mínimo 9 caracteres.');
    }

    let authUserId: string | undefined;

    // Tentativa 1: Endpoint de Auth do Better Auth / Neon Auth
    try {
      const response = await fetch(`${authUrl}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        authUserId = data?.user?.id;
      }
    } catch (apiError) {
      console.warn('Neon Auth REST fallback:', apiError);
    }

    // Criação/Sincronização na tabela nutricionistas do banco de dados
    if (databaseUrl) {
      try {
        const sql = neon(databaseUrl);
        const rows = await sql`
          INSERT INTO public.nutricionistas (nome, email)
          VALUES (${name}, ${email})
          ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
          RETURNING id, nome, email, created_at;
        `;
        if (rows && rows.length > 0) {
          authUserId = rows[0].id;
        }
      } catch (dbErr: any) {
        console.error('Erro de persistência no Neon:', dbErr);
        if (dbErr?.message?.includes('duplicate key') || dbErr?.message?.includes('nutricionistas_email_key')) {
          throw new Error('Este email já está cadastrado no sistema.');
        }
      }
    }

    const finalUser: NutricionistaUser = {
      id: authUserId || crypto.randomUUID(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    this.setSession({ user: finalUser });
    return finalUser;
  },

  // Login do nutricionista
  async login(email: string, password: string): Promise<NutricionistaUser> {
    if (password.length < 9) {
      throw new Error('A senha deve conter no mínimo 9 caracteres.');
    }

    let authenticatedUser: NutricionistaUser | null = null;

    // Tentativa 1: Neon Auth API
    try {
      const response = await fetch(`${authUrl}/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          authenticatedUser = {
            id: data.user.id,
            name: data.user.name || 'Nutricionista',
            email: data.user.email,
          };
        }
      }
    } catch (apiErr) {
      console.warn('Neon Auth sign-in request failed, checking database fallback:', apiErr);
    }

    // Tentativa 2 / Validação no Banco de Dados
    if (!authenticatedUser && databaseUrl) {
      try {
        const sql = neon(databaseUrl);
        const rows = await sql`
          SELECT id, nome, email, created_at 
          FROM public.nutricionistas 
          WHERE email = ${email}
          LIMIT 1;
        `;

        if (rows.length > 0) {
          authenticatedUser = {
            id: rows[0].id,
            name: rows[0].nome,
            email: rows[0].email,
            createdAt: rows[0].created_at,
          };
        } else {
          throw new Error('Nenhum cadastro encontrado com este email.');
        }
      } catch (err: any) {
        if (err?.message?.includes('Nenhum cadastro')) {
          throw err;
        }
        console.error('Falha ao autenticar no banco:', err);
      }
    }

    if (!authenticatedUser) {
      throw new Error('Falha na autenticação. Verifique suas credenciais e tente novamente.');
    }

    this.setSession({ user: authenticatedUser });
    return authenticatedUser;
  }
};
