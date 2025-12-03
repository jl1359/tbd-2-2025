// src/modules/reportes/reportes.controller.js
import { prisma } from "../../config/prisma.js";

function toPlain(value) {
  if (typeof value === "bigint") return Number(value);

  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace("T", " ");
  }

  if (value && typeof value === "object") {
    if (typeof value.toNumber === "function") return value.toNumber();

    const prim = value.valueOf?.();
    if (prim != null && typeof prim !== "object") return prim;

    if (Array.isArray(value)) return value.map(toPlain);

    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = toPlain(v);
    return out;
  }

  return value;
}

function normalizeResult(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    if (raw.length > 0 && Array.isArray(raw[0])) return raw[0];
    return raw;
  }

  if (typeof raw === "object") return [raw];

  return [];
}

function getRangoFechas(req) {
  const { desde, hasta } = req.query;

  const ahora = new Date();
  const defaultHasta = ahora.toISOString().slice(0, 19).replace("T", " ");
  const defaultDesdeDate = new Date(
    ahora.getTime() - 30 * 24 * 60 * 60 * 1000
  );
  const defaultDesde = defaultDesdeDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  return {
    desde: desde ? `${desde} 00:00:00` : defaultDesde,
    hasta: hasta ? `${hasta} 23:59:59` : defaultHasta,
  };
}

// mapeos...

function mapUsuarioActivo(r) {
  return {
    id_usuario: r.id_usuario ?? r.f0 ?? null,
    nombre: r.nombre ?? r.f1 ?? null,
    correo: r.correo ?? r.f2 ?? null,
    primera_actividad: r.primera_actividad ?? r.f3 ?? null,
    ultima_actividad: r.ultima_actividad ?? r.f4 ?? null,
    total_acciones: r.total_acciones ?? r.f5 ?? null,
  };
}

function mapUsuarioAbandonado(r) {
  return {
    id_usuario: r.id_usuario ?? r.f0 ?? null,
    nombre: r.nombre ?? r.f1 ?? null,
    correo: r.correo ?? r.f2 ?? null,
    estado: r.estado ?? r.f3 ?? null,
  };
}

function mapIngresoCreditos(r) {
  return {
    fecha: r.fecha ?? r.f0 ?? null,
    total_creditos: r.total_creditos ?? r.f1 ?? null,
    total_bs: r.total_bs ?? r.f2 ?? null,
  };
}

function mapIntercambiosCategoria(r) {
  return {
    categoria: r.categoria ?? r.f0 ?? null,
    total_intercambios: r.total_intercambios ?? r.f1 ?? null,
  };
}

function mapPublicacionesVsIntercambios(r) {
  return {
    categoria: r.categoria ?? r.f0 ?? null,
    publicaciones: r.publicaciones ?? r.f1 ?? null,
    intercambios: r.intercambios ?? r.f2 ?? null,
    ratio_intercambio: r.ratio_intercambio ?? r.f3 ?? null,
  };
}

function mapImpacto(r) {
  return {
    // si algún día el SP devuelve id_usuario con nombre, lo usas;
    // si no, cae al f0 o null
    id_usuario: r.id_usuario ?? r.f0 ?? null,

    // CO₂, agua y energía
    total_co2_ahorrado: Number(
      r.total_co2_ahorrado ?? r.f4 ?? 0
    ),
    total_agua_ahorrada: Number(
      r.total_agua_ahorrada ?? r.f5 ?? 0
    ),
    total_energia_ahorrada: Number(
      r.total_energia_ahorrada ?? r.f6 ?? 0
    ),

    // transacciones y usuarios activos
    total_transacciones: Number(
      r.total_transacciones ?? r.f2 ?? 0
    ),
    total_usuarios_activos: Number(
      r.total_usuarios_activos ?? r.f3 ?? 0
    ),
  };
}

function mapRankingUsuarios(r) {
  return {
    id_usuario: r.id_usuario ?? r.f0 ?? null,
    co2_total: r.co2_total ?? r.f1 ?? null,
    agua_total: r.agua_total ?? r.f2 ?? null,
    energia_total: r.energia_total ?? r.f3 ?? null,
    transacciones: r.transacciones ?? r.f4 ?? null,
  };
}

function mapUsuariosPremium(r) {
  return {
    desde: r.desde ?? r.f0 ?? null,
    hasta: r.hasta ?? r.f1 ?? null,
    total_usuarios_activos: r.total_usuarios_activos ?? r.f2 ?? null,
    usuarios_nuevos_premium: r.usuarios_nuevos_premium ?? r.f3 ?? null,
    usuarios_premium_activos: r.usuarios_premium_activos ?? r.f4 ?? null,
    ingresos_suscripcion_bs: r.ingresos_suscripcion_bs ?? r.f5 ?? null,
    porcentaje_adopcion_premium:
      r.porcentaje_adopcion_premium ?? r.f6 ?? null,
  };
}

