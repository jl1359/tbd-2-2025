-- PRUEBAS EN LA BD DE CREDITOS_VERDES

-- Configuracion inicial:

-- Insertar "ROLES" basicos:
insert into rol (nombre, descripcion) values
('USUARIO_COMUN', 'Usuario regular que publica e intercambia'),
('EMPRENDEDOR', 'Ofrece productos/servicios sostenibles'),
('ADMINISTRADOR', 'Gestiona y audita el sistema');

-- Insertar "PERMISOS":
insert into permiso (nombre, descripcion) values
('PUBLICAR_BIENES', 'Puede publicar bienes para intercambio'),
('PUBLICAR_SERVICIOS', 'Puede publicar servicios'),
('COMPRAR_CREDITOS', 'Puede comprar creditos con dinero real'),
('GESTIONAR_PUBLICIDAD', 'Puede crear campañas publicitarias'),
('VALIDAR_TRANSACCIONES', 'Puede aprobar/rechazar transcripciones');

-- Asignar "PERMISOS A ROLES":
insert into rol_permiso (id_rol, id_permiso) values
(1, 1), (1, 2), (1, 3),  -- PERMISOS DE "USUARIO COMUN"
(2, 1), (2, 2), (2, 3), (2, 4), -- PERMISOS DE "EMPRENDEDOR"
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5); -- PERMISOS DE "ADMINISTRADOR"


-- INSERTAR "CATALOGOS" ESENCIALES:

-- Resultado de acceso:
insert into resultado_acceso (nombre, descripcion) values
('EXITO', 'Login exitoso'),
('FALLO_CONTRASEÑA', 'Contraseña incorrecta'),
('USUARIO_NO_EXISTE', 'Usuario no encontrado');

-- Categorias
insert into categoria (nombre, descripcion) values
('ROPA', 'Prendas de vestir y accesorios'),
('TECNOLOGIA', 'Dispositivos electronicos y gadgets'),
('EDUCACION', 'Clases, cursos y tutorias'),
('TRANSPORTE', 'Servicios de movilidad'),
('HOGAR', 'Muebles y articulos para el hogar');

-- Tipo de publicacion:
insert into tipo_publicacion (nombre, descripcion) values
('BIEN', 'Producto fisico o articulo'),
('SERVICIO', 'Servicio o actividad');

-- Tipo de movimiento:
insert into tipo_movimiento (nombre, descripcion) values 
('RECARGA', 'Recarga de créditos por compra'),
('INTERCAMBIO_IN', 'Entrada de créditos por intercambio'),
('INTERCAMBIO_OUT', 'Salida de créditos por intercambio'),
('BONO_ACTIVIDAD', 'Bonificación por actividad sostenible'),
('BONO_PUBLICACION', 'Bonificación por publicación');
select * from tipo_movimiento;
-- Signos de movimiento:
insert into signo_movimiento (nombre) values
('POSITIVO'), ('NEGATIVO');

-- Relacion tipo movimiento - signo:
insert into signo_x_tipo_mov (id_tipo_movimiento, id_signo) values
(5, 1),  -- RECARGA: POSITIVO
(6, 1),  -- INTERCAMBIO_IN: POSITIVO  
(7, 2),  -- INTERCAMBIO_OUT: NEGATIVO
(8, 1),  -- BONO_ACTIVIDAD: POSITIVO
(9, 1);  -- BONO_PUBLICACION: POSITIVO


-- Tipos de referencia:
insert into tipo_referencia (nombre) values
('PUBLICACION'), ('TRANSACCION'), ('COMPRA'), ('ACTIVIDAD_SOSTENIBLE');
select * from tipo_referencia;
insert into tipo_referencia (nombre) value ('AJUSTE');

-- Paquetes de creditos:
insert into paquete_creditos (nombre, cantidad_creditos, precio_bs, activo) values
('PAQUETE_BASICO', 50, 15.00, TRUE),
('PAQUETE_STANDARD', 100, 25.00, TRUE),
('PAQUETE_PREMIUM', 200, 45.00, TRUE);

-- Periodos para reportes:
insert into periodo (nombre, descripcion) values
('DIARIO', 'Reporte diario de impacto'),
('SEMANAL', 'Reporte semanal consolidado'),
('MENSUAL', 'Reporte mensual para metricas');

