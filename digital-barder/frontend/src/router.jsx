import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";  // Componente de ejemplo
import Sidebar from "./components/Sidebar";    // Sidebar si lo necesitas

function AppRouter() {
  return (
    <Routes>
      {/* Definir las rutas aquí */}
      <Route path="/" element={<Dashboard />} />
      {/* Otras rutas que puedas tener */}
    </Routes>
  );
}

export default AppRouter;