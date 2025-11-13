
import React, { useState, useEffect } from 'react';
import type { Team, AppSettings } from '../types';
import { exportToCsv } from '../utils/helpers';

interface AdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
    teams: Team[];
    settings: AppSettings;
    onSaveSettings: (settings: AppSettings) => void;
    onDeleteTeam: (id: string) => void;
    onClearAll: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
    isOpen, onClose, teams, settings, onSaveSettings, onDeleteTeam, onClearAll
}) => {
    const [passwordInput, setPasswordInput] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // State for editable settings, initialized from props
    const [ibanInput, setIbanInput] = useState(settings.iban);
    const [teamLimitInput, setTeamLimitInput] = useState(settings.teamLimit);
    const [logoUrlInput, setLogoUrlInput] = useState(settings.logoUrl);
    const [bannerUrlInput, setBannerUrlInput] = useState(settings.bannerUrl);
    const [adminEmailInput, setAdminEmailInput] = useState(settings.adminEmail);
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Sync state with props when modal opens or settings change
            setIbanInput(settings.iban);
            setTeamLimitInput(settings.teamLimit);
            setLogoUrlInput(settings.logoUrl);
            setBannerUrlInput(settings.bannerUrl);
            setAdminEmailInput(settings.adminEmail);
        } else {
            document.body.style.overflow = 'auto';
            // Reset state on close
            setIsLoggedIn(false);
            setPasswordInput('');
        }
        return () => { document.body.style.overflow = 'auto' };
    }, [isOpen, settings]);

    const handleLogin = () => {
        const storedPassword = localStorage.getItem('pa_admin_pass') || 'Angola2001';
        if (passwordInput === storedPassword) {
            setIsLoggedIn(true);
        } else {
            alert('Palavra-passe incorreta.');
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('A imagem é demasiado grande. O limite é 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveSettings = () => {
        const newLimit = parseInt(String(teamLimitInput), 10);
        if (isNaN(newLimit) || newLimit <= 0) {
            alert('O limite de equipas deve ser um número válido e positivo.');
            return; 
        }

        const finalAdminEmail = adminEmailInput.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (finalAdminEmail && !emailRegex.test(finalAdminEmail)) {
            alert('Por favor, insira um e-mail de administrador válido.');
            return;
        }

        const newSettings: AppSettings = {
            iban: ibanInput,
            teamLimit: newLimit,
            logoUrl: logoUrlInput,
            bannerUrl: bannerUrlInput,
            adminEmail: finalAdminEmail,
        };

        onSaveSettings(newSettings);
        // The parent component will show the confirmation toast
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Painel de Administrador</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {!isLoggedIn ? (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                            <h3 className="text-lg text-white mb-4">Acesso Restrito</h3>
                            <input
                                type="password"
                                value={passwordInput}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                onChange={e => setPasswordInput(e.target.value)}
                                placeholder="Palavra-passe"
                                className="bg-slate-700 border border-slate-600 rounded-md p-2 text-white mb-4 w-full max-w-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                            <button onClick={handleLogin} className="py-2 px-6 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500">Entrar</button>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                               <div className="lg:col-span-3 bg-slate-900/50 p-4 rounded-lg space-y-4">
                                    <h4 className="font-semibold text-orange-400 text-lg border-b border-slate-700 pb-2">Configurações Gerais</h4>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300">IBAN para Pagamento</label>
                                        <input type="text" value={ibanInput} onChange={e => setIbanInput(e.target.value)} className="mt-1 w-full bg-slate-700 p-2 rounded-md text-white" placeholder="AO06..." />
                                    </div>
                                     <div>
                                        <label className="text-sm font-medium text-gray-300">E-mail do Administrador (para referência)</label>
                                        <input type="email" value={adminEmailInput} onChange={e => setAdminEmailInput(e.target.value)} className="mt-1 w-full bg-slate-700 p-2 rounded-md text-white" placeholder="admin@example.com" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-300">Limite de Equipas</label>
                                        <input type="number" value={teamLimitInput} onChange={e => setTeamLimitInput(Number(e.target.value))} className="mt-1 w-full bg-slate-700 p-2 rounded-md text-white" placeholder="16" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">Logo do Cabeçalho</label>
                                            <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={e => handleFileChange(e, setLogoUrlInput)} />
                                            <label htmlFor="logo-upload" className="cursor-pointer mt-1 w-full bg-slate-700 p-2 rounded-md text-white block text-center hover:bg-slate-600">Carregar Imagem</label>
                                            {logoUrlInput && <img src={logoUrlInput} alt="Preview Logo" className="mt-2 h-12 w-auto p-1 bg-slate-700 rounded"/>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">Banner Principal</label>
                                            <input type="file" id="banner-upload" className="hidden" accept="image/*" onChange={e => handleFileChange(e, setBannerUrlInput)} />
                                            <label htmlFor="banner-upload" className="cursor-pointer mt-1 w-full bg-slate-700 p-2 rounded-md text-white block text-center hover:bg-slate-600">Carregar Imagem</label>
                                            {bannerUrlInput && <img src={bannerUrlInput} alt="Preview Banner" className="mt-2 h-12 w-auto object-cover p-1 bg-slate-700 rounded"/>}
                                        </div>
                                    </div>

                                    <button onClick={handleSaveSettings} className="w-full mt-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-semibold">Guardar Configurações</button>
                               </div>
                                <div className="lg:col-span-2 bg-slate-900/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-orange-400 mb-2 text-lg border-b border-slate-700 pb-2">Gestão de Dados</h4>
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => exportToCsv(teams)} className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-500 text-sm font-semibold">Exportar CSV</button>
                                        <button onClick={onClearAll} className="py-2 px-4 bg-red-700 text-white rounded-lg hover:bg-red-600 text-sm font-semibold">Apagar Tudo</button>
                                    </div>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-4">Lista de Inscrições ({teams.length})</h3>
                            <div className="overflow-x-auto">
                                {teams.length > 0 ? (
                                <table className="w-full text-sm text-left text-gray-300">
                                    <thead className="text-xs text-gray-400 uppercase bg-slate-700">
                                        <tr>
                                            <th scope="col" className="px-4 py-3">#</th>
                                            <th scope="col" className="px-4 py-3">Equipa</th>
                                            <th scope="col" className="px-4 py-3">Atletas</th>
                                            <th scope="col" className="px-4 py-3">Contacto</th>
                                            <th scope="col" className="px-4 py-3">Estado</th>
                                            <th scope="col" className="px-4 py-3 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teams.map((team, index) => (
                                            <tr key={team.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                                <td className="px-4 py-2">{index + 1}</td>
                                                <td className="px-4 py-2 font-medium text-white">{team.teamName}</td>
                                                <td className="px-4 py-2">{team.a1}<br/>{team.a2}</td>
                                                <td className="px-4 py-2">{team.contactEmail}</td>
                                                <td className={`px-4 py-2 font-semibold ${team.status === 'inscrito' ? 'text-green-400' : 'text-yellow-400'}`}>{team.status}</td>
                                                <td className="px-4 py-2 flex gap-2 flex-wrap justify-center">
                                                    <button onClick={() => onDeleteTeam(team.id)} className="py-1 px-2 text-xs bg-red-600 hover:bg-red-500 rounded">Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                ) : (
                                    <p className="text-slate-400 text-center py-4">Ainda não há equipas inscritas. Seja o primeiro!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