-- Equivalencias de impacto ambiental:
insert into equivalencia_impacto (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad) values
(1, NULL, 2.5, 8000, 50), -- ROPA
(2, NULL, 15.0, 5000, 120), -- TECNOLOGIA
(3, NULL, 0.1, 10, 2), -- EDUCACION
(4, NULL, 0.5, 50, 8), -- TRANSPORTE
(5, NULL, 8.0, 3000, 80); -- HOGAR

-- Insertar tipos de actividad
INSERT INTO TIPO_ACTIVIDAD (nombre, descripcion) VALUES
('RECICLAJE', 'Actividades de reciclaje'),
('VOLUNTARIADO', 'Trabajo voluntario ambiental'),
('EDUCACION', 'Charlas y capacitaciones');

-- Insertar tipos de reporte
INSERT INTO TIPO_REPORTE (nombre, descripcion) VALUES
('USUARIO_INDIVIDUAL', 'Reporte individual de usuario'),
('PLATAFORMA_GENERAL', 'Reporte general de la plataforma');

-- REGISTRO DE USUARIOS:

insert into usuario (id_rol, estado, nombre, apellido, correo, telefono) VALUES
(1, 'ACTIVO', 'Ana', 'García', 'ana.garcia@email.com', '777-1111'),
(1, 'ACTIVO', 'Pedro', 'López', 'pedro.lopez@email.com', '777-2222'), 
(2, 'ACTIVO', 'EcoTienda', 'Verde', 'ecotienda@email.com', '777-3333'),
(3, 'ACTIVO', 'Admin', 'Sistema', 'admin@creditosverdes.com', '777-0000');

-- Billeteras para los usuarios:
insert into billetera (id_usuario, estado, saldo_creditos, saldo_bs) VALUES
(1, 'ACTIVA', 50, 0.00),
(2, 'ACTIVA', 100, 0.00),
(3, 'ACTIVA', 200, 0.00), 
(4, 'ACTIVA', 0, 0.00);

-- Creacion de ubicaciones:
insert into ubicacion (direccion, ciudad, provincia) VALUES
('Av. Ecológica 123', 'La Paz', 'La Paz'),
('Calle Verde 456', 'Cochabamba', 'Cochabamba'),
('Plaza Sostenible 789', 'Santa Cruz', 'Santa Cruz');

-- Creacion de publicaciones:
-- Ana publica un libro (Bien)
INSERT INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos) VALUES
(1, 3, 1, 'PUBLICADA', 1, 'Libro de Matemáticas', 'Libro de matemáticas nivel universitario en buen estado', 15);

-- Pedro publica una bicicleta (Bien)  
INSERT INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos) VALUES
(2, 4, 1, 'PUBLICADA', 2, 'Bicicleta Mountain Bike', 'Bicicleta en buen estado, perfecta para ciudad', 80);

-- EcoTienda publica clases de inglés (Servicio)
INSERT INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos) VALUES
(3, 3, 2, 'PUBLICADA', 3, 'Clases de Inglés', 'Clases de inglés conversacional por hora', 25);



-- INSERTAR USUARIOS Y VERIFICAR CREACION DE BILLETERAS AUTOMATICAMENTE:
insert into usuario (id_rol, estado, nombre, apellido, correo, telefono) VALUES
(1, 'ACTIVO', 'Maria', 'Gonzalez', 'maria@email.com', '777-1111'),
(1, 'ACTIVO', 'Carlos', 'Rodriguez', 'carlos@email.com', '777-2222'),
(2, 'ACTIVO', 'EcoShop', 'Sostenible', 'ecoshop@email.com', '777-3333');

-- Verificar que se crearon las billeteras automáticamente
SELECT u.nombre, b.saldo_creditos, b.estado 
FROM USUARIO u 
LEFT JOIN BILLETERA b ON u.id_usuario = b.id_usuario;


-- PROBAR COMPRA DE CREDITOS:
-- Maria compra paquete básico
CALL sp_compra_creditos_aprobar(1, 1, 'pay_maria_001');

-- Verificar resultados
SELECT '=== MOVIMIENTOS MARIA ===' as info;
SELECT m.id_usuario, u.nombre, tm.nombre as tipo, m.cantidad, m.saldo_anterior, m.saldo_posterior
FROM MOVIMIENTO_CREDITOS m
JOIN USUARIO u ON m.id_usuario = u.id_usuario
JOIN TIPO_MOVIMIENTO tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento
WHERE m.id_usuario = 1;

