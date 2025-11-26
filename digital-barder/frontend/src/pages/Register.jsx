import React, { useState } from 'react';
import DateSelect from '../components/DateSelect/DateSelect';
import '../Register.css';

const Register = () => {
    // Estados para los selects de fecha
    const [dia, setDia] = useState('');
    const [mes, setMes] = useState('');
    const [ano, setAno] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');

    // Generar opciones para días (1-31)
    const diasOptions = Array.from({ length: 31 }, (_, i) => ({
        value: (i + 1).toString(),
        label: (i + 1).toString()
    }));
    
    // Opciones para meses
    const mesesOptions = [
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
    ];

    // Generar opciones para años (2025 hasta 1900 en orden descendente)
    const añosOptions = Array.from({ length: 126 }, (_, i) => ({
        value: (2025 - i).toString(),
        label: (2025 - i).toString()
    }));

    // Opciones para tipo de usuario
    const tipoUsuarioOptions = [
        { value: 'comun', label: 'Comun' },
        { value: 'emprendedor', label: 'Emprendedor' },
        { value: 'emprendedorOng', label: 'Emprendedor ONG' }
    ];

    return (
        <div className="min-h-screen w-full flex flex-col items-center py-4 px-6 overflow-x-hidden">
            {/* FORMULARIO DE REGISTRO */}
            <div className="flex-1 flex flex-col items-center justify-center mt-8">
                <div className="register-form-container">
                    <h1 className="register-title">Crea una Cuenta</h1>
                    
                    <form id="register-form" className="w-full">
                        {/* Fila 1: Nombre y Apellidos */}
                        <div className="form-row">
                            <div className="flex gap-4">
                                <div className="flex-1 input-container">
                                    <input 
                                        type="text" 
                                        id="nombre" 
                                        name="nombre" 
                                        className="form-input custom-input"
                                        placeholder="Nombre"
                                        required 
                                    />
                                </div>
                                <div className="flex-1 input-container">
                                    <input 
                                        type="text" 
                                        id="apellidos" 
                                        name="apellidos" 
                                        className="form-input custom-input"
                                        placeholder="Apellidos"
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fila 2: Fecha de nacimiento */}
                        <div className="form-row">
                            <div className="section-label-container">
                                <label className="section-label">Fecha de nacimiento</label>
                            </div>
                            <div className="birthday-group">
                                {/* DÍA - COMPONENTE PERSONALIZADO */}
                                <DateSelect
                                    options={diasOptions}
                                    placeholder="Día"
                                    value={dia}
                                    onChange={setDia}
                                    type="dia"
                                />
                                
                                {/* MES - COMPONENTE PERSONALIZADO */}
                                <DateSelect
                                    options={mesesOptions}
                                    placeholder="Mes"
                                    value={mes}
                                    onChange={setMes}
                                    type="mes"
                                />
                                
                                {/* AÑO - COMPONENTE PERSONALIZADO */}
                                <DateSelect
                                    options={añosOptions}
                                    placeholder="Año"
                                    value={ano}
                                    onChange={setAno}
                                    type="ano"
                                />
                            </div>
                        </div>

                        {/* Fila 3: Género y Tipo Usuario */}
                        <div className="form-row">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="section-label-container">
                                        <label className="section-label">Género</label>
                                    </div>
                                    <div className="radio-group">
                                        <label className="radio-option custom-input" htmlFor="hombre">
                                            <span className="radio-label">Hombre</span>
                                            <input type="radio" id="hombre" name="genero" value="hombre" />
                                        </label>
                                        <label className="radio-option custom-input" htmlFor="mujer">
                                            <span className="radio-label">Mujer</span>
                                            <input type="radio" id="mujer" name="genero" value="mujer" />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="section-label-container">
                                        <label className="section-label">Tipo Usuario</label>
                                    </div>
                                    {/* TIPO USUARIO - COMPONENTE PERSONALIZADO */}
                                    <DateSelect
                                        options={tipoUsuarioOptions}
                                        placeholder="Emprendedor"
                                        value={tipoUsuario}
                                        onChange={setTipoUsuario}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fila 4: Contacto */}
                        <div className="form-row">
                            <div className="input-container">
                                <input 
                                    type="text" 
                                    id="contacto" 
                                    name="contacto" 
                                    className="form-input custom-input"
                                    placeholder="Número de móvil o correo electrónico"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Fila 5: Contraseña y Confirmar */}
                        <div className="form-row">
                            <div className="flex gap-4">
                                <div className="flex-1 input-container">
                                    <input 
                                        type="password" 
                                        id="password" 
                                        name="password" 
                                        className="form-input custom-input"
                                        placeholder="Contraseña"
                                        required 
                                    />
                                </div>
                                <div className="flex-1 input-container">
                                    <input 
                                        type="password" 
                                        id="confirm-password" 
                                        name="confirm-password" 
                                        className="form-input custom-input"
                                        placeholder="Confirmar contraseña"
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botón Registrar */}
                        <button 
                            type="submit" 
                            className="btn-register custom-button"
                        >
                            Registrar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;