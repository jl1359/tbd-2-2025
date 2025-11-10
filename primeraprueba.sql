USE CREDITOS_VERDES;

START TRANSACTION;

 /*********************************************************
  * 1) CATALOGOS (idempotentes con INSERT IGNORE)
  *********************************************************/
INSERT IGNORE INTO ROL (nombre, descripcion) VALUES
('ADMIN','Administrador del sistema'),
('USER','Usuario estándar');

INSERT IGNORE INTO PERMISO (nombre, descripcion) VALUES
('VER_PUBLICACIONES','Puede ver publicaciones'),
('CREAR_PUBLICACIONES','Puede crear publicaciones'),
('COMPRAR_CREDITOS','Puede comprar créditos'),
('INTERCAMBIAR','Puede realizar intercambios');

INSERT IGNORE INTO RESULTADO_ACCESO (nombre, descripcion) VALUES
('OK','Acceso exitoso'),('FALLIDO','Credenciales inválidas'),('BLOQUEADO','Usuario bloqueado');

INSERT IGNORE INTO CATEGORIA (nombre, descripcion) VALUES
('Electrónica','Productos electrónicos'),
('Servicios de Reciclaje','Servicios verdes de reciclaje');

INSERT IGNORE INTO UNIDAD_MEDIDA (nombre, simbolo) VALUES
('Unidad','u'),('Kilogramo','kg'),('Litro','L');

INSERT IGNORE INTO FACTOR_CONVERSION (id_um_origen, id_um_destino, factor, descripcion)
VALUES (
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kg'),
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'),
  1.00000000,
  'Sin conversión práctica, solo ejemplo'
);

INSERT IGNORE INTO UBICACION (direccion, ciudad, provincia, latitud, longitud) VALUES
('Av. Mariscal Santa Cruz 123','La Paz','La Paz',-16.4960,-68.1334),
('Cra. 7 #45-50','Bogotá','Cundinamarca',4.6486,-74.0647);

INSERT IGNORE INTO TIPO_PUBLICACION (nombre, descripcion) VALUES
('PRODUCTO','Publicación de producto'),('SERVICIO','Publicación de servicio');

INSERT IGNORE INTO TIPO_REFERENCIA (nombre) VALUES ('COMPRA'),('TRANSACCION'),('AJUSTE');

INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion) VALUES
('RECARGA','Créditos ingresan por compra de paquete'),
('INTERCAMBIO_IN','Créditos recibidos por intercambio'),
('INTERCAMBIO_OUT','Créditos pagados en intercambio'),
('BONO_ACTIVIDAD','Bono por actividad sostenible'),
('BONO_PUBLICACION','Bono por crear publicación en promo');

INSERT IGNORE INTO SIGNO_MOVIMIENTO (nombre) VALUES ('POSITIVO'),('NEGATIVO');

INSERT IGNORE INTO SIGNO_X_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm
  ON ( (tm.nombre IN ('RECARGA','INTERCAMBIO_IN','BONO_ACTIVIDAD','BONO_PUBLICACION') AND sm.nombre='POSITIVO')
    OR (tm.nombre='INTERCAMBIO_OUT' AND sm.nombre='NEGATIVO') );

INSERT IGNORE INTO PAQUETE_CREDITOS (nombre, cantidad_creditos, precio_bs, activo) VALUES
('Pack 1k',1000,100.00,TRUE),
('Pack 5k',5000,450.00,TRUE);

INSERT IGNORE INTO TIPO_PROMOCION (nombre, descripcion) VALUES
('BONO_PUBLICACION','Otorga créditos al crear publicación');

INSERT IGNORE INTO TIPO_LOGRO (nombre, descripcion) VALUES
('RECICLADOR','Metas por reciclaje'),
('AHORRADOR_CO2','Metas por CO2 ahorrado');

INSERT IGNORE INTO TIPO_ACTIVIDAD (nombre, descripcion) VALUES
('Reciclaje de electrónicos','Entrega de RAEE a punto limpio'),
('Reforestación','Siembra de árboles');

INSERT IGNORE INTO UBICACION_PUBLICIDAD (nombre, descripcion, precio_base) VALUES
('Banner Home','Ubicación principal en home', 200.00),
('Sidebar','Lateral de páginas', 80.00);

