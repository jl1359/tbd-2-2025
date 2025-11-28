// src/components/perfilUser/components/TabVentas.jsx
import React from 'react';

export default function TabVentas() {
    return (
        <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Mis Ventas</h3>
            <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                Buscar
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">
                Green Credits
            </button>
            </div>
        </div>

        {/* Historial de ventas */}
        <div className="space-y-4">
            <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div>
                <p className="font-semibold">Plan Semanal</p>
                <p className="text-sm text-gray-600">Gustavo Herbas Andía</p>
                <p className="text-sm text-gray-600">Nueva Recarga</p>
                </div>
                <div className="text-right">
                <p className="font-semibold">26.90 BS</p>
                <p className="text-sm text-yellow-600">Pago en curso</p>
                <p className="text-xs text-gray-500">20-11-2025 10:35:30</p>
                </div>
            </div>
            <button className="w-full mt-3 py-2 border border-red-500 text-red-500 rounded-lg text-sm">
                Cancelar pedido ahora
            </button>
            </div>

            <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div>
                <p className="font-semibold">Green Credits</p>
                <p className="text-sm text-gray-600">Plan Semanal</p>
                <p className="text-sm text-gray-600">Gustavo Herbas Andía</p>
                </div>
                <div className="text-right">
                <p className="font-semibold">26.90 BS</p>
                <p className="text-sm text-green-600">Enviado</p>
                <p className="text-xs text-gray-500">20-11-2025 08:25:01</p>
                </div>
            </div>
            <button className="w-full mt-3 py-2 border border-red-500 text-red-500 rounded-lg text-sm">
                Cancelar pedido ahora
            </button>
            </div>
        </div>
        </div>
    );
}