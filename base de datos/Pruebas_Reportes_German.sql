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




-- ============================================
-- CONFIGURACIÓN INICIAL COMPLETA - CRÉDITOS_VERDES
-- Datos maestros y catálogos base
-- ============================================

-- USE CREDITOS_VERDES;

-- ============================================
-- 1. CONFIGURACIÓN DE ROLES Y PERMISOS
-- ============================================

-- 1.1 Roles del sistema
INSERT IGNORE INTO ROL (nombre, descripcion) VALUES
('ADMIN', 'Administrador del sistema con todos los permisos'),
('COMPRADOR', 'Usuario que principalmente compra/intercambia'),
('VENDEDOR', 'Usuario que principalmente vende/ofrece servicios'),
('ONG', 'Organización con fines sociales/ambientales');

-- 1.2 Permisos del sistema
INSERT IGNORE INTO PERMISO (nombre, descripcion) VALUES
('GESTION_USUARIOS', 'Crear, editar y eliminar usuarios'),
('VER_REPORTES', 'Acceso a reportes del sistema'),
('GESTION_CATALOGOS', 'Administrar catálogos del sistema'),
('MODERAR_CONTENIDO', 'Moderar publicaciones y transacciones'),
('GESTION_FINANZAS', 'Administrar aspectos financieros');

-- 1.3 Asignar permisos a roles
INSERT IGNORE INTO ROL_PERMISO (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM ROL r
CROSS JOIN PERMISO p
WHERE r.nombre = 'ADMIN'

UNION ALL

SELECT r.id_rol, p.id_permiso
FROM ROL r
CROSS JOIN PERMISO p
WHERE r.nombre = 'COMPRADOR' AND p.nombre IN ('VER_REPORTES')

UNION ALL

SELECT r.id_rol, p.id_permiso
FROM ROL r
CROSS JOIN PERMISO p
WHERE r.nombre = 'VENDEDOR' AND p.nombre IN ('VER_REPORTES')

UNION ALL

SELECT r.id_rol, p.id_permiso
FROM ROL r
CROSS JOIN PERMISO p
WHERE r.nombre = 'ONG' AND p.nombre IN ('VER_REPORTES', 'GESTION_CATALOGOS');

-- 1.4 Resultados de acceso
INSERT IGNORE INTO RESULTADO_ACCESO (nombre, descripcion) VALUES
('EXITO', 'Inicio de sesión exitoso'),
('FALLO_CONTRASENA', 'Contraseña incorrecta'),
('USUARIO_BLOQUEADO', 'Usuario suspendido o bloqueado'),
('USUARIO_NO_EXISTE', 'Credenciales no encontradas');

-- ============================================
-- 2. CONFIGURACIÓN DE CATEGORÍAS Y UNIDADES
-- ============================================

-- 2.1 Categorías de productos/servicios
INSERT IGNORE INTO CATEGORIA (nombre, descripcion) VALUES
('Tecnología', 'Dispositivos electrónicos, computadoras, smartphones'),
('Hogar', 'Electrodomésticos, muebles, decoración'),
('Educación', 'Libros, cursos, material educativo'),
('Transporte', 'Bicicletas, patinetas, movilidad urbana'),
('Ropa', 'Prendas de vestir, calzado, accesorios'),
('Deportes', 'Equipamiento deportivo, implementos'),
('Juguetes', 'Juguetes, juegos, entretenimiento'),
('Herramientas', 'Herramientas manuales y eléctricas'),
('Jardinería', 'Plantas, herramientas de jardín, abonos'),
('Arte', 'Material artístico, manualidades, pinturas'),
('Música', 'Instrumentos musicales, equipos de audio'),
('Salud', 'Productos wellness, cuidado personal'),
('Bebés', 'Artículos para bebés y niños pequeños'),
('Mascotas', 'Alimentos y accesorios para mascotas'),
('Oficina', 'Material de oficina, escritorio');

-- 2.2 Unidades de medida
INSERT IGNORE INTO UNIDAD_MEDIDA (nombre, simbolo) VALUES
('Unidad', 'u'),
('Kilogramo', 'kg'),
('Gramo', 'g'),
('Litro', 'L'),
('Mililitro', 'ml'),
('Metro', 'm'),
('Centímetro', 'cm'),
('Hora', 'hr'),
('Día', 'día'),
('Semana', 'sem'),
('Mes', 'mes'),
('KilogramoCO2', 'kgCO2'),
('Kilovatio-hora', 'kWh');

-- 2.3 Factores de conversión entre unidades
INSERT IGNORE INTO FACTOR_CONVERSION (id_um_origen, id_um_destino, factor, descripcion) VALUES
((SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'kg'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'g'), 1000, '1 kg = 1000 g'),
((SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'g'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'kg'), 0.001, '1 g = 0.001 kg'),
((SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'L'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'ml'), 1000, '1 L = 1000 ml'),
((SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'ml'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'L'), 0.001, '1 ml = 0.001 L'),
((SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'm'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'cm'), 100, '1 m = 100 cm'),
((SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'cm'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'm'), 0.01, '1 cm = 0.01 m');

-- ============================================
-- 3. CONFIGURACIÓN GEOGRÁFICA
-- ============================================

-- 3.1 Ubicaciones (principales ciudades de Bolivia)
INSERT IGNORE INTO UBICACION (direccion, ciudad, provincia, latitud, longitud) VALUES
('Av. 16 de Julio 123', 'La Paz', 'La Paz', -16.4957, -68.1335),
('Calle España 456', 'Cochabamba', 'Cochabamba', -17.3939, -66.1570),
('Av. San Martín 789', 'Santa Cruz', 'Santa Cruz', -17.7833, -63.1821),
('Plaza 25 de Mayo 321', 'Sucre', 'Chuquisaca', -19.0475, -65.2600),
('Av. 6 de Agosto 654', 'Oruro', 'Oruro', -17.9667, -67.1167),
('Calle Bolívar 987', 'Potosí', 'Potosí', -19.5833, -65.7500),
('Av. Las Américas 159', 'Tarija', 'Tarija', -21.5333, -64.7333),
('Barrio Santa Bárbara 753', 'Trinidad', 'Beni', -14.8333, -64.9000),
('Zona Centro 286', 'Cobija', 'Pando', -11.0333, -68.7333),
('Av. Juan Pablo II 417', 'El Alto', 'La Paz', -16.5047, -68.1633);

-- ============================================
-- 4. CONFIGURACIÓN DE TIPOS Y CATÁLOGOS
-- ============================================

-- 4.1 Tipos de publicación
INSERT IGNORE INTO TIPO_PUBLICACION (nombre, descripcion) VALUES
('PRODUCTO', 'Publicación de producto físico o artículo'),
('SERVICIO', 'Publicación de servicio o actividad');

-- 4.2 Tipos de referencia para movimientos
INSERT IGNORE INTO TIPO_REFERENCIA (nombre) VALUES
('COMPRA'), ('TRANSACCION'), ('AJUSTE'), ('PROMOCION'), ('ACTIVIDAD');

-- 4.3 Tipos de movimiento financiero
INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion) VALUES
('RECARGA', 'Ingreso de créditos por compra con dinero real'),
('INTERCAMBIO_IN', 'Ingreso de créditos por intercambio/venta'),
('INTERCAMBIO_OUT', 'Egreso de créditos por intercambio/compra'),
('BONO_PUBLICACION', 'Bono por creación de publicaciones'),
('BONO_ACTIVIDAD', 'Bono por actividades sostenibles'),
('BONO_REGISTRO', 'Bono por registro en la plataforma'),
('BONO_PROMOCION', 'Bono por participación en promociones'),
('PENALIZACION', 'Deducción por incumplimiento o penalización');

