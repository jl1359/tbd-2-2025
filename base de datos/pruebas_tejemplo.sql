/* ============================================================
   PRUEBAS INTEGRALES — CREDITOS_VERDES2 (IDEMPOTENTE y SIN 1242)
   
   ============================================================ */

USE CREDITOS_VERDES2;

SET @now = NOW();
SET @period_name = '2025-11';

START TRANSACTION;

/* ------------------------------------------------------------
   0) CATÁLOGOS MÍNIMOS (idempotentes)
   ------------------------------------------------------------ */
INSERT IGNORE INTO ROL (nombre, descripcion) VALUES
 ('ADMIN','Admin'),('COMPRADOR','Comprador'),('VENDEDOR','Vendedor'),('ONG','Org. Social');

INSERT IGNORE INTO PERMISO (nombre, descripcion) VALUES
 ('GESTION_USUARIOS','CRUD usuarios'),
 ('VER_REPORTES','Acceso a reportes');

-- Bridge rol/permiso (idempotente)
INSERT IGNORE INTO ROL_PERMISO (id_rol, id_permiso)
SELECT (SELECT id_rol FROM ROL WHERE nombre='ADMIN' LIMIT 1), p.id_permiso
FROM PERMISO p
WHERE p.nombre IN ('GESTION_USUARIOS','VER_REPORTES');

INSERT IGNORE INTO RESULTADO_ACCESO (nombre, descripcion) VALUES
 ('OK','Acceso correcto'),('FAIL','Credenciales inválidas');

INSERT IGNORE INTO CATEGORIA (nombre, descripcion) VALUES
 ('Bicicletas','Movilidad'),
 ('Tecnología','Electrónica'),
 ('Muebles','Hogar'),
 ('Libros','Cultura'),
 ('Ropa','Vestimenta');

INSERT IGNORE INTO UNIDAD_MEDIDA (nombre, simbolo) VALUES
 ('Unidad','u'),('Kilogramo','kg'),('Litro','L'),('kWh','kWh'),('Paquete','paq');

INSERT IGNORE INTO UBICACION (direccion, ciudad, provincia, latitud, longitud) VALUES
 ('Av. Central 123','La Paz','La Paz',-16.5,-68.15),
 ('Calle 9 #456','Cochabamba','Cochabamba',-17.392,-66.159),
 ('Zona Sur 100','La Paz','La Paz',-16.55,-68.08);

INSERT IGNORE INTO TIPO_PUBLICACION (nombre, descripcion) VALUES
 ('PRODUCTO','Publicación de producto'),
 ('SERVICIO','Publicación de servicio');

INSERT IGNORE INTO TIPO_REFERENCIA (nombre) VALUES ('COMPRA'),('TRANSACCION'),('AJUSTE');

INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion) VALUES
 ('RECARGA','Ingreso por compra de créditos'),
 ('INTERCAMBIO_IN','Ingreso por intercambio'),
 ('INTERCAMBIO_OUT','Egreso por intercambio'),
 ('BONO_PUBLICACION','Bono por promo/publicación'),
 ('BONO_ACTIVIDAD','Bono por actividad sostenible');

INSERT IGNORE INTO SIGNO_MOVIMIENTO (nombre) VALUES ('POSITIVO'),('NEGATIVO');

-- Bridge signos/tipos (idempotente)
INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, @now
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm
  ON ((tm.nombre IN ('RECARGA','INTERCAMBIO_IN','BONO_PUBLICACION','BONO_ACTIVIDAD') AND sm.nombre='POSITIVO')
   OR (tm.nombre='INTERCAMBIO_OUT' AND sm.nombre='NEGATIVO'));

INSERT IGNORE INTO TIPO_PROMOCION (nombre, descripcion) VALUES
 ('LANZAMIENTO','Promoción de lanzamiento'),
 ('TEMPORADA','Promoción de temporada');

INSERT IGNORE INTO TIPO_LOGRO (nombre, descripcion) VALUES
 ('PRIMERA_VENTA','Primer intercambio exitoso'),
 ('ECO_HERO','Alto impacto ambiental');

INSERT IGNORE INTO TIPO_ACTIVIDAD (nombre, descripcion) VALUES
 ('RECICLAJE','Reciclaje domiciliario'),
 ('REFORESTACION','Plantación de árboles');

INSERT IGNORE INTO UBICACION_PUBLICIDAD (nombre, descripcion, precio_base) VALUES
 ('HOME_TOP','Banner cabecera', 150.00),
 ('SIDEBAR','Lateral', 60.00);

