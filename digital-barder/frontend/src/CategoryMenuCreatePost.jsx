// src/pages/CategoryMenuCreatePost.jsx
import React, { useState } from 'react';
import './CategoryMenuCreatePost.css';

const CategoryMenuCreatePost = ({ isOpen, onClose, onCategorySelect }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    if (!isOpen) return null;

    const productCategories = [
        'Productos',
        'Electrónicos',
        'Ropa',
        'Hogar',
        'Deportes',
        'Libros',
        'Música',
        'Juguetes',
        'Belleza',
        'Automotriz',
        'Computadoras',
        'Smartphones',
        'Tablets',
        'Accesorios',
        'Calzado',
        'Moda'
    ];

    const serviceCategories = [
        'Consultoría',
        'Diseño',
        'Educación',
        'Salud',
        'Reparaciones',
        'Transporte',
        'Eventos',
        'Limpieza',
        'Asesoría Legal',
        'Desarrollo Software',
        'Marketing Digital',
        'Traducción',
        'Fotografía',
        'Video',
        'Coach Personal',
        'Terapias Alternativas'
    ];

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        if (onCategorySelect) {
            onCategorySelect(category);
        }
    };

    return (
        <div className="category-menu-createpost-overlay" onClick={onClose}>
            <div className="category-menu-createpost" onClick={(e) => e.stopPropagation()}>
                <div className="scroll-container-createpost">
                    {/* Sección Productos */}
                    <div className="category-section-createpost">
                        <h3 className="category-title-createpost">Productos</h3>
                        <ul className="category-list-createpost">
                            {productCategories.map((category, index) => (
                                <li 
                                    key={index}
                                    className={`category-item-createpost ${selectedCategory === category ? 'selected' : ''}`}
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    {category}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Línea separadora */}
                    <div className="category-divider-createpost"></div>

                    {/* Sección Servicios */}
                    <div className="category-section-createpost">
                        <h3 className="category-title-createpost">Servicios</h3>
                        <ul className="category-list-createpost">
                            {serviceCategories.map((category, index) => (
                                <li 
                                    key={index}
                                    className={`category-item-createpost ${selectedCategory === category ? 'selected' : ''}`}
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    {category}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryMenuCreatePost;