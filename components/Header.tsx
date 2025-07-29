
import React from 'react';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

interface HeaderProps {
    onAddItem: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddItem }) => {
    return (
        <header className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-tertiary-dark">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Münz<span className="text-accent">tracker</span>
            </h1>
            <button
                onClick={onAddItem}
                className="mt-4 sm:mt-0 flex items-center justify-center bg-accent hover:bg-yellow-500 text-primary-dark font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
            >
                <PlusIcon />
                Posten Hinzufügen
            </button>
        </header>
    );
};

export default Header;
