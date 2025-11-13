import React, { useState, useEffect } from 'react';
import type { Team } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import RegistrationModal from './components/RegistrationModal';
import AdminPanel from './components/AdminPanel';
import ContactModal from './components/ContactModal';
import AIStudioModal from './components/AIStudioModal';
import { sendConfirmationEmail } from './services/emailService';

const App: React.FC = () => {
    const [teams, setTeams] = useLocalStorage<Team[]>('padel_inscricoes_v2', []);
    const [iban, setIban] = useLocalStorage<string>('padel_iban_v2', '');
    const [teamLimit, setTeamLimit] = useLocalStorage<number>('padel_team_limit_v2', 16);
    const [logoUrl, setLogoUrl] = useLocalStorage<string>('padel_logo_url_v2', 'https://i.imgur.com/mO4Pjgt.png');
    const [bannerUrl, setBannerUrl] = useLocalStorage<string>('padel_banner_url_v2', 'https://i.imgur.com/2s364y7.png');
    const [adminEmail, setAdminEmail] = useLocalStorage<string>('padel_admin_email_v2', 'niltondesousa55@gmail.com');
    
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isAIStudioModalOpen, setIsAIStudioModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (!localStorage.getItem('pa_admin_pass')) {
            localStorage.setItem('pa_admin_pass', 'Angola2001');
        }
    }, []);
    
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 5000);
    };

    const handleRegisterTeam = (teamData: Omit<Team, 'status' | 'timestamp' | 'id'>) => {
        const confirmedCount = teams.filter(t => t.status === 'inscrito').length;
        const newTeam: Team = {
            ...teamData,
            id: crypto.randomUUID(),
            status: confirmedCount < teamLimit ? 'inscrito' : 'reserva',
            timestamp: new Date().toISOString(),
        };

        const updatedTeams = [...teams, newTeam];
        setTeams(updatedTeams);
        setIsRegistrationOpen(false);
        showToast(`Equipa "${newTeam.teamName}" inscrita com sucesso como ${newTeam.status}!`);
    };

    const handleSendContactMessage = ({ name, title, email }: { name: string; title: string; email: string }) => {
        setIsContactModalOpen(false);
        showToast('A sua mensagem foi recebida! Obrigado.', 'success');
    };

    const handleSendAIRequest = ({ name, title }: { name: string; title: string }) => {
        setIsAIStudioModalOpen(false);
        showToast('A sua solicitação foi recebida com sucesso!', 'success');
    };

    const handleDeleteTeam = (id: string) => {
        if (!window.confirm('Tem a certeza que pretende eliminar esta inscrição?')) {
            return;
        }
    
        const teamToDelete = teams.find(t => t.id === id);
        if (!teamToDelete) {
            showToast('Equipa não encontrada.', 'error');
            return;
        }
        
        // 1. Filter out the team to be deleted
        let updatedTeams = teams.filter(t => t.id !== id);
        let promotedTeam: Team | undefined;
    
        // 2. If the deleted team was confirmed ('inscrito'), check for promotion
        if (teamToDelete.status === 'inscrito') {
            const confirmedCountAfterDeletion = updatedTeams.filter(t => t.status === 'inscrito').length;
            
            if (confirmedCountAfterDeletion < teamLimit) {
                // Find the oldest team on the reserve list
                const oldestReserve = updatedTeams
                    .filter(t => t.status === 'reserva')
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    
                if (oldestReserve) {
                    promotedTeam = { ...oldestReserve, status: 'inscrito' };
                    // 3. Create the final list by mapping over the updated list
                    updatedTeams = updatedTeams.map(t => 
                        t.id === oldestReserve.id ? promotedTeam! : t
                    );
                }
            }
        }
    
        // 4. Set the final state
        setTeams(updatedTeams);
        
        // 5. Show toasts
        showToast('Inscrição eliminada.');
        if (promotedTeam) {
            showToast(`Equipa "${promotedTeam.teamName}" promovida a inscrita!`, 'success');
        }
    };

    const handleClearAll = () => {
        if (window.confirm('ATENÇÃO: Tem a certeza que pretende apagar TODAS as inscrições? Esta ação é irreversível.')) {
            setTeams([]);
            showToast('Todas as inscrições foram eliminadas.');
        }
    };
    
    const confirmedCount = teams.filter(t => t.status === 'inscrito').length;
    const reserveCount = teams.filter(t => t.status === 'reserva').length;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <img src={bannerUrl} alt="Banner do Torneio" className="w-full h-48 md:h-64 object-cover" />

            <div className="container mx-auto p-4 max-w-7xl -mt-16 md:-mt-24">
                <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700">
                    <Header onAdminClick={() => setIsAdminOpen(true)} logoUrl={logoUrl} />

                    <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold text-white mb-4">Sobre o Torneio</h2>
                            <p className="text-gray-300 mb-4">
                                Celebre os 50 anos de independência de Angola connosco! Um torneio de padel comemorativo para unir a comunidade através do desporto. As inscrições são para equipas de dois (duplas).
                            </p>
                            <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-4 rounded-lg mb-6">
                                <h3 className="font-semibold mb-2">Processo de Inscrição:</h3>
                                <p className="text-sm">
                                    Após submeter o formulário, a sua equipa será pré-inscrita. A vaga só é garantida após o pagamento do valor da inscrição. O limite é de <strong>{teamLimit} equipas</strong>, as restantes ficam em lista de reserva.
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
                                    <span className="font-bold">{confirmedCount} / {teamLimit}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-green-400 h-2 rounded-full" style={{ width: `${teamLimit > 0 ? (confirmedCount / teamLimit) * 100 : 0}%` }}></div>
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
                teamLimit={teamLimit}
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
                iban={iban}
                onSaveIban={setIban}
                onDeleteTeam={handleDeleteTeam}
                onClearAll={handleClearAll}
                teamLimit={teamLimit}
                onSaveTeamLimit={setTeamLimit}
                logoUrl={logoUrl}
                onSaveLogoUrl={setLogoUrl}
                bannerUrl={bannerUrl}
                onSaveBannerUrl={setBannerUrl}
                adminEmail={adminEmail}
                onSaveAdminEmail={setAdminEmail}
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