// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Search from './pages/Search';
import Register from './pages/Register';
import Login from './pages/Login';
import CreatePost from './pages/CreatePost';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Search />} />
            <Route path="/search" element={<Search />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-post" element={<CreatePost />} />
        </Routes>
    );
}

export default App;