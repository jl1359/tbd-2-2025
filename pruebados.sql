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
((SELECT id_rol FROM ROL WHERE nombre='ADMIN'),'ACTIVO','Carlos','Arce','c.arce@ejemplo.bo','+591-70000001','https://perfil.ejemplo.bo/carlos.arce');
-- PUBLICA
INSERT IGNORE INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil) VALUES
((SELECT id_rol FROM ROL WHERE nombre='USER'),'ACTIVO','María Fernanda','Cruz','m.fernanda@ejemplo.bo','+591-70000002','https://perfil.ejemplo.bo/maria.cruz');
-- COMPRA
INSERT IGNORE INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil) VALUES
((SELECT id_rol FROM ROL WHERE nombre='USER'),'ACTIVO','Juan Carlos','Mamani','j.c.mamani@ejemplo.bo','+591-70000003','https://perfil.ejemplo.bo/juan.mamani');

-- Permisos por rol
INSERT IGNORE INTO ROL_PERMISO (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM ROL r JOIN PERMISO p
WHERE (r.nombre='USER'  AND p.nombre IN ('VER_PUBLICACIONES','CREAR_PUBLICACIONES','COMPRAR_CREDITOS','INTERCAMBIAR'))
   OR (r.nombre='ADMIN' AND p.nombre='ADMINISTRAR');

-- Bitácora acceso inicial
INSERT INTO BITACORA_ACCESO (id_usuario, fecha, direccion_ip, user_agent, id_resultado)
SELECT u.id_usuario, NOW(), '181.114.10.10', 'Chrome/142 Win10',
       (SELECT id_resultado FROM RESULTADO_ACCESO WHERE nombre='OK')
FROM USUARIO u
WHERE u.correo IN ('c.arce@ejemplo.bo','m.fernanda@ejemplo.bo','j.c.mamani@ejemplo.bo');

-- Variables
SET @id_admin := (SELECT id_usuario FROM USUARIO WHERE correo='c.arce@ejemplo.bo');
SET @id_pub   := (SELECT id_usuario FROM USUARIO WHERE correo='m.fernanda@ejemplo.bo');
SET @id_comp  := (SELECT id_usuario FROM USUARIO WHERE correo='j.c.mamani@ejemplo.bo');
SET @id_cat_e := (SELECT id_categoria FROM CATEGORIA WHERE nombre='Electrónica');
SET @id_cat_s := (SELECT id_categoria FROM CATEGORIA WHERE nombre='Servicios de Reciclaje');
SET @id_tp_p  := (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO');
SET @id_tp_s  := (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO');
SET @id_um_u  := (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

/* =========================================================
   3) PUBLICIDAD (Admin crea campaña)
   ========================================================= */
INSERT IGNORE INTO PUBLICIDAD (id_usuario, id_ubicacion, estado, titulo, descripcion, url_destino, fecha_inicio, fecha_fin, costo_creditos, clicks, impresiones)
VALUES (
  @id_admin,
  (SELECT id_ubicacion FROM UBICACION_PUBLICIDAD WHERE nombre='Banner Home'),
  'ACTIVA',
  'Campaña Verde Bolivia',
  'Promoción de productos y servicios eco en Bolivia',
  'https://campana.ejemplo.bo/verde',
  NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY),
  110, 0, 0
);

/* =========================================================
   4) PUBLICACIONES (María publica producto + servicio)
   ========================================================= */
SET @prod_name := 'Lámpara Eco LED';
SET @serv_name := 'Recolección RAEE domicilio';
SET @pub_title_prod := 'Lámpara Eco LED 9W';
SET @pub_title_serv := 'Recolección RAEE en Santa Cruz';

-- PRODUCTO
INSERT IGNORE INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
VALUES (@id_cat_e, @prod_name, 'Lámpara LED de bajo consumo (A++)', 25.50, 0.20);
SET @id_producto := (SELECT id_producto FROM PRODUCTO WHERE nombre=@prod_name ORDER BY id_producto DESC LIMIT 1);

-- SERVICIO
INSERT IGNORE INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
VALUES (@id_cat_s, 'ACTIVO', @serv_name, 'Retiro en domicilio de aparatos electrónicos en desuso', 30.00, 90);
SET @id_servicio := (SELECT id_servicio FROM SERVICIO WHERE nombre=@serv_name ORDER BY id_servicio DESC LIMIT 1);

-- PUBLICACIÓN PRODUCTO (Santa Cruz)
INSERT IGNORE INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES (@id_pub, @id_cat_e, @id_tp_p, 'PUBLICADA',
        (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Santa Cruz de la Sierra' LIMIT 1),
        @pub_title_prod, 'LED 9W equivalente a 75W, 6500K, casquillo E27', 150, 'https://img.ejemplo.bo/lampara9w.jpg');
SET @id_pub_prod := (SELECT id_publicacion FROM PUBLICACION WHERE titulo=@pub_title_prod AND id_usuario=@id_pub ORDER BY id_publicacion DESC LIMIT 1);

-- PUBLICACIÓN SERVICIO (Santa Cruz)
INSERT IGNORE INTO PUBLICACION (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES (@id_pub, @id_cat_s, @id_tp_s, 'PUBLICADA',
        (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Santa Cruz de la Sierra' LIMIT 1),
        @pub_title_serv, 'Cobertura en 3er anillo y 4to anillo', 120, 'https://img.ejemplo.bo/recoleccion-raee.jpg');
SET @id_pub_serv := (SELECT id_publicacion FROM PUBLICACION WHERE titulo=@pub_title_serv AND id_usuario=@id_pub ORDER BY id_publicacion DESC LIMIT 1);

-- VÍNCULOS
INSERT IGNORE INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um)
VALUES (@id_pub_prod, @id_producto, 1.0000, @id_um_u);

INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
VALUES (@id_pub_serv, @id_servicio, 'Lun-Sáb 09:00-17:00');

-- CALIFICACIÓN (Juan califica el producto de María) con alias para evitar warning de VALUES()
INSERT INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario)
VALUES (@id_comp, @id_pub_prod, 5, 'Muy buena calidad y ahorro de energía') AS new
ON DUPLICATE KEY UPDATE estrellas=new.estrellas, comentario=new.comentario;

/* =========================================================
   5) COMPRAS DE CRÉDITOS (recargas pequeñas)
   ========================================================= */
-- Juan compra Pack 500
SET @tx_comp_j := CONCAT('TXPAGO-J-', UNIX_TIMESTAMP(), '-', FLOOR(RAND()*10000));
CALL sp_compra_creditos_aprobar(@id_comp, (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'), @tx_comp_j);

-- Carlos (admin) compra Pack 500 para poder intercambiar
SET @tx_comp_a := CONCAT('TXPAGO-A-', UNIX_TIMESTAMP(), '-', FLOOR(RAND()*10000));
CALL sp_compra_creditos_aprobar(@id_admin, (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'), @tx_comp_a);

/* =========================================================
   6) INTERCAMBIOS (SP) – usa triggers de verificación y bitácora
   ========================================================= */
-- Juan compra la lámpara (150 créditos)
CALL sp_realizar_intercambio(@id_comp,  @id_pub_prod, 150);

-- Admin compra el servicio de recolección (120 créditos)
CALL sp_realizar_intercambio(@id_admin, @id_pub_serv, 120);

/* =========================================================
   7) ACTIVIDAD SOSTENIBLE (SP) – otorga bono a María
   ========================================================= */
CALL sp_registrar_actividad_sostenible(
  @id_pub,
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='Reforestación'),
  'Siembra de 5 plantines nativos en la ribera del Piraí',
  60,
  'https://evidencias.ejemplo.bo/siembra5.jpg'
);

/* =========================================================
   8) PROMOCIÓN (creada pero ojo: el bono automático via trigger no se ejecuta
      porque la relación PROMOCION_PUBLICACION se crea después de la PUBLICACION)
   ========================================================= */
INSERT IGNORE INTO PROMOCION (id_tipo_promocion, nombre, descripcion, creditos_otorgados, fecha_inicio, fecha_fin, estado)
VALUES (
 (SELECT id_tipo_promocion FROM TIPO_PROMOCION WHERE nombre='BONO_PUBLICACION'),
 'Promo Verde Nov',
 'Bono por publicaciones eco durante noviembre',
 30,
 NOW() - INTERVAL 1 DAY,
 NOW() + INTERVAL 7 DAY,
 'ACTIVA'
);

INSERT IGNORE INTO PROMOCION_PUBLICACION (id_promocion, id_publicacion)
VALUES (
 (SELECT id_promocion FROM PROMOCION WHERE nombre='Promo Verde Nov' ORDER BY id_promocion DESC LIMIT 1),
 @id_pub_prod
);

/* =========================================================
   9) EVENTO AMBIENTAL de ejemplo
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
 'Estimación puntual de CO2 evitado por la compra'
);

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
   11) CONSULTAS (16 TABLAS IMPORTANTES) – TODOS LOS ATRIBUTOS
   ========================================================= */

-- 1
SELECT * FROM USUARIO
WHERE id_usuario IN (@id_admin,@id_pub,@id_comp)
ORDER BY id_usuario;

-- 2
SELECT * FROM BILLETERA
WHERE id_usuario IN (@id_admin,@id_pub,@id_comp)
ORDER BY id_billetera;

-- 3
SELECT * FROM PUBLICACION
WHERE id_publicacion IN (@id_pub_prod,@id_pub_serv)
ORDER BY id_publicacion;

-- 4
SELECT * FROM PRODUCTO
WHERE id_producto=@id_producto
ORDER BY id_producto;

-- 5
SELECT * FROM SERVICIO
WHERE id_servicio=@id_servicio
ORDER BY id_servicio;

-- 6
SELECT * FROM PUBLICACION_PRODUCTO
WHERE id_publicacion=@id_pub_prod;

-- 7
SELECT * FROM PUBLICACION_SERVICIO
WHERE id_publicacion=@id_pub_serv;

-- 8
SELECT * FROM CALIFICACION
WHERE id_publicacion=@id_pub_prod;

-- 9
SELECT * FROM COMPRA_CREDITOS
WHERE id_usuario IN (@id_comp,@id_admin)
ORDER BY id_compra DESC;

-- 10
SELECT * FROM MOVIMIENTO_CREDITOS
WHERE id_usuario IN (@id_admin,@id_pub,@id_comp)
ORDER BY id_movimiento DESC;

-- 11
SELECT * FROM TRANSACCION
ORDER BY id_transaccion DESC;

-- 12
SELECT * FROM BITACORA_INTERCAMBIO
ORDER BY id_bitacora DESC;

-- 13
SELECT * FROM PUBLICIDAD
WHERE id_usuario=@id_admin
ORDER BY id_publicidad DESC;

-- 14
SELECT * FROM ACTIVIDAD_SOSTENIBLE
WHERE id_usuario=@id_pub
ORDER BY id_actividad DESC;

-- 15
SELECT * FROM IMPACTO_AMBIENTAL
ORDER BY id_impacto DESC;

-- 16
SELECT * FROM REPORTE_IMPACTO
ORDER BY id_reporte DESC;

-- (extras útiles)
SELECT * FROM EVENTO_AMBIENTAL ORDER BY id_evento DESC;
SELECT * FROM PROMOCION ORDER BY id_promocion DESC;
SELECT * FROM PROMOCION_PUBLICACION ORDER BY id_promocion, id_publicacion;
SELECT * FROM BITACORA_ACCESO WHERE id_usuario IN (@id_admin,@id_pub,@id_comp) ORDER BY id_acceso DESC;

SET SQL_SAFE_UPDATES = 1;
