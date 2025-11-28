// src/components/perfilUser/components/TabCreditos.jsx
import React, { useState } from 'react';

export default function TabCreditos() {
    const [metodoPago, setMetodoPago] = useState('');

    const planesRecarga = [
        { creditos: 15, precio: 'Bs 7.00' },
        { creditos: 250, precio: 'Bs 175.90' }
    ];

    const paquetes = [
        { tipo: 'Publicidad', precio: 'Bs 18.60' }
    ];

    const planes = [
        { tipo: 'Semanal', precio: 'Bs 26.90' },
        { tipo: 'Mensual', precio: 'Bs 55.90' }
    ];

    const metodosPago = ['Banca', 'Tigo', 'Money'];

    return (
        <div className="p-6">
        <h3 className="text-lg font-semibold mb-6">Obtener Créditos</h3>

        <div className="grid md:grid-cols-2 gap-6">
            {/* Columna izquierda - Opciones de compra */}
            <div className="space-y-6">
            {/* Recarga Monedas */}
            <div>
                <h4 className="font-semibold mb-3">Recarga Monedas</h4>
                <div className="space-y-2">
                {planesRecarga.map((plan, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{plan.creditos} créditos</span>
                    <span className="font-semibold">{plan.precio}</span>
                    </div>
                ))}
                </div>
            </div>

            {/* Paquetes */}
            <div>
                <h4 className="font-semibold mb-3">Paquete</h4>
                {paquetes.map((paquete, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{paquete.tipo}</span>
                    <span className="font-semibold">{paquete.precio}</span>
                </div>
                ))}
            </div>

            {/* Planes */}
            <div>
                <h4 className="font-semibold mb-3">Plan</h4>
                {planes.map((plan, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{plan.tipo}</span>
                    <span className="font-semibold">{plan.precio}</span>
                </div>
                ))}
            </div>
            </div>

            {/* Columna derecha - Resumen y pago */}
            <div className="space-y-6">
            {/* Saldo actual */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Saldo</h4>
                <div className="flex justify-between items-center">
                <span>25 créditos</span>
                <span className="font-semibold">Bs 69.99</span>
                </div>
            </div>

            {/* Métodos de pago */}
            <div>
                <h4 className="font-semibold mb-3">Seleccione forma de pago</h4>
                <div className="space-y-2">
                {metodosPago.map((metodo) => (
                    <button
                    key={metodo}
                    onClick={() => setMetodoPago(metodo)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                        metodoPago === metodo ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    >
                    {metodo}
                    </button>
                ))}
                </div>
            </div>

            {/* QR */}
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
                <p className="font-semibold mb-2">Generar QR</p>
                <p className="text-sm text-gray-600">Paga por: BNB, Yape...</p>
            </div>

            {/* Botón comprar */}
            <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold text-lg">
                Comprar Ahora
            </button>
            </div>
        </div>
        </div>
    );
}