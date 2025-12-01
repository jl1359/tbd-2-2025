USE CREDITOS_VERDES2;

-- =========================================================
-- 15) SEED MASIVO PARA PRUEBAS FUNCIONALES Y DE CARGA
--     (usuarios, billeteras, compras, intercambios, actividades,
--      suscripciones, publicidad, impacto, reportes)
-- =========================================================

-- 15.0) Asegurar TIPO_MOVIMIENTO BONO_BIENVENIDA con signo POSITIVO
-- (por si no se creó antes; el trigger trg_usuario_after_ins_bono_bienvenida lo necesita)

INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion)
VALUES ('BONO_BIENVENIDA', 'Bono de bienvenida por registro de usuario');

INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm ON sm.nombre = 'POSITIVO'
WHERE tm.nombre = 'BONO_BIENVENIDA';

-- Asegurar también BONO_PRIMERA_COMPRA y BONO_RECOMPRAS con signo POSITIVO (por si acaso)

INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion) VALUES
  ('BONO_PRIMERA_COMPRA','Bono por primera compra de créditos'),
  ('BONO_RECOMPRAS','Bono por compras recurrentes de créditos');

INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm ON sm.nombre = 'POSITIVO'
WHERE tm.nombre IN ('BONO_PRIMERA_COMPRA','BONO_RECOMPRAS');

-- =========================================================
-- 15.1) PROCEDIMIENTO PARA GENERAR DATOS MASIVOS
-- =========================================================

DROP PROCEDURE IF EXISTS sp_seed_masivo;
DELIMITER $$

