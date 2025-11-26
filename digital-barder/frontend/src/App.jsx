import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Search from './pages/Search';
import Register from './pages/Register';
import Login from './pages/Login'; // Asegúrate de importar el componente Login

function App() {
    return (
        <Routes>
            <Route path="/" element={<Search />} />
            <Route path="/search" element={<Search />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} /> {/* Agrega esta ruta */}
        </Routes>
    );
}

export default App;