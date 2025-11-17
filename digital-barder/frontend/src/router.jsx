import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import Reportes from "./pages/Reportes.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* Ruta raíz → /home */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Login público */}
      <Route path="/login" element={<Login />} />

      {/* Home protegido */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reportes"
        element={
          <ProtectedRoute>
            <Layout>
              <Reportes />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    
  );
}
