import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white px-6 py-5 rounded-lg shadow-sm border border-gray-200 text-center max-w-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-sm text-gray-500 mb-4">
          La página que buscas no existe.
        </p>
        <Link to="/home" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
