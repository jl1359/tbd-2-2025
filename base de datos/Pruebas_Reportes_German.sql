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



-- ============================================
-- SCRIPT DE POBLADO DE DATOS - CRÉDITOS_VERDES
-- 30 usuarios realistas con transacciones, movimientos y actividades
-- ============================================

-- USE CREDITOS_VERDES;

-- ============================================
-- 1. CREACIÓN DE 30 USUARIOS REALISTAS
-- ============================================

INSERT IGNORE INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil) VALUES
-- Administradores (2)
((SELECT id_rol FROM ROL WHERE nombre = 'ADMIN'), 'ACTIVO', 'María', 'Gonzales', 'maria.gonzales@creditosverdes.bo', '+591 71234567', 'perfil_maria_gonzales'),
((SELECT id_rol FROM ROL WHERE nombre = 'ADMIN'), 'ACTIVO', 'Carlos', 'Méndez', 'carlos.mendez@creditosverdes.bo', '+591 72234567', 'perfil_carlos_mendez'),

-- ONGs (3)
((SELECT id_rol FROM ROL WHERE nombre = 'ONG'), 'ACTIVO', 'Fundación', 'EcoBolivia', 'contacto@ecobolivia.org', '+591 4 4455667', 'perfil_ecobolivia'),
((SELECT id_rol FROM ROL WHERE nombre = 'ONG'), 'ACTIVO', 'Asociación', 'Verde Futuro', 'info@verdefuturo.bo', '+591 3 3344556', 'perfil_verde_futuro'),
((SELECT id_rol FROM ROL WHERE nombre = 'ONG'), 'ACTIVO', 'Centro', 'Ambiental LP', 'centroambiental.lp@gmail.com', '+591 2 2233445', 'perfil_centro_ambiental'),

-- Vendedores activos (10)
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Ana', 'Rodríguez', 'ana.rodriguez@gmail.com', '+591 71123456', 'perfil_ana_rodriguez'),
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Luis', 'Fernández', 'luis.fernandez@hotmail.com', '+591 72123456', 'perfil_luis_fernandez'),
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Sofia', 'Paredes', 'sofia.paredes@yahoo.com', '+591 73123456', 'perfil_sofia_paredes'),
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Diego', 'Castro', 'diego.castro@gmail.com', '+591 74123456', 'perfil_diego_castro'),
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Valeria', 'Ríos', 'valeria.rios@outlook.com', '+591 75123456', 'perfil_valeria_rios'),
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Javier', 'Torrez', 'javier.torrez@gmail.com', '+591 76123456', 'perfil_javier_torrez'),
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Camila', 'Vargas', 'camila.vargas@hotmail.com', '+591 77123456', 'perfil_camila_vargas'),
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Mateo', 'Salazar', 'mateo.salazar@gmail.com', '+591 78123456', 'perfil_mateo_salazar'),
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Isabella', 'Molina', 'isabella.molina@yahoo.com', '+591 79123456', 'perfil_isabella_molina'),
((SELECT id_rol FROM ROL WHERE nombre = 'VENDEDOR'), 'ACTIVO', 'Sebastián', 'López', 'sebastian.lopez@gmail.com', '+591 70123456', 'perfil_sebastian_lopez'),

-- Compradores activos (15)
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Daniel', 'Pérez', 'daniel.perez@gmail.com', '+591 61234567', 'perfil_daniel_perez'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Gabriela', 'Silva', 'gabriela.silva@hotmail.com', '+591 62234567', 'perfil_gabriela_silva'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Andrés', 'Martínez', 'andres.martinez@yahoo.com', '+591 63234567', 'perfil_andres_martinez'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Carolina', 'Gutiérrez', 'carolina.gutierrez@gmail.com', '+591 64234567', 'perfil_carolina_gutierrez'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Ricardo', 'Cruz', 'ricardo.cruz@outlook.com', '+591 65234567', 'perfil_ricardo_cruz'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Fernanda', 'Navarro', 'fernanda.navarro@gmail.com', '+591 66234567', 'perfil_fernanda_navarro'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Miguel', 'Rojas', 'miguel.rojas@hotmail.com', '+591 67234567', 'perfil_miguel_rojas'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Paula', 'Díaz', 'paula.diaz@yahoo.com', '+591 68234567', 'perfil_paula_diaz'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'José', 'Herrera', 'jose.herrera@gmail.com', '+591 69234567', 'perfil_jose_herrera'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Laura', 'Romero', 'laura.romero@outlook.com', '+591 60234567', 'perfil_laura_romero'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Roberto', 'Suárez', 'roberto.suarez@gmail.com', '+591 61234568', 'perfil_roberto_suarez'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Patricia', 'Morales', 'patricia.morales@hotmail.com', '+591 62234568', 'perfil_patricia_morales'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Eduardo', 'Ortega', 'eduardo.ortega@yahoo.com', '+591 63234568', 'perfil_eduardo_ortega'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Verónica', 'Castillo', 'veronica.castillo@gmail.com', '+591 64234568', 'perfil_veronica_castillo'),
((SELECT id_rol FROM ROL WHERE nombre = 'COMPRADOR'), 'ACTIVO', 'Héctor', 'Ramírez', 'hector.ramirez@outlook.com', '+591 65234568', 'perfil_hector_ramirez');

-- ============================================
-- 2. CREACIÓN DE BILLETERAS PARA TODOS LOS USUARIOS
-- ============================================

INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
SELECT id_usuario, 'ACTIVA', 0, 0.00, NULL
FROM USUARIO;

-- ============================================
-- 3. COMPRAS DE CRÉDITOS INICIALES
-- ============================================