CREATE PROCEDURE sp_seed_masivo()
BEGIN
  DECLARE v_i INT;
  DECLARE v_user INT;
  DECLARE v_cat INT;
  DECLARE v_tipo_pub INT;
  DECLARE v_paquete INT;
  DECLARE v_pub INT;
  DECLARE v_tipo_act INT;
  DECLARE v_ubic_pub INT;
  DECLARE v_monto DECIMAL(12,2);
  DECLARE v_id_tipo_rep_mensual INT;
  DECLARE v_id_tipo_rep_impacto INT;
  DECLARE v_id_periodo_ultimo INT;

  -- Handler general para NO reventar la semilla si algún SP lanza error
  -- (por ejemplo, saldo insuficiente en algún intercambio)
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
  BEGIN
    -- simple: ignorar y seguir con el siguiente loop
  END;

  -- =====================================================
  -- 1) USUARIOS MASIVOS (50 usuarios demo adicionales)
  -- =====================================================
  SET v_i = 1;
  WHILE v_i <= 50 DO
    INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil, password_hash)
    VALUES (
      (SELECT id_rol FROM ROL WHERE nombre='USUARIO' LIMIT 1),
      'ACTIVO',
      CONCAT('Usuario', LPAD(v_i,3,'0')),
      'Demo',
      CONCAT('user', LPAD(v_i,3,'0'), '@demo.com'),
      CONCAT('71', LPAD(v_i,6,'0')),
      CONCAT('/p/user', LPAD(v_i,3,'0')),
      ''
    );
    -- El trigger trg_usuario_after_ins_bono_bienvenida ya crea BILLETERA y MOVIMIENTO_CREDITOS
    SET v_i = v_i + 1;
  END WHILE;

  -- 5 admins y 5 ONG para probar filtros por rol
  SET v_i = 1;
  WHILE v_i <= 5 DO
    INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil, password_hash)
    VALUES (
      (SELECT id_rol FROM ROL WHERE nombre='ADMIN' LIMIT 1),
      'ACTIVO',
      CONCAT('Admin', LPAD(v_i,2,'0')),
      'Sistema',
      CONCAT('admin', LPAD(v_i,2,'0'), '@demo.com'),
      CONCAT('70', LPAD(v_i,6,'0')),
      CONCAT('/p/admin', LPAD(v_i,2,'0')),
      ''
    );
    SET v_i = v_i + 1;
  END WHILE;

  SET v_i = 1;
  WHILE v_i <= 5 DO
    INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil, password_hash)
    VALUES (
      (SELECT id_rol FROM ROL WHERE nombre='ONG' LIMIT 1),
      'ACTIVO',
      CONCAT('ONG', LPAD(v_i,2,'0')),
      'Ambiental',
      CONCAT('ong', LPAD(v_i,2,'0'), '@demo.com'),
      CONCAT('72', LPAD(v_i,6,'0')),
      CONCAT('/p/ong', LPAD(v_i,2,'0')),
      ''
    );
    SET v_i = v_i + 1;
  END WHILE;

  -- ===============================================
  -- 2) BITÁCORA DE ACCESO (actividad de logins)
  -- ===============================================
  SET v_i = 1;
  WHILE v_i <= 80 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    INSERT INTO BITACORA_ACCESO (id_usuario, fecha, direccion_ip, user_agent, id_resultado)
    VALUES (
      v_user,
      NOW() - INTERVAL FLOOR(RAND()*60) DAY,
      CONCAT('192.168.1.', FLOOR(RAND()*200)),
      'Seed-Massive-Agent',
      (SELECT id_resultado FROM RESULTADO_ACCESO WHERE nombre='OK' LIMIT 1)
    );
    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 3) PRODUCTOS Y SERVICIOS BASE POR CATEGORÍA
  --    (para asegurar que cada categoría tenga algo)
  -- =================================================
  INSERT IGNORE INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
  SELECT
    c.id_categoria,
    CONCAT('Producto demo ', c.nombre),
    CONCAT('Producto genérico para categoría ', c.nombre),
    100 + (c.id_categoria * 10),
    1.0 + (c.id_categoria * 0.5)
  FROM CATEGORIA c;

  INSERT IGNORE INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
  SELECT
    c.id_categoria,
    'ACTIVO',
    CONCAT('Servicio demo ', c.nombre),
    CONCAT('Servicio genérico asociado a categoría ', c.nombre),
    50 + (c.id_categoria * 5),
    30 + (c.id_categoria * 2)
  FROM CATEGORIA c;

  -- =================================================
  -- 4) PUBLICACIONES MASIVAS (≈ 200 publicaciones)
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 200 DO
    -- Usuario aleatorio
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    -- Categoría aleatoria
    SELECT id_categoria
    INTO v_cat
    FROM CATEGORIA
    ORDER BY RAND()
    LIMIT 1;

    -- Tipo de publicación aleatorio (PRODUCTO / SERVICIO / otras)
    SELECT id_tipo_publicacion
    INTO v_tipo_pub
    FROM TIPO_PUBLICACION
    ORDER BY RAND()
    LIMIT 1;

    -- Ubicación aleatoria
    SELECT id_ubicacion
    INTO v_ubic_pub
    FROM UBICACION
    ORDER BY RAND()
    LIMIT 1;

    INSERT INTO PUBLICACION
      (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
       titulo, descripcion, valor_creditos, imagen_url)
    VALUES
      (v_user, v_cat, v_tipo_pub, 'PUBLICADA', v_ubic_pub,
       CONCAT('Publicación demo #', v_i),
       CONCAT('Descripción masiva de prueba para la publicación #', v_i),
       50 + (v_i MOD 10) * 25,  -- valores entre 50 y 275 créditos
       CONCAT('https://img/demo/pub', v_i, '.jpg'));

    SET v_pub = LAST_INSERT_ID();

    -- Vincular a PRODUCTO o SERVICIO según tipo
    IF (SELECT nombre FROM TIPO_PUBLICACION WHERE id_tipo_publicacion = v_tipo_pub LIMIT 1) = 'PRODUCTO' THEN
      INSERT IGNORE INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um)
      SELECT
        v_pub,
        p.id_producto,
        1.0000,
        (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo IN ('u','pz') ORDER BY id_um LIMIT 1)
      FROM PRODUCTO p
      WHERE p.id_categoria = v_cat
      ORDER BY RAND()
      LIMIT 1;
    ELSEIF (SELECT nombre FROM TIPO_PUBLICACION WHERE id_tipo_publicacion = v_tipo_pub LIMIT 1) = 'SERVICIO' THEN
      INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
      SELECT
        v_pub,
        s.id_servicio,
        'L-V 09:00-18:00'
      FROM SERVICIO s
      WHERE s.id_categoria = v_cat
      ORDER BY RAND()
      LIMIT 1;
    END IF;

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 5) PROMOCIONES ACTIVAS Y VINCULACIÓN A PUBLICACIONES
  -- =================================================
  INSERT IGNORE INTO PROMOCION
    (id_tipo_promocion, nombre, descripcion, creditos_otorgados,
     fecha_inicio, fecha_fin, estado)
  SELECT
    (SELECT id_tipo_promocion FROM TIPO_PROMOCION WHERE nombre='TEMPORADA' LIMIT 1),
    'Promo Masiva Verano',
    'Promoción masiva de prueba (TEMPORADA)',
    30,
    NOW() - INTERVAL 15 DAY,
    NOW() + INTERVAL 15 DAY,
    'ACTIVA';

  INSERT IGNORE INTO PROMOCION
    (id_tipo_promocion, nombre, descripcion, creditos_otorgados,
     fecha_inicio, fecha_fin, estado)
  SELECT
    (SELECT id_tipo_promocion FROM TIPO_PROMOCION WHERE nombre='BONO_RECICLAJE' LIMIT 1),
    'Promo Masiva Reciclaje',
    'Promoción masiva de prueba (BONO_RECICLAJE)',
    20,
    NOW() - INTERVAL 10 DAY,
    NOW() + INTERVAL 20 DAY,
    'ACTIVA';

  -- Vincular unas 50 publicaciones a las promos (dispara BONO_PUBLICACION via triggers)
  SET v_i = 1;
  WHILE v_i <= 50 DO
    SELECT id_publicacion
    INTO v_pub
    FROM PUBLICACION
    ORDER BY RAND()
    LIMIT 1;

    INSERT IGNORE INTO PROMOCION_PUBLICACION (id_promocion, id_publicacion)
    SELECT id_promocion, v_pub
    FROM PROMOCION
    WHERE estado='ACTIVA'
    ORDER BY RAND()
    LIMIT 1;

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 6) COMPRAS DE CRÉDITOS MASIVAS (recargas)
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 150 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    SELECT id_paquete
    INTO v_paquete
    FROM PAQUETE_CREDITOS
    ORDER BY RAND()
    LIMIT 1;

    CALL sp_compra_creditos_aprobar(
      v_user,
      v_paquete,
      CONCAT('PAY-MASS-', v_i)
    );

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 7) INTERCAMBIOS MASIVOS (TRANSACCION + IMPACTO)
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 120 DO
    -- Comprador con saldo positivo
    SELECT b.id_usuario
    INTO v_user
    FROM BILLETERA b
    WHERE b.saldo_creditos > 0
    ORDER BY RAND()
    LIMIT 1;

    -- Publicación de otro usuario
    SELECT p.id_publicacion
    INTO v_pub
    FROM PUBLICACION p
    WHERE p.estado = 'PUBLICADA'
      AND p.id_usuario <> v_user
    ORDER BY RAND()
    LIMIT 1;

    -- Ejecutar intercambio (usa valor_creditos de la publicación)
    CALL sp_realizar_intercambio(v_user, v_pub, NULL);

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 8) ACTIVIDADES SOSTENIBLES MASIVAS
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 80 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    SELECT id_tipo_actividad
    INTO v_tipo_act
    FROM TIPO_ACTIVIDAD
    ORDER BY RAND()
    LIMIT 1;

    CALL sp_registrar_actividad_sostenible(
      v_user,
      v_tipo_act,
      CONCAT('Actividad sostenible masiva #', v_i),
      5 + (v_i MOD 5),  -- entre 5 y 9 créditos
      CONCAT('https://evidencias/actividad', v_i, '.jpg')
    );

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 9) SUSCRIPCIONES PREMIUM MASIVAS
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 40 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    SET v_monto = 20 + (v_i MOD 3) * 10; -- 20, 30, 40 Bs

    INSERT INTO SUSCRIPCION_PREMIUM
      (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
    VALUES
      (
        v_user,
        NOW() - INTERVAL (10 + v_i) DAY,
        NOW() + INTERVAL (30 + v_i) DAY,
        'ACTIVA',
        v_monto
      );

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 10) PUBLICIDAD MASIVA
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 30 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    SELECT id_ubicacion
    INTO v_ubic_pub
    FROM UBICACION_PUBLICIDAD
    ORDER BY RAND()
    LIMIT 1;

    INSERT INTO PUBLICIDAD
      (id_usuario, id_ubicacion, estado, titulo, descripcion,
       url_destino, fecha_inicio, fecha_fin, costo_creditos)
    VALUES
      (
        v_user,
        v_ubic_pub,
        'ACTIVA',
        CONCAT('Publicidad demo #', v_i),
        'Campaña masiva de prueba',
        'https://mi-sitio-demo.com',
        NOW() - INTERVAL (v_i MOD 10) DAY,
        NOW() + INTERVAL (10 + v_i) DAY,
        30 + (v_i * 2)
      );

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 11) REPORTES DE IMPACTO (usando último PERIODO)
  -- =================================================
  SELECT id_tipo_reporte
  INTO v_id_tipo_rep_mensual
  FROM TIPO_REPORTE
  WHERE nombre = 'MENSUAL'
  LIMIT 1;

  SELECT id_tipo_reporte
  INTO v_id_tipo_rep_impacto
  FROM TIPO_REPORTE
  WHERE nombre = 'IMPACTO_GENERAL'
  LIMIT 1;

  SELECT id_periodo
  INTO v_id_periodo_ultimo
  FROM PERIODO
  ORDER BY fecha_inicio DESC, id_periodo DESC
  LIMIT 1;

  IF v_id_tipo_rep_mensual IS NOT NULL AND v_id_periodo_ultimo IS NOT NULL THEN
    CALL sp_generar_reporte_impacto(
      v_id_tipo_rep_mensual,
      v_id_periodo_ultimo,
      NULL
    );
  END IF;

  IF v_id_tipo_rep_impacto IS NOT NULL AND v_id_periodo_ultimo IS NOT NULL THEN
    CALL sp_generar_reporte_impacto(
      v_id_tipo_rep_impacto,
      v_id_periodo_ultimo,
      NULL
    );
  END IF;

