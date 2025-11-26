// src/modules/reportes/reportes.service.js
import { prisma } from "../../config/prisma.js";

function rangoFechas({ desde, hasta }) {
  return [desde || "2000-01-01", hasta || "2100-01-01"];
}

export async function repUsuariosActivosService(r) {
  const [rows] = await prisma.$queryRawUnsafe(
    "CALL sp_rep_usuarios_activos(?, ?)",
    ...rangoFechas(r)
  );
  return rows;
}

export async function repUsuariosAbandonadosService(r) {
  const [rows] = await prisma.$queryRawUnsafe(
    "CALL sp_rep_usuarios_abandonados(?, ?)",
    ...rangoFechas(r)
  );
  return rows;
}

export async function repIngresosCreditosService(r) {
  const [rows] = await prisma.$queryRawUnsafe(
    "CALL sp_rep_ingresos_creditos(?, ?)",
    ...rangoFechas(r)
  );
  return rows;
}

export async function repCreditosGenConsService(r) {
  const [rows] = await prisma.$queryRawUnsafe(
    "CALL sp_rep_creditos_generados_vs_consumidos(?, ?)",
    ...rangoFechas(r)
  );
  return rows;
}

export async function repIntercambiosCategoriaService(r) {
  const [rows] = await prisma.$queryRawUnsafe(
    "CALL sp_rep_intercambios_por_categoria(?, ?)",
    ...rangoFechas(r)
  );
  return rows;
}

export async function repPublicacionesVsIntercambiosService(r) {
  const [rows] = await prisma.$queryRawUnsafe(
    "CALL sp_rep_publicaciones_vs_intercambios(?, ?)",
    ...rangoFechas(r)
  );
  return rows;
}

export async function repImpactoAcumuladoService(tipoReporte, periodo) {
  const [rows] = await prisma.$queryRawUnsafe(
    "CALL sp_generar_reporte_impacto(?, ?, NULL)",
    tipoReporte,
    periodo,
  );
  return rows;
}


export async function rankingUsuariosService(idPeriodo, limit) {
  const [rows] = await prisma.$queryRawUnsafe(
    "CALL sp_obtener_ranking_usuarios(?, ?)",
    idPeriodo ?? null,
    limit ?? null
  );
  return rows;
}
