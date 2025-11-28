// src/components/perfilUser/PerfilUser.jsx
import React, { useState } from 'react';
import HeaderPerfil from './components/HeaderPerfil';
import TabSaldo from './components/TabSaldo';
import TabVentas from './components/TabVentas';
import TabCreditos from './components/TabCreditos';
import TabHistorial from './components/TabHistorial';

export default function PerfilUser({ usuario, onClose }) {
    const [tabActivo, setTabActivo] = useState('saldo');

    const tabs = [
        { id: 'saldo', label: 'Saldo' },
        { id: 'ventas', label: 'Ventas' },
        { id: 'creditos', label: 'Obtener Créditos' },
        { id: 'historial', label: 'Historial' }
    ];

    const renderTabContent = () => {
        switch (tabActivo) {
        case 'saldo':
            return <TabSaldo usuario={usuario} />;
        case 'ventas':
            return <TabVentas usuario={usuario} />;
        case 'creditos':
            return <TabCreditos usuario={usuario} />;
        case 'historial':
            return <TabHistorial usuario={usuario} />;
        default:
            return <TabSaldo usuario={usuario} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header con botón cerrar */}
            <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Mi Perfil</h2>
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
            >
                ✕
            </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
            {/* Sidebar con tabs */}
            <div className="w-48 bg-gray-50 border-r p-4">
                <HeaderPerfil usuario={usuario} />
                
                <nav className="mt-6 space-y-2">
                {tabs.map((tab) => (
                    <button
                    key={tab.id}
                    onClick={() => setTabActivo(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        tabActivo === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    >
                    {tab.label}
                    </button>
                ))}
                </nav>
            </div>

            {/* Contenido del tab activo */}
            <div className="flex-1 overflow-y-auto">
                {renderTabContent()}
            </div>
            </div>
        </div>
        </div>
    );
}