-- 4.4 Signos de movimiento
INSERT IGNORE INTO SIGNO_MOVIMIENTO (nombre) VALUES
('POSITIVO'), ('NEGATIVO');

-- 4.5 Relación tipo movimiento - signo
INSERT IGNORE INTO SIGNO_X_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
CROSS JOIN SIGNO_MOVIMIENTO sm
WHERE (tm.nombre IN ('RECARGA', 'INTERCAMBIO_IN', 'BONO_PUBLICACION', 'BONO_ACTIVIDAD', 'BONO_REGISTRO', 'BONO_PROMOCION') AND sm.nombre = 'POSITIVO')
   OR (tm.nombre IN ('INTERCAMBIO_OUT', 'PENALIZACION') AND sm.nombre = 'NEGATIVO');

-- ============================================
-- 5. CONFIGURACIÓN FINANCIERA
-- ============================================

-- 5.1 Paquetes de créditos
INSERT IGNORE INTO PAQUETE_CREDITOS (nombre, cantidad_creditos, precio_bs, activo) VALUES
('Pack Básico 50', 50, 25.00, TRUE),
('Pack Estándar 100', 100, 45.00, TRUE),
('Pack Premium 200', 200, 85.00, TRUE),
('Pack Empresarial 500', 500, 200.00, TRUE),
('Pack Máximo 1000', 1000, 380.00, TRUE);

