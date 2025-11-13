import type { Team } from '../types';

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