INSERT IGNORE INTO TIPO_REPORTE (nombre, descripcion) VALUES
('MENSUAL','Acumulado mensual'),
('GENERAL','Acumulado general');

INSERT IGNORE INTO PERIODO (nombre, descripcion) VALUES
('2025-11','Noviembre 2025'),('2025-10','Octubre 2025');

INSERT IGNORE INTO DIMENSION_AMBIENTAL (codigo, nombre, unidad_base, descripcion) VALUES
('CO2','Dióxido de carbono','kg','Emisiones de CO2'),
('H2O','Agua','L','Consumo/ahorro de agua'),
('ENER','Energía','kWh','Consumo/ahorro de energía');

 /*********************************************************
  * 2) USUARIOS (Sandra/Jorge) + permisos + bitácora
  *********************************************************/
INSERT IGNORE INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil) VALUES
((SELECT id_rol FROM ROL WHERE nombre='USER'),'ACTIVO','Sandra','Subieta','sandra@example.com','+57-3000000000','https://example.com/u/shakira'),
((SELECT id_rol FROM ROL WHERE nombre='USER'),'ACTIVO','Jorge','Gomez','jorge@example.com','+1-3100000000','https://example.com/u/elon');

INSERT IGNORE INTO ROL_PERMISO (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM ROL r
JOIN PERMISO p
WHERE r.nombre = 'USER'
  AND p.nombre IN ('VER_PUBLICACIONES','CREAR_PUBLICACIONES','COMPRAR_CREDITOS','INTERCAMBIAR');

INSERT INTO BITACORA_ACCESO (id_usuario, fecha, direccion_ip, user_agent, id_resultado)
SELECT u.id_usuario, NOW(), '181.114.10.10', 'Chrome/142 Win10',
       (SELECT id_resultado FROM RESULTADO_ACCESO WHERE nombre='OK')
FROM USUARIO u
WHERE u.correo IN ('sandra@example.com','jorge@example.com');

 /*********************************************************
  * 3) PUBLICACIONES / PRODUCTOS / SERVICIOS
  *********************************************************/
INSERT IGNORE INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
VALUES (
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Electrónica'),
  'Auriculares ecológicos','Diadema hecha con materiales reciclados',299.99,0.25
);

INSERT IGNORE INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
VALUES (
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Servicios de Reciclaje'),
  'ACTIVO','Recolección de RAEE','Disposición responsable de electrónicos',50.00,90
);

INSERT IGNORE INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES (
  (SELECT id_usuario FROM USUARIO WHERE correo='sandra@example.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Electrónica'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Bogotá' LIMIT 1),
  'Auriculares eco-friendly',
  'Auriculares con plástico reciclado y packaging compostable.',
  300,'https://example.com/img/eco-headphones.jpg'
);

INSERT IGNORE INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES (
  (SELECT id_usuario FROM USUARIO WHERE correo='jorge@example.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Servicios de Reciclaje'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz' LIMIT 1),
  'Recojo de RAEE en oficina',
  'Paso a recoger tus electrónicos en desuso para su reciclaje.',
  200,'https://example.com/img/raee-pickup.jpg'
);

INSERT IGNORE INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um)
VALUES (
 (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Auriculares eco-friendly'),
 (SELECT id_producto FROM PRODUCTO WHERE nombre='Auriculares ecológicos'),
 1.0000,(SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u')
);

INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
VALUES (
 (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Recojo de RAEE en oficina'),
 (SELECT id_servicio FROM SERVICIO WHERE nombre='Recolección de RAEE'),
 'Lun-Vie 09:00-17:00'
);

INSERT IGNORE INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario)
VALUES (
 (SELECT id_usuario FROM USUARIO WHERE correo='jorge@example.com'),
 (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Auriculares eco-friendly'),
 5,'Excelente iniciativa y producto de calidad.'
);

 /*********************************************************
  * 4) EQUIVALENCIAS / IMPACTO (catálogo mínimo)
  *********************************************************/
INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
VALUES (
 (SELECT id_categoria FROM CATEGORIA WHERE nombre='Electrónica'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'),
 2.500000,10.000000,1.500000
);

INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
VALUES (
 (SELECT id_categoria FROM CATEGORIA WHERE nombre='Servicios de Reciclaje'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'),
 1.000000,5.000000,0.800000
);

 /*********************************************************
  * 5) COMPRAS DE CRÉDITOS (SP + triggers)
  *********************************************************/
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='sandra@example.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 5k'),
  'TXPAGO-0001'
);

CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='jorge@example.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 1k'),
  'TXPAGO-0002'
);

 /*********************************************************
  * 6) INTERCAMBIO (SP)
  *    Jorge compra el producto de Sandra por 300 créditos
  *********************************************************/
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='jorge@example.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Auriculares eco-friendly'),
  300
);

 /*********************************************************
  * 7) ACTIVIDAD SOSTENIBLE (SP -> BONO)
  *********************************************************/
CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='sandra@example.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='Reforestación'),
  'Plantación de 10 árboles en jornada comunitaria',
  150,'https://example.com/evidencias/plantacion10.jpg'
);

 /*********************************************************
  * 8) PUBLICIDAD
  *********************************************************/