function mapUsuariosNuevos(r) {
  return {
    id_usuario: r.id_usuario ?? r.f0 ?? null,
    nombre: r.nombre ?? r.f1 ?? null,
    correo: r.correo ?? r.f2 ?? null,
    fecha_primer_login: r.fecha_primer_login ?? r.f3 ?? null,
  };
}

function mapSaldoUsuario(r) {
  return {
    id_usuario: r.id_usuario ?? r.f0 ?? null,
    nombre: r.nombre ?? r.f1 ?? null,
    correo: r.correo ?? r.f2 ?? null,
    saldo_creditos: r.saldo_creditos ?? r.f3 ?? null,
  };
}

function mapActividadSostenible(r) {
  return {
    id_usuario: r.id_usuario ?? r.f0 ?? null,
    nombre: r.nombre ?? r.f1 ?? null,
    correo: r.correo ?? r.f2 ?? null,
    total_actividades: r.total_actividades ?? r.f3 ?? null,
    creditos_otorgados: r.creditos_otorgados ?? r.f4 ?? null,
  };
}

function mapImpactoCategoria(r) {
  return {
    categoria: r.categoria ?? r.f0 ?? null,
    co2_total: r.co2_total ?? r.f1 ?? null,
    agua_total: r.agua_total ?? r.f2 ?? null,
    energia_total: r.energia_total ?? r.f3 ?? null,
  };
}

// C1) Usuarios activos
export async function getUsuariosActivos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req);
    const raw = await prisma.$queryRawUnsafe(
      "CALL sp_rep_usuarios_activos(?, ?)",
      desde,
      hasta
    );
    const rows = normalizeResult(raw).map(mapUsuarioActivo);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C2) Usuarios abandonados
export async function getUsuariosAbandonados(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req);
    const raw = await prisma.$queryRawUnsafe(
      "CALL sp_rep_usuarios_abandonados(?, ?)",
      desde,
      hasta
    );
    const rows = normalizeResult(raw).map(mapUsuarioAbandonado);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C3) Ingresos créditos
export async function getIngresosCreditos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req);
    const raw = await prisma.$queryRawUnsafe(
      "CALL sp_rep_ingresos_creditos(?, ?)",
      desde,
      hasta
    );
    const rows = normalizeResult(raw).map(mapIngresoCreditos);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C4) Créditos generados vs consumidos
export async function getCreditosGeneradosVsConsumidos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req);
    const raw = await prisma.$queryRawUnsafe(
      "CALL sp_rep_creditos_generados_vs_consumidos(?, ?)",
      desde,
      hasta
    );

    const rows = normalizeResult(raw);
    const base = rows[0] || {};

    const creditos_generados = base.creditos_generados ?? base.f0 ?? 0;
    const creditos_consumidos = base.creditos_consumidos ?? base.f1 ?? 0;

    const resumen = {
      creditos_generados: Number(creditos_generados ?? 0),
      creditos_consumidos: Number(creditos_consumidos ?? 0),
      saldo_neto:
        Number(creditos_generados ?? 0) - Number(creditos_consumidos ?? 0),
    };

    res.json(toPlain(resumen));
  } catch (err) {
    next(err);
  }
}

// C5) Intercambios por categoría
export async function getIntercambiosPorCategoria(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req);
    const raw = await prisma.$queryRawUnsafe(
      "CALL sp_rep_intercambios_por_categoria(?, ?)",
      desde,
      hasta
    );
    const rows = normalizeResult(raw).map(mapIntercambiosCategoria);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C6) Publicaciones vs intercambios
export async function getPublicacionesVsIntercambios(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req);
    const raw = await prisma.$queryRawUnsafe(
      "CALL sp_rep_publicaciones_vs_intercambios(?, ?)",
      desde,
      hasta
    );
    const rows = normalizeResult(raw).map(mapPublicacionesVsIntercambios);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C7) Impacto ambiental acumulado (usa sp_generar_reporte_impacto)
