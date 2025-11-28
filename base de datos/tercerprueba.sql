USE CREDITOS_VERDES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;
/* =========================================================
   1) CATÁLOGOS (idempotentes)
   ========================================================= */
INSERT IGNORE INTO ROL (nombre, descripcion) VALUES
('ADMIN','Administrador del sistema'),
('USER','Usuario estándar');

INSERT IGNORE INTO PERMISO (nombre, descripcion) VALUES
('VER_PUBLICACIONES','Puede ver publicaciones'),
('CREAR_PUBLICACIONES','Puede crear publicaciones'),
('COMPRAR_CREDITOS','Puede comprar créditos'),
('INTERCAMBIAR','Puede realizar intercambios'),
('ADMINISTRAR','Permisos administrativos');

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
 1.00000000, 'Ejemplo sin conversión real'
);

INSERT IGNORE INTO UBICACION (direccion, ciudad, provincia, latitud, longitud) VALUES
('Av. 16 de Julio #100','La Paz','La Paz',-16.4959,-68.1334),
('Av. Cristo Redentor #2500','Santa Cruz de la Sierra','Santa Cruz',-17.7833,-63.1821),
('Av. Blanco Galindo km 5','Cochabamba','Cochabamba',-17.3895,-66.1568);

INSERT IGNORE INTO TIPO_PUBLICACION (nombre, descripcion) VALUES
('PRODUCTO','Publicación de producto'),
('SERVICIO','Publicación de servicio');

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
('Pack 200',200,20.00,TRUE),
('Pack 500',500,48.00,TRUE),
('Pack 1000',1000,90.00,TRUE);

INSERT IGNORE INTO TIPO_PROMOCION (nombre, descripcion) VALUES
('BONO_PUBLICACION','Otorga créditos al crear publicación');

INSERT IGNORE INTO TIPO_LOGRO (nombre, descripcion) VALUES
('RECICLADOR','Metas por reciclaje'),
('AHORRADOR_CO2','Metas por CO2 ahorrado');

INSERT IGNORE INTO TIPO_ACTIVIDAD (nombre, descripcion) VALUES
('Reciclaje de electrónicos','Entrega de RAEE a punto limpio'),
('Reforestación','Siembra de árboles');

INSERT IGNORE INTO UBICACION_PUBLICIDAD (nombre, descripcion, precio_base) VALUES
('Banner Home','Ubicación principal en home', 120.00),
('Sidebar','Lateral de páginas', 50.00);

INSERT IGNORE INTO TIPO_REPORTE (nombre, descripcion) VALUES
('MENSUAL','Acumulado mensual'),
('GENERAL','Acumulado general');

INSERT IGNORE INTO PERIODO (nombre, descripcion) VALUES
('2025-11','Noviembre 2025');

INSERT IGNORE INTO DIMENSION_AMBIENTAL (codigo, nombre, unidad_base, descripcion) VALUES
('CO2','Dióxido de carbono','kg','Emisiones de CO2');

INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
VALUES
((SELECT id_categoria FROM CATEGORIA WHERE nombre='Electrónica'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 1.800000,7.500000,1.200000),
((SELECT id_categoria FROM CATEGORIA WHERE nombre='Servicios de Reciclaje'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 0.900000,4.000000,0.600000);

/* =========================================================
   2) USUARIOS BOLIVIA + permisos + bitácora
   ========================================================= */
-- ADMIN
INSERT IGNORE INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil) VALUES
((SELECT id_rol FROM ROL WHERE nombre='ADMIN'),'ACTIVO','Luis Alberto','Vargas','l.vargas@ejemplo.bo','+591-70000011','https://perfil.ejemplo.bo/luis.vargas');
-- PUBLICA
INSERT IGNORE INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil) VALUES
((SELECT id_rol FROM ROL WHERE nombre='USER'),'ACTIVO','Ana María','Flores','a.flores@ejemplo.bo','+591-70000012','https://perfil.ejemplo.bo/ana.flores');
-- COMPRA
INSERT IGNORE INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil) VALUES
((SELECT id_rol FROM ROL WHERE nombre='USER'),'ACTIVO','Marco Antonio','Quispe','m.quispe@ejemplo.bo','+591-70000013','https://perfil.ejemplo.bo/marco.quispe');

