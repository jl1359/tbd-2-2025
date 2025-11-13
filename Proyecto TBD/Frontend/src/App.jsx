import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home.jsx";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";
import Seguridad from "@/pages/Seguridad.jsx";
import Reportes from "@/pages/Reportes.jsx";
import ProfileUser from "@/pages/ProfileUser.jsx";
import ProfileAdmin from "@/pages/ProfileAdmin.jsx";
import ProfileOrg from "@/pages/ProfileOrg.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />

      {/* ✅ Nuevas rutas */}
      <Route path="/seguridad" element={<Seguridad />} />
      <Route path="/reportes" element={<Reportes />} />
      <Route path="/perfil/usuario" element={<ProfileUser />} />
      <Route path="/perfil/administrador" element={<ProfileAdmin />} />
      <Route path="/perfil/organizacion" element={<ProfileOrg />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