// C7) Impacto ambiental acumulado (TOTAL HISTÓRICO)
export async function getImpactoAcumulado(req, res, next) {
  try {
    let { idTipoReporte } = req.query;

    if (!idTipoReporte) {
      return res.status(400).json({
        ok: false,
        message: "idTipoReporte es requerido",
      });
    }

    idTipoReporte = Number(idTipoReporte);

    // TOTAL HISTÓRICO: suma TODOS los períodos de ese tipo de reporte
    const raw = await prisma.$queryRawUnsafe(
      `
      SELECT
        NULL AS id_usuario,
        SUM(total_co2_ahorrado)     AS total_co2_ahorrado,
        SUM(total_agua_ahorrada)    AS total_agua_ahorrada,
        SUM(total_energia_ahorrada) AS total_energia_ahorrada,
        SUM(total_transacciones)    AS total_transacciones,
        SUM(total_usuarios_activos) AS total_usuarios_activos
      FROM REPORTE_IMPACTO
      WHERE id_tipo_reporte = ?
      `,
      idTipoReporte
    );

    const rows = normalizeResult(raw).map((r) => ({
      id_usuario: null,
      total_co2_ahorrado: Number(r.total_co2_ahorrado ?? 0),
      total_agua_ahorrada: Number(r.total_agua_ahorrada ?? 0),
      total_energia_ahorrada: Number(r.total_energia_ahorrada ?? 0),
      total_transacciones: Number(r.total_transacciones ?? 0),
      total_usuarios_activos: Number(r.total_usuarios_activos ?? 0),
    }));

    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}


// C8) Ranking usuarios
export async function getRankingUsuarios(req, res, next) {
  try {
    let { idPeriodo, limit } = req.query;
    const pPeriodo = idPeriodo ? Number(idPeriodo) : null;
    const pLimit = limit ? Number(limit) : 10;

    const raw = await prisma.$queryRawUnsafe(
      "CALL sp_obtener_ranking_usuarios(?, ?)",
      pPeriodo,
      pLimit
    );

    const rows = normalizeResult(raw).map(mapRankingUsuarios);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C9) Usuarios premium
export async function getUsuariosPremium(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req);
    const raw = await prisma.$queryRawUnsafe(
      "CALL sp_rep_usuarios_premium(?, ?)",
      desde,
      hasta
    );
    const rows = normalizeResult(raw).map(mapUsuariosPremium);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C10) Usuarios nuevos
export async function getUsuariosNuevos(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req);
    const raw = await prisma.$queryRawUnsafe(
      `
      SELECT
        u.id_usuario,
        u.nombre,
        u.correo,
        MIN(b.fecha) AS fecha_primer_login
      FROM USUARIO u
      JOIN BITACORA_ACCESO b
        ON b.id_usuario = u.id_usuario
      GROUP BY u.id_usuario, u.nombre, u.correo
      HAVING fecha_primer_login BETWEEN ? AND ?
      ORDER BY fecha_primer_login
      `,
      desde,
      hasta
    );

    const rows = normalizeResult(raw).map(mapUsuariosNuevos);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C11) Saldos créditos
export async function getSaldosCreditos(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const raw = await prisma.$queryRawUnsafe(
      `
      SELECT
        u.id_usuario,
        u.nombre,
        u.correo,
        b.saldo_creditos
      FROM USUARIO u
      JOIN BILLETERA b
        ON b.id_usuario = u.id_usuario
      ORDER BY b.saldo_creditos DESC
      LIMIT ?
      `,
      limit
    );

    const rows = normalizeResult(raw).map(mapSaldoUsuario);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C12) Actividades sostenibles
export async function getActividadesSostenibles(req, res, next) {
  try {
    const { desde, hasta } = getRangoFechas(req);

    const raw = await prisma.$queryRawUnsafe(
      `
      SELECT
        u.id_usuario,
        u.nombre,
        u.correo,
        COUNT(a.id_actividad) AS total_actividades,
        SUM(a.creditos_otorgados) AS creditos_otorgados
      FROM ACTIVIDAD_SOSTENIBLE a
      JOIN USUARIO u
        ON u.id_usuario = a.id_usuario
      WHERE a.creado_en BETWEEN ? AND ?
      GROUP BY u.id_usuario, u.nombre, u.correo
      ORDER BY total_actividades DESC
      `,
      desde,
      hasta
    );

    const rows = normalizeResult(raw).map(mapActividadSostenible);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}

// C13) Impacto por categoría
export async function getImpactoPorCategoria(req, res, next) {
  try {
    const { idPeriodo } = req.query;
    if (!idPeriodo) {
      return res
        .status(400)
        .json({ ok: false, message: "idPeriodo es requerido" });
    }

    const raw = await prisma.$queryRawUnsafe(
      `
      SELECT
        c.nombre AS categoria,
        SUM(ia.co2_ahorrado)     AS co2_total,
        SUM(ia.agua_ahorrada)    AS agua_total,
        SUM(ia.energia_ahorrada) AS energia_total
      FROM IMPACTO_AMBIENTAL ia
      JOIN TRANSACCION t
        ON t.id_transaccion = ia.id_transaccion
      JOIN PUBLICACION p
        ON p.id_publicacion = t.id_publicacion
      JOIN CATEGORIA c
        ON c.id_categoria = p.id_categoria
      WHERE ia.id_periodo = ?
      GROUP BY c.nombre
      ORDER BY co2_total DESC
      `,
      Number(idPeriodo)
    );

    const rows = normalizeResult(raw).map(mapImpactoCategoria);
    res.json(toPlain(rows));
  } catch (err) {
    next(err);
  }
}