SELECT '=== BILLETERA ACTUALIZADA ===' as info;
SELECT u.nombre, b.saldo_creditos 
FROM BILLETERA b JOIN USUARIO u ON b.id_usuario = u.id_usuario 
WHERE u.id_usuario = 1;


-- CREAR PUBLICACIONES:

-- Crear ubicaciones
INSERT INTO UBICACION (direccion, ciudad, provincia) VALUES
('Av. Principal 123', 'La Paz', 'La Paz'),
('Calle Comercio 456', 'Cochabamba', 'Cochabamba');

-- Carlos publica una bicicleta
INSERT INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos) VALUES
(2, 4, 1, 'PUBLICADA', 1, 'Bicicleta Usada', 'Bicicleta en buen estado para ciudad', 60);

-- EcoShop publica clases
INSERT INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos) VALUES
(3, 3, 2, 'PUBLICADA', 2, 'Clases de Yoga', 'Clases de yoga para principiantes', 30);

-- Verificar publicaciones
SELECT p.id_publicacion, u.nombre, p.titulo, p.valor_creditos 
FROM PUBLICACION p 
JOIN USUARIO u ON p.id_usuario = u.id_usuario;


-- PROBAR INTERCAMBIOS:

-- Maria compra bicicleta de Carlos (60 créditos)
CALL sp_realizar_intercambio(1, 2, 60);

-- Verificar transacción creada
SELECT '=== TRANSACCIÓN CREADA ===' as info;
SELECT t.id_transaccion, c.nombre as comprador, v.nombre as vendedor, 
       t.cantidad_creditos, t.estado
FROM TRANSACCION t
JOIN USUARIO c ON t.id_comprador = c.id_usuario
JOIN USUARIO v ON t.id_vendedor = v.id_usuario;

-- Verificar movimientos generados
SELECT '=== MOVIMIENTOS INTERCAMBIO ===' as info;
SELECT m.id_usuario, u.nombre, tm.nombre as tipo, m.cantidad, m.descripcion
FROM MOVIMIENTO_CREDITOS m
JOIN USUARIO u ON m.id_usuario = u.id_usuario
JOIN TIPO_MOVIMIENTO tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento
WHERE m.id_referencia = 1;  -- id_transaccion = 1

-- Verificar bitácora
SELECT '=== BITÁCORA INTERCAMBIO ===' as info;
SELECT * FROM BITACORA_INTERCAMBIO WHERE id_transaccion = 1;

-- Verificar impacto ambiental calculado
SELECT '=== IMPACTO AMBIENTAL ===' as info;
SELECT * FROM IMPACTO_AMBIENTAL;


-- ACTIVIDADES SOSTENIBLES:

-- Carlos recibe bonificación por reciclar
CALL sp_registrar_actividad_sostenible(2, 1, 'Reciclaje de 10kg de plástico', 15, 'https://evidencia.com/reciclaje.jpg');

-- Verificar actividad y movimiento
SELECT '=== ACTIVIDAD SOSTENIBLE ===' as info;
SELECT a.id_usuario, u.nombre, ta.nombre as tipo_actividad, a.creditos_otorgados
FROM ACTIVIDAD_SOSTENIBLE a
JOIN USUARIO u ON a.id_usuario = u.id_usuario
JOIN TIPO_ACTIVIDAD ta ON a.id_tipo_actividad = ta.id_tipo_actividad;

SELECT '=== MOVIMIENTO BONO ===' as info;
SELECT m.id_usuario, u.nombre, tm.nombre as tipo, m.cantidad, m.descripcion
FROM MOVIMIENTO_CREDITOS m
JOIN USUARIO u ON m.id_usuario = u.id_usuario
JOIN TIPO_MOVIMIENTO tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento
WHERE tm.nombre = 'BONO_ACTIVIDAD';


-- REPORTES Y RANKINGS:

-- Generar reporte general de la plataforma (período 3 = mensual)
CALL sp_generar_reporte_impacto(2, 3, NULL);

-- Generar reporte individual de Maria
CALL sp_generar_reporte_impacto(1, 3, 1);

-- Ver reportes generados
SELECT '=== REPORTES GENERADOS ===' as info;
SELECT r.id_usuario, u.nombre, tr.nombre as tipo_reporte, p.nombre as periodo,
       r.total_co2_ahorrado, r.total_transacciones
