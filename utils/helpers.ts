
import type { Team, AppSettings } from '../types';
import { DATABASE_URL } from '../config';

export function exportToCsv(teams: Team[]): void {
  if (teams.length === 0) {
    alert('Sem inscrições para exportar.');
    return;
  }
  const headers = ['#', 'ID', 'Nome da Equipa', 'Email de Contacto', 'Atleta 1', 'T-shirt A1', 'Telefone A1', 'Atleta 2', 'T-shirt A2', 'Telefone A2', 'Estado', 'Data Inscrição'];
  const rows = teams.map((t, i) => [
    i + 1,
    t.id,
    t.teamName,
    t.contactEmail,
    t.a1,
    t.a1t,
    t.a1phone,
    t.a2,
    t.a2t,
    t.a2phone,
    t.status,
    t.timestamp
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'inscricoes_padel_angola_50.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- Serviço de API com Base de Dados Online ---

// Este serviço agora comunica com um endpoint de um JSON online.
// NOTA: Isto usa um padrão simples de ler-modificar-escrever num único ficheiro JSON.
// Não é adequado para aplicações com muitos acessos simultâneos, pois pode levar a
// "race conditions" (quando edições simultâneas se sobrepõem). Um backend a sério
// resolveria este problema.

const defaultSettings: AppSettings = {
  iban: '',
  teamLimit: 16,
  adminEmail: 'niltondesousa55@gmail.com',
};

interface Database {
  teams: Team[];
  settings: AppSettings;
}

// Vai buscar o objeto completo da base de dados ao serviço online.
async function getDatabase(): Promise<Database> {
  try {
    const response = await fetch(DATABASE_URL);
    if (!response.ok) {
      throw new Error(`A resposta da rede não foi bem-sucedida: ${response.statusText}`);
    }
    const data = await response.json();
    // Garante que as configurações têm os valores padrão caso estejam em falta
    data.settings = { ...defaultSettings, ...(data.settings || {}) };
    data.teams = data.teams || [];
    return data;
  } catch (error) {
    console.error("Falha ao ir buscar os dados da base de dados:", error);
    // Retorna uma estrutura padrão em caso de falha para evitar que a app crash
    return {
      teams: [],
      settings: defaultSettings,
    };
  }
}

// Guarda o objeto completo da base de dados de volta no serviço online.
async function saveDatabase(data: Database): Promise<void> {
  try {
    const response = await fetch(DATABASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`A resposta da rede não foi bem-sucedida: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Falha ao guardar os dados na base de dados:", error);
    // Lança o erro novamente para que a UI o possa tratar
    throw error;
  }
}


export const api = {
  async getTeams(): Promise<Team[]> {
    const db = await getDatabase();
    return db.teams;
  },

  async saveTeams(teams: Team[]): Promise<void> {
    const db = await getDatabase();
    db.teams = teams;
    await saveDatabase(db);
  },

  async getSettings(): Promise<AppSettings> {
    const db = await getDatabase();
    return db.settings;
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await getDatabase();
    db.settings = settings;
    await saveDatabase(db);
  },
};
