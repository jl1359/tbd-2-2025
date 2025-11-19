-- ============================================
-- SCRIPT DE LIMPIEZA COMPLETA - CRÉDITOS_VERDES
-- Orden correcto para evitar errores de claves foráneas
-- ============================================

USE CREDITOS_VERDES;

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. TABLAS CON DATOS TRANSACCIONALES (más específicas primero)
-- ============================================

-- Bitácoras y logs
TRUNCATE TABLE BITACORA_INTERCAMBIO;
TRUNCATE TABLE BITACORA_ACCESO;

-- Movimientos financieros
TRUNCATE TABLE MOVIMIENTO_CREDITOS;

-- Transacciones e intercambios
TRUNCATE TABLE TRANSACCION;

-- Compras de créditos
TRUNCATE TABLE COMPRA_CREDITOS;

-- Actividades y eventos
TRUNCATE TABLE ACTIVIDAD_SOSTENIBLE;
TRUNCATE TABLE EVENTO_AMBIENTAL;

-- Impacto ambiental
TRUNCATE TABLE IMPACTO_AMBIENTAL;
TRUNCATE TABLE REPORTE_IMPACTO;

-- Relaciones muchos-a-muchos
TRUNCATE TABLE PROMOCION_PUBLICACION;
TRUNCATE TABLE PUBLICACION_PRODUCTO;
TRUNCATE TABLE PUBLICACION_SERVICIO;
TRUNCATE TABLE USUARIO_LOGRO;
TRUNCATE TABLE ROL_PERMISO;
TRUNCATE TABLE SIGNO_X_TIPO_MOV;

-- Calificaciones
TRUNCATE TABLE CALIFICACION;

-- ============================================
-- 2. TABLAS CON DATOS MAESTROS TRANSACCIONALES
-- ============================================

-- Publicaciones
TRUNCATE TABLE PUBLICACION;

-- Productos y servicios
TRUNCATE TABLE PRODUCTO;
TRUNCATE TABLE SERVICIO;

-- Billeteras
TRUNCATE TABLE BILLETERA;

-- Publicidad
TRUNCATE TABLE PUBLICIDAD;

-- Promociones
TRUNCATE TABLE PROMOCION;

-- Logros
TRUNCATE TABLE LOGRO;

-- ============================================
-- 3. TABLAS PRINCIPALES DE ENTIDADES
-- ============================================

-- Usuarios
TRUNCATE TABLE USUARIO;

-- ============================================
-- 4. TABLAS DE CATÁLOGOS (más genéricas al final)
-- ============================================

-- Catálogos con dependencias
TRUNCATE TABLE EQUIVALENCIA_IMPACTO;
TRUNCATE TABLE FACTOR_CONVERSION;
TRUNCATE TABLE DIMENSION_AMBIENTAL;
TRUNCATE TABLE PERIODO;
TRUNCATE TABLE TIPO_REPORTE;
TRUNCATE TABLE UBICACION_PUBLICIDAD;
TRUNCATE TABLE TIPO_ACTIVIDAD;
TRUNCATE TABLE TIPO_LOGRO;
TRUNCATE TABLE TIPO_PROMOCION;
TRUNCATE TABLE PAQUETE_CREDITOS;
TRUNCATE TABLE SIGNO_MOVIMIENTO;
TRUNCATE TABLE TIPO_MOVIMIENTO;
TRUNCATE TABLE TIPO_REFERENCIA;
TRUNCATE TABLE TIPO_PUBLICACION;
TRUNCATE TABLE UBICACION;
TRUNCATE TABLE UNIDAD_MEDIDA;
TRUNCATE TABLE CATEGORIA;
TRUNCATE TABLE RESULTADO_ACCESO;
TRUNCATE TABLE PERMISO;
TRUNCATE TABLE ROL;

-- ============================================
-- 5. REACTIVAR VERIFICACIÓN Y VERIFICAR ESTADO
-- ============================================

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 6. VERIFICAR QUE TODAS LAS TABLAS ESTÉN VACÍAS
-- ============================================

SELECT '=== VERIFICACIÓN DE TABLAS VACÍAS ===' as info;

SELECT 
    TABLE_NAME as tabla,
    TABLE_ROWS as registros
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'CREDITOS_VERDES'
AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_ROWS DESC, TABLE_NAME;

SELECT '=== BASE DE DATOS COMPLETAMENTE LIMPIA ===' as status;
SELECT '✅ Todas las tablas han sido truncadas correctamente' as mensaje;