END$$
DELIMITER ;

-- =========================================================
-- 15.2) EJECUTAR LA SEMILLA MASIVA
-- =========================================================
CALL sp_seed_masivo();
USE CREDITOS_VERDES2;

-- =========================================================
-- 15) SEED MASIVO PROFESIONAL (10x)
--     - Muchos usuarios
--     - Mucha actividad (logins, compras, intercambios)
--     - Publicaciones, actividades sostenibles, premium,
--       publicidad, impacto, reportes
-- =========================================================

-- 15.0) Asegurar tipos de movimiento necesarios
--      (por si en algún entorno aún no están creados)

INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion)
VALUES ('BONO_BIENVENIDA', 'Bono de bienvenida por registro de usuario');

INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm ON sm.nombre = 'POSITIVO'
WHERE tm.nombre = 'BONO_BIENVENIDA';

INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion) VALUES
  ('BONO_PRIMERA_COMPRA','Bono por primera compra de créditos'),
  ('BONO_RECOMPRAS','Bono por compras recurrentes de créditos');

INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm ON sm.nombre = 'POSITIVO'
WHERE tm.nombre IN ('BONO_PRIMERA_COMPRA','BONO_RECOMPRAS');

-- =========================================================
-- 15.1) PROCEDIMIENTO DE SEED MASIVO PROFESIONAL
-- =========================================================