INSERT IGNORE INTO TIPO_REPORTE (nombre, descripcion) VALUES
 ('MENSUAL','KPIs mensuales'), ('TRIMESTRAL','KPIs trimestrales');

-- Período actual
INSERT IGNORE INTO PERIODO (nombre, descripcion, fecha_inicio, fecha_fin)
VALUES (@period_name,'Noviembre 2025','2025-11-01','2025-11-30');

-- Dimensiones ambientales
INSERT IGNORE INTO DIMENSION_AMBIENTAL (codigo, nombre, unidad_base, descripcion) VALUES
 ('CO2','Dióxido de carbono','kg','CO2 evitado'),
 ('AGUA','Agua ahorrada','L','Litros ahorrados'),
 ('ENERGIA','Energía','kWh','Energía ahorrada');

/* ------------------------------------------------------------
   1) USUARIOS y BILLETERAS
   ------------------------------------------------------------ */
INSERT IGNORE INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil) VALUES
 ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR' LIMIT 1),'ACTIVO','Ana','Rojas','ana@demo.com','70000001','/p/ana'),
 ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR' LIMIT 1),'ACTIVO','Bruno','Salazar','bruno@demo.com','70000002','/p/bruno'),
 ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR' LIMIT 1),'ACTIVO','Carla','Mamani','carla@demo.com','70000003','/p/carla'),
 ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'  LIMIT 1),'ACTIVO','Luis','Quispe','luis@demo.com','70000004','/p/luis'),
 ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'  LIMIT 1),'ACTIVO','Marta','Suárez','marta@demo.com','70000005','/p/marta'),
 ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'  LIMIT 1),'ACTIVO','Nico','Torres','nico@demo.com','70000006','/p/nico'),
 ((SELECT id_rol FROM ROL WHERE nombre='ONG'       LIMIT 1),'ACTIVO','ONG','Verde','ong@demo.com','70000007','/p/ong'),
 ((SELECT id_rol FROM ROL WHERE nombre='ADMIN'     LIMIT 1),'ACTIVO','Root','Admin','admin@demo.com','70000000','/p/admin');

-- Billeteras (idempotente)
INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
SELECT u.id_usuario, 'ACTIVA', 0, 0.00, NULL
FROM USUARIO u;

/* ------------------------------------------------------------
   2) PRODUCTOS / SERVICIOS
   ------------------------------------------------------------ */
INSERT IGNORE INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso) VALUES
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas' LIMIT 1),'Bici Urbana','Aluminio 21v', 1200.00, 14.5),
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas' LIMIT 1),'Bici Montaña','Acero 18v', 900.00, 16.8),
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología' LIMIT 1),'Laptop 14"','i5 16GB', 4500.00, 1.4),
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología' LIMIT 1),'Monitor 24"','1080p 75Hz', 950.00, 3.2),
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Muebles'    LIMIT 1),'Silla Gamer','Reclinable', 750.00, 9.0);

INSERT IGNORE INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min) VALUES
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología' LIMIT 1),'ACTIVO','Mantenimiento PC','Limpieza y optimización', 90.00, 60),
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología' LIMIT 1),'ACTIVO','Instalación SO','Formateo e instalación', 120.00, 90),
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Libros'     LIMIT 1),'ACTIVO','Encuadernación','Arreglo de libros', 50.00, 45),
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Ropa'       LIMIT 1),'ACTIVO','Ajuste de prendas','Sastrería básica', 35.00, 30),
 ((SELECT id_categoria FROM CATEGORIA WHERE nombre='Muebles'    LIMIT 1),'ACTIVO','Armado de muebles','Armado a domicilio', 80.00, 60);

/* ------------------------------------------------------------
   3) PUBLICACIONES (robusto con filtros + LIMIT 1)
   ------------------------------------------------------------ */
-- IDs útiles
SET @id_u_luis   = (SELECT id_usuario FROM USUARIO WHERE correo='luis@demo.com'  LIMIT 1);
SET @id_u_marta  = (SELECT id_usuario FROM USUARIO WHERE correo='marta@demo.com' LIMIT 1);
SET @id_u_nico   = (SELECT id_usuario FROM USUARIO WHERE correo='nico@demo.com'  LIMIT 1);

