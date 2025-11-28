// src/components/perfilUser/components/HeaderPerfil.jsx
import React from 'react';

export default function HeaderPerfil({ usuario }) {
    return (
        <div className="text-center">
        {/* Avatar */}
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl mx-auto mb-3">
            {usuario.nombre?.charAt(0) || 'U'}
        </div>
        
        {/* Información básica */}
        <h3 className="font-semibold text-gray-900">{usuario.nombre || 'Gustavo Herbas Andia'}</h3>
        <p className="text-sm text-gray-600">{usuario.correo || 'Gustavo_Herbas67@gmail.com'}</p>
        <p className="text-sm text-gray-600">+591 65558947</p>
        
        {/* Stats rápidos */}
        <div className="mt-4 p-3 bg-white rounded-lg border">
            <div className="flex justify-between text-sm mb-2">
            <span>Recomendado por</span>
            <span className="font-semibold">34%</span>
            </div>
            <div className="flex justify-between text-sm">
            <span>Ventas realizadas</span>
            <span className="font-semibold">3</span>
            </div>
            <div className="flex justify-between text-sm">
            <span>Intercambios</span>
            <span className="font-semibold">1</span>
            </div>
        </div>
        </div>
    );
}