DROP PROCEDURE IF EXISTS sp_seed_masivo_profesional;
DELIMITER $$

CREATE PROCEDURE sp_seed_masivo_profesional()
BEGIN
  DECLARE v_i INT;
  DECLARE v_user INT;
  DECLARE v_cat INT;
  DECLARE v_tipo_pub INT;
  DECLARE v_paquete INT;
  DECLARE v_pub INT;
  DECLARE v_tipo_act INT;
  DECLARE v_ubic_pub INT;
  DECLARE v_monto DECIMAL(12,2);
  DECLARE v_id_tipo_rep_mensual INT;
  DECLARE v_id_tipo_rep_impacto INT;
  DECLARE v_id_periodo_ultimo INT;

  -- Handler general: si un SP revienta por saldo u otra cosa, seguimos
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
  BEGIN
    -- ignorar error puntual y continuar el loop
  END;

  -- =====================================================
  -- 1) USUARIOS MASIVOS
  --    - 500 usuarios normales
  --    - 50 admins
  --    - 50 ONG
  -- =====================================================

  -- 500 usuarios normales
  SET v_i = 1;
  WHILE v_i <= 500 DO
    INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil, password_hash)
    VALUES (
      (SELECT id_rol FROM ROL WHERE nombre='USUARIO' LIMIT 1),
      'ACTIVO',
      CONCAT('Usuario', LPAD(v_i,3,'0')),
      'Demo',
      CONCAT('user', LPAD(v_i,3,'0'), '@demo.com'),
      CONCAT('71', LPAD(v_i,6,'0')),
      CONCAT('/p/user', LPAD(v_i,3,'0')),
      ''
    );
    -- Trigger de bono de bienvenida se encarga de BILLETERA + MOVIMIENTO
    SET v_i = v_i + 1;
  END WHILE;

  -- 50 admins
  SET v_i = 1;
  WHILE v_i <= 50 DO
    INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil, password_hash)
    VALUES (
      (SELECT id_rol FROM ROL WHERE nombre='ADMIN' LIMIT 1),
      'ACTIVO',
      CONCAT('Admin', LPAD(v_i,2,'0')),
      'Sistema',
      CONCAT('admin', LPAD(v_i,2,'0'), '@demo.com'),
      CONCAT('70', LPAD(v_i,6,'0')),
      CONCAT('/p/admin', LPAD(v_i,2,'0')),
      ''
    );
    SET v_i = v_i + 1;
  END WHILE;

  -- 50 ONG
  SET v_i = 1;
  WHILE v_i <= 50 DO
    INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil, password_hash)
    VALUES (
      (SELECT id_rol FROM ROL WHERE nombre='ONG' LIMIT 1),
      'ACTIVO',
      CONCAT('ONG', LPAD(v_i,2,'0')),
      'Ambiental',
      CONCAT('ong', LPAD(v_i,2,'0'), '@demo.com'),
      CONCAT('72', LPAD(v_i,6,'0')),
      CONCAT('/p/ong', LPAD(v_i,2,'0')),
      ''
    );
    SET v_i = v_i + 1;
  END WHILE;

  -- ===============================================
  -- 2) BITÁCORA DE ACCESO (≈ 800 logins simulados)
  -- ===============================================
  SET v_i = 1;
  WHILE v_i <= 800 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    INSERT INTO BITACORA_ACCESO (id_usuario, fecha, direccion_ip, user_agent, id_resultado)
    VALUES (
      v_user,
      NOW() - INTERVAL FLOOR(RAND()*120) DAY,
      CONCAT('10.0.', FLOOR(RAND()*10), '.', FLOOR(RAND()*200)),
      'Seed-Massive-Agent',
      (SELECT id_resultado FROM RESULTADO_ACCESO WHERE nombre='OK' LIMIT 1)
    );
    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 3) PRODUCTOS Y SERVICIOS BASE POR CATEGORÍA
  --    (asegura que cada categoría tenga producto y servicio)
  -- =================================================
  INSERT IGNORE INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
  SELECT
    c.id_categoria,
    CONCAT('Producto demo ', c.nombre),
    CONCAT('Producto genérico para categoría ', c.nombre),
    100 + (c.id_categoria * 10),
    1.0 + (c.id_categoria * 0.5)
  FROM CATEGORIA c;

  INSERT IGNORE INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
  SELECT
    c.id_categoria,
    'ACTIVO',
    CONCAT('Servicio demo ', c.nombre),
    CONCAT('Servicio genérico asociado a categoría ', c.nombre),
    50 + (c.id_categoria * 5),
    30 + (c.id_categoria * 2)
  FROM CATEGORIA c;

  -- =================================================
  -- 4) PUBLICACIONES MASIVAS (≈ 2000 publicaciones)
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 2000 DO
    -- Usuario aleatorio
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    -- Categoría aleatoria
    SELECT id_categoria
    INTO v_cat
    FROM CATEGORIA
    ORDER BY RAND()
    LIMIT 1;

    -- Tipo de publicación aleatorio
    SELECT id_tipo_publicacion
    INTO v_tipo_pub
    FROM TIPO_PUBLICACION
    ORDER BY RAND()
    LIMIT 1;

    -- Ubicación aleatoria
    SELECT id_ubicacion
    INTO v_ubic_pub
    FROM UBICACION
    ORDER BY RAND()
    LIMIT 1;

    INSERT INTO PUBLICACION
      (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
       titulo, descripcion, valor_creditos, imagen_url)
    VALUES
      (v_user, v_cat, v_tipo_pub, 'PUBLICADA', v_ubic_pub,
       CONCAT('Publicación masiva #', v_i),
       CONCAT('Descripción masiva de prueba para la publicación #', v_i),
       50 + (v_i MOD 20) * 25,  -- valores entre 50 y 550 créditos
       CONCAT('https://img/demo/pub', v_i, '.jpg'));

    SET v_pub = LAST_INSERT_ID();

    -- Vincular a PRODUCTO o SERVICIO según tipo
    IF (SELECT nombre FROM TIPO_PUBLICACION WHERE id_tipo_publicacion = v_tipo_pub LIMIT 1) = 'PRODUCTO' THEN
      INSERT IGNORE INTO PUBLICACION_PRODUCTO (id_publicacion, id_producto, cantidad, id_um)
      SELECT
        v_pub,
        p.id_producto,
        1.0000,
        (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo IN ('u','pz') ORDER BY id_um LIMIT 1)
      FROM PRODUCTO p
      WHERE p.id_categoria = v_cat
      ORDER BY RAND()
      LIMIT 1;
    ELSEIF (SELECT nombre FROM TIPO_PUBLICACION WHERE id_tipo_publicacion = v_tipo_pub LIMIT 1) = 'SERVICIO' THEN
      INSERT IGNORE INTO PUBLICACION_SERVICIO (id_publicacion, id_servicio, horario)
      SELECT
        v_pub,
        s.id_servicio,
        'L-V 09:00-18:00'
      FROM SERVICIO s
      WHERE s.id_categoria = v_cat
      ORDER BY RAND()
      LIMIT 1;
    END IF;

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 5) PROMOCIONES ACTIVAS + VINCULACIÓN MASIVA
  -- =================================================
  INSERT IGNORE INTO PROMOCION
    (id_tipo_promocion, nombre, descripcion, creditos_otorgados,
     fecha_inicio, fecha_fin, estado)
  SELECT
    (SELECT id_tipo_promocion FROM TIPO_PROMOCION WHERE nombre='TEMPORADA' LIMIT 1),
    'Promo Masiva Verano',
    'Promoción masiva de prueba (TEMPORADA)',
    30,
    NOW() - INTERVAL 30 DAY,
    NOW() + INTERVAL 30 DAY,
    'ACTIVA';

  INSERT IGNORE INTO PROMOCION
    (id_tipo_promocion, nombre, descripcion, creditos_otorgados,
     fecha_inicio, fecha_fin, estado)
  SELECT
    (SELECT id_tipo_promocion FROM TIPO_PROMOCION WHERE nombre='BONO_RECICLAJE' LIMIT 1),
    'Promo Masiva Reciclaje',
    'Promoción masiva de prueba (BONO_RECICLAJE)',
    20,
    NOW() - INTERVAL 20 DAY,
    NOW() + INTERVAL 40 DAY,
    'ACTIVA';

  -- Vincular ≈ 500 publicaciones (dispara bonos por trigger de PROMOCION_PUBLICACION)
  SET v_i = 1;
  WHILE v_i <= 500 DO
    SELECT id_publicacion
    INTO v_pub
    FROM PUBLICACION
    ORDER BY RAND()
    LIMIT 1;

    INSERT IGNORE INTO PROMOCION_PUBLICACION (id_promocion, id_publicacion)
    SELECT id_promocion, v_pub
    FROM PROMOCION
    WHERE estado='ACTIVA'
    ORDER BY RAND()
    LIMIT 1;

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 6) COMPRAS DE CRÉDITOS MASIVAS (≈ 1500 recargas)
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 1500 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    SELECT id_paquete
    INTO v_paquete
    FROM PAQUETE_CREDITOS
    ORDER BY RAND()
    LIMIT 1;

    CALL sp_compra_creditos_aprobar(
      v_user,
      v_paquete,
      CONCAT('PAY-MASS-', v_i)
    );

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 7) INTERCAMBIOS MASIVOS (≈ 1200 transacciones)
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 1200 DO
    -- Comprador con saldo positivo
    SELECT b.id_usuario
    INTO v_user
    FROM BILLETERA b
    WHERE b.saldo_creditos > 0
    ORDER BY RAND()
    LIMIT 1;

    -- Publicación de otro usuario
    SELECT p.id_publicacion
    INTO v_pub
    FROM PUBLICACION p
    WHERE p.estado = 'PUBLICADA'
      AND p.id_usuario <> v_user
    ORDER BY RAND()
    LIMIT 1;

    -- Ejecutar intercambio (usa valor_creditos de la publicación)
    CALL sp_realizar_intercambio(v_user, v_pub, NULL);

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 8) ACTIVIDADES SOSTENIBLES MASIVAS (≈ 800)
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 800 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    SELECT id_tipo_actividad
    INTO v_tipo_act
    FROM TIPO_ACTIVIDAD
    ORDER BY RAND()
    LIMIT 1;

    CALL sp_registrar_actividad_sostenible(
      v_user,
      v_tipo_act,
      CONCAT('Actividad sostenible masiva #', v_i),
      5 + (v_i MOD 5),  -- entre 5 y 9 créditos
      CONCAT('https://evidencias/actividad', v_i, '.jpg')
    );

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 9) SUSCRIPCIONES PREMIUM MASIVAS (≈ 400)
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 400 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    SET v_monto = 20 + (v_i MOD 3) * 10; -- 20, 30, 40 Bs

    INSERT INTO SUSCRIPCION_PREMIUM
      (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
    VALUES
      (
        v_user,
        NOW() - INTERVAL (20 + v_i) DAY,
        NOW() + INTERVAL (30 + v_i) DAY,
        'ACTIVA',
        v_monto
      );

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 10) PUBLICIDAD MASIVA (≈ 300 campañas)
  -- =================================================
  SET v_i = 1;
  WHILE v_i <= 300 DO
    SELECT id_usuario
    INTO v_user
    FROM USUARIO
    ORDER BY RAND()
    LIMIT 1;

    SELECT id_ubicacion
    INTO v_ubic_pub
    FROM UBICACION_PUBLICIDAD
    ORDER BY RAND()
    LIMIT 1;

    INSERT INTO PUBLICIDAD
      (id_usuario, id_ubicacion, estado, titulo, descripcion,
       url_destino, fecha_inicio, fecha_fin, costo_creditos)
    VALUES
      (
        v_user,
        v_ubic_pub,
        'ACTIVA',
        CONCAT('Publicidad masiva #', v_i),
        'Campaña masiva de prueba para dashboards de publicidad',
        'https://mi-sitio-demo.com',
        NOW() - INTERVAL (v_i MOD 15) DAY,
        NOW() + INTERVAL (15 + v_i) DAY,
        30 + (v_i * 3)
      );

    SET v_i = v_i + 1;
  END WHILE;

  -- =================================================
  -- 11) REPORTES DE IMPACTO (último PERIODO)
  -- =================================================
  SELECT id_tipo_reporte
  INTO v_id_tipo_rep_mensual
  FROM TIPO_REPORTE
  WHERE nombre = 'MENSUAL'
  LIMIT 1;

  SELECT id_tipo_reporte
  INTO v_id_tipo_rep_impacto
  FROM TIPO_REPORTE
  WHERE nombre = 'IMPACTO_GENERAL'
  LIMIT 1;

  SELECT id_periodo
  INTO v_id_periodo_ultimo
  FROM PERIODO
  ORDER BY fecha_inicio DESC, id_periodo DESC
  LIMIT 1;

  IF v_id_tipo_rep_mensual IS NOT NULL AND v_id_periodo_ultimo IS NOT NULL THEN
    CALL sp_generar_reporte_impacto(
      v_id_tipo_rep_mensual,
      v_id_periodo_ultimo,
      NULL
    );
  END IF;

  IF v_id_tipo_rep_impacto IS NOT NULL AND v_id_periodo_ultimo IS NOT NULL THEN
    CALL sp_generar_reporte_impacto(
      v_id_tipo_rep_impacto,
      v_id_periodo_ultimo,
      NULL
    );
  END IF;