-- Usuarios que compran diferentes paquetes de créditos
CALL sp_compra_creditos_aprobar(6, 1, 'txn_compra_001');  -- Ana Rodríguez - Pack Básico 50
CALL sp_compra_creditos_aprobar(7, 2, 'txn_compra_002');  -- Luis Fernández - Pack Estándar 100
CALL sp_compra_creditos_aprobar(8, 3, 'txn_compra_003');  -- Sofia Paredes - Pack Premium 200
CALL sp_compra_creditos_aprobar(9, 2, 'txn_compra_004');  -- Diego Castro - Pack Estándar 100
CALL sp_compra_creditos_aprobar(10, 4, 'txn_compra_005'); -- Valeria Ríos - Pack Empresarial 500
CALL sp_compra_creditos_aprobar(11, 1, 'txn_compra_006'); -- Javier Torrez - Pack Básico 50
CALL sp_compra_creditos_aprobar(12, 3, 'txn_compra_007'); -- Camila Vargas - Pack Premium 200
CALL sp_compra_creditos_aprobar(13, 2, 'txn_compra_008'); -- Mateo Salazar - Pack Estándar 100
CALL sp_compra_creditos_aprobar(14, 5, 'txn_compra_009'); -- Isabella Molina - Pack Máximo 1000
CALL sp_compra_creditos_aprobar(15, 1, 'txn_compra_010'); -- Sebastián López - Pack Básico 50

-- Compradores también compran créditos
CALL sp_compra_creditos_aprobar(16, 2, 'txn_compra_011'); -- Daniel Pérez - Pack Estándar 100
CALL sp_compra_creditos_aprobar(17, 1, 'txn_compra_012'); -- Gabriela Silva - Pack Básico 50
CALL sp_compra_creditos_aprobar(18, 3, 'txn_compra_013'); -- Andrés Martínez - Pack Premium 200
CALL sp_compra_creditos_aprobar(19, 2, 'txn_compra_014'); -- Carolina Gutiérrez - Pack Estándar 100
CALL sp_compra_creditos_aprobar(20, 1, 'txn_compra_015'); -- Ricardo Cruz - Pack Básico 50

-- ============================================
-- 4. CREACIÓN DE PRODUCTOS Y SERVICIOS
-- ============================================

-- Productos disponibles
INSERT IGNORE INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso) VALUES
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología'), 'Laptop Dell Latitude', 'Laptop reacondicionada, 8GB RAM, 256GB SSD', 1200.00, 2.1),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología'), 'iPhone 11', 'Smartphone reacondicionado, 64GB', 450.00, 0.194),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Hogar'), 'Sofá 3 plazas', 'Sofá en buen estado, tela resistente', 350.00, 45.0),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Hogar'), 'Mesa de centro', 'Mesa de madera maciza, diseño moderno', 120.00, 15.5),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Educación'), 'Libros de programación', 'Colección de 5 libros sobre Python y JavaScript', 80.00, 3.2),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Transporte'), 'Bicicleta montañera', 'Bicicleta usada, cambios 21 velocidades', 180.00, 12.0),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Ropa'), 'Chaqueta de cuero', 'Chaqueta genuina, talla M', 95.00, 1.8),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Deportes'), 'Set de pesas', 'Juego de pesas de 20kg total', 60.00, 22.0),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Juguetes'), 'Lego Classic', 'Set de 500 piezas, creativo', 25.00, 0.8),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Herramientas'), 'Taladro inalámbrico', 'Taladro 18V, con accesorios', 75.00, 2.3);