FROM REPORTE_IMPACTO r
LEFT JOIN USUARIO u ON r.id_usuario = u.id_usuario
JOIN TIPO_REPORTE tr ON r.id_tipo_reporte = tr.id_tipo_reporte
JOIN PERIODO p ON r.id_periodo = p.id_periodo;


-- OBTENER RANKINGS:

-- Ranking de usuarios por impacto ambiental
CALL sp_obtener_ranking_usuarios(3, 5);

-- Historial completo de Maria
CALL sp_obtener_historial_usuario(1);


-- PRUEBAS DE VALIDACION:

-- Probar validacion de saldo insuficiente:
-- EcoShop intenta comprar algo caro sin saldo suficiente (debería fallar)
CALL sp_realizar_intercambio(3, 1, 100);  -- Solo tiene 30 créditos

-- Verificar que no se creó la transacción
SELECT COUNT(*) as transacciones_fallidas FROM TRANSACCION WHERE id_comprador = 3;


-- Probar bonificacion por publicacion con promo:
-- Insertar tipos de promoción
INSERT INTO TIPO_PROMOCION (nombre, descripcion) VALUES
('BONO_PUBLICACION', 'Bonificación por crear publicaciones'),
('REGISTRO_BIENVENIDA', 'Créditos de bienvenida por registro'),
('INTERCAMBIO_MASIVO', 'Promoción por múltiples intercambios'),
('TEMPORADA_ESPECIAL', 'Promoción por temporada especial');

-- Crear una promoción activa
INSERT INTO PROMOCION (id_tipo_promocion, nombre, descripcion, creditos_otorgados, fecha_inicio, fecha_fin, estado) VALUES
(1, 'BONO PUBLICACION', 'Bono por publicar productos', 10, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'ACTIVA');

-- Asociar promoción a una publicación específica
INSERT INTO PROMOCION_PUBLICACION (id_promocion, id_publicacion) VALUES (2, 1);

-- Crear nueva publicación que recibe bono (el trigger se activará)
INSERT INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos) VALUES
(1, 1, 1, 'PUBLICADA', 1, 'Libro de Cocina', 'Libro de recetas saludables', 20);

-- Verificar bono aplicado
SELECT '=== BONO POR PUBLICACIÓN ===' as info;
SELECT m.id_usuario, u.nombre, tm.nombre as tipo, m.cantidad, m.descripcion
FROM MOVIMIENTO_CREDITOS m
JOIN USUARIO u ON m.id_usuario = u.id_usuario
JOIN TIPO_MOVIMIENTO tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento
WHERE tm.nombre = 'BONO_PUBLICACION';


-- ESTADO FINAL --> VERIFICACION COMPLETA
-- Resumen final de todo el sistema
SELECT '=== RESUMEN FINAL DEL SISTEMA ===' as info;

SELECT '=== USUARIOS Y SALDOS ===' as info;
SELECT u.id_usuario, u.nombre, b.saldo_creditos, COUNT(m.id_movimiento) as total_movimientos
FROM USUARIO u
JOIN BILLETERA b ON u.id_usuario = b.id_usuario
LEFT JOIN MOVIMIENTO_CREDITOS m ON u.id_usuario = m.id_usuario
GROUP BY u.id_usuario, u.nombre, b.saldo_creditos;

SELECT '=== TRANSACCIONES COMPLETADAS ===' as info;
SELECT t.id_transaccion, c.nombre as comprador, v.nombre as vendedor, 
       p.titulo, t.cantidad_creditos, t.estado
FROM TRANSACCION t
JOIN USUARIO c ON t.id_comprador = c.id_usuario
JOIN USUARIO v ON t.id_vendedor = v.id_usuario
JOIN PUBLICACION p ON t.id_publicacion = p.id_publicacion;

SELECT '=== IMPACTO AMBIENTAL TOTAL ===' as info;
SELECT SUM(co2_ahorrado) as total_co2, SUM(agua_ahorrada) as total_agua, 
       SUM(energia_ahorrada) as total_energia, COUNT(*) as total_registros
FROM IMPACTO_AMBIENTAL;

SELECT '=== BITÁCORAS REGISTRADAS ===' as info;
SELECT 'ACCESOS' as tipo, COUNT(*) as cantidad FROM BITACORA_ACCESO
UNION ALL
SELECT 'INTERCAMBIOS' as tipo, COUNT(*) as cantidad FROM BITACORA_INTERCAMBIO;