-- Permisos por rol
INSERT IGNORE INTO ROL_PERMISO (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM ROL r JOIN PERMISO p
WHERE (r.nombre='USER'  AND p.nombre IN ('VER_PUBLICACIONES','CREAR_PUBLICACIONES','COMPRAR_CREDITOS','INTERCAMBIAR'))
   OR (r.nombre='ADMIN' AND p.nombre='ADMINISTRAR');

-- Bitácora acceso inicial OK
INSERT INTO BITACORA_ACCESO (id_usuario, fecha, direccion_ip, user_agent, id_resultado)
SELECT u.id_usuario, NOW(), '181.114.10.10', 'Chrome/142 Win10',
       (SELECT id_resultado FROM RESULTADO_ACCESO WHERE nombre='OK')
FROM USUARIO u
WHERE u.correo IN ('l.vargas@ejemplo.bo','a.flores@ejemplo.bo','m.quispe@ejemplo.bo');

-- Variables
SET @id_admin := (SELECT id_usuario FROM USUARIO WHERE correo='l.vargas@ejemplo.bo');
SET @id_pub   := (SELECT id_usuario FROM USUARIO WHERE correo='a.flores@ejemplo.bo');
SET @id_comp  := (SELECT id_usuario FROM USUARIO WHERE correo='m.quispe@ejemplo.bo');
SET @id_cat_e := (SELECT id_categoria FROM CATEGORIA WHERE nombre='Electrónica');
SET @id_cat_s := (SELECT id_categoria FROM CATEGORIA WHERE nombre='Servicios de Reciclaje');
SET @id_tp_p  := (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO');
SET @id_tp_s  := (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO');
SET @id_um_u  := (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

/* =========================================================
   3) COMPRAS DE CRÉDITOS (mensual/anual) – RECARGAS
   ========================================================= */
-- Admin compra Pack 1000 (simula anual)
SET @tx_admin := CONCAT('TX-ADMIN-', UNIX_TIMESTAMP(), '-', FLOOR(RAND()*10000));
CALL sp_compra_creditos_aprobar(@id_admin, (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 1000'), @tx_admin);

-- Marco (comprador) compra Pack 200 (mensual)
SET @tx_comp := CONCAT('TX-COMP-', UNIX_TIMESTAMP(), '-', FLOOR(RAND()*10000));
CALL sp_compra_creditos_aprobar(@id_comp, (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 200'), @tx_comp);

/* =========================================================
   4) PUBLICIDAD del ADMIN (crea campaña y la paga con créditos)
   ========================================================= */
INSERT IGNORE INTO PUBLICIDAD (id_usuario, id_ubicacion, estado, titulo, descripcion, url_destino, fecha_inicio, fecha_fin, costo_creditos, clicks, impresiones)
VALUES (
  @id_admin,
  (SELECT id_ubicacion FROM UBICACION_PUBLICIDAD WHERE nombre='Banner Home'),
  'ACTIVA',
  'Campaña Eco Bolivia',
  'Lanzamiento de campaña eco en portada',
  'https://campana.ejemplo.bo/eco',
  NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY),
  80, 5, 320
);
-- Descuento del costo de la publicidad (AJUSTE, usando INTERCAMBIO_OUT para egreso)
INSERT INTO MOVIMIENTO_CREDITOS (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
VALUES (
  @id_admin,
  (SELECT id_tipo_movimiento FROM TIPO_MOVIMIENTO WHERE nombre='INTERCAMBIO_OUT'),
  (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='AJUSTE'),
  (SELECT costo_creditos FROM PUBLICIDAD WHERE id_usuario=@id_admin ORDER BY id_publicidad DESC LIMIT 1),
  'Pago de publicidad (Banner Home)',
  0,0,
  (SELECT id_publicidad FROM PUBLICIDAD WHERE id_usuario=@id_admin ORDER BY id_publicidad DESC LIMIT 1)
);

/* =========================================================
   5) PUBLICACIONES (Ana publica producto + servicio)
   ========================================================= */
SET @prod_name := 'Foco LED 9W Ahorro';
SET @serv_name := 'Recolección RAEE domicilio';
SET @pub_title_prod := 'Foco LED 9W E27';
SET @pub_title_serv := 'Retiro RAEE en SCZ';

-- PRODUCTO
INSERT IGNORE INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
VALUES (@id_cat_e, @prod_name, 'Foco LED 9W, 6500K, E27, A++', 18.50, 0.18);
SET @id_producto := (SELECT id_producto FROM PRODUCTO WHERE nombre=@prod_name ORDER BY id_producto DESC LIMIT 1);

-- SERVICIO
INSERT IGNORE INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
VALUES (@id_cat_s, 'ACTIVO', @serv_name, 'Retiro en domicilio de electrónicos en desuso', 25.00, 90);
SET @id_servicio := (SELECT id_servicio FROM SERVICIO WHERE nombre=@serv_name ORDER BY id_servicio DESC LIMIT 1);

-- PUBLICACIÓN PRODUCTO (Santa Cruz)
INSERT IGNORE INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES (@id_pub, @id_cat_e, @id_tp_p, 'PUBLICADA',
        (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Santa Cruz de la Sierra' LIMIT 1),
        @pub_title_prod, 'Ahorro energético, luz fría 6500K', 90, 'https://img.ejemplo.bo/foco9w.jpg');
SET @id_pub_prod := (SELECT id_publicacion FROM PUBLICACION WHERE titulo=@pub_title_prod AND id_usuario=@id_pub ORDER BY id_publicacion DESC LIMIT 1);

-- PUBLICACIÓN SERVICIO
INSERT IGNORE INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES (@id_pub, @id_cat_s, @id_tp_s, 'PUBLICADA',
        (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Santa Cruz de la Sierra' LIMIT 1),
        @pub_title_serv, 'Cobertura 3er y 4to anillo', 60, 'https://img.ejemplo.bo/retiro-raee-scz.jpg');
SET @id_pub_serv := (SELECT id_publicacion FROM PUBLICACION WHERE titulo=@pub_title_serv AND id_usuario=@id_pub ORDER BY id_publicacion DESC LIMIT 1);

-- VÍNCULOS
INSERT IGNORE INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um)
VALUES (@id_pub_prod, @id_producto, 1.0000, @id_um_u);

INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
VALUES (@id_pub_serv, @id_servicio, 'Lun-Sáb 09:00-17:00');

/* =========================================================
   6) INTERCAMBIOS (SP) – compras reales
   ========================================================= */
-- Marco compra el producto (90 créditos)
CALL sp_realizar_intercambio(@id_comp,  @id_pub_prod, 90);

-- Admin compra el servicio (60 créditos)
CALL sp_realizar_intercambio(@id_admin, @id_pub_serv, 60);

/* =========================================================
   7) ACTIVIDAD SOSTENIBLE (SP) – bono para la publicadora
   ========================================================= */
CALL sp_registrar_actividad_sostenible(
  @id_pub,
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='Reforestación'),
  'Siembra de 4 plantines nativos en la zona del Piraí',
  40,
  'https://evidencias.ejemplo.bo/siembra4.jpg'
);

/* =========================================================
   8) EVENTO AMBIENTAL (estimación puntual ligada a última transacción)
   ========================================================= */
INSERT INTO EVENTO_AMBIENTAL (id_usuario, id_dimension, fuente, id_fuente, categoria, valor, id_um, contaminacion_reducida, descripcion)
VALUES (
 @id_comp,
 (SELECT id_dimension FROM DIMENSION_AMBIENTAL WHERE codigo='CO2'),
 'TRANSACCION',
 (SELECT id_transaccion FROM TRANSACCION ORDER BY id_transaccion DESC LIMIT 1),
 'Intercambio',
 1.800000,
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'),
 NULL,
 'CO2 evitado por compra de foco LED'
);

/* =========================================================
   9) ADMIN gestiona estado: SUSPENDIDO a Marco (comprador)
   ========================================================= */
UPDATE USUARIO SET estado='SUSPENDIDO' WHERE id_usuario=@id_comp;

INSERT INTO BITACORA_ACCESO (id_usuario, fecha, direccion_ip, user_agent, id_resultado)
VALUES (@id_comp, NOW(), '181.114.10.11', 'Chrome/142 Win10', (SELECT id_resultado FROM RESULTADO_ACCESO WHERE nombre='BLOQUEADO'));

/* =========================================================
   10) REPORTES (SP)
   ========================================================= */
CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO ORDER BY id_periodo DESC LIMIT 1),
  NULL
);

CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO ORDER BY id_periodo DESC LIMIT 1),
  @id_pub
);

COMMIT;

/* =========================================================
   11) CONSULTAS – 16 TABLAS CLAVE (todos los atributos)
   ========================================================= */
-- 1) USUARIO
SELECT * FROM USUARIO WHERE id_usuario IN (@id_admin,@id_pub,@id_comp) ORDER BY id_usuario;

-- 2) BILLETERA
SELECT * FROM BILLETERA WHERE id_usuario IN (@id_admin,@id_pub,@id_comp) ORDER BY id_billetera;

-- 3) PUBLICACION
SELECT * FROM PUBLICACION WHERE id_publicacion IN (@id_pub_prod,@id_pub_serv) ORDER BY id_publicacion;

-- 4) PRODUCTO
SELECT * FROM PRODUCTO WHERE id_producto=@id_producto;

