
import React, { useState, useEffect } from 'react';
import type { Team, AppSettings } from './types';
import { api } from './utils/helpers';
import Header from './components/Header';
import RegistrationModal from './components/RegistrationModal';
import { AdminPanel } from './components/AdminPanel';
import ContactModal from './components/ContactModal';
import AIStudioModal from './components/AIStudioModal';
import { sendConfirmationEmail } from './services/emailService';

const App: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isAIStudioModalOpen, setIsAIStudioModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        // Ensure admin password is set on first load
        if (!localStorage.getItem('pa_admin_pass')) {
            localStorage.setItem('pa_admin_pass', 'Angola2001');
        }

        // Load all data from our mock API
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [teamsData, settingsData] = await Promise.all([
                    api.getTeams(),
                    api.getSettings()
                ]);
                setTeams(teamsData);
                setSettings(settingsData);
            } catch (error) {
                console.error("Failed to load application data:", error);
                showToast('Erro ao carregar os dados da aplicação.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);
    
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 5000);
    };

    const handleRegisterTeam = async (teamData: Omit<Team, 'status' | 'timestamp' | 'id'>) => {
        if (!settings) return;
        
        const confirmedCount = teams.filter(t => t.status === 'inscrito').length;
        const newTeam: Team = {
            ...teamData,
            id: crypto.randomUUID(),
            status: confirmedCount < settings.teamLimit ? 'inscrito' : 'reserva',
            timestamp: new Date().toISOString(),
        };

        const updatedTeams = [...teams, newTeam];
        
        try {
            await api.saveTeams(updatedTeams);
            setTeams(updatedTeams);
            setIsRegistrationOpen(false);
            showToast(`Equipa "${newTeam.teamName}" inscrita com sucesso como ${newTeam.status}!`);
        } catch (error) {
            console.error("Failed to save team:", error);
            if (error instanceof Error && error.message === 'STORAGE_FULL') {
                showToast("Erro ao guardar: O armazenamento do navegador está cheio.", 'error');
            } else {
                showToast("Ocorreu um erro ao guardar a inscrição.", 'error');
            }
        }
    };

    const handleSendContactMessage = ({ name, title, email }: { name: string; title: string; email: string }) => {
        setIsContactModalOpen(false);
        showToast('A sua mensagem foi recebida! Obrigado.', 'success');
    };

    const handleSendAIRequest = ({ name, title }: { name: string; title: string }) => {
        setIsAIStudioModalOpen(false);
        showToast('A sua solicitação foi recebida com sucesso!', 'success');
    };

    const handleDeleteTeam = async (id: string) => {
        if (!settings || !window.confirm('Tem a certeza que pretende eliminar esta inscrição?')) {
            return;
        }
    
        const teamToDelete = teams.find(t => t.id === id);
        if (!teamToDelete) {
            showToast('Equipa não encontrada.', 'error');
            return;
        }
        
        let initialTeams = teams.filter(t => t.id !== id);
        let promotedTeam: Team | undefined;
    
        if (teamToDelete.status === 'inscrito') {
            const confirmedCountAfterDeletion = initialTeams.filter(t => t.status === 'inscrito').length;
            
            if (confirmedCountAfterDeletion < settings.teamLimit) {
                const oldestReserve = initialTeams
                    .filter(t => t.status === 'reserva')
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    
                if (oldestReserve) {
                    promotedTeam = { ...oldestReserve, status: 'inscrito' };
                    initialTeams = initialTeams.map(t => t.id === oldestReserve.id ? promotedTeam! : t);
                }
            }
        }
    
        try {
            await api.saveTeams(initialTeams);
            setTeams(initialTeams);
            showToast('Inscrição eliminada.');
            if (promotedTeam) {
                showToast(`Equipa "${promotedTeam.teamName}" promovida a inscrita!`, 'success');
            }
        } catch (error) {
            console.error("Failed to delete team:", error);
            if (error instanceof Error && error.message === 'STORAGE_FULL') {
                showToast("Erro ao eliminar: O armazenamento do navegador está cheio.", 'error');
            } else {
                showToast("Ocorreu um erro ao eliminar a inscrição.", 'error');
            }
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('ATENÇÃO: Tem a certeza que pretende apagar TODAS as inscrições? Esta ação é irreversível.')) {
            try {
                await api.saveTeams([]);
                setTeams([]);
                showToast('Todas as inscrições foram eliminadas.');
            } catch (error) {
                console.error("Failed to clear all teams:", error);
                if (error instanceof Error && error.message === 'STORAGE_FULL') {
                    showToast("Erro ao apagar: O armazenamento do navegador está cheio.", 'error');
                } else {
                    showToast("Ocorreu um erro ao apagar as inscrições.", 'error');
                }
            }
        }
    };

    const handleSaveSettings = async (newSettings: AppSettings) => {
        try {
            await api.saveSettings(newSettings);
            setSettings(newSettings);
            showToast("Configurações guardadas com sucesso!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            if (error instanceof Error && error.message === 'STORAGE_FULL') {
                showToast("Erro: Imagens demasiado grandes. Tente usar ficheiros mais pequenos.", 'error');
            } else {
                showToast("Ocorreu um erro ao guardar as configurações.", 'error');
            }
        }
    };
    
    if (isLoading || !settings) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-white text-xl animate-pulse">A carregar dados do torneio...</p>
            </div>
        );
    }
    
    const confirmedCount = teams.filter(t => t.status === 'inscrito').length;
    const reserveCount = teams.filter(t => t.status === 'reserva').length;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <img src={settings.bannerUrl} alt="Banner do Torneio" className="w-full h-48 md:h-64 object-cover" />

            <div className="container mx-auto p-4 max-w-7xl -mt-16 md:-mt-24">
                <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700">
                    <Header onAdminClick={() => setIsAdminOpen(true)} logoUrl={settings.logoUrl} />

                    <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold text-white mb-4">Sobre o Torneio</h2>
                            <p className="text-gray-300 mb-4">
                                Celebre os 50 anos de independência de Angola connosco! Um torneio de padel comemorativo para unir a comunidade através do desporto. As inscrições são para equipas de dois (duplas).
                            </p>
                            <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-4 rounded-lg mb-6">
                                <h3 className="font-semibold mb-2">Processo de Inscrição:</h3>
                                <p className="text-sm">
                                    Após submeter o formulário, a sua equipa será pré-inscrita. A vaga só é garantida após o pagamento do valor da inscrição. O limite é de <strong>{settings.teamLimit} equipas</strong>, as restantes ficam em lista de reserva.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsRegistrationOpen(true)}
                                className="w-full sm:w-auto bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-500 transition-transform hover:scale-105 duration-200"
                            >
                                Fazer Inscrição
                            </button>
                        </div>
                        <div className="bg-gray-900/50 p-6 rounded-lg">
                            <h3 className="text-2xl font-bold text-white mb-4">Estado das Inscrições</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-green-400">Vagas Preenchidas:</span>
                                    <span className="font-bold">{confirmedCount} / {settings.teamLimit}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-green-400 h-2 rounded-full" style={{ width: `${settings.teamLimit > 0 ? (confirmedCount / settings.teamLimit) * 100 : 0}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-yellow-400">Lista de Reserva:</span>
                                    <span className="font-bold">{reserveCount}</span>
                                </div>
                            </div>
                        </div>
                    </main>

                    <div className="p-4 md:p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Equipas Inscritas</h3>
                        {teams.length > 0 ? (
                             <div className="overflow-x-auto rounded-lg bg-gray-900/50">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-700/50">
                                        <tr>
                                            <th className="p-3 text-sm font-semibold tracking-wide">#</th>
                                            <th className="p-3 text-sm font-semibold tracking-wide">Nome da Equipa</th>
                                            <th className="p-3 text-sm font-semibold tracking-wide">Atletas</th>
                                            <th className="p-3 text-sm font-semibold tracking-wide">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {teams.map((team, i) => (
                                            <tr key={team.id} className="hover:bg-gray-700/40">
                                                <td className="p-3 text-gray-400">{i + 1}</td>
                                                <td className="p-3 font-semibold">{team.teamName}</td>
                                                <td className="p-3">{team.a1} / {team.a2}</td>
                                                <td className={`p-3 font-bold ${team.status === 'inscrito' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">Ainda não há equipas inscritas. Seja o primeiro!</p>
                        )}
                    </div>

                </div>

                <footer className="text-center text-gray-500 py-6 text-sm">
                    <div className="mb-4 flex justify-center items-center gap-6">
                        <button 
                            onClick={() => setIsContactModalOpen(true)}
                            className="text-orange-400 hover:text-orange-300 hover:underline"
                        >
                            Contactar a Organização
                        </button>
                        <button 
                            onClick={() => setIsAIStudioModalOpen(true)}
                            className="text-orange-400 hover:text-orange-300 hover:underline"
                        >
                            AI Studio
                        </button>
                    </div>
                    © {new Date().getFullYear()} Padel Angola — Torneio 50 Anos • Todos os direitos reservados.
                </footer>
            </div>
            
            <RegistrationModal 
                isOpen={isRegistrationOpen}
                onClose={() => setIsRegistrationOpen(false)}
                onSubmit={handleRegisterTeam}
                teamLimit={settings.teamLimit}
                currentTeams={confirmedCount}
            />

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onSubmit={handleSendContactMessage}
            />

            <AIStudioModal
                isOpen={isAIStudioModalOpen}
                onClose={() => setIsAIStudioModalOpen(false)}
                onSubmit={handleSendAIRequest}
            />

            <AdminPanel
                isOpen={isAdminOpen}
                onClose={() => setIsAdminOpen(false)}
                teams={teams}
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onDeleteTeam={handleDeleteTeam}
                onClearAll={handleClearAll}
            />

            {toastMessage && (
                <div className={`fixed bottom-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce ${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default App;