-- Servicios disponibles
INSERT IGNORE INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min) VALUES
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Educación'), 'ACTIVO', 'Clases de matemáticas', 'Tutorías personalizadas para estudiantes', 40.00, 60),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Educación'), 'ACTIVO', 'Curso de jardinería', 'Aprende técnicas de jardinería sostenible', 30.00, 90),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Hogar'), 'ACTIVO', 'Limpieza ecológica', 'Servicio de limpieza con productos naturales', 50.00, 120),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Jardinería'), 'ACTIVO', 'Mantenimiento de jardines', 'Podado, riego y cuidado de plantas', 45.00, 180),
((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Música'), 'ACTIVO', 'Clases de guitarra', 'Clases para principiantes e intermedios', 35.00, 60);

-- ============================================
-- 5. CREACIÓN DE PUBLICACIONES
-- ============================================

-- Publicaciones de productos
INSERT IGNORE INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url) VALUES
(6, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 1, 'Laptop Dell Latitude - Excelente estado', 'Laptop reacondicionada profesionalmente, ideal para trabajo y estudio. Incluye cargador original.', 240, 'img/laptop_dell.jpg'),
(7, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 2, 'iPhone 11 reacondicionado', 'Smartphone en perfecto estado, batería al 85%, incluye funda y cargador.', 90, 'img/iphone11.jpg'),
(8, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Hogar'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 3, 'Sofá 3 plazas cómodo', 'Sofá en excelente estado, solo 1 año de uso. Perfecto para sala de estar.', 70, 'img/sofa_3plazas.jpg'),
(9, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Hogar'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 4, 'Mesa de centro moderna', 'Mesa de madera maciza, diseño contemporáneo. Ideal para apartamentos.', 24, 'img/mesa_centro.jpg'),
(10, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Educación'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 5, 'Libros programación completo', 'Colección esencial para desarrolladores. Incluye Python, JavaScript y algoritmos.', 16, 'img/libros_programacion.jpg'),
(11, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Transporte'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 6, 'Bicicleta montañera profesional', 'Bicicleta en buen estado, perfecta para ejercicio y transporte ecológico.', 36, 'img/bicicleta_montañera.jpg'),
(12, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Ropa'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 7, 'Chaqueta de cuero genuino', 'Chaqueta de alta calidad, talla M. Solo usada 2 veces.', 19, 'img/chaqueta_cuero.jpg'),
(13, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Deportes'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 8, 'Set de pesas 20kg completo', 'Ideal para ejercicio en casa. Incluye barra y discos.', 12, 'img/set_pesas.jpg'),
(14, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Juguetes'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 9, 'Lego Classic 500 piezas', 'Set creativo para niños y adultos. Piezas en perfecto estado.', 5, 'img/lego_classic.jpg'),
(15, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Herramientas'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'PRODUCTO'), 'PUBLICADA', 10, 'Taladro inalámbrico profesional', 'Herramienta confiable, batería de larga duración. Incluye maletín.', 15, 'img/taladro_inalambrico.jpg');

-- Publicaciones de servicios
INSERT IGNORE INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url) VALUES
(6, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Educación'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'SERVICIO'), 'PUBLICADA', 1, 'Clases de matemáticas personalizadas', 'Tutorías individuales para estudiantes de primaria y secundaria. Métodos pedagógicos modernos.', 8, 'img/clases_matematicas.jpg'),
(7, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Educación'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'SERVICIO'), 'PUBLICADA', 2, 'Curso de jardinería sostenible', 'Aprende a crear tu propio huerto urbano con técnicas ecológicas y de bajo impacto.', 6, 'img/curso_jardineria.jpg'),
(8, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Hogar'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'SERVICIO'), 'PUBLICADA', 3, 'Limpieza ecológica del hogar', 'Servicio profesional usando solo productos naturales y biodegradables.', 10, 'img/limpieza_ecologica.jpg'),
(9, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Jardinería'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'SERVICIO'), 'PUBLICADA', 4, 'Mantenimiento completo de jardines', 'Podado, riego, fertilización orgánica y diseño de espacios verdes.', 9, 'img/mantenimiento_jardines.jpg'),
(10, (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Música'), (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre = 'SERVICIO'), 'PUBLICADA', 5, 'Clases de guitarra para todos los niveles', 'Aprende desde cero o perfecciona tu técnica. Método personalizado.', 7, 'img/clases_guitarra.jpg');

-- ============================================
-- 6. RELACIÓN PUBLICACIONES-PRODUCTOS/SERVICIOS
-- ============================================

-- Relación publicaciones-productos
INSERT IGNORE INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um) VALUES
(1, 1, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u')),
(2, 2, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u')),
(3, 3, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u')),
(4, 4, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u')),
(5, 5, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u')),
(6, 6, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u')),
(7, 7, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u')),
(8, 8, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u')),
(9, 9, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u')),
(10, 10, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u'));

-- Relación publicaciones-servicios
INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario) VALUES
(11, 1, 'Lunes a Viernes 15:00-19:00'),
(12, 2, 'Sábados 9:00-12:00'),
(13, 3, 'Lunes a Sábado 8:00-17:00'),
(14, 4, 'Miércoles y Sábados 7:00-13:00'),
(15, 5, 'Martes y Jueves 16:00-20:00');

-- ============================================
-- 7. TRANSACCIONES E INTERCAMBIOS
-- ============================================

-- Primero agregamos más compras de créditos para asegurar saldos suficientes
CALL sp_compra_creditos_aprobar(21, 1, 'txn_compra_016'); -- Fernanda - Pack Básico 50
CALL sp_compra_creditos_aprobar(22, 1, 'txn_compra_017'); -- Miguel - Pack Básico 50  
CALL sp_compra_creditos_aprobar(23, 1, 'txn_compra_018'); -- Paula - Pack Básico 50
CALL sp_compra_creditos_aprobar(24, 1, 'txn_compra_019'); -- José - Pack Básico 50
CALL sp_compra_creditos_aprobar(25, 2, 'txn_compra_020'); -- Laura - Pack Estándar 100
CALL sp_compra_creditos_aprobar(26, 1, 'txn_compra_021'); -- Roberto - Pack Básico 50
CALL sp_compra_creditos_aprobar(27, 1, 'txn_compra_022'); -- Patricia - Pack Básico 50
CALL sp_compra_creditos_aprobar(28, 2, 'txn_compra_023'); -- Eduardo - Pack Estándar 100
CALL sp_compra_creditos_aprobar(29, 1, 'txn_compra_024'); -- Verónica - Pack Básico 50
CALL sp_compra_creditos_aprobar(30, 1, 'txn_compra_025'); -- Héctor - Pack Básico 50

-- Transacciones exitosas entre usuarios (montos ajustados según saldos reales)
CALL sp_realizar_intercambio(16, 1, 40);   -- Daniel compra laptop de Ana
CALL sp_realizar_intercambio(17, 2, 30);   -- Gabriela compra iPhone de Luis
CALL sp_realizar_intercambio(18, 3, 70);   -- Andrés compra sofá de Sofia
CALL sp_realizar_intercambio(19, 4, 20);   -- Carolina compra mesa de Diego
CALL sp_realizar_intercambio(20, 5, 15);   -- Ricardo compra libros de Valeria
CALL sp_realizar_intercambio(21, 6, 35);   -- Fernanda compra bicicleta de Javier
CALL sp_realizar_intercambio(22, 7, 15);   -- Miguel compra chaqueta de Camila
CALL sp_realizar_intercambio(23, 8, 10);   -- Paula compra pesas de Mateo
CALL sp_realizar_intercambio(24, 9, 5);    -- José compra Lego de Isabella
CALL sp_realizar_intercambio(25, 10, 12);  -- Laura compra taladro de Sebastián

-- Servicios
CALL sp_realizar_intercambio(26, 11, 8);   -- Roberto contrata clases de matemáticas
CALL sp_realizar_intercambio(27, 12, 6);   -- Patricia contrata curso de jardinería
CALL sp_realizar_intercambio(28, 13, 10);  -- Eduardo contrata limpieza ecológica
CALL sp_realizar_intercambio(29, 14, 9);   -- Verónica contrata mantenimiento jardines
-- CALL sp_realizar_intercambio(30, 15, 7);   -- Héctor contrata clases de guitarra

-- Segunda ronda de transacciones (montos más pequeños para reutilización)
CALL sp_realizar_intercambio(17, 6, 15);   -- Gabriela compra bicicleta de Javier
CALL sp_realizar_intercambio(19, 8, 8);    -- Carolina compra pesas de Mateo
CALL sp_realizar_intercambio(22, 5, 10);   -- Miguel compra libros de Valeria
CALL sp_realizar_intercambio(25, 3, 25);   -- Laura compra sofá de Sofia
CALL sp_realizar_intercambio(28, 10, 8);   -- Eduardo compra taladro de Sebastián

-- Tercera ronda de transacciones (transacciones pequeñas)
CALL sp_realizar_intercambio(16, 9, 3);    -- Daniel compra Lego de Isabella
CALL sp_realizar_intercambio(18, 7, 8);    -- Andrés compra chaqueta de Camila
CALL sp_realizar_intercambio(20, 8, 5);    -- Ricardo compra pesas de Mateo
CALL sp_realizar_intercambio(21, 4, 10);   -- Fernanda compra mesa de Diego
CALL sp_realizar_intercambio(23, 5, 8);    -- Paula compra libros de Valeria
CALL sp_realizar_intercambio(24, 10, 6);   -- José compra taladro de Sebastián
CALL sp_realizar_intercambio(26, 9, 4);    -- Roberto compra Lego de Isabella
CALL sp_realizar_intercambio(27, 7, 7);    -- Patricia compra chaqueta de Camila
CALL sp_realizar_intercambio(29, 8, 6);    -- Verónica compra pesas de Mateo
CALL sp_realizar_intercambio(30, 4, 8);    -- Héctor compra mesa de Diego

-- ============================================
-- 8. ACTIVIDADES SOSTENIBLES (CORREGIDO)
-- ============================================

-- Registro de actividades sostenibles con bonificación
CALL sp_registrar_actividad_sostenible(16, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'RECICLAJE'), 'Reciclaje de 15kg de plástico y vidrio en centro comunitario', 25, 'img/reciclaje_16.jpg');
CALL sp_registrar_actividad_sostenible(17, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'VOLUNTARIADO'), 'Voluntariado en reforestación de parque urbano - 8 horas', 40, 'img/voluntariado_17.jpg');
CALL sp_registrar_actividad_sostenible(18, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'EDUCACION_AMBIENTAL'), 'Charla sobre compostaje doméstico para 30 personas', 30, 'img/charla_18.jpg');
CALL sp_registrar_actividad_sostenible(19, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'REUTILIZACION'), 'Taller de reutilización creativa de ropa usada', 35, 'img/taller_19.jpg');
CALL sp_registrar_actividad_sostenible(20, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'CONSERVACION'), 'Participación en limpieza de ribera del río', 20, 'img/limpieza_20.jpg');
CALL sp_registrar_actividad_sostenible(21, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'TRANSPORTE_SOSTENIBLE'), 'Uso exclusivo de bicicleta por 30 días consecutivos', 50, 'img/bicicleta_21.jpg');
CALL sp_registrar_actividad_sostenible(22, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'RECICLAJE'), 'Reciclaje de electrónicos - 5 dispositivos', 30, 'img/electronico_22.jpg');
CALL sp_registrar_actividad_sostenible(23, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'VOLUNTARIADO'), 'Voluntariado en banco de alimentos - 12 horas', 45, 'img/alimentos_23.jpg');
CALL sp_registrar_actividad_sostenible(24, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'EDUCACION_AMBIENTAL'), 'Taller de huertos urbanos para niños', 25, 'img/huertos_24.jpg');
CALL sp_registrar_actividad_sostenible(25, (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre = 'REUTILIZACION'), 'Reparación y donación de 10 muebles usados', 40, 'img/muebles_25.jpg');

-- ============================================
-- 9. CALIFICACIONES Y RESEÑAS (CORREGIDO)
-- ============================================

INSERT IGNORE INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario) VALUES
(16, 1, 5, 'Excelente producto, llegó en perfectas condiciones y muy buena comunicación con el vendedor.'),
(17, 2, 4, 'Buen smartphone, funciona perfectamente. La entrega fue un poco tardía pero todo correcto.'),
(18, 3, 5, 'El sofá es muy cómodo y está en excelente estado. Muy contento con la compra.'),
(19, 4, 4, 'Mesa de buena calidad, solo algunos pequeños detalles pero en general muy bien.'),
(20, 5, 5, 'Los libros son exactamente lo que necesitaba. Muy buen estado y envío rápido.'),
(21, 6, 5, 'Bicicleta en perfecto estado, mejor de lo que esperaba. Recomendado 100%.'),
(22, 7, 4, 'Chaqueta de buena calidad, talla correcta. Todo según lo descrito.'),
(23, 8, 5, 'Pesas en perfecto estado, muy buen material. Ideal para entrenar en casa.'),
(24, 9, 5, 'Lego completo y en excelente estado. Mi hijo está encantado.'),
(25, 10, 4, 'Taladro funciona perfectamente, solo la batería dura un poco menos de lo esperado.');

-- Calificaciones para servicios
INSERT IGNORE INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario) VALUES
(26, 11, 5, 'Excelente profesor, muy paciente y con buenos métodos de enseñanza.'),
(27, 12, 4, 'Curso muy interesante, aprendí mucho sobre jardinería sostenible.'),
(28, 13, 5, 'Limpieza impecable con productos ecológicos. Muy profesional.'),
(29, 14, 5, 'Jardín quedó espectacular, muy buen trabajo y atención al detalle.'),
(30, 15, 4, 'Buen profesor de guitarra, avance rápido con sus métodos.');

-- ============================================
-- 10. ACTUALIZACIÓN DE LOGROS DE USUARIOS (CORREGIDO)
-- ============================================

-- Asignar logros automáticamente (corregido el nombre del logro)
INSERT IGNORE INTO USUARIO_LOGRO (id_usuario, id_logro, progreso_actual) VALUES
-- Primeras ventas
(6, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Venta'), 1),
(7, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Venta'), 1),
(8, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Venta'), 1),
(9, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Venta'), 1),
(10, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Venta'), 1),

-- Primeras compras
(16, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Compra'), 1),
(17, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Compra'), 1),
(18, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Compra'), 1),
(19, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Compra'), 1),
(20, (SELECT id_logro FROM LOGRO WHERE nombre = 'Primera Compra'), 1),

-- Vendedores estrella (progreso)
(6, (SELECT id_logro FROM LOGRO WHERE nombre = 'Vendedor Estrella'), 2),
(7, (SELECT id_logro FROM LOGRO WHERE nombre = 'Vendedor Estrella'), 1),
(8, (SELECT id_logro FROM LOGRO WHERE nombre = 'Vendedor Estrella'), 2),
(9, (SELECT id_logro FROM LOGRO WHERE nombre = 'Vendedor Estrella'), 1),
(10, (SELECT id_logro FROM LOGRO WHERE nombre = 'Vendedor Estrella'), 2),

-- Colaboradores activos (corregido el nombre del logro)
(16, (SELECT id_logro FROM LOGRO WHERE nombre = 'Colaborador Activo'), 1),
(17, (SELECT id_logro FROM LOGRO WHERE nombre = 'Colaborador Activo'), 1),
(18, (SELECT id_logro FROM LOGRO WHERE nombre = 'Colaborador Activo'), 1),
(19, (SELECT id_logro FROM LOGRO WHERE nombre = 'Colaborador Activo'), 1),
(20, (SELECT id_logro FROM LOGRO WHERE nombre = 'Colaborador Activo'), 1);

-- ============================================
-- 11. VERIFICACIÓN FINAL Y REPORTES INICIALES
-- ============================================

SELECT '=== VERIFICACIÓN DE DATOS POBLADOS ===' as info;

-- Resumen de usuarios y saldos
SELECT 'Usuarios creados:' as item;
SELECT COUNT(*) as total_usuarios FROM USUARIO;

SELECT 'Saldos en billeteras:' as item;
SELECT 
    u.nombre,
    u.apellido,
    r.nombre as rol,
    b.saldo_creditos,
    b.saldo_bs
FROM USUARIO u
JOIN ROL r ON u.id_rol = r.id_rol
JOIN BILLETERA b ON u.id_usuario = b.id_usuario
ORDER BY b.saldo_creditos DESC
LIMIT 10;

SELECT 'Transacciones realizadas:' as item;
SELECT COUNT(*) as total_transacciones FROM TRANSACCION;

SELECT 'Actividades sostenibles:' as item;
SELECT COUNT(*) as total_actividades FROM ACTIVIDAD_SOSTENIBLE;

SELECT 'Publicaciones activas:' as item;
SELECT 
    tp.nombre as tipo_publicacion,
    COUNT(*) as cantidad
FROM PUBLICACION p
JOIN TIPO_PUBLICACION tp ON p.id_tipo_publicacion = tp.id_tipo_publicacion
WHERE p.estado = 'PUBLICADA'
GROUP BY tp.nombre;

-- Generar reporte de impacto inicial
CALL sp_generar_reporte_impacto(
    (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre = 'MENSUAL'),
    (SELECT id_periodo FROM PERIODO WHERE nombre = '2024-03'),
    NULL
);

SELECT 'Reporte de impacto generado:' as item;
SELECT 
    tr.nombre as tipo_reporte,
    p.nombre as periodo,
    ri.total_co2_ahorrado,
    ri.total_agua_ahorrada,
    ri.total_energia_ahorrada,
    ri.total_transacciones,
    ri.total_usuarios_activos
FROM REPORTE_IMPACTO ri
JOIN TIPO_REPORTE tr ON ri.id_tipo_reporte = tr.id_tipo_reporte
JOIN PERIODO p ON ri.id_periodo = p.id_periodo;

SELECT '=== POBLADO DE DATOS COMPLETADO ===' as status;





-- ============================================
-- SCRIPT DE REPORTES - CRÉDITOS_VERDES 
-- Corrigiendo errores de columnas faltantes
-- ============================================

-- USE CREDITOS_VERDES;

-- ============================================
-- 1. REPORTES DE ACTIVIDAD DE USUARIOS
-- ============================================

-- 1.1 USUARIOS NUEVOS - Simplificado sin fechas
SELECT 
    'TOTAL_USUARIOS' as tipo,
    COUNT(*) as cantidad
FROM USUARIO
WHERE estado = 'ACTIVO'

UNION ALL

SELECT 
    'USUARIOS_CON_TRANSACCIONES' as tipo,
    COUNT(DISTINCT id_usuario) as cantidad
FROM (
    SELECT id_comprador as id_usuario FROM TRANSACCION WHERE estado = 'COMPLETADA'
    UNION 
    SELECT id_vendedor as id_usuario FROM TRANSACCION WHERE estado = 'COMPLETADA'
) usuarios_con_tx;

-- 1.2 DISTRIBUCIÓN DE USUARIOS POR ROL Y ESTADO
SELECT 
    r.nombre as rol,
    u.estado,
    COUNT(*) as cantidad,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM USUARIO)), 2) as porcentaje
FROM USUARIO u
JOIN ROL r ON u.id_rol = r.id_rol
GROUP BY r.nombre, u.estado
ORDER BY r.nombre, u.estado;

-- 1.3 USUARIOS POR TIPO (COMPRADORES vs VENDEDORES)
SELECT 
    'COMPRADORES' as tipo,
    COUNT(DISTINCT id_comprador) as cantidad
FROM TRANSACCION 
WHERE estado = 'COMPLETADA'

UNION ALL

SELECT 
    'VENDEDORES' as tipo,
    COUNT(DISTINCT id_vendedor) as cantidad
FROM TRANSACCION 
WHERE estado = 'COMPLETADA'

UNION ALL

SELECT 
    'USUARIOS_DUAL' as tipo,
    COUNT(DISTINCT u.id_usuario) as cantidad
FROM USUARIO u
WHERE EXISTS (SELECT 1 FROM TRANSACCION WHERE id_comprador = u.id_usuario AND estado = 'COMPLETADA')
  AND EXISTS (SELECT 1 FROM TRANSACCION WHERE id_vendedor = u.id_usuario AND estado = 'COMPLETADA');

-- ============================================
-- 2. REPORTES DE INTERCAMBIOS REALIZADOS
-- ============================================

-- 2.1 INTERCAMBIOS POR ESTADO
SELECT 
    estado,
    COUNT(*) as cantidad_intercambios,
    SUM(cantidad_creditos) as total_creditos,
    ROUND(AVG(cantidad_creditos), 2) as promedio_creditos,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM TRANSACCION)), 2) as porcentaje_total
FROM TRANSACCION
GROUP BY estado
ORDER BY cantidad_intercambios DESC;

-- 2.2 TOP 10 USUARIOS CON MÁS INTERCAMBIOS
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido,
    r.nombre as rol,
    COUNT(DISTINCT t.id_transaccion) as total_intercambios,
    SUM(CASE WHEN t.id_comprador = u.id_usuario THEN 1 ELSE 0 END) as como_comprador,
    SUM(CASE WHEN t.id_vendedor = u.id_usuario THEN 1 ELSE 0 END) as como_vendedor,
    SUM(t.cantidad_creditos) as total_creditos_movidos
FROM USUARIO u
JOIN ROL r ON u.id_rol = r.id_rol
LEFT JOIN TRANSACCION t ON u.id_usuario = t.id_comprador OR u.id_usuario = t.id_vendedor
WHERE t.estado = 'COMPLETADA'
GROUP BY u.id_usuario, u.nombre, u.apellido, r.nombre
ORDER BY total_intercambios DESC
LIMIT 10;

-- 2.3 INTERCAMBIOS POR CATEGORÍA
SELECT 
    c.nombre as categoria,
    COUNT(DISTINCT t.id_transaccion) as intercambios,
    SUM(t.cantidad_creditos) as creditos_total,
    ROUND(AVG(t.cantidad_creditos), 2) as creditos_promedio,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM TRANSACCION WHERE estado = 'COMPLETADA')), 2) as porcentaje
FROM TRANSACCION t
JOIN PUBLICACION p ON t.id_publicacion = p.id_publicacion
JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
WHERE t.estado = 'COMPLETADA'
GROUP BY c.nombre
ORDER BY intercambios DESC;

-- 2.4 INTERCAMBIOS POR TIPO DE PUBLICACIÓN
SELECT 
    tp.nombre as tipo_publicacion,
    COUNT(DISTINCT t.id_transaccion) as intercambios,
    SUM(t.cantidad_creditos) as creditos_total,
    ROUND(AVG(t.cantidad_creditos), 2) as creditos_promedio
FROM TRANSACCION t
JOIN PUBLICACION p ON t.id_publicacion = p.id_publicacion
JOIN TIPO_PUBLICACION tp ON p.id_tipo_publicacion = tp.id_tipo_publicacion
WHERE t.estado = 'COMPLETADA'
GROUP BY tp.nombre
ORDER BY intercambios DESC;

-- ============================================
-- 3. REPORTES DE MOVIMIENTOS DE CRÉDITOS (CORREGIDOS)
-- ============================================

-- 3.1 MOVIMIENTOS POR TIPO
SELECT 
    tm.nombre as tipo_movimiento,
    sm.nombre as signo,
    COUNT(*) as cantidad_movimientos,
    SUM(mc.cantidad) as total_creditos,
    ROUND(AVG(mc.cantidad), 2) as promedio_creditos,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM MOVIMIENTO_CREDITOS)), 2) as porcentaje
FROM MOVIMIENTO_CREDITOS mc
JOIN TIPO_MOVIMIENTO tm ON mc.id_tipo_movimiento = tm.id_tipo_movimiento
JOIN SIGNO_X_TIPO_MOV stm ON tm.id_tipo_movimiento = stm.id_tipo_movimiento
JOIN SIGNO_MOVIMIENTO sm ON stm.id_signo = sm.id_signo
GROUP BY tm.nombre, sm.nombre
ORDER BY total_creditos DESC;

-- 3.2 TOP 10 USUARIOS POR SALDO ACTUAL (CORREGIDO)
SELECT 
    u.nombre,
    u.apellido,
    r.nombre as rol,
    b.saldo_creditos,
    b.saldo_bs,
    COUNT(mc.id_movimiento) as total_movimientos,
    SUM(CASE WHEN sm.nombre = 'POSITIVO' THEN mc.cantidad ELSE 0 END) as creditos_recibidos,
    SUM(CASE WHEN sm.nombre = 'NEGATIVO' THEN mc.cantidad ELSE 0 END) as creditos_gastados,
    ROUND(b.saldo_creditos * 100.0 / (SELECT SUM(saldo_creditos) FROM BILLETERA), 2) as porcentaje_total
FROM USUARIO u
JOIN ROL r ON u.id_rol = r.id_rol
JOIN BILLETERA b ON u.id_usuario = b.id_usuario
JOIN MOVIMIENTO_CREDITOS mc ON u.id_usuario = mc.id_usuario
JOIN TIPO_MOVIMIENTO tm ON mc.id_tipo_movimiento = tm.id_tipo_movimiento
JOIN SIGNO_X_TIPO_MOV stm ON tm.id_tipo_movimiento = stm.id_tipo_movimiento
JOIN SIGNO_MOVIMIENTO sm ON stm.id_signo = sm.id_signo
GROUP BY u.id_usuario, u.nombre, u.apellido, r.nombre, b.saldo_creditos, b.saldo_bs
ORDER BY b.saldo_creditos DESC
LIMIT 10;

-- 3.3 DISTRIBUCIÓN DE SALDOS
SELECT 
    CASE 
        WHEN saldo_creditos = 0 THEN 'SIN SALDO'
        WHEN saldo_creditos < 50 THEN '0-50 CRÉDITOS'
        WHEN saldo_creditos < 100 THEN '50-100 CRÉDITOS'
        WHEN saldo_creditos < 200 THEN '100-200 CRÉDITOS'
        ELSE 'MÁS DE 200 CRÉDITOS'
    END as rango_saldo,
    COUNT(*) as cantidad_usuarios,
    SUM(saldo_creditos) as total_creditos,
    ROUND(AVG(saldo_creditos), 2) as promedio,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM BILLETERA)), 2) as porcentaje
FROM BILLETERA
GROUP BY rango_saldo
ORDER BY total_creditos DESC;

-- ============================================
-- 4. REPORTES DE CUSTODIA Y RECLAMOS
-- ============================================

-- 4.1 CALIFICACIONES Y SATISFACCIÓN
SELECT 
    u.nombre as vendedor,
    u.apellido,
    COUNT(c.id_calificacion) as total_calificaciones,
    ROUND(AVG(c.estrellas), 2) as promedio_estrellas,
    SUM(CASE WHEN c.estrellas = 5 THEN 1 ELSE 0 END) as calificaciones_5_estrellas,
    SUM(CASE WHEN c.estrellas <= 2 THEN 1 ELSE 0 END) as calificaciones_bajas,
    ROUND((SUM(CASE WHEN c.estrellas = 5 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as porcentaje_5_estrellas
FROM USUARIO u
JOIN PUBLICACION p ON u.id_usuario = p.id_usuario
JOIN CALIFICACION c ON p.id_publicacion = c.id_publicacion
GROUP BY u.id_usuario, u.nombre, u.apellido
HAVING total_calificaciones >= 1
ORDER BY promedio_estrellas DESC, total_calificaciones DESC;

-- 4.2 TRANSACCIONES CON PROBLEMAS
SELECT 
    estado,
    COUNT(*) as cantidad,
    SUM(cantidad_creditos) as creditos_involucrados,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM TRANSACCION)), 2) as porcentaje_total
FROM TRANSACCION
WHERE estado IN ('CANCELADA', 'RECHAZADA', 'ANULADA')
GROUP BY estado
ORDER BY cantidad DESC;

-- 4.3 BITÁCORA DE INTERCAMBIOS
SELECT 
    'TOTAL_EVENTOS' as tipo,
    COUNT(*) as cantidad
FROM BITACORA_INTERCAMBIO

UNION ALL

SELECT 
    'EVENTOS_CON_INCIDENTES' as tipo,
    COUNT(*) as cantidad
FROM BITACORA_INTERCAMBIO
WHERE descripcion LIKE '%problema%' 
   OR descripcion LIKE '%error%'
   OR descripcion LIKE '%incidente%'
   OR descripcion LIKE '%reclamo%';

-- ============================================
-- 5. INDICADORES DE IMPACTO ECOLÓGICO Y SOCIAL
-- ============================================

-- 5.1 IMPACTO AMBIENTAL TOTAL POR CATEGORÍA
SELECT 
    c.nombre as categoria,
    COUNT(DISTINCT ia.id_transaccion) as transacciones,
    ROUND(SUM(ia.co2_ahorrado), 2) as co2_ahorrado_kg,
    ROUND(SUM(ia.agua_ahorrada), 2) as agua_ahorrada_litros,
    ROUND(SUM(ia.energia_ahorrada), 2) as energia_ahorrada_kwh,
    ROUND(SUM(ia.co2_ahorrado) / COUNT(DISTINCT ia.id_transaccion), 2) as co2_promedio_por_transaccion
FROM IMPACTO_AMBIENTAL ia
JOIN CATEGORIA c ON ia.id_categoria = c.id_categoria
GROUP BY c.nombre
ORDER BY co2_ahorrado_kg DESC;

-- 5.2 TOP 10 USUARIOS CON MAYOR IMPACTO ECOLÓGICO
SELECT 
    u.nombre,
    u.apellido,
    r.nombre as rol,
    COUNT(DISTINCT ia.id_transaccion) as transacciones_ecologicas,
    ROUND(SUM(ia.co2_ahorrado), 2) as co2_total_ahorrado,
    ROUND(SUM(ia.agua_ahorrada), 2) as agua_total_ahorrada,
    ROUND(SUM(ia.energia_ahorrada), 2) as energia_total_ahorrada,
    ROUND(SUM(ia.co2_ahorrado) / COUNT(DISTINCT ia.id_transaccion), 2) as eficiencia_co2
FROM USUARIO u
JOIN ROL r ON u.id_rol = r.id_rol
JOIN IMPACTO_AMBIENTAL ia ON u.id_usuario = ia.id_usuario
GROUP BY u.id_usuario, u.nombre, u.apellido, r.nombre
ORDER BY co2_total_ahorrado DESC
LIMIT 10;

-- 5.3 ACTIVIDADES SOSTENIBLES POR TIPO
SELECT 
    ta.nombre as tipo_actividad,
    COUNT(*) as actividades_realizadas,
    SUM(act.creditos_otorgados) as creditos_otorgados,
    ROUND(AVG(act.creditos_otorgados), 2) as creditos_promedio,
    COUNT(DISTINCT act.id_usuario) as usuarios_participantes,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ACTIVIDAD_SOSTENIBLE)), 2) as porcentaje
FROM ACTIVIDAD_SOSTENIBLE act
JOIN TIPO_ACTIVIDAD ta ON act.id_tipo_actividad = ta.id_tipo_actividad
GROUP BY ta.nombre
ORDER BY actividades_realizadas DESC;

-- 5.4 EQUIVALENCIAS DE IMPACTO
SELECT 
    'CO2 ahorrado equivalente a' as tipo,
    ROUND(SUM(ia.co2_ahorrado) / 21.0, 2) as valor,
    'árboles absorbiendo CO2 por 1 año' as descripcion
FROM IMPACTO_AMBIENTAL ia

UNION ALL

SELECT 
    'Agua ahorrada equivalente a' as tipo,
    ROUND(SUM(ia.agua_ahorrada) / 150.0, 2) as valor,
    'duchas de 10 minutos' as descripcion
FROM IMPACTO_AMBIENTAL ia

UNION ALL

SELECT 
    'Energía ahorrada equivalente a' as tipo,
    ROUND(SUM(ia.energia_ahorrada) / 30.0, 2) as valor,
    'días de consumo eléctrico de un hogar' as descripcion
FROM IMPACTO_AMBIENTAL ia;

-- ============================================
-- 6. REPORTES CONSOLIDADOS Y RESUMEN EJECUTIVO
-- ============================================

-- 6.1 RESUMEN EJECUTIVO DEL SISTEMA
SELECT 
    'Total Usuarios Registrados' as metric,
    (SELECT COUNT(*) FROM USUARIO WHERE estado = 'ACTIVO') as valor

UNION ALL SELECT 
    'Usuarios con Transacciones',
    (SELECT COUNT(DISTINCT id_usuario) FROM (
        SELECT id_comprador as id_usuario FROM TRANSACCION WHERE estado = 'COMPLETADA'
        UNION SELECT id_vendedor as id_usuario FROM TRANSACCION WHERE estado = 'COMPLETADA'
    ) usuarios_activos)

UNION ALL SELECT 
    'Total Transacciones Completadas',
    (SELECT COUNT(*) FROM TRANSACCION WHERE estado = 'COMPLETADA')

UNION ALL SELECT 
    'Créditos en Circulación',
    (SELECT SUM(saldo_creditos) FROM BILLETERA)

UNION ALL SELECT 
    'CO2 Ahorrado Total (kg)',
    (SELECT ROUND(SUM(co2_ahorrado), 2) FROM IMPACTO_AMBIENTAL)

UNION ALL SELECT 
    'Actividades Sostenibles Registradas',
    (SELECT COUNT(*) FROM ACTIVIDAD_SOSTENIBLE)

UNION ALL SELECT 
    'Promedio Calificación',
    (SELECT ROUND(AVG(estrellas), 2) FROM CALIFICACION);

-- 6.2 EFICIENCIA DEL SISTEMA
SELECT 
    'TASA_EXITO_TRANSACCIONES' as indicador,
    ROUND(
        (SELECT COUNT(*) FROM TRANSACCION WHERE estado = 'COMPLETADA') * 100.0 / 
        (SELECT COUNT(*) FROM TRANSACCION), 
    2) as valor,
    '%' as unidad

UNION ALL

SELECT 
    'PROMEDIO_CREDITOS_POR_TRANSACCION' as indicador,
    ROUND(
        (SELECT AVG(cantidad_creditos) FROM TRANSACCION WHERE estado = 'COMPLETADA'), 
    2) as valor,
    'créditos' as unidad

UNION ALL

SELECT 
    'CO2_AHORRADO_POR_TRANSACCION' as indicador,
    ROUND(
        (SELECT SUM(co2_ahorrado) FROM IMPACTO_AMBIENTAL) / 
        (SELECT COUNT(*) FROM TRANSACCION WHERE estado = 'COMPLETADA'), 
    2) as valor,
    'kg' as unidad;

-- ============================================
-- 7. CONSULTAS AVANZADAS PARA ANÁLISIS (CORREGIDAS)
-- ============================================

-- 7.1 CORRELACIÓN ENTRE ACTIVIDAD Y RECOMPENSAS (CORREGIDO)
SELECT 
    u.nombre,
    u.apellido,
    r.nombre as rol,
    COUNT(DISTINCT t.id_transaccion) as transacciones,
    COUNT(DISTINCT act.id_actividad) as actividades_sostenibles,
    SUM(act.creditos_otorgados) as creditos_por_actividades,
    b.saldo_creditos as saldo_actual,
    ROUND(SUM(ia.co2_ahorrado), 2) as impacto_ecologico
FROM USUARIO u
JOIN ROL r ON u.id_rol = r.id_rol
LEFT JOIN TRANSACCION t ON u.id_usuario = t.id_comprador OR u.id_usuario = t.id_vendedor
LEFT JOIN ACTIVIDAD_SOSTENIBLE act ON u.id_usuario = act.id_usuario
LEFT JOIN BILLETERA b ON u.id_usuario = b.id_usuario
LEFT JOIN IMPACTO_AMBIENTAL ia ON u.id_usuario = ia.id_usuario
WHERE (t.estado = 'COMPLETADA' OR act.id_actividad IS NOT NULL)
GROUP BY u.id_usuario, u.nombre, u.apellido, r.nombre, b.saldo_creditos
HAVING transacciones > 0 OR actividades_sostenibles > 0
ORDER BY impacto_ecologico DESC;

-- 7.2 ANÁLISIS DE COMPORTAMIENTO POR ROL (CORREGIDO)
SELECT 
    r.nombre as rol,
    COUNT(DISTINCT u.id_usuario) as total_usuarios,
    COUNT(DISTINCT t.id_transaccion) as transacciones_totales,
    ROUND(COUNT(DISTINCT t.id_transaccion) * 1.0 / COUNT(DISTINCT u.id_usuario), 2) as transacciones_por_usuario,
    ROUND(AVG(b.saldo_creditos), 2) as saldo_promedio,
    ROUND(SUM(ia.co2_ahorrado), 2) as co2_ahorrado_total
FROM ROL r
JOIN USUARIO u ON r.id_rol = u.id_rol
LEFT JOIN TRANSACCION t ON u.id_usuario = t.id_comprador OR u.id_usuario = t.id_vendedor
LEFT JOIN BILLETERA b ON u.id_usuario = b.id_usuario
LEFT JOIN IMPACTO_AMBIENTAL ia ON u.id_usuario = ia.id_usuario
WHERE u.estado = 'ACTIVO'
GROUP BY r.nombre
ORDER BY transacciones_totales DESC;
