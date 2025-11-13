
import React, { useState, FormEvent, useEffect } from 'react';
import type { Team, TShirtSize } from '../types';
import { TShirtSizes } from '../types';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (team: Omit<Team, 'status' | 'timestamp' | 'id'>) => void;
    teamLimit: number;
    currentTeams: number;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onSubmit, teamLimit, currentTeams }) => {
    const [teamName, setTeamName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [a1, setA1] = useState('');
    const [a1t, setA1t] = useState<TShirtSize>('M');
    const [a1phone, setA1phone] = useState('');
    const [a2, setA2] = useState('');
    const [a2t, setA2t] = useState<TShirtSize>('M');
    const [a2phone, setA2phone] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto' };
    }, [isOpen]);

    const resetForm = () => {
        setTeamName('');
        setContactEmail('');
        setA1(''); setA1t('M'); setA1phone('');
        setA2(''); setA2t('M'); setA2phone('');
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const finalEmail = contactEmail.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!finalEmail) {
            alert('Por favor, insira o e-mail de contacto da equipa.');
            return;
        }

        if (!emailRegex.test(finalEmail)) {
            alert('O formato do e-mail de contacto é inválido.');
            return;
        }

        onSubmit({ 
            teamName, 
            contactEmail: finalEmail,
            a1, a1t, a1phone, 
            a2, a2t, a2phone,
        });
        resetForm();
    };

    if (!isOpen) return null;

    const isFull = currentTeams >= teamLimit;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Formulário de Inscrição</h2>
                        <p className="text-gray-400">
                            {isFull ? "As vagas estão preenchidas. A sua inscrição será como reserva." : "Preencha os dados da sua equipa."}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4 mb-6 bg-gray-900/50 p-4 rounded-lg">
                         <div>
                            <label htmlFor="teamName" className="block text-lg font-semibold text-white mb-2">Nome da Equipa</label>
                            <input type="text" id="teamName" value={teamName} onChange={e => setTeamName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                         </div>
                         <div className="pt-2">
                            <label htmlFor="contactEmail" className="block text-lg font-semibold text-white mb-2">E-mail de Contacto</label>
                            <input type="email" id="contactEmail" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="O e-mail principal para receber a confirmação"/>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-orange-400 border-b border-orange-400/30 pb-2">Atleta 1</h3>
                            <div><label className="text-gray-300">Nome Completo</label><input type="text" value={a1} onChange={e => setA1(e.target.value)} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/></div>
                            <div><label className="text-gray-300">Tamanho da T-shirt</label><select value={a1t} onChange={e => setA1t(e.target.value as TShirtSize)} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">{TShirtSizes.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            <div><label className="text-gray-300">Telefone</label><input type="tel" value={a1phone} onChange={e => setA1phone(e.target.value)} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/></div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-orange-400 border-b border-orange-400/30 pb-2">Atleta 2</h3>
                            <div><label className="text-gray-300">Nome Completo</label><input type="text" value={a2} onChange={e => setA2(e.target.value)} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/></div>
                            <div><label className="text-gray-300">Tamanho da T-shirt</label><select value={a2t} onChange={e => setA2t(e.target.value as TShirtSize)} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">{TShirtSizes.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            <div><label className="text-gray-300">Telefone</label><input type="tel" value={a2phone} onChange={e => setA2phone(e.target.value)} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/></div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-6 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500 transition-colors">Submeter Inscrição</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationModal;