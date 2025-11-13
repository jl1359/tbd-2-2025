// src/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const ok = !!localStorage.getItem("db_token");
    return ok ? children : <Navigate to="/login" replace />;
}
