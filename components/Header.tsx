import React from 'react';

interface HeaderProps {
    onAdminClick: () => void;
    logoUrl: string;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick, logoUrl }) => {
    return (
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-6">
            <div className="flex items-center gap-4">
                <img src={logoUrl} alt="Logo Angola Padel 50" className="h-20 w-auto" />
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                        Padel Angola 50 Anos
                    </h1>
                    <p className="text-sm text-gray-400">Torneio Comemorativo da Independência</p>
                </div>
            </div>
            <button
                onClick={onAdminClick}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 w-full sm:w-auto"
            >
                Área do Administrador
            </button>
        </header>
    );
};

export default Header;