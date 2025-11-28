// src/components/perfilUser/components/TabSaldo.jsx
import React from 'react';

export default function TabSaldo() {
    return (
        <div className="p-6">
        <h3 className="text-lg font-semibold mb-6">Mi Saldo</h3>
        
        <div className="grid gap-6">
            {/* Saldo principal */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <p className="text-sm opacity-90">Monedas</p>
            <p className="text-3xl font-bold my-2">0.00</p>
            <button className="text-sm bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold">
                Obtener créditos
            </button>
            </div>

            {/* Secciones rápidas */}
            <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Recompensas</p>
                <p className="font-semibold">Saldo estimado</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Participación</p>
                <p className="font-semibold">BOB 0.00</p>
                <button className="text-blue-600 text-sm mt-1">Ver →</button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Ranking</p>
                <p className="text-xs text-gray-600">Transacciones</p>
                <p className="font-semibold text-sm">GC 0.00 →</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Estadística</p>
                <p className="text-xs text-gray-600">Oferta primera recarga</p>
            </div>
            </div>

            {/* Botón recargar */}
            <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold text-lg">
            Recargar →
            </button>
        </div>
        </div>
    );
}