-- ============================================
-- 6. CONFIGURACIÓN DE PROMOCIONES Y LOGROS
-- ============================================

-- 6.1 Tipos de promoción
INSERT IGNORE INTO TIPO_PROMOCION (nombre, descripcion) VALUES
('LANZAMIENTO', 'Promoción especial de lanzamiento'),
('TEMPORADA', 'Promoción por temporada específica'),
('FIDELIDAD', 'Promoción para usuarios frecuentes'),
('COLECTIVO', 'Promoción para grupos o comunidades'),
('ESPECIAL', 'Promoción especial por evento');

-- 6.2 Tipos de logro
INSERT IGNORE INTO TIPO_LOGRO (nombre, descripcion) VALUES
('PRIMERA_VENTA', 'Primera transacción exitosa como vendedor'),
('PRIMERA_COMPRA', 'Primera transacción exitosa como comprador'),
('VENDEDOR_ESTRELLA', 'Múltiples ventas exitosas'),
('ECOLOGISTA', 'Alto impacto ambiental positivo'),
('COLABORADOR', 'Múltiples actividades sostenibles');

-- 6.3 Logros predefinidos
INSERT IGNORE INTO LOGRO (id_tipo_logro, nombre, descripcion, meta_requerida, creditos_recompensa) VALUES
((SELECT id_tipo_logro FROM TIPO_LOGRO WHERE nombre = 'PRIMERA_VENTA'), 'Primera Venta', 'Completa tu primera venta exitosa', 1, 50),
((SELECT id_tipo_logro FROM TIPO_LOGRO WHERE nombre = 'PRIMERA_COMPRA'), 'Primera Compra', 'Realiza tu primera compra en la plataforma', 1, 25),
((SELECT id_tipo_logro FROM TIPO_LOGRO WHERE nombre = 'VENDEDOR_ESTRELLA'), 'Vendedor Estrella', 'Completa 10 ventas exitosas', 10, 200),
((SELECT id_tipo_logro FROM TIPO_LOGRO WHERE nombre = 'ECOLOGISTA'), 'Ecologista Nivel 1', 'Ahorra 100 kg de CO2', 100, 150),
((SELECT id_tipo_logro FROM TIPO_LOGRO WHERE nombre = 'COLABORADOR'), 'Colaborador Activo', 'Participa en 5 actividades sostenibles', 5, 100);

-- ============================================
-- 7. CONFIGURACIÓN DE ACTIVIDADES SOSTENIBLES
-- ============================================

-- 7.1 Tipos de actividad sostenible
INSERT IGNORE INTO TIPO_ACTIVIDAD (nombre, descripcion) VALUES
('RECICLAJE', 'Actividades de reciclaje y reutilización'),
('VOLUNTARIADO', 'Trabajo voluntario ambiental/comunitario'),
('EDUCACION_AMBIENTAL', 'Charlas, talleres de concienciación'),
('REUTILIZACION', 'Reutilización creativa de materiales'),
('CONSERVACION', 'Actividades de conservación ambiental'),
('TRANSPORTE_SOSTENIBLE', 'Uso de transporte no contaminante');

-- ============================================
-- 8. CONFIGURACIÓN DE PUBLICIDAD
-- ============================================

-- 8.1 Ubicaciones de publicidad
INSERT IGNORE INTO UBICACION_PUBLICIDAD (nombre, descripcion, precio_base) VALUES
('HOME_TOP', 'Banner superior en página principal', 150.00),
('SIDEBAR_PRINCIPAL', 'Barra lateral en página principal', 80.00),
('CATEGORIA_TOP', 'Banner superior en páginas de categoría', 100.00),
('BUSQUEDA_LATERAL', 'Anuncios en resultados de búsqueda', 60.00),
('POPUP_INICIO', 'Ventana emergente al inicio', 200.00);

-- ============================================
-- 9. CONFIGURACIÓN DE REPORTES
-- ============================================

-- 9.1 Tipos de reporte
INSERT IGNORE INTO TIPO_REPORTE (nombre, descripcion) VALUES
('MENSUAL', 'Reporte consolidado mensual'),
('TRIMESTRAL', 'Reporte trimestral de indicadores'),
('ANUAL', 'Reporte anual de gestión'),
('USUARIO_INDIVIDUAL', 'Reporte específico por usuario'),
('CATEGORIA_ESPECIFICA', 'Reporte por categoría de producto');