-- 5) SERVICIO
SELECT * FROM SERVICIO WHERE id_servicio=@id_servicio;

-- 6) PUBLICACION_PRODUCTO
SELECT * FROM PUBLICACION_PRODUCTO WHERE id_publicacion=@id_pub_prod;

-- 7) PUBLICACION_SERVICIO
SELECT * FROM PUBLICACION_SERVICIO WHERE id_publicacion=@id_pub_serv;

-- 8) TRANSACCION
SELECT * FROM TRANSACCION ORDER BY id_transaccion DESC;

-- 9) BITACORA_INTERCAMBIO
SELECT * FROM BITACORA_INTERCAMBIO ORDER BY id_bitacora DESC;

-- 10) COMPRA_CREDITOS
SELECT * FROM COMPRA_CREDITOS WHERE id_usuario IN (@id_admin,@id_comp) ORDER BY id_compra DESC;

-- 11) MOVIMIENTO_CREDITOS
SELECT * FROM MOVIMIENTO_CREDITOS WHERE id_usuario IN (@id_admin,@id_pub,@id_comp) ORDER BY id_movimiento DESC;

-- 12) CALIFICACION (si decidieras calificar, aquí saldrían; en esta prueba no calificamos)
SELECT * FROM CALIFICACION WHERE id_publicacion=@id_pub_prod;

-- 13) PUBLICIDAD
SELECT * FROM PUBLICIDAD WHERE id_usuario=@id_admin ORDER BY id_publicidad DESC;

-- 14) ACTIVIDAD_SOSTENIBLE
SELECT * FROM ACTIVIDAD_SOSTENIBLE WHERE id_usuario=@id_pub ORDER BY id_actividad DESC;

-- 15) IMPACTO_AMBIENTAL
SELECT * FROM IMPACTO_AMBIENTAL ORDER BY id_impacto DESC;

-- 16) REPORTE_IMPACTO
SELECT * FROM REPORTE_IMPACTO ORDER BY id_reporte DESC;

-- Extras útiles
SELECT * FROM EVENTO_AMBIENTAL ORDER BY id_evento DESC;
SELECT * FROM BITACORA_ACCESO WHERE id_usuario IN (@id_admin,@id_pub,@id_comp) ORDER BY id_acceso DESC;

SET SQL_SAFE_UPDATES = 1;
