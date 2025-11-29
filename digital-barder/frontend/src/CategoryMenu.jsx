import React, { useState } from 'react';
import './CategoryMenu.css';

const CategoryMenu = ({ isOpen, onClose }) => {
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
        // Aquí puedes agregar más lógica cuando se seleccione una categoría
        console.log('Categoría seleccionada:', category);
    };

    return (
        <div className="category-menu-overlay" onClick={onClose}>
            <div className="category-menu" onClick={(e) => e.stopPropagation()}>
                <div className="scroll-container">
                    {/* Sección Productos */}
                    <div className="category-section">
                        <h3 className="category-title">Productos</h3>
                        <ul className="category-list">
                            {productCategories.map((category, index) => (
                                <li 
                                    key={index}
                                    className={`category-item ${selectedCategory === category ? 'selected' : ''}`}
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    {category}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Línea separadora */}
                    <div className="category-divider"></div>

                    {/* Sección Servicios */}
                    <div className="category-section">
                        <h3 className="category-title">Servicios</h3>
                        <ul className="category-list">
                            {serviceCategories.map((category, index) => (
                                <li 
                                    key={index}
                                    className={`category-item ${selectedCategory === category ? 'selected' : ''}`}
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

export default CategoryMenu;