// frontend/src/router.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

// Páginas base
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

// Perfil
import Perfil from "./pages/Perfil.jsx";
import EditarPerfil from "./pages/EditarPerfil.jsx";

// Wallet
import ComprarCreditos from "./pages/ComprarCreditos.jsx";
import Movimientos from "./pages/Movimientos.jsx";
import HistorialCompras from "./pages/HistorialCompras.jsx";

import Wallet from "./pages/Wallet.jsx";

import Publicaciones from "./pages/Publicaciones.jsx";
import MisPublicaciones from "./pages/MisPublicaciones.jsx";

import PublicacionNueva from "./pages/PublicacionNueva.jsx";

import Intercambios from "./pages/Intercambios.jsx";

import Actividades from "./pages/Actividades.jsx";
import MisActividades from "./pages/MisActividades.jsx";

import Premium from "./pages/Premium.jsx";

import Logros from "./pages/Logros.jsx";
import Promociones from "./pages/Promociones.jsx";

// Reportes menú principal
import Reportes from "./pages/Reportes.jsx";
import Publicidad from "./pages/Publicidad.jsx";


// Reportes individuales
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

// Backend lab
import BackendLab from "./pages/BackendLab.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* Redirige raíz a login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ------------------------------- */}
      {/*         RUTAS PROTEGIDAS        */}
      {/* ------------------------------- */}

      {/* HOME */}
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

      {/* PERFIL */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Layout>
              <Perfil />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* EDITAR PERFIL (NUEVO, FUNCIONAL) */}
      <Route
        path="/perfil/editar"
        element={
          <ProtectedRoute>
            <Layout>
              <EditarPerfil />
            </Layout>
          </ProtectedRoute>
        }
      />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
            {/* WALLET */}
      <Route
        path="/comprar-creditos"
        element={
          <ProtectedRoute>
            <Layout>
              <ComprarCreditos />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wallet/movimientos"
        element={
          <ProtectedRoute>
            <Layout>
              <Movimientos />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wallet/compras"
        element={
          <ProtectedRoute>
            <Layout>
              <HistorialCompras />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/publicaciones"
        element={
          <ProtectedRoute>
            <Layout>
              <Publicaciones />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/publicaciones/mias"
        element={
          <ProtectedRoute>
            <Layout>
              <MisPublicaciones />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/publicaciones/nueva"
        element={
          <ProtectedRoute>
            <Layout>
              <PublicacionNueva />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/intercambios"
        element={
          <ProtectedRoute>
            <Layout>
              <Intercambios />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/actividades"
        element={
          <ProtectedRoute>
            <Layout>
              <Actividades />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/actividades/mias"
        element={
          <ProtectedRoute>
            <Layout>
              <MisActividades />
            </Layout>
          </ProtectedRoute>
        }
      />

    <Route
      path="/premium"
      element={
        <ProtectedRoute>
          <Layout>
            <Premium />
          </Layout>
        </ProtectedRoute>
      }
    />
      <Route
      path="/logros"
      element={
        <ProtectedRoute>
          <Layout>
            <Logros />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/promociones"
      element={
        <ProtectedRoute>
          <Layout>
            <Promociones />
          </Layout>
        </ProtectedRoute>
      }
    />

      <Route
        path="/publicidad"
        element={
          <ProtectedRoute>
            <Layout>
              <Publicidad />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* REPORTES */}
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

      {/* REPORTES INDIVIDUALES */}
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

      {/* LABORATORIO BACKEND */}
      <Route
        path="/backend-lab"
        element={
          <ProtectedRoute>
            <Layout>
              <BackendLab />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
