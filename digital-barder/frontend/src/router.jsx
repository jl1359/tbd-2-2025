// frontend/src/router.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

// Páginas base
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

// Índice de reportes + botón a dashboard
import Reportes from "./pages/Reportes.jsx";

// Dashboard con gráficas (ya lo tienes creado)
import ReportesDashboard from "./pages/ReportesDashboard.jsx";

// Páginas individuales de reportes (tablas)
import ReportesUsuarios from "./pages/ReportesUsuarios.jsx";
import ReportesIngresosCreditos from "./pages/ReportesIngresosCreditos.jsx";
import ReportesCreditosGeneradosConsumidos from "./pages/ReportesCreditosGeneradosConsumidos.jsx";
import ReportesIntercambiosCategoria from "./pages/ReportesIntercambiosCategoria.jsx";
import ReportesPublicacionesVsIntercambios from "./pages/ReportesPublicacionesVsIntercambios.jsx";
import ReportesImpactoAcumulado from "./pages/ReportesImpactoAcumulado.jsx";

import ReportesRankingUsuarios from "./pages/ReportesRankingUsuarios.jsx";
import ReportesUsuariosPremium from "./pages/ReportesUsuariosPremium.jsx";
import ReportesSaldosUsuarios from "./pages/ReportesSaldosUsuarios.jsx";
import ReportesActividadesSostenibles from "./pages/ReportesActividadesSostenibles.jsx";
import ReportesImpactoCategoria from "./pages/ReportesImpactoCategoria.jsx";

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

      {/* Índice de reportes (lista de tarjetas + botón al dashboard) */}
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

      {/* Páginas individuales de reportes (tablas) */}
      <Route
        path="/reportes/usuarios"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesUsuarios />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/ingresos-creditos"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesIngresosCreditos />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/creditos-generados-consumidos"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesCreditosGeneradosConsumidos />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/intercambios-categoria"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesIntercambiosCategoria />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/publicaciones-intercambios"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesPublicacionesVsIntercambios />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/impacto-acumulado"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesImpactoAcumulado />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/ranking-usuarios"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesRankingUsuarios />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/usuarios-premium"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesUsuariosPremium />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/saldos-usuarios"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesSaldosUsuarios />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/actividades-sostenibles"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesActividadesSostenibles />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes/impacto-categoria"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesImpactoCategoria />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Dashboard con gráficos de reportes */}
      <Route
        path="/reportes-dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportesDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