END$$
DELIMITER ;

-- =========================================================
-- 15.2) EJECUTAR LA SEMILLA MASIVA PROFESIONAL
-- =========================================================
-- CALL sp_seed_masivo_profesional();

-- (Opcional) Si no quieres dejar el procedimiento en la BD:
-- DROP PROCEDURE IF EXISTS sp_seed_masivo_profesional;

-- Puedes borrar el procedimiento si ya no lo quieres en la BD:
-- DROP PROCEDURE IF EXISTS sp_seed_masivo;
-- Usuarios
SELECT COUNT(*) AS total_usuarios FROM USUARIO;

-- Billeteras
SELECT COUNT(*) AS total_billeteras FROM BILLETERA;

-- Publicaciones
SELECT COUNT(*) AS total_publicaciones FROM PUBLICACION;

-- Transacciones
SELECT COUNT(*) AS total_transacciones FROM TRANSACCION;

-- Movimientos de créditos
SELECT COUNT(*) AS total_movimientos FROM MOVIMIENTO_CREDITOS;

-- Impacto ambiental
SELECT COUNT(*) AS total_impactos FROM IMPACTO_AMBIENTAL;

-- Actividades sostenibles
SELECT COUNT(*) AS total_actividades FROM ACTIVIDAD_SOSTENIBLE;

-- Suscripciones premium
SELECT COUNT(*) AS total_suscripciones FROM SUSCRIPCION_PREMIUM;
SELECT * FROM USUARIO ORDER BY id_usuario DESC LIMIT 100;
SELECT * FROM PUBLICACION ORDER BY id_publicacion DESC LIMIT 100;
SELECT * FROM TRANSACCION ORDER BY id_transaccion DESC LIMIT 100;
SELECT * FROM MOVIMIENTO_CREDITOS ORDER BY id_movimiento DESC LIMIT 100;
SELECT * FROM IMPACTO_AMBIENTAL ORDER BY id_impacto DESC LIMIT 100;
