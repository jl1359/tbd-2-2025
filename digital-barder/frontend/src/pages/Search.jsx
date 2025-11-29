import React, { useState, useRef } from 'react';
import '../Search.css';
import CategoryMenu from '../CategoryMenu';

const Search = () => {
    const [activeCategory, setActiveCategory] = useState('crear-publicacion');
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [selectedCategoryType, setSelectedCategoryType] = useState(null);
    const sliderRef1 = useRef(null);
    const sliderRef2 = useRef(null);

    const categories = [
        { id: 'crear-publicacion', name: 'Crear Publicación' },
        { id: 'tiendas', name: 'Tiendas' },
        { id: 'campañas', name: 'Campañas' }
    ];

    // Primer nivel: Tipo de categoría
    const categoryTypes = [
        { id: 'productos', name: 'Productos' },
        { id: 'servicios', name: 'Servicios' }
    ];

    // Segundo nivel: Categorías específicas
    const productCategories = [
        { id: 'electronicos', name: 'Electrónicos' },
        { id: 'ropa', name: 'Ropa' },
        { id: 'hogar', name: 'Hogar' },
        { id: 'deportes', name: 'Deportes' },
        { id: 'libros', name: 'Libros' },
        { id: 'musica', name: 'Música' },
        { id: 'juguetes', name: 'Juguetes' },
        { id: 'belleza', name: 'Belleza' },
        { id: 'automotriz', name: 'Automotriz' }
    ];

    const serviceCategories = [
        { id: 'consultoria', name: 'Consultoría' },
        { id: 'diseno', name: 'Diseño' },
        { id: 'educacion', name: 'Educación' },
        { id: 'salud', name: 'Salud' },
        { id: 'reparaciones', name: 'Reparaciones' },
        { id: 'transporte', name: 'Transporte' },
        { id: 'eventos', name: 'Eventos' },
        { id: 'limpieza', name: 'Limpieza' }
    ];

    const scrollLeft = (sliderRef) => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = (sliderRef) => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const handleCategoryTypeSelect = (type) => {
        setSelectedCategoryType(type);
    };

    const getCurrentSubCategories = () => {
        if (selectedCategoryType === 'productos') {
            return productCategories;
        } else if (selectedCategoryType === 'servicios') {
            return serviceCategories;
        }
        return [];
    };

    return (
        <div className="search-page">
            {/* CUADRO GC EN ESQUINA SUPERIOR DERECHA */}
            <div className="gc-container">
                <div className="gc-content">
                    <div className="gc-icon-container">
                        <img 
                            src="/images/Hdorado.png" 
                            alt="GC Icon" 
                            className="gc-icon"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="gc-icon-placeholder" style={{display: 'none'}}>
                            <span>GC</span>
                        </div>
                    </div>
                    <div className="gc-amount">
                        GC 0.00
                    </div>
                    <button className="gc-add-btn">
                        <span className="plus-symbol">+</span>
                    </button>
                </div>
            </div>

            {/* CONTENEDOR GRID PRINCIPAL */}
            <div className="search-grid-container">
                
                {/* BARRA DE BÚSQUEDA */}
                <div className="search-box-absolute" style={{
                    top: '20px',    
                    left: '16%',
                    transform: 'translateX(-50%)'
                }}>
                    <input 
                        type="text"
                        placeholder="Buscar..."
                        className="search-input"
                    />
                </div>

                {/* TÍTULO CATEGORÍA */}
                <div className="category-title-container" style={{marginTop: "20px", marginLeft: "-100px"}}>
                    <div className="category-title-box">
                        <span>Categoría</span>
                        <button 
                            className="dropdown-toggle"
                            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                        >
                            {showCategoryMenu ? '▲' : '▼'}
                        </button>
                    </div>
                </div>

                {/* COMPONENTE DEL MENÚ DE CATEGORÍAS */}
                {showCategoryMenu && (
                    <CategoryMenu
                        isOpen={showCategoryMenu}
                        onClose={() => setShowCategoryMenu(false)}
                    />
                )}


                {/* BOTONES DE CATEGORÍA PRINCIPALES */}
                <div className="categories-container" style={{marginTop: "5px"}}>
                    <button
                        className={`category-btn ${activeCategory === 'crear-publicacion' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('crear-publicacion')}
                        style={{ 
                            marginLeft: "-710px",
                            marginTop: "-10px"
                        }}
                    >
                        Crear Publicación
                    </button>

                    <button
                        className={`category-btn ${activeCategory === 'tiendas' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('tiendas')}
                        style={{ 
                            marginLeft: "20px",
                            marginTop: "-10px"
                        }}
                    >
                        Tiendas
                    </button>

                    <button
                        className={`category-btn ${activeCategory === 'campañas' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('campañas')}
                        style={{ 
                            marginLeft: "20px",
                            marginTop: "-10px"
                        }}
                    >
                        Campañas
                    </button>
                </div>

                {/* PERFIL DE USUARIO */}
                <div className="profile-container" style={{marginLeft: "660px", marginTop: "-150px"}}>
                    <div className="profile-content">
                        {/* Campanita de notificaciones */}
                        <div className="notification-bell">
                            <div className="bell-icon-container">
                                <img 
                                    src="/images/notifi.png" 
                                    alt="Notificaciones" 
                                    className="bell-icon"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="bell-icon-placeholder" style={{display: 'none'}}>
                                    <span>🔔</span>
                                </div>
                            </div>
                        </div>

                        {/* Foto de perfil */}
                        <div className="profile-img-container">
                            <img 
                                src="/images/TomCruise.png" 
                                alt="Profile" 
                                className="profile-img"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div className="profile-placeholder" style={{display: 'none'}}>
                                <span>TC</span>
                            </div>
                        </div>

                        {/* Nombre del usuario */}
                        <div className="profile-name-side">
                            Gustavo Herbas Andia
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DE CUADROS CON POSICIÓN INTERNA PERSONALIZABLE */}
                <div className="boxes-section" style={{ transform: 'translateX(-50px)' }}>
                    {/* Primera fila con 3 cuadros */}
                    <div className="boxes-row first-row">
                        <div className="content-box box-1">
                            <div className="service-card">
                                {/* IMAGEN AGREGADA - SIN MODIFICAR POSICIONES EXISTENTES */}
                                <div style={{
                                    position: 'absolute',
                                    top: '0px',
                                    left: '0px',
                                    right: '0px',
                                    height: '205px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '2px solid #E9FFD9'
                                }}>
                                    <img 
                                        src="/images/carpinteria.png" 
                                        alt="Servicio de Carpintería"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            // Puedes agregar un placeholder si lo deseas
                                        }}
                                    />
                                </div>

        {/* TODOS LOS ELEMENTOS ORIGINALES MANTENIENDO SUS POSICIONES EXACTAS */}
        <div className="service-card-header" style={{ position: 'absolute', left: '20px', top: '-5px' }}>
            <span className="service-pill-category" style={{ position: 'relative', left: '-10px', top:"220px" }}>
                Carpintería
            </span>
            <span className="service-type-text" style={{ position: 'relative', left: '15px',top:"215px" }}>
                Servicio
            </span>
        </div>

        <h3 className="service-title" style={{ 
            position: 'absolute', 
            left: '15px', 
            top: '250px',
            margin: 0,
            fontSize: '21px',
            fontWeight: '600'
        }}>
            Se brinda Servicio de Carpintería
        </h3>

        <div className="service-row" style={{ position: 'absolute', left: '0px', top: '300px' }}>
            <div className="service-icon-circle">
                <img src="/images/hora.png" alt="Horario" className="service-icon-image" />
            </div>
            <span className="service-open-label" style={{ position: 'relative', left: '5px' }}>
                Abierto ahora
            </span>
        </div>

        <div className="service-row" style={{ position: 'absolute', left: '0px', top: '325px' }}>
            <div className="service-icon-circle">
                <img src="/images/ubi.png" alt="Ubicación" className="service-icon-image" />
            </div>
            <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                Santa Cruz, Urubo
            </span>
        </div>

        <div className="service-row" style={{ position: 'absolute', left: '0px', top: '350px' }}>
            <div className="service-icon-circle">
                <img src="/images/intercamb.png" alt="Intercambio" className="service-icon-image" />
            </div>
            <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                Intercambios: 
            </span>
            <span className="service-open-label2" style={{ position: 'relative', left: '5px' }}>
                No Activo
            </span>
        </div>

        <div className="service-row" style={{ position: 'absolute', left: '0px', top: '375px' }}>
            <div className="service-icon-circle">
                <img src="/images/star.png" alt="Recomendación" className="service-icon-image" />
            </div>
            <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                Recomendado por el 64% (29 opiniones)
            </span>
        </div>

        <div className="service-credits" style={{ position: 'absolute', right: '30px', top: '350px' }}>
            <span className="service-credits-number" style={{ position: 'relative', left: '15px',top:'20px' }}>
                32
            </span>
            <span className="service-credits-label" style={{ position: 'relative', left: '30px',top:'20px' }}>
                Green Credits
            </span>
        </div>

        <button className="service-link" style={{ 
            position: 'absolute', 
            top:'450px',
            left: '140px', 
            bottom: '25px',
            fontSize: '21px',
            fontWeight: '600'
        }}>
            Ver Detalle
        </button>
    </div>
</div>
                        
                        {/* Los otros cuadros siguen el mismo patrón con diferentes contenidos */}
                        <div className="content-box box-2">
                            <div className="service-card">
                                <div style={{
                                    position: 'absolute',
                                    top: '0px',
                                    left: '0px',
                                    right: '0px',
                                    height: '205px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '2px solid #E9FFD9'
                                }}>
                                    <img 
                                        src="/images/camera.png" 
                                        alt="Servicio de Carpintería"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            // Puedes agregar un placeholder si lo deseas
                                        }}
                                    />
                                </div>
                                {/* FILA SUPERIOR: categoría y tipo - POSICIONES PERSONALIZABLES */}
                                <div className="service-card-header" style={{ position: 'absolute', left: '20px', top: '-5px' }}>
                                    <span className="service-pill-category" style={{ position: 'relative', left: '-10px', top:"220px" }}>
                                        Electrónico
                                    </span>
                                    <span className="service-type-text" style={{ position: 'relative', left: '15px',top:"215px" }}>
                                        9/10
                                    </span>
                                </div>

                                {/* TÍTULO - POSICIÓN PERSONALIZABLE */}
                                <h3 className="service-title" style={{ 
                                    position: 'absolute', 
                                    left: '15px', 
                                    top: '250px',
                                    margin: 0,
                                    fontSize: '21px',
                                    fontWeight: '600'
                                }}>
                                    Cámara - Sony
                                </h3>

                                {/* UBICACIÓN - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '325px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/ubi.png" alt="Ubicación" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Santa Cruz, Equipetrol
                                    </span>
                                </div>

                                {/* INTERCAMBIO ACTIVO - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '350px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/intercamb.png" alt="Intercambio" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Intercambios:
                                    </span>
                                    <span className="service-open-label2" style={{ position: 'relative', left: '5px' }}>
                                        No Activo
                                    </span>
                                </div>

                                {/* RECOMENDACIÓN - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '375px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/star.png" alt="Recomendación" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Recomendado por el 64% (29 opiniones)
                                    </span>
                                </div>

                                {/* GREEN CREDITS - POSICIÓN PERSONALIZABLE */}
                                <div className="service-credits" style={{ position: 'absolute', right: '30px', top: '350px' }}>
                                    <span className="service-credits-number" style={{ position: 'relative', left: '15px',top:'20px' }}>
                                        32
                                    </span>
                                    <span className="service-credits-label" style={{ position: 'relative', left: '30px',top:'20px' }}>
                                        Green Credits
                                    </span>
                                </div>

                                {/* VER DETALLE - POSICIÓN PERSONALIZABLE */}
                                <button className="service-link" style={{ 
                                    position: 'absolute', 
                                    top:'450px',
                                    left: '140px', 
                                    bottom: '25px',
                                    fontSize: '21px',
                                    fontWeight: '600'
                                }}>
                                    Ver Detalle
                                </button>
                            </div>
                        </div>
                        
                        <div className="content-box box-3">
                            <div className="service-card">
                                <div style={{
                                    position: 'absolute',
                                    top: '0px',
                                    left: '0px',
                                    right: '0px',
                                    height: '205px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '2px solid #E9FFD9'
                                }}>
                                    <img 
                                        src="/images/ropa.png" 
                                        alt="Servicio de Carpintería"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            // Puedes agregar un placeholder si lo deseas
                                        }}
                                    />
                                </div>
                                {/* FILA SUPERIOR: categoría y tipo - POSICIONES PERSONALIZABLES */}
                                <div className="service-card-header" style={{ position: 'absolute', left: '20px', top: '-5px' }}>
                                    <span className="service-pill-category" style={{ position: 'relative', left: '-10px', top:"220px" }}>
                                        Ropa
                                    </span>
                                    <span className="service-type-text" style={{ position: 'relative', left: '15px',top:"215px" }}>
                                        8/10
                                    </span>
                                </div>

                                {/* TÍTULO - POSICIÓN PERSONALIZABLE */}
                                <h3 className="service-title" style={{ 
                                    position: 'absolute', 
                                    left: '15px', 
                                    top: '250px',
                                    margin: 0,
                                    fontSize: '21px',
                                    fontWeight: '600'
                                }}>
                                    Conjunto casual North-Face
                                </h3>

                                {/* UBICACIÓN - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '325px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/ubi.png" alt="Ubicación" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Cochabamba, Cercado
                                    </span>
                                </div>

                                {/* INTERCAMBIO ACTIVO - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '350px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/intercamb.png" alt="Intercambio" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Intercambios:
                                    </span>
                                    <span className="service-open-label" style={{ position: 'relative', left: '5px' }}>
                                        Activo
                                    </span>
                                </div>

                                {/* RECOMENDACIÓN - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '375px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/star.png" alt="Recomendación" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Recomendado por el 34% (10 opiniones)
                                    </span>
                                </div>

                                {/* GREEN CREDITS - POSICIÓN PERSONALIZABLE */}
                                <div className="service-credits" style={{ position: 'absolute', right: '30px', top: '350px' }}>
                                    <span className="service-credits-number" style={{ position: 'relative', left: '15px',top:'20px' }}>
                                        32
                                    </span>
                                    <span className="service-credits-label" style={{ position: 'relative', left: '30px',top:'20px' }}>
                                        Green Credits
                                    </span>
                                </div>

                                {/* VER DETALLE - POSICIÓN PERSONALIZABLE */}
                                <button className="service-link" style={{ 
                                    position: 'absolute', 
                                    top:'450px',
                                    left: '140px', 
                                    bottom: '25px',
                                    fontSize: '21px',
                                    fontWeight: '600'
                                }}>
                                    Ver Detalle
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Segunda fila con 2 cuadros */}
                    <div className="boxes-row second-row">
                        {/* CUADRO DE PUBLICIDAD AGREGADO */}
                            <div className="advertisement-box" style={{
                                position: 'absolute',
                                left: '-20px',
                                top: '0px',
                                transform: 'translateY(-50%)',
                                backgroundColor: '#ff0000',
                                color: 'white',
                                padding: '20px',
                                borderRadius: '8px',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                width: '180px',
                                height: '0px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                zIndex: 10,
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                            }}>
                                PUBLICIDAD
                            </div>
                            <div className="advertisement-box" style={{
                                position: 'absolute',
                                left: '460px',
                                top: '0px',
                                transform: 'translateY(-50%)',
                                backgroundColor: '#ff0000',
                                color: 'white',
                                padding: '20px',
                                borderRadius: '8px',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                width: '180px',
                                height: '0px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                zIndex: 10,
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                            }}>
                                PUBLICIDAD
                            </div>
                        <div className="content-box box-4">
                            <div className="service-card">
                                <div style={{
                                    position: 'absolute',
                                    top: '0px',
                                    left: '0px',
                                    right: '0px',
                                    height: '205px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '2px solid #E9FFD9'
                                }}>
                                    <img 
                                        src="/images/viva.png" 
                                        alt="Servicio de Carpintería"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            // Puedes agregar un placeholder si lo deseas
                                        }}
                                    />
                                </div>
                                {/* FILA SUPERIOR: categoría y tipo - POSICIONES PERSONALIZABLES */}
                                <div className="service-card-header" style={{ position: 'absolute', left: '20px', top: '-5px' }}>
                                    <span className="service-pill-category" style={{ position: 'relative', left: '-10px', top:"220px" }}>
                                        Tecnología
                                    </span>
                                    <span className="service-pilll-category" style={{ position: 'relative', left: '-170px', top:"220px" }}>
                                        Compania
                                    </span>
                                </div>

                                {/* TÍTULO - POSICIÓN PERSONALIZABLE */}
                                <h3 className="service-title" style={{ 
                                    position: 'absolute', 
                                    left: '15px', 
                                    top: '250px',
                                    margin: 0,
                                    fontSize: '21px',
                                    fontWeight: '600'
                                }}>
                                    Elije un plan para tu hogar.
                                </h3>

                                {/* ABIERTO AHORA - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '300px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/hora.png" alt="Horario" className="service-icon-image" />
                                    </div>
                                    <span className="service-open-label" style={{ position: 'relative', left: '5px' }}>
                                        Abierto ahora
                                    </span>
                                </div>

                                {/* UBICACIÓN - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '325px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/ubi.png" alt="Ubicación" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Cochabamba, Av. Santa Cruz
                                    </span>
                                </div>

                                {/* RECOMENDACIÓN - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '350px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/star.png" alt="Recomendación" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Recomendado por el 87% (301 opiniones)
                                    </span>
                                </div>

                                {/* GREEN CREDITS - POSICIÓN PERSONALIZABLE */}
                                <div className="service-credits" style={{ position: 'absolute', right: '30px', top: '350px' }}>
                                    <span className="service-credits-number" style={{ position: 'relative', left: '15px',top:'20px' }}>
                                        32
                                    </span>
                                    <span className="service-credits-label" style={{ position: 'relative', left: '30px',top:'20px' }}>
                                        Green Credits
                                    </span>
                                </div>

                                {/* VER DETALLE - POSICIÓN PERSONALIZABLE */}
                                <button className="service-link" style={{ 
                                    position: 'absolute', 
                                    top:'450px',
                                    left: '155px', 
                                    bottom: '25px',
                                    fontSize: '21px',
                                    fontWeight: '600'
                                }}>
                                    Visitar
                                </button>
                            </div>
                        </div>
                        
                        <div className="content-box box-5">
                            <div className="service-card">
                                <div style={{
                                    position: 'absolute',
                                    top: '0px',
                                    left: '0px',
                                    right: '0px',
                                    height: '205px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '2px solid #E9FFD9'
                                }}>
                                    <img 
                                        src="/images/tienda.png" 
                                        alt="Servicio de Carpintería"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            // Puedes agregar un placeholder si lo deseas
                                        }}
                                    />
                                </div>
                                {/* FILA SUPERIOR: categoría y tipo - POSICIONES PERSONALIZABLES */}
                                <div className="service-card-header" style={{ position: 'absolute', left: '20px', top: '-5px' }}>
                                    <span className="service-pill-category" style={{ position: 'relative', left: '-10px', top:"220px" }}>
                                        Carpintería
                                    </span>
                                    <span className="service-pilo-category" style={{ position: 'relative', left: '-185px', top:"220px" }}>
                                        Galeria
                                    </span>
                                </div>

                                {/* TÍTULO - POSICIÓN PERSONALIZABLE */}
                                <h3 className="service-title" style={{ 
                                    position: 'absolute', 
                                    left: '15px', 
                                    top: '250px',
                                    margin: 0,
                                    fontSize: '21px',
                                    fontWeight: '600'
                                }}>
                                    Nueva Colección Otoño/Invierno.
                                    Visítanos en nuestras sucursales.
                                </h3>

                                {/* ABIERTO AHORA - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '315px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/hora.png" alt="Horario" className="service-icon-image" />
                                    </div>
                                    <span className="service-open-label" style={{ position: 'relative', left: '5px' }}>
                                        Abierto ahora
                                    </span>
                                </div>

                                {/* UBICACIÓN - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '340px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/ubi.png" alt="Ubicación" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Cochabamba, Av. Santa Cruz, Av. América
                                    </span>
                                </div>

                                {/* RECOMENDACIÓN - POSICIÓN PERSONALIZABLE */}
                                <div className="service-row" style={{ position: 'absolute', left: '0px', top: '365px' }}>
                                    <div className="service-icon-circle">
                                        <img src="/images/star.png" alt="Recomendación" className="service-icon-image" />
                                    </div>
                                    <span className="service-row-text" style={{ position: 'relative', left: '5px' }}>
                                        Recomendado por el 87% (301 opiniones)
                                    </span>
                                </div>

                                {/* GREEN CREDITS - POSICIÓN PERSONALIZABLE */}
                                <div className="service-credits" style={{ position: 'absolute', right: '30px', top: '350px' }}>
                                    <span className="service-credits-number" style={{ position: 'relative', left: '15px',top:'20px' }}>
                                        32
                                    </span>
                                    <span className="service-credits-label" style={{ position: 'relative', left: '30px',top:'20px' }}>
                                        Green Credits
                                    </span>
                                </div>

                                {/* VER DETALLE - POSICIÓN PERSONALIZABLE */}
                                <button className="service-link" style={{ 
                                    position: 'absolute', 
                                    top:'450px',
                                    left: '155px', 
                                    bottom: '25px',
                                    fontSize: '21px',
                                    fontWeight: '600'
                                }}>
                                    Visitar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
