
import React, { useState, useRef } from 'react';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const HelpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-2 text-gray-400 hover:text-white"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);


interface ControlsProps {
    onAddItem: () => void;
    onImport: (file: File) => void;
    onExportXLSX: () => void;
    onExportPDF: () => void;
}

const ImportHelpPopover: React.FC = () => (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-tertiary-dark text-gray-300 text-sm p-3 rounded-lg shadow-lg z-10 opacity-100 pointer-events-auto">
        <h4 className="font-bold text-white mb-2">XLSX Importformat</h4>
        <p>Ihre Tabelle muss die folgenden Spaltennamen in der ersten Zeile enthalten:</p>
        <ul className="list-disc list-inside mt-2 text-xs space-y-1">
            <li><span className="font-semibold">Name</span> (Text)</li>
            <li><span className="font-semibold">Gewicht</span> (Zahl)</li>
            <li><span className="font-semibold">Einheit</span> ('g' oder 'oz')</li>
            <li><span className="font-semibold">Typ</span> ('Münze' oder 'Barren')</li>
            <li><span className="font-semibold">Metall</span> ('Gold' oder 'Silber')</li>
            <li><span className="font-semibold">Reinheit</span> (Zahl, z.B. 999.9)</li>
            <li><span className="font-semibold">Kaufdatum</span> (YYYY-MM-DD)</li>
            <li><span className="font-semibold">Kaufpreis</span> (Zahl)</li>
            <li><span className="font-semibold">Anzahl</span> (Ganzzahl)</li>
            <li><span className="font-semibold">Prägedatum</span> (Text/Zahl)</li>
            <li><span className="font-semibold">Notizen</span> (Text)</li>
        </ul>
    </div>
);


const Controls: React.FC<ControlsProps> = ({ onAddItem, onImport, onExportXLSX, onExportPDF }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showHelp, setShowHelp] = useState(false);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
    };

    return (
        <div className="bg-secondary-dark p-4 rounded-lg shadow-xl flex flex-wrap gap-3 justify-between items-center">
            <h3 className="text-lg font-semibold text-white w-full sm:w-auto mb-3 sm:mb-0">Bestandsverwaltung</h3>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={onAddItem}
                    className="flex items-center justify-center bg-accent hover:bg-yellow-500 text-primary-dark font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md text-sm sm:text-base"
                >
                    <PlusIcon /> Posten Hinzufügen
                </button>
                <div className="relative flex items-center">
                    <button
                        onClick={handleImportClick}
                        className="flex items-center justify-center bg-tertiary-dark hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-l-lg transition-colors duration-200 shadow-md text-sm sm:text-base"
                    >
                        <UploadIcon /> XLSX Import
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />
                    <button 
                        onMouseEnter={() => setShowHelp(true)}
                        onMouseLeave={() => setShowHelp(false)}
                        className="bg-tertiary-dark hover:bg-gray-600 text-gray-200 font-bold py-2 px-2 rounded-r-lg transition-colors duration-200 shadow-md h-full flex items-center"
                    >
                         <HelpIcon />
                    </button>
                    {showHelp && <ImportHelpPopover />}
                </div>

                <button
                    onClick={onExportXLSX}
                    className="flex items-center justify-center bg-tertiary-dark hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md text-sm sm:text-base"
                >
                    <DownloadIcon /> XLSX Export
                </button>
                <button
                    onClick={onExportPDF}
                    className="flex items-center justify-center bg-tertiary-dark hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md text-sm sm:text-base"
                >
                    <DownloadIcon /> PDF Export
                </button>
            </div>
        </div>
    );
};

export default Controls;