INSERT IGNORE INTO PUBLICIDAD (id_usuario, id_ubicacion, estado, titulo, descripcion, url_destino, fecha_inicio, fecha_fin, costo_creditos, clicks, impresiones)
VALUES (
 (SELECT id_usuario FROM USUARIO WHERE correo='sandra@example.com'),
 (SELECT id_ubicacion FROM UBICACION_PUBLICIDAD WHERE nombre='Banner Home'),
 'ACTIVA','Promo auriculares eco','Descuento por tiempo limitado',
 'https://example.com/landing/eco-headphones',
 NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY),
 500,12,1200
);

 /*********************************************************
  * 9) LOGROS
  *********************************************************/
INSERT IGNORE INTO LOGRO (id_tipo_logro, nombre, descripcion, meta_requerida, creditos_recompensa)
VALUES (
 (SELECT id_tipo_logro FROM TIPO_LOGRO WHERE nombre='AHORRADOR_CO2'),
 'Primer kilo de CO2','Ahorrar al menos 1 kg CO2',1,50
);

INSERT IGNORE INTO USUARIO_LOGRO (id_usuario, id_logro, progreso_actual)
VALUES (
 (SELECT id_usuario FROM USUARIO WHERE correo='jorge@example.com'),
 (SELECT id_logro FROM LOGRO WHERE nombre='Primer kilo de CO2'),
 0
);

 /*********************************************************
  * 10) EVENTO_AMBIENTAL
  *********************************************************/
INSERT INTO EVENTO_AMBIENTAL (id_usuario, id_dimension, fuente, id_fuente, categoria, valor, id_um, contaminacion_reducida, descripcion)
VALUES (
 (SELECT id_usuario FROM USUARIO WHERE correo='jorge@example.com'),
 (SELECT id_dimension FROM DIMENSION_AMBIENTAL WHERE codigo='CO2'),
 'TRANSACCION',
 (SELECT id_transaccion FROM TRANSACCION ORDER BY id_transaccion DESC LIMIT 1),
 'Intercambio',2.500000,(SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'),
 NULL,'Estimación puntual de CO2 evitado'
);

 /*********************************************************
  * 11) REPORTES (SP)
  *********************************************************/
CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO ORDER BY id_periodo DESC LIMIT 1),
  NULL
);

CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO ORDER BY id_periodo DESC LIMIT 1),
  (SELECT id_usuario FROM USUARIO WHERE correo='sandra@example.com')
);

COMMIT;

 /*********************************************************
  * 12) CONSULTAS CLAVE (en el mismo archivo)
  *********************************************************/

-- 1) USUARIOS + SALDOS
SELECT u.id_usuario, u.nombre, u.apellido, u.correo, b.saldo_creditos, b.estado AS estado_billetera
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN ('sandra@example.com','jorge@example.com')
ORDER BY u.id_usuario;

-- 2) PUBLICACIONES
SELECT p.id_publicacion, p.titulo, p.descripcion, p.estado, p.valor_creditos,
       u.nombre AS usuario, c.nombre AS categoria, tp.nombre AS tipo, ub.ciudad