-- 9.2 Períodos para reportes (2024-2025)
INSERT IGNORE INTO PERIODO (nombre, descripcion) VALUES
('2024-01', 'Enero 2024'),
('2024-02', 'Febrero 2024'),
('2024-03', 'Marzo 2024'),
('2024-04', 'Abril 2024'),
('2024-05', 'Mayo 2024'),
('2024-06', 'Junio 2024'),
('2024-07', 'Julio 2024'),
('2024-08', 'Agosto 2024'),
('2024-09', 'Septiembre 2024'),
('2024-10', 'Octubre 2024'),
('2024-11', 'Noviembre 2024'),
('2024-12', 'Diciembre 2024'),
('2025-01', 'Enero 2025'),
('2025-02', 'Febrero 2025'),
('2025-03', 'Marzo 2025');

-- ============================================
-- 10. CONFIGURACIÓN AMBIENTAL
-- ============================================

-- 10.1 Dimensiones ambientales
INSERT IGNORE INTO DIMENSION_AMBIENTAL (codigo, nombre, unidad_base, descripcion) VALUES
('CO2', 'Dióxido de carbono', 'kg', 'CO2 equivalente evitado'),
('AGUA', 'Agua', 'L', 'Litros de agua ahorrados'),
('ENERGIA', 'Energía', 'kWh', 'Energía eléctrica ahorrada'),
('RESIDUOS', 'Residuos', 'kg', 'Residuos evitados o reciclados'),
('MATERIAL', 'Material', 'kg', 'Material reutilizado');

-- 10.2 Equivalencias de impacto ambiental por categoría
INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad) VALUES
-- Tecnología
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 25.5, 15000.0, 120.0),
-- Hogar
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Hogar'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 15.2, 8000.0, 85.0),
-- Educación
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Educación'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 2.1, 500.0, 8.5),
-- Transporte
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Transporte'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 12.8, 300.0, 15.2),
-- Ropa
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Ropa'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 8.7, 12000.0, 45.3),
-- Deportes
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Deportes'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 6.3, 2500.0, 22.1),
-- Juguetes
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Juguetes'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 4.2, 1800.0, 18.7),
-- Herramientas
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Herramientas'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 9.5, 4200.0, 35.8),
-- Jardinería
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Jardinería'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 3.8, 1500.0, 12.4),
-- Arte
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Arte'), (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'), 2.5, 800.0, 9.3);

-- ============================================
-- 11. VERIFICACIÓN DE LA CONFIGURACIÓN
-- ============================================

SELECT '=== VERIFICACIÓN DE CONFIGURACIÓN INICIAL ===' as info;

-- Resumen de catálogos configurados
SELECT 'Roles configurados:' as item;
SELECT nombre, descripcion FROM ROL;

SELECT 'Categorías disponibles:' as item;
SELECT nombre, descripcion FROM CATEGORIA;

SELECT 'Paquetes de créditos:' as item;
SELECT nombre, cantidad_creditos, precio_bs FROM PAQUETE_CREDITOS WHERE activo = TRUE;

SELECT 'Tipos de movimiento:' as item;
SELECT tm.nombre, tm.descripcion, sm.nombre as signo
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_X_TIPO_MOV stm ON tm.id_tipo_movimiento = stm.id_tipo_movimiento
JOIN SIGNO_MOVIMIENTO sm ON stm.id_signo = sm.id_signo
ORDER BY tm.nombre;

SELECT 'Equivalencias de impacto:' as item;
SELECT c.nombre as categoria, eq.co2_por_unidad, eq.agua_por_unidad, eq.energia_por_unidad
FROM EQUIVALENCIA_IMPACTO eq
JOIN CATEGORIA c ON eq.id_categoria = c.id_categoria;

-- Conteo general
SELECT 'Resumen de configuración:' as item;
SELECT 'Roles' as tipo, COUNT(*) as cantidad FROM ROL
UNION ALL SELECT 'Categorías', COUNT(*) FROM CATEGORIA
UNION ALL SELECT 'Ubicaciones', COUNT(*) FROM UBICACION
UNION ALL SELECT 'Paquetes créditos', COUNT(*) FROM PAQUETE_CREDITOS
UNION ALL SELECT 'Tipos movimiento', COUNT(*) FROM TIPO_MOVIMIENTO
UNION ALL SELECT 'Logros', COUNT(*) FROM LOGRO
UNION ALL SELECT 'Equivalencias impacto', COUNT(*) FROM EQUIVALENCIA_IMPACTO;

SELECT '=== CONFIGURACIÓN INICIAL COMPLETADA ===' as status;
SELECT '✅ Sistema listo con todos los catálogos base configurados' as mensaje;