SET @id_cat_bici = (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas' LIMIT 1);
SET @id_cat_tec  = (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología' LIMIT 1);
SET @id_cat_mue  = (SELECT id_categoria FROM CATEGORIA WHERE nombre='Muebles'    LIMIT 1);
SET @id_cat_lib  = (SELECT id_categoria FROM CATEGORIA WHERE nombre='Libros'     LIMIT 1);

SET @id_tp_prod  = (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO' LIMIT 1);
SET @id_tp_serv  = (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO' LIMIT 1);

SET @id_ub_lpz   = (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'        ORDER BY id_ubicacion ASC LIMIT 1);
SET @id_ub_cbba  = (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'    ORDER BY id_ubicacion ASC LIMIT 1);

-- Publicación PRODUCTO: Bici urbana (Luis, Bicicletas, La Paz)
INSERT IGNORE INTO PUBLICACION
 (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES
 (@id_u_luis, @id_cat_bici, @id_tp_prod, 'PUBLICADA', @id_ub_lpz,
  'Bicicleta urbana aluminio', 'Bici urbana ligera, 21 velocidades.', 300, 'https://img/bici1.jpg');

-- Vincular a PRODUCTO 'Bici Urbana' (resuelto con LIMIT 1 y filtro por categoría)
SET @id_pub_bici_urb = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Bicicleta urbana aluminio'
    AND id_usuario=@id_u_luis
    AND id_categoria=@id_cat_bici
  ORDER BY id_publicacion ASC
  LIMIT 1
);

SET @id_prod_bici_urb = (
  SELECT p.id_producto
  FROM PRODUCTO p
  WHERE p.nombre='Bici Urbana'
    AND p.id_categoria=@id_cat_bici
  ORDER BY p.id_producto ASC
  LIMIT 1
);

SET @id_um_u = (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u' LIMIT 1);

INSERT IGNORE INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um)
VALUES (@id_pub_bici_urb, @id_prod_bici_urb, 1.0000, @id_um_u);

-- Publicación PRODUCTO: Bici montaña (Marta)
INSERT IGNORE INTO PUBLICACION
 (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES
 (@id_u_marta, @id_cat_bici, @id_tp_prod, 'PUBLICADA', @id_ub_cbba,
  'Bicicleta de montaña', 'Bici MTB 18v.', 220, 'https://img/mtb.jpg');

SET @id_pub_bici_mtb = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Bicicleta de montaña'
    AND id_usuario=@id_u_marta
    AND id_categoria=@id_cat_bici
  ORDER BY id_publicacion ASC
  LIMIT 1
);

SET @id_prod_bici_mtb = (
  SELECT id_producto
  FROM PRODUCTO
  WHERE nombre='Bici Montaña'
    AND id_categoria=@id_cat_bici
  ORDER BY id_producto ASC
  LIMIT 1
);

INSERT IGNORE INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um)
VALUES (@id_pub_bici_mtb, @id_prod_bici_mtb, 1.0000, @id_um_u);

-- Publicación SERVICIO: Mantenimiento PC (Luis, Tecnología)
INSERT IGNORE INTO PUBLICACION
 (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES
 (@id_u_luis, @id_cat_tec, @id_tp_serv, 'PUBLICADA', @id_ub_lpz,
  'Mantenimiento y limpieza de PC', 'Servicio técnico completo', 120, 'https://img/serv1.jpg');

SET @id_pub_serv_pc = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Mantenimiento y limpieza de PC'
    AND id_usuario=@id_u_luis
    AND id_categoria=@id_cat_tec
  ORDER BY id_publicacion ASC
  LIMIT 1
);

SET @id_serv_mant_pc = (
  SELECT id_servicio
  FROM SERVICIO
  WHERE nombre='Mantenimiento PC'
    AND id_categoria=@id_cat_tec
  ORDER BY id_servicio ASC
  LIMIT 1
);

INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
VALUES (@id_pub_serv_pc, @id_serv_mant_pc, 'L-V 09:00-18:00');

-- Publicación SERVICIO: Formateo SO (Nico, Tecnología)
INSERT IGNORE INTO PUBLICACION
 (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES
 (@id_u_nico, @id_cat_tec, @id_tp_serv, 'PUBLICADA', @id_ub_lpz,
  'Formateo e instalación de SO', 'Instalación desde cero', 140, 'https://img/serv2.jpg');

SET @id_pub_serv_so = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Formateo e instalación de SO'
    AND id_usuario=@id_u_nico
    AND id_categoria=@id_cat_tec
  ORDER BY id_publicacion ASC
  LIMIT 1
);

SET @id_serv_inst_so = (
  SELECT id_servicio
  FROM SERVICIO
  WHERE nombre='Instalación SO'
    AND id_categoria=@id_cat_tec
  ORDER BY id_servicio ASC
  LIMIT 1
);

INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
VALUES (@id_pub_serv_so, @id_serv_inst_so, 'L-S 10:00-19:00');

-- Publicación SERVICIO: Armado de muebles (Marta, Muebles)
INSERT IGNORE INTO PUBLICACION
 (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES
 (@id_u_marta, @id_cat_mue, @id_tp_serv, 'PUBLICADA', @id_ub_cbba,
  'Armado de muebles a domicilio', 'Armado rápido y seguro', 80, 'https://img/armado.jpg');

SET @id_pub_serv_arm = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Armado de muebles a domicilio'
    AND id_usuario=@id_u_marta
    AND id_categoria=@id_cat_mue
  ORDER BY id_publicacion ASC
  LIMIT 1
);

SET @id_serv_arm_mue = (
  SELECT id_servicio
  FROM SERVICIO
  WHERE nombre='Armado de muebles'
    AND id_categoria=@id_cat_mue
  ORDER BY id_servicio ASC
  LIMIT 1
);

INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
VALUES (@id_pub_serv_arm, @id_serv_arm_mue, 'L-D 08:00-18:00');

-- Publicación SERVICIO: Encuadernación (Nico, Libros)
INSERT IGNORE INTO PUBLICACION
 (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
VALUES
 (@id_u_nico, @id_cat_lib, @id_tp_serv, 'PUBLICADA', @id_ub_lpz,
  'Encuadernación de libros', 'Refuerzo de tapas y lomo', 60, 'https://img/encu.jpg');

SET @id_pub_serv_enc = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Encuadernación de libros'
    AND id_usuario=@id_u_nico
    AND id_categoria=@id_cat_lib
  ORDER BY id_publicacion ASC
  LIMIT 1
);

SET @id_serv_enc = (
  SELECT id_servicio
  FROM SERVICIO
  WHERE nombre='Encuadernación'
    AND id_categoria=@id_cat_lib
  ORDER BY id_servicio ASC
  LIMIT 1
);

INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
VALUES (@id_pub_serv_enc, @id_serv_enc, 'L-V 09:00-17:00');

/* ------------------------------------------------------------
   4) EQUIVALENCIAS AMBIENTALES
   ------------------------------------------------------------ */
INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
VALUES
 (@id_cat_bici, @id_um_u, 12.50, 45.00, 5.75),
 (@id_cat_tec,  @id_um_u,  2.10,  5.00, 1.50);

/* ------------------------------------------------------------
   5) PROMOCIONES (disparan bono por trigger al vincular)
   ------------------------------------------------------------ */
INSERT IGNORE INTO PROMOCION (id_tipo_promocion, nombre, descripcion, creditos_otorgados, fecha_inicio, fecha_fin, estado)
SELECT (SELECT id_tipo_promocion FROM TIPO_PROMOCION WHERE nombre='LANZAMIENTO' LIMIT 1),
       'Promo Bicis','Bono bicis', 50, @now - INTERVAL 1 DAY, @now + INTERVAL 3 DAY, 'ACTIVA'
UNION ALL
SELECT (SELECT id_tipo_promocion FROM TIPO_PROMOCION WHERE nombre='TEMPORADA' LIMIT 1),
       'Promo Tecno','Bono tecnología', 30, @now - INTERVAL 1 DAY, @now + INTERVAL 3 DAY, 'ACTIVA'
ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion), creditos_otorgados=VALUES(creditos_otorgados),
                        fecha_inicio=VALUES(fecha_inicio), fecha_fin=VALUES(fecha_fin), estado=VALUES(estado);

SET @id_promo_bicis = (SELECT id_promocion FROM PROMOCION WHERE nombre='Promo Bicis'  ORDER BY id_promocion ASC LIMIT 1);
SET @id_promo_tecno = (SELECT id_promocion FROM PROMOCION WHERE nombre='Promo Tecno'  ORDER BY id_promocion ASC LIMIT 1);

-- Vincular a publicaciones (usa IDS ya normalizados con LIMIT 1)
INSERT IGNORE INTO PROMOCION_PUBLICACION (id_promocion, id_publicacion)
VALUES
 (@id_promo_bicis, @id_pub_bici_urb),
 (@id_promo_bicis, @id_pub_bici_mtb),
 (@id_promo_tecno, @id_pub_serv_pc);

/* ------------------------------------------------------------
   6) PAQUETES y COMPRAS (3 usuarios)
   ------------------------------------------------------------ */
INSERT IGNORE INTO PAQUETE_CREDITOS (nombre, cantidad_creditos, precio_bs, activo)
VALUES ('Pack 100', 100, 50.00, TRUE),
       ('Pack 300', 300,150.00, TRUE),
       ('Pack 600', 600,270.00, TRUE);

SET @id_pack_600 = (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 600' LIMIT 1);
SET @id_pack_300 = (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 300' LIMIT 1);
SET @id_pack_100 = (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 100' LIMIT 1);

SET @id_ana   = (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'   LIMIT 1);
SET @id_bruno = (SELECT id_usuario FROM USUARIO WHERE correo='bruno@demo.com' LIMIT 1);
SET @id_carla = (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com' LIMIT 1);

-- Evita duplicar compras con id_transaccion_pago únicos
CALL sp_compra_creditos_aprobar(@id_ana,   @id_pack_600, 'PAY-DEMO-ANA-001');
CALL sp_compra_creditos_aprobar(@id_bruno, @id_pack_300, 'PAY-DEMO-BRU-001');
CALL sp_compra_creditos_aprobar(@id_carla, @id_pack_100, 'PAY-DEMO-CAR-001');

/* ------------------------------------------------------------
   7) INTERCAMBIOS (4 transacciones)
   ------------------------------------------------------------ */
-- Ana compra bici urbana (300)
CALL sp_realizar_intercambio(@id_ana, @id_pub_bici_urb, 300);

-- Bruno compra MTB (220)
CALL sp_realizar_intercambio(@id_bruno, @id_pub_bici_mtb, 220);

-- ids que ya usaste en el script
SET @id_carla = (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com' LIMIT 1);
SET @id_pack_100 = (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 100' LIMIT 1);

-- nueva compra (usa un id de pago único)
CALL sp_compra_creditos_aprobar(@id_carla, @id_pack_100, 'PAY-DEMO-CAR-002');

-- ahora sí: paga 120
CALL sp_realizar_intercambio(@id_carla, @id_pub_serv_pc, 120);


-- Ana paga servicio Formateo SO (140)
CALL sp_realizar_intercambio(@id_ana, @id_pub_serv_so, 140);

-- Completar la última transacción creada (si el flujo lo requiere)
SET @id_last_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_last_tx;

/* ------------------------------------------------------------
   8) ACTIVIDADES SOSTENIBLES (bonos)
   ------------------------------------------------------------ */
SET @id_act_recic = (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE' LIMIT 1);
SET @id_act_refo  = (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='REFORESTACION' LIMIT 1);

CALL sp_registrar_actividad_sostenible(@id_ana,   @id_act_recic, 'Entregó 6kg de plástico', 20, 'https://evid/reciclaje-ana.jpg');
CALL sp_registrar_actividad_sostenible(@id_bruno, @id_act_refo,  'Plantó 3 árboles',        15, 'https://evid/reforest-bruno.jpg');

/* ------------------------------------------------------------
   9) EVENTOS AMBIENTALES manuales
   ------------------------------------------------------------ */
SET @id_dim_co2 = (SELECT id_dimension FROM DIMENSION_AMBIENTAL WHERE codigo='CO2'   LIMIT 1);
SET @id_dim_h2o = (SELECT id_dimension FROM DIMENSION_AMBIENTAL WHERE codigo='AGUA'  LIMIT 1);
SET @id_um_kg   = (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kg' LIMIT 1);
-- antes: 
-- SET @id_per = (SELECT id_periodo FROM PERIODO WHERE nombre=@period_name LIMIT 1);

-- ahora:
SET @id_per = (
  SELECT id_periodo
  FROM PERIODO
  WHERE nombre COLLATE utf8mb4_unicode_ci
        = CONVERT(@period_name USING utf8mb4) COLLATE utf8mb4_unicode_ci
  LIMIT 1
);

INSERT INTO EVENTO_AMBIENTAL (id_usuario, id_dimension, fuente, id_fuente, categoria, valor, id_um, contaminacion_reducida, descripcion)
VALUES
 (@id_ana,   @id_dim_co2, 'TRANSACCION', (SELECT MAX(id_transaccion) FROM TRANSACCION), 'Compensación','2.500000', @id_um_kg, NULL,'Eco-compensación'),
 (@id_bruno, @id_dim_h2o, 'PUBLICACION', @id_pub_bici_mtb,                               'Ahorro',      '10.000000',(SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='L' LIMIT 1), NULL,'Educación hídrica');

/* ------------------------------------------------------------
   10) CALIFICACIONES (UNIQUE usuario-publicacion)
   ------------------------------------------------------------ */
INSERT INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario)
VALUES
 (@id_ana,   @id_pub_bici_urb, 5, 'Muy buena bici')
ON DUPLICATE KEY UPDATE estrellas=VALUES(estrellas), comentario=VALUES(comentario);

INSERT INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario)
VALUES
 (@id_bruno, @id_pub_bici_mtb, 4, 'Conforme')
ON DUPLICATE KEY UPDATE estrellas=VALUES(estrellas), comentario=VALUES(comentario);

INSERT INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario)
VALUES
 (@id_carla, @id_pub_serv_pc,  5, 'Excelente servicio')
ON DUPLICATE KEY UPDATE estrellas=VALUES(estrellas), comentario=VALUES(comentario);

INSERT INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario)
VALUES
 (@id_ana,   @id_pub_serv_so,  4, 'Rápido')
ON DUPLICATE KEY UPDATE estrellas=VALUES(estrellas), comentario=VALUES(comentario);

INSERT INTO CALIFICACION (id_usuario, id_publicacion, estrellas, comentario)
VALUES
 (@id_carla, @id_pub_serv_enc, 5, 'Quedó como nuevo')
ON DUPLICATE KEY UPDATE estrellas=VALUES(estrellas), comentario=VALUES(comentario);

/* ------------------------------------------------------------
   11) PUBLICIDAD (2)
   ------------------------------------------------------------ */
SET @id_u_luis = (SELECT id_usuario FROM USUARIO WHERE correo='luis@demo.com'  LIMIT 1);
SET @id_u_marta= (SELECT id_usuario FROM USUARIO WHERE correo='marta@demo.com' LIMIT 1);
SET @id_ub_home= (SELECT id_ubicacion FROM UBICACION_PUBLICIDAD WHERE nombre='HOME_TOP' LIMIT 1);
SET @id_ub_side= (SELECT id_ubicacion FROM UBICACION_PUBLICIDAD WHERE nombre='SIDEBAR'  LIMIT 1);

INSERT IGNORE INTO PUBLICIDAD
 (id_usuario, id_ubicacion, estado, titulo, descripcion, url_destino, fecha_inicio, fecha_fin, costo_creditos, clicks, impresiones)
VALUES
 (@id_u_luis,  @id_ub_home, 'ACTIVA','Promo Taller PC','Servicio express','https://vendedor/luis',  @now, @now + INTERVAL 10 DAY, 120, 5, 1500),
 (@id_u_marta, @id_ub_side, 'ACTIVA','Armado Rápido','Muebles armados en 24h','https://vendedora/marta', @now, @now + INTERVAL 7 DAY, 80, 2, 700);

/* ------------------------------------------------------------
   12) REPORTES + RANKING
   ------------------------------------------------------------ */
CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL' LIMIT 1),
  @id_per,
  NULL);

CALL sp_obtener_ranking_usuarios(@id_per, 5);

/* ------------------------------------------------------------
   13) CONSULTAS DE VERIFICACIÓN (opcionales)
   ------------------------------------------------------------ */
-- Saldos
SELECT 'SALDOS' AS seccion, u.correo, b.saldo_creditos
FROM USUARIO u JOIN BILLETERA b ON b.id_usuario=u.id_usuario
WHERE u.correo IN ('ana@demo.com','bruno@demo.com','carla@demo.com','luis@demo.com','marta@demo.com','nico@demo.com')
ORDER BY u.correo;

-- Bitácora reciente
SELECT 'BITACORA' AS seccion, id_bitacora, id_transaccion, cantidad_creditos, descripcion
FROM BITACORA_INTERCAMBIO
ORDER BY id_bitacora DESC LIMIT 10;

-- Movimientos últimos 15
SELECT 'MOVS' AS seccion, id_movimiento, id_usuario, id_tipo_movimiento, cantidad, saldo_anterior, saldo_posterior, id_referencia
FROM MOVIMIENTO_CREDITOS
ORDER BY id_movimiento DESC LIMIT 15;

-- Impacto ambiental por usuario en el período
SELECT 'IMPACTO' AS seccion, ia.id_usuario, SUM(ia.co2_ahorrado) co2, SUM(ia.agua_ahorrada) agua, SUM(ia.energia_ahorrada) energia
FROM IMPACTO_AMBIENTAL ia
WHERE ia.id_periodo=@id_per
GROUP BY ia.id_usuario
ORDER BY co2 DESC;

-- Reporte mensual global
SELECT 'REPORTE' AS seccion, r.*
FROM REPORTE_IMPACTO r
WHERE r.id_tipo_reporte=(SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL' LIMIT 1)
  AND r.id_periodo=@id_per
  AND r.id_usuario IS NULL;

-- Historial de Ana
CALL sp_obtener_historial_usuario(@id_ana);

-- FULLTEXT test (si existe índice)
SELECT 'FT' AS seccion, id_publicacion, titulo
FROM PUBLICACION
WHERE MATCH(titulo, descripcion) AGAINST ('bici aluminio servicio' IN NATURAL LANGUAGE MODE)
ORDER BY id_publicacion DESC;

COMMIT;

-- Resumen
SELECT 'RESUMEN' AS seccion,
 (SELECT COUNT(*) FROM USUARIO)               AS usuarios,
 (SELECT COUNT(*) FROM PUBLICACION)           AS publicaciones,
 (SELECT COUNT(*) FROM MOVIMIENTO_CREDITOS)   AS movimientos,
 (SELECT COUNT(*) FROM TRANSACCION)           AS transacciones,
 (SELECT COUNT(*) FROM IMPACTO_AMBIENTAL)     AS impactos,
 (SELECT COUNT(*) FROM PROMOCION_PUBLICACION) AS promos_vinculadas,
 (SELECT COUNT(*) FROM CALIFICACION)          AS calificaciones,
 (SELECT COUNT(*) FROM EVENTO_AMBIENTAL)      AS eventos_ambientales;

/* ============================================================
   PRUEBAS EXTENDIDAS (A–E) — SIN ERRORES
   Añadir al final del script principal
   ============================================================ */
USE CREDITOS_VERDES2;
SET @now_ext = NOW();

START TRANSACTION;

/* ---------------------------
   IDs base y helpers
   --------------------------- */
SET @id_ana    = (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'   LIMIT 1);
SET @id_bruno  = (SELECT id_usuario FROM USUARIO WHERE correo='bruno@demo.com' LIMIT 1);
SET @id_carla  = (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com' LIMIT 1);
SET @id_luis   = (SELECT id_usuario FROM USUARIO WHERE correo='luis@demo.com'  LIMIT 1);
SET @id_marta  = (SELECT id_usuario FROM USUARIO WHERE correo='marta@demo.com' LIMIT 1);
SET @id_nico   = (SELECT id_usuario FROM USUARIO WHERE correo='nico@demo.com'  LIMIT 1);

SET @id_per = (
  SELECT id_periodo
  FROM PERIODO
  ORDER BY fecha_inicio DESC, id_periodo DESC
  LIMIT 1
);

-- Publicaciones clave (con filtros + LIMIT 1)
SET @id_pub_bici_urb = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Bicicleta urbana aluminio'
    AND id_usuario=@id_luis
  ORDER BY id_publicacion ASC
  LIMIT 1
);

SET @id_pub_bici_mtb = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Bicicleta de montaña'
    AND id_usuario=@id_marta
  ORDER BY id_publicacion ASC
  LIMIT 1
);

SET @id_pub_serv_pc = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Mantenimiento y limpieza de PC'
    AND id_usuario=@id_luis
  ORDER BY id_publicacion ASC
  LIMIT 1
);

SET @id_pub_serv_so = (
  SELECT id_publicacion
  FROM PUBLICACION
  WHERE titulo='Formateo e instalación de SO'
    AND id_usuario=@id_nico
  ORDER BY id_publicacion ASC
  LIMIT 1
);

-- Paquetes para recargas controladas
SET @id_pack_100 = (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 100' LIMIT 1);
SET @id_pack_300 = (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 300' LIMIT 1);

/* ============================================================
   (A) INTERCAMBIO INVERSO — Luis compra servicio de Nico
   (garantizamos saldo y ejecutamos)
   ============================================================ */
-- Recarga segura para Luis (id de pago único para idempotencia)
CALL sp_compra_creditos_aprobar(@id_luis, @id_pack_300, 'PAY-EXT-LUIS-001');

-- Compra: Formateo e instalación de SO (140 créditos)
CALL sp_realizar_intercambio(@id_luis, @id_pub_serv_so, 140);

/* ============================================================
   (B) “SALDO INSUFICIENTE” VERIFICADO SIN ERROR
   (No llamamos al SP; solo comprobamos la función)
   ============================================================ */
SELECT 'CHECK_SALDO_INSUFICIENTE' AS test,
       fn_verificar_saldo(@id_bruno, 99999) AS puede_pagar_99999;  -- Esperado: 0

/* ============================================================
   (C) PROMOCIÓN EXPIRADA (NO debe otorgar bono)
   ============================================================ */
INSERT IGNORE INTO PROMOCION (id_tipo_promocion, nombre, descripcion, creditos_otorgados, fecha_inicio, fecha_fin, estado)
SELECT (SELECT id_tipo_promocion FROM TIPO_PROMOCION WHERE nombre='LANZAMIENTO' LIMIT 1),
       'Promo Vencida', 'No debe otorgar bono', 80,
       @now_ext - INTERVAL 10 DAY, @now_ext - INTERVAL 5 DAY, 'FINALIZADA';

SET @id_promo_venc = (SELECT id_promocion FROM PROMOCION WHERE nombre='Promo Vencida' ORDER BY id_promocion ASC LIMIT 1);

-- Vincular a la publicación de bici urbana (no debe crear movimiento de bono)
INSERT IGNORE INTO PROMOCION_PUBLICACION (id_promocion, id_publicacion)
VALUES (@id_promo_venc, @id_pub_bici_urb);

-- Verificación (solo muestra 0 si no hay bono por esa promo)
SELECT 'PROMO_VENCIDA_BONO_MOVS' AS test,
       COUNT(*) AS movimientos_bono_creados
FROM MOVIMIENTO_CREDITOS
WHERE descripcion LIKE '%Promo Vencida%';

/* ============================================================
   (D) LOGROS / PROGRESO USUARIO
   ============================================================ */
INSERT IGNORE INTO LOGRO (id_tipo_logro, nombre, descripcion, meta_requerida, creditos_recompensa)
SELECT tl.id_tipo_logro, 'VENTAS_3X', 'Tres ventas realizadas', 3, 50
FROM TIPO_LOGRO tl
WHERE tl.nombre='PRIMERA_VENTA'
LIMIT 1;

SET @id_logro_3x = (SELECT id_logro FROM LOGRO WHERE nombre='VENTAS_3X' LIMIT 1);

-- Asignar progreso a Marta (idempotente)
INSERT IGNORE INTO USUARIO_LOGRO (id_usuario, id_logro, progreso_actual)
VALUES (@id_marta, @id_logro_3x, 3);

-- Verificación ligera
SELECT 'LOGROS_MARTA' AS test, ul.id_usuario, ul.id_logro, ul.progreso_actual
FROM USUARIO_LOGRO ul
WHERE ul.id_usuario=@id_marta AND ul.id_logro=@id_logro_3x;

/* ============================================================
   (E) IMPACTO AMBIENTAL ACUMULADO + REPORTE
   ============================================================ */
-- Asegurar saldo para Ana y hacer dos transacciones pequeñas
CALL sp_compra_creditos_aprobar(@id_ana, @id_pack_100, 'PAY-EXT-ANA-001');

-- Pequeñas compras (no tiene que coincidir con valor_creditos exacto)
CALL sp_realizar_intercambio(@id_ana, @id_pub_bici_urb, 50);
CALL sp_realizar_intercambio(@id_ana, @id_pub_bici_mtb, 100);

-- Regenerar reporte mensual global
CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL' LIMIT 1),
  @id_per,
  NULL
);

-- Top 5 del ranking actualizado
CALL sp_obtener_ranking_usuarios(@id_per, 5);

/* ---------------------------
   Verificaciones finales
   --------------------------- */
-- Saldos de actores de estas pruebas
SELECT 'SALDOS_EXT' AS seccion, u.correo, b.saldo_creditos
FROM USUARIO u JOIN BILLETERA b ON b.id_usuario=u.id_usuario
WHERE u.correo IN ('ana@demo.com','bruno@demo.com','luis@demo.com','marta@demo.com','nico@demo.com')
ORDER BY u.correo;

-- Bitácora reciente
SELECT 'BITACORA_EXT' AS seccion, id_bitacora, id_transaccion, cantidad_creditos, descripcion
FROM BITACORA_INTERCAMBIO
ORDER BY id_bitacora DESC LIMIT 10;

COMMIT;
