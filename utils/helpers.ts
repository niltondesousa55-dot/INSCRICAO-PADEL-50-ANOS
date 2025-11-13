
import type { Team, AppSettings } from '../types';

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

// --- Mock Backend API Service ---

const TEAMS_KEY = 'padel_inscricoes_v2_teams';
const SETTINGS_KEY = 'padel_inscricoes_v2_settings';

const defaultSettings: AppSettings = {
  iban: '',
  teamLimit: 16,
  logoUrl: 'https://i.imgur.com/mO4Pjgt.png',
  bannerUrl: 'https://i.imgur.com/2s364y7.png',
  adminEmail: 'niltondesousa55@gmail.com',
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  async getTeams(): Promise<Team[]> {
    await simulateDelay(50);
    const data = localStorage.getItem(TEAMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveTeams(teams: Team[]): Promise<void> {
    await simulateDelay(50);
    try {
      localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        throw new Error('STORAGE_FULL');
      }
      throw error;
    }
  },

  async getSettings(): Promise<AppSettings> {
    await simulateDelay(50);
    const data = localStorage.getItem(SETTINGS_KEY);
    // Merge saved settings with defaults to ensure all keys are present
    return { ...defaultSettings, ...(data ? JSON.parse(data) : {}) };
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await simulateDelay(50);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        throw new Error('STORAGE_FULL');
      }
      throw error;
    }
  },
};
