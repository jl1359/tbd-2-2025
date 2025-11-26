import React, { useState } from 'react';
import '../Search.css';

const Search = () => {
    const [activeCategory, setActiveCategory] = useState('crear-publicacion');

    const categories = [
        { id: 'crear-publicacion', name: 'Crear Publicación' },
        { id: 'tiendas', name: 'Tiendas' },
        { id: 'campañas', name: 'Campañas' }
    ];

    return (
        <div className="search-page">
            {/* CONTENEDOR GRID PRINCIPAL - CONTROL ABSOLUTO */}
            <div className="search-grid-container">
                
                {/* BARRA DE BÚSQUEDA - POSICIONA CON grid-area */}
                <div className="search-box grid-area-search pos-top pos-center width-full m-30" style= {{marginLeft:"-665px"}}>
                    <input 
                        type="text"
                        placeholder="Buscar..."
                        className="search-input"
                    />
                </div>

                {/* TÍTULO CATEGORÍA - POSICIONA CON grid-area */}
                <h2 className="category-title grid-area-category-title">Categoría</h2>

                {/* BOTONES DE CATEGORÍA - POSICIONA CON grid-area */}
                <div className="categories-box grid-area-categories">
                    <div className="categories-buttons">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PERFIL DE USUARIO - POSICIONA CON grid-area */}
                <div className="profile-box grid-area-profile pos-center pos-center width-third order-20"style= {{marginLeft:"1080px"}}>
                    <div className="profile-content">
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
                                <span>IMG</span>
                            </div>
                        </div>
                        <div className="profile-text">
                            <span className="profile-code">GC 503.50</span>
                            <span className="profile-name">+ Gustavo Herbas Andia</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Search;