import React, { useState, FormEvent, useEffect } from 'react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; title: string; email: string }) => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto' };
    }, [isOpen]);

    const resetForm = () => {
        setName('');
        setTitle('');
        setEmail('');
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const finalEmail = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name.trim() || !title.trim() || !finalEmail) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (!emailRegex.test(finalEmail)) {
            alert('O formato do e-mail de contacto é inválido.');
            return;
        }

        onSubmit({ name: name.trim(), title: title.trim(), email: finalEmail });
        resetForm();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Contactar a Organização</h2>
                        <p className="text-gray-400">Envie-nos a sua dúvida ou sugestão.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="contactName" className="block text-sm font-medium text-gray-300 mb-1">O seu Nome</label>
                            <input type="text" id="contactName" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                        </div>
                        <div>
                            <label htmlFor="contactTitle" className="block text-sm font-medium text-gray-300 mb-1">Assunto</label>
                            <input type="text" id="contactTitle" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                        </div>
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-1">O seu E-mail de Contacto</label>
                            <input type="email" id="contactEmail" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="Para podermos responder-lhe"/>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-6 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500 transition-colors">Enviar Mensagem</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactModal;
