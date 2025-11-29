import React, { useState } from 'react';
import './HorarioMenuCreatePost.css';

const HorarioMenuCreatePost = ({ isOpen, onClose, onHorarioSelect, horariosSeleccionados, position }) => {
    const [horarios, setHorarios] = useState(horariosSeleccionados || {});

    if (!isOpen) return null;

    const diasSemana = [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo'
    ];

    const horas = Array.from({ length: 24 }, (_, i) => {
        const hora = i.toString().padStart(2, '0');
        return [`${hora}:00`, `${hora}:30`];
    }).flat();

    const handleHorarioChange = (dia, campo, valor) => {
        setHorarios(prev => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                [campo]: valor
            }
        }));
    };

    const handleGuardar = () => {
        onHorarioSelect(horarios);
        onClose();
    };

    const getHorarioDefault = (dia) => {
        return horarios[dia] || { apertura: '09:00', cierre: '18:00' };
    };

    return (
        <div className="horario-menu-createpost-overlay" onClick={onClose}>
            <div 
                className="horario-menu-createpost" 
                onClick={(e) => e.stopPropagation()}
                style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    animation: 'fadeInHorario 0.3s ease'
                }}
            >
                <div className="scroll-container-horario">
                    <h3 className="horario-title">Horario de Atención</h3>
                    
                    {diasSemana.map((dia) => (
                        <div key={dia} className="horario-dia">
                            <div className="horario-dia-header">
                                <span className="horario-dia-nombre">{dia}</span>
                            </div>
                            <div className="horario-selectores">
                                <div className="horario-selector">
                                    <label>Apertura:</label>
                                    <select
                                        value={getHorarioDefault(dia).apertura || '09:00'}
                                        onChange={(e) => handleHorarioChange(dia, 'apertura', e.target.value)}
                                        className="horario-select"
                                    >
                                        {horas.map(hora => (
                                            <option key={`${dia}-apertura-${hora}`} value={hora}>
                                                {hora}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="horario-selector">
                                    <label>Cierre:</label>
                                    <select
                                        value={getHorarioDefault(dia).cierre || '18:00'}
                                        onChange={(e) => handleHorarioChange(dia, 'cierre', e.target.value)}
                                        className="horario-select"
                                    >
                                        {horas.map(hora => (
                                            <option key={`${dia}-cierre-${hora}`} value={hora}>
                                                {hora}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="horario-actions">
                        <button className="horario-guardar-btn" onClick={handleGuardar}>
                            Guardar Horario
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HorarioMenuCreatePost;