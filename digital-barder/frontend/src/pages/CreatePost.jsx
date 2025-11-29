// src/pages/CreatePost.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../CreatePost.css';
import CategoryMenuCreatePost from '../CategoryMenuCreatePost';
import HorarioMenuCreatePost from '../HorarioMenuCreatePost';
import DireccionMenuCreatePost from '../DireccionMenuCreatePost';

const CreatePost = () => {
  // Estados para el cuadro de Título
  const [isEditingTitulo, setIsEditingTitulo] = useState(false);
  const [inputValueTitulo, setInputValueTitulo] = useState('');
  const inputRefTitulo = useRef(null);

  // Estados para el cuadro de Descripción
  const [isEditingDescripcion, setIsEditingDescripcion] = useState(false);
  const [inputValueDescripcion, setInputValueDescripcion] = useState('');
  const inputRefDescripcion = useRef(null);

  // Estados para el cuadro de Categoría
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categoriaRef = useRef(null);

  // Estados para el cuadro de Dirección
  const [showDireccionMenu, setShowDireccionMenu] = useState(false);
  const [selectedDireccion, setSelectedDireccion] = useState(null);
  const direccionRef = useRef(null);

  // Estados para el cuadro de Horario
  const [showHorarioMenu, setShowHorarioMenu] = useState(false);
  const [selectedHorarios, setSelectedHorarios] = useState({});
  const horarioRef = useRef(null);

  // Handlers para Título
  const handleTituloClick = () => {
    setIsEditingTitulo(true);
  };

  const handleTituloChange = (e) => {
    setInputValueTitulo(e.target.value);
  };

  const handleTituloBlur = () => {
    setIsEditingTitulo(false);
  };

  // Handlers para Descripción
  const handleDescripcionClick = () => {
    setIsEditingDescripcion(true);
  };

  const handleDescripcionChange = (e) => {
    setInputValueDescripcion(e.target.value);
  };

  const handleDescripcionBlur = () => {
    setIsEditingDescripcion(false);
  };

  // Handlers para Categoría
  const handleCategoriaClick = () => {
    setShowCategoryMenu(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryMenu(false);
  };

  // Handlers para Dirección
  const handleDireccionClick = () => {
    setShowDireccionMenu(true);
  };

  const handleDireccionSelect = (direccion) => {
    setSelectedDireccion(direccion);
    setShowDireccionMenu(false);
  };

  // Handlers para Horario
  const handleHorarioClick = () => {
    setShowHorarioMenu(true);
  };

  const handleHorarioSelect = (horarios) => {
    setSelectedHorarios(horarios);
    setShowHorarioMenu(false);
  };

  // Efectos para colocar el cursor al final
  useEffect(() => {
    if (isEditingTitulo && inputRefTitulo.current) {
      inputRefTitulo.current.focus();
      inputRefTitulo.current.setSelectionRange(inputValueTitulo.length, inputValueTitulo.length);
    }
  }, [isEditingTitulo, inputValueTitulo.length]);

  useEffect(() => {
    if (isEditingDescripcion && inputRefDescripcion.current) {
      inputRefDescripcion.current.focus();
      inputRefDescripcion.current.setSelectionRange(inputValueDescripcion.length, inputValueDescripcion.length);
    }
  }, [isEditingDescripcion, inputValueDescripcion.length]);

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  // Función para formatear el texto del horario seleccionado
  const getHorarioText = () => {
    const diasConHorario = Object.keys(selectedHorarios).filter(dia => selectedHorarios[dia]);
    if (diasConHorario.length === 0) return null;
    if (diasConHorario.length === 7) return 'Todos los días';
    return `${diasConHorario.length} días configurados`;
  };

  // Función para formatear el texto de la dirección seleccionada
  const getDireccionText = () => {
    if (!selectedDireccion) return null;
    const { calle, numero, colonia, ciudad, estado, codigoPostal } = selectedDireccion;
    if (!calle) return null;
    return `${calle} ${numero}, ${colonia}, ${ciudad}, ${estado} ${codigoPostal}`;
  };

  // Obtener posición del elemento
  const getPosition = (ref) => {
  if (ref.current) {
    const rect = ref.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8, // un poco debajo del cuadro
      left: rect.left
    };
  }
  return { top: 0, left: 0 };
};

  return (
      <div className="min-h-screen flex flex-col items-center justify-start pt-8 px-4" style={{ minHeight: '300vh' }}>
      {/* TÍTULO PRINCIPAL */}
      <h1 className="create-post-title title-size-xl">
        Crear Publicación
      </h1>

      {/* CUADRO DE TÍTULO */}
      <div 
        className="titulo-cuadro cuadro-width-medium" 
        style={{
          left: '-300px',
          top: '-35px'
        }}
        onClick={handleTituloClick}
      >
        <p className="titulo-texto">
          Titulo
        </p>
        
        {isEditingTitulo ? (
          <textarea
            ref={inputRefTitulo}
            className="titulo-input"
            value={inputValueTitulo}
            onChange={handleTituloChange}
            onBlur={handleTituloBlur}
            onKeyDown={(e) => handleKeyDown(e, handleTituloBlur)}
            rows={1}
          />
        ) : (
          inputValueTitulo && (
            <div className="titulo-ingresado-container">
              <p className="titulo-ingresado">{inputValueTitulo}</p>
            </div>
          )
        )}
      </div>

      {/* CUADRO DE DESCRIPCIÓN */}
      <div 
        className="descripcion-cuadro cuadro-width-medium" 
        style={{
          left: '-300px',
          top: '-10px'
        }}
        onClick={handleDescripcionClick}
      >
        <p className="descripcion-texto">
          Descripción
        </p>
        
        {isEditingDescripcion ? (
          <textarea
            ref={inputRefDescripcion}
            className="descripcion-input"
            value={inputValueDescripcion}
            onChange={handleDescripcionChange}
            onBlur={handleDescripcionBlur}
            onKeyDown={(e) => handleKeyDown(e, handleDescripcionBlur)}
            rows={1}
          />
        ) : (
          inputValueDescripcion && (
            <div className="descripcion-ingresado-container">
              <p className="descripcion-ingresado">{inputValueDescripcion}</p>
            </div>
          )
        )}
      </div>

      {/* CUADRO DE CATEGORÍA CON BOTÓN DROPDOWN */}
      <div 
        ref={categoriaRef}
        className="categoria-cuadro" 
        style={{
          left: '-505px',
          top: '14px'
        }}
      >
        <div className="categoria-header">
          <p className="categoria-texto">
            Categoría
          </p>
          <button 
            className="categoria-dropdown-btn"
            onClick={handleCategoriaClick}
          >
            {showCategoryMenu ? '▲' : '▼'}
          </button>
        </div>
        
        {selectedCategory ? (
          <p className="categoria-seleccionada">{selectedCategory}</p>
        ) : (
          <p className="categoria-placeholder">Selecciona una categoría</p>
        )}
      </div>

      {/* CUADRO DE DIRECCIÓN CON BOTÓN DROPDOWN */}
      <div 
        ref={direccionRef}
        className="direccion-cuadro" 
        style={{
          left: '-505px',
          top: '39px'
        }}
      >
        <div className="direccion-header">
          <p className="direccion-texto">
            Dirección
          </p>
          <button 
            className="direccion-dropdown-btn"
            onClick={handleDireccionClick}
          >
            {showDireccionMenu ? '▲' : '▼'}
          </button>
        </div>
        
        {getDireccionText() ? (
          <p className="direccion-seleccionada">{getDireccionText()}</p>
        ) : (
          <p className="direccion-placeholder">Ingresa tu dirección</p>
        )}
      </div>

      {/* CUADRO DE HORARIO DE ATENCIÓN */}
      <div 
        ref={horarioRef}
        className="horario-cuadro" 
        style={{
          left: '-135px',
          top: '-125px'
        }}
      >
        <div className="horario-header">
          <p className="horario-texto">
            Horario de atención
          </p>
          <button 
            className="horario-dropdown-btn"
            onClick={handleHorarioClick}
          >
            {showHorarioMenu ? '▲' : '▼'}
          </button>
        </div>
        
        {getHorarioText() ? (
          <p className="horario-seleccionado">{getHorarioText()}</p>
        ) : (
          <p className="horario-placeholder">Configura tu horario</p>
        )}
      </div>

      {/* Renderizado condicional de los menús */}
      {showCategoryMenu && (
        <CategoryMenuCreatePost 
          isOpen={showCategoryMenu} 
          onClose={() => setShowCategoryMenu(false)}
          onCategorySelect={handleCategorySelect}
          position={getPosition(categoriaRef)}
        />
      )}
{showDireccionMenu && (
  <DireccionMenuCreatePost 
    isOpen={showDireccionMenu} 
    onClose={() => setShowDireccionMenu(false)}
    onDireccionSelect={handleDireccionSelect}
    direccionSeleccionada={selectedDireccion}
    position={{
      top: getPosition(direccionRef).top+2,
      left: getPosition(direccionRef).left -20 // ← AQUÍ ajusta los px para dirección
    }}
  />
)}

      {showHorarioMenu && (
        <HorarioMenuCreatePost 
          isOpen={showHorarioMenu} 
          onClose={() => setShowHorarioMenu(false)}
          onHorarioSelect={handleHorarioSelect}
          horariosSeleccionados={selectedHorarios}
          position={getPosition(horarioRef)}
        />
      )}
    </div>
  );
};

export default CreatePost;