FROM PUBLICACION p
JOIN USUARIO u ON u.id_usuario = p.id_usuario
JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
JOIN TIPO_PUBLICACION tp ON tp.id_tipo_publicacion = p.id_tipo_publicacion
LEFT JOIN UBICACION ub ON ub.id_ubicacion = p.id_ubicacion
ORDER BY p.id_publicacion;

-- Detalle producto/servicio por publicación
SELECT 'PRODUCTO' AS tipo, pp.id_publicacion, pr.nombre AS item, pp.cantidad, um.simbolo
FROM PUBLICACION_PRODUCTO pp
JOIN PRODUCTO pr ON pr.id_producto = pp.id_producto
JOIN UNIDAD_MEDIDA um ON um.id_um = pp.id_um
UNION ALL
SELECT 'SERVICIO' AS tipo, ps.id_publicacion, s.nombre AS item, NULL AS cantidad, NULL AS simbolo
FROM PUBLICACION_SERVICIO ps
JOIN SERVICIO s ON s.id_servicio = ps.id_servicio
ORDER BY id_publicacion;

-- 3) COMPRAS DE CRÉDITOS
SELECT cc.id_compra, u.nombre AS usuario, pc.nombre AS paquete, pc.cantidad_creditos,
       cc.monto_bs, cc.estado, cc.id_transaccion_pago
FROM COMPRA_CREDITOS cc
JOIN USUARIO u ON u.id_usuario = cc.id_usuario
JOIN PAQUETE_CREDITOS pc ON pc.id_paquete = cc.id_paquete
ORDER BY cc.id_compra DESC;

-- 4) MOVIMIENTOS DE CRÉDITOS
SELECT m.id_movimiento, u.nombre AS usuario, tm.nombre AS tipo_mov, tr.nombre AS tipo_ref,
       m.cantidad, m.saldo_anterior, m.saldo_posterior, m.id_referencia
FROM MOVIMIENTO_CREDITOS m
JOIN USUARIO u ON u.id_usuario = m.id_usuario
JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_movimiento = m.id_tipo_movimiento
JOIN TIPO_REFERENCIA tr ON tr.id_tipo_referencia = m.id_tipo_referencia
ORDER BY m.id_movimiento DESC
LIMIT 30;

-- 5) TRANSACCIONES
SELECT t.id_transaccion, t.estado, t.cantidad_creditos,
       c.nombre AS comprador, v.nombre AS vendedor, p.titulo AS publicacion
FROM TRANSACCION t
JOIN USUARIO c ON c.id_usuario = t.id_comprador
JOIN USUARIO v ON v.id_usuario = t.id_vendedor
JOIN PUBLICACION p ON p.id_publicacion = t.id_publicacion
ORDER BY t.id_transaccion DESC;

-- 6) BITÁCORA DE INTERCAMBIO
SELECT id_bitacora, id_transaccion, id_usuario_origen, id_usuario_destino,
       cantidad_creditos, descripcion
FROM BITACORA_INTERCAMBIO
ORDER BY id_bitacora DESC
LIMIT 50;

-- 7) (Opcional) IMPACTO AMBIENTAL
SELECT ia.id_impacto, ia.id_transaccion, u.nombre AS usuario, c.nombre AS categoria,
       ia.co2_ahorrado, ia.agua_ahorrada, ia.energia_ahorrada, ia.id_periodo
FROM IMPACTO_AMBIENTAL ia
JOIN USUARIO u ON u.id_usuario = ia.id_usuario
JOIN CATEGORIA c ON c.id_categoria = ia.id_categoria
ORDER BY ia.id_impacto DESC;

-- 8) (Opcional) REPORTE por periodo
SELECT r.id_reporte, tr.nombre AS tipo_reporte, p.nombre AS periodo, 
       COALESCE(u.nombre, 'GLOBAL') AS usuario,
       r.total_co2_ahorrado, r.total_agua_ahorrada, r.total_energia_ahorrada,
       r.total_transacciones, r.total_usuarios_activos
FROM REPORTE_IMPACTO r
JOIN TIPO_REPORTE tr ON tr.id_tipo_reporte = r.id_tipo_reporte
JOIN PERIODO p ON p.id_periodo = r.id_periodo
LEFT JOIN USUARIO u ON u.id_usuario = r.id_usuario
ORDER BY r.id_reporte DESC;