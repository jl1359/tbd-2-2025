// src/components/perfilUser/components/TabHistorial.jsx
import React from 'react';

export default function TabHistorial() {
    const secciones = [
        { titulo: 'Recompensas', descripcion: 'Historial de recompensas obtenidas' },
        { titulo: 'Participación', descripcion: 'Eventos y actividades' },
        { titulo: 'Ranking', descripcion: 'Posición y progreso' },
        { titulo: 'Estadística', descripcion: 'Métricas y análisis' }
    ];

    return (
        <div className="p-6">
        <h3 className="text-lg font-semibold mb-6">Historial</h3>
        
        <div className="grid gap-4">
            {secciones.map((seccion, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900">{seccion.titulo}</h4>
                <p className="text-sm text-gray-600 mt-1">{seccion.descripcion}</p>
                <button className="mt-3 text-blue-600 text-sm font-semibold">
                Ver detalles →
                </button>
            </div>
            ))}
        </div>
        </div>
    );
}