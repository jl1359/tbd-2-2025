use creditos_verdes;

/* 1) FUNCIONES DE AYUDA */

-- 1.1 Helper: obtener id de TIPO_MOVIMIENTO por nombre
DROP FUNCTION IF EXISTS fn_get_tipo_mov;
DELIMITER $$
CREATE FUNCTION fn_get_tipo_mov(p_nombre VARCHAR(50))
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE v_id INT;
  SELECT id_tipo_movimiento INTO v_id
  FROM TIPO_MOVIMIENTO
  WHERE nombre = p_nombre
  LIMIT 1;
  RETURN v_id;
END$$
DELIMITER ;

-- 1.2 Verificar saldo: retorna 1 si alcanza, 0 si no
DROP FUNCTION IF EXISTS fn_verificar_saldo;
DELIMITER $$
CREATE FUNCTION fn_verificar_saldo(p_id_usuario INT, p_monto BIGINT)
RETURNS TINYINT
DETERMINISTIC
BEGIN
  DECLARE v_saldo BIGINT DEFAULT 0;
  SELECT saldo_creditos INTO v_saldo FROM BILLETERA WHERE id_usuario = p_id_usuario;
  IF v_saldo IS NULL THEN SET v_saldo = 0; END IF;
  RETURN (v_saldo >= p_monto);
END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

/*= 2) PROCEDIMIENTOS DE NEGOCIO (TRANSACCION) =*/

-- 2.1 Compra de créditos (aprobada): crea compra, suma créditos y genera movimiento
DROP PROCEDURE IF EXISTS sp_compra_creditos_aprobar;
DELIMITER $$
CREATE PROCEDURE sp_compra_creditos_aprobar(
  IN p_id_usuario INT,
  IN p_id_paquete INT,
  IN p_id_transaccion_pago VARCHAR(255)
)
BEGIN
  DECLARE v_creditos BIGINT;
  DECLARE v_id_tipo_mov INT;

  -- Validaciones básicas
  IF p_id_usuario IS NULL OR p_id_paquete IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario y paquete son obligatorios';
  END IF;

  SELECT cantidad_creditos INTO v_creditos
  FROM PAQUETE_CREDITOS
  WHERE id_paquete = p_id_paquete;

  IF v_creditos IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Paquete no existe';
  END IF;

  -- Insert compra (marcada como APROBADO)
  INSERT INTO COMPRA_CREDITOS (id_usuario, id_paquete, monto_bs, estado, id_transaccion_pago)
  SELECT p_id_usuario, p_id_paquete, precio_bs, 'APROBADO', p_id_transaccion_pago
  FROM PAQUETE_CREDITOS WHERE id_paquete = p_id_paquete;

  -- Asegurar billetera
  INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
  VALUES (p_id_usuario, 'ACTIVA', 0, 0.00, NULL);

  -- Movimiento RECARGA (trigger calculará saldos)
  SET v_id_tipo_mov = fn_get_tipo_mov('RECARGA');
  IF v_id_tipo_mov IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO RECARGA no existe';
  END IF;

  INSERT INTO MOVIMIENTO_CREDITOS
    (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
  VALUES
    (p_id_usuario, v_id_tipo_mov, (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='COMPRA' LIMIT 1),
     v_creditos, 'Recarga por compra de paquete', 0, 0, LAST_INSERT_ID());
END$$
DELIMITER ;

-- 2.2 Verificación de saldo (procedimiento que lanza error si no alcanza)
DROP PROCEDURE IF EXISTS sp_verificar_saldo;
DELIMITER $$
CREATE PROCEDURE sp_verificar_saldo(IN p_id_usuario INT, IN p_monto BIGINT)
BEGIN
  IF fn_verificar_saldo(p_id_usuario, p_monto) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente';
  END IF;
END$$
DELIMITER ;

-- 2.3 Realizar intercambio (crea transacción, mueve saldos y registra bitácora + impacto)
DROP PROCEDURE IF EXISTS sp_realizar_intercambio;
DELIMITER $$
CREATE PROCEDURE sp_realizar_intercambio(
  IN p_id_comprador INT,
  IN p_id_publicacion INT,
  IN p_creditos BIGINT
)
BEGIN
  DECLARE v_id_vendedor INT;
  DECLARE v_valor_creditos BIGINT;
  DECLARE v_id_tx INT;
  DECLARE v_mov_in INT;
  DECLARE v_mov_out INT;

  -- Datos de la publicación
  SELECT id_usuario, valor_creditos INTO v_id_vendedor, v_valor_creditos
  FROM PUBLICACION WHERE id_publicacion = p_id_publicacion;

  IF v_id_vendedor IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Publicación no existe';
  END IF;

  IF p_id_comprador = v_id_vendedor THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No puedes intercambiar con tu propia publicación';
  END IF;

  -- Verificar saldo del comprador
  CALL sp_verificar_saldo(p_id_comprador, p_creditos);

  -- Crear transacción SOLICITADA -> ACEPTADA (para flujo simple)
  INSERT INTO TRANSACCION (id_comprador, id_vendedor, id_publicacion, cantidad_creditos, estado)
  VALUES (p_id_comprador, v_id_vendedor, p_id_publicacion, p_creditos, 'ACEPTADA');
  SET v_id_tx = LAST_INSERT_ID();

  -- Asegurar billeteras
  INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
  VALUES (p_id_comprador, 'ACTIVA', 0, 0.00, NULL),
         (v_id_vendedor, 'ACTIVA', 0, 0.00, NULL);

  -- Tipos de movimiento
  SET v_mov_in  = fn_get_tipo_mov('INTERCAMBIO_IN');
  SET v_mov_out = fn_get_tipo_mov('INTERCAMBIO_OUT');
  IF v_mov_in IS NULL OR v_mov_out IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipos de movimiento de intercambio no configurados';
  END IF;

  -- Movimientos comprador (-) y vendedor (+) - trigger calculará saldos y validará negativo
  INSERT INTO MOVIMIENTO_CREDITOS
    (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
  VALUES
    (p_id_comprador, v_mov_out, (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='TRANSACCION' LIMIT 1),
     p_creditos, CONCAT('Pago por transacción #', v_id_tx), 0, 0, v_id_tx),
    (v_id_vendedor, v_mov_in, (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='TRANSACCION' LIMIT 1),
     p_creditos, CONCAT('Crédito recibido por transacción #', v_id_tx), 0, 0, v_id_tx);

  -- Bitácora inicial
  INSERT INTO BITACORA_INTERCAMBIO (id_transaccion, id_usuario_origen, id_usuario_destino, cantidad_creditos, descripcion)
  VALUES (v_id_tx, p_id_comprador, v_id_vendedor, p_creditos, 'Intercambio realizado');

  -- Calcular e insertar impacto ambiental de la transacción
  CALL sp_calcular_e_insertar_impacto(v_id_tx);
END$$
DELIMITER ;

-- 2.4 Generar reporte de impacto (agrega/actualiza fila en REPORTE_IMPACTO por periodo)
DROP PROCEDURE IF EXISTS sp_generar_reporte_impacto;
DELIMITER $$
CREATE PROCEDURE sp_generar_reporte_impacto(
  IN p_id_tipo_reporte INT,
  IN p_id_periodo INT,
  IN p_id_usuario INT    -- <== sin "NULL" aquí
)
BEGIN
  DECLARE v_total_co2 DECIMAL(12,6);
  DECLARE v_total_ag  DECIMAL(12,6);
  DECLARE v_total_en  DECIMAL(12,6);
  DECLARE v_total_tx  BIGINT;
  DECLARE v_total_users BIGINT;

  /* Acumulados de IMPACTO_AMBIENTAL */
  IF p_id_usuario IS NULL THEN
    SELECT IFNULL(SUM(co2_ahorrado),0),
           IFNULL(SUM(agua_ahorrada),0),
           IFNULL(SUM(energia_ahorrada),0),
           COUNT(DISTINCT id_transaccion),
           COUNT(DISTINCT id_usuario)
    INTO v_total_co2, v_total_ag, v_total_en, v_total_tx, v_total_users
    FROM IMPACTO_AMBIENTAL
    WHERE id_periodo = p_id_periodo;
  ELSE
    SELECT IFNULL(SUM(co2_ahorrado),0),
           IFNULL(SUM(agua_ahorrada),0),
           IFNULL(SUM(energia_ahorrada),0),
           COUNT(DISTINCT id_transaccion),
           COUNT(DISTINCT id_usuario)
    INTO v_total_co2, v_total_ag, v_total_en, v_total_tx, v_total_users
    FROM IMPACTO_AMBIENTAL
    WHERE id_periodo = p_id_periodo
      AND id_usuario = p_id_usuario;
  END IF;

  /* Upsert simple: borrar y reinsertar la fila objetivo */
  DELETE FROM REPORTE_IMPACTO
  WHERE id_tipo_reporte = p_id_tipo_reporte
    AND id_periodo = p_id_periodo
    AND ( (p_id_usuario IS NULL AND id_usuario IS NULL)
          OR id_usuario = p_id_usuario );

  INSERT INTO REPORTE_IMPACTO
    (id_usuario, id_tipo_reporte, id_periodo,
     total_co2_ahorrado, total_agua_ahorrada, total_energia_ahorrada,
     total_transacciones, total_usuarios_activos)
  VALUES
    (p_id_usuario, p_id_tipo_reporte, p_id_periodo,
     v_total_co2, v_total_ag, v_total_en, v_total_tx, v_total_users);
END$$
DELIMITER ;

-- 2.5 Obtener ranking de usuarios (por CO2 ahorrado en un periodo)
DROP PROCEDURE IF EXISTS sp_obtener_ranking_usuarios;
DELIMITER $$
CREATE PROCEDURE sp_obtener_ranking_usuarios(
  IN p_id_periodo INT,
  IN p_limit INT
)
BEGIN
  SELECT ia.id_usuario,
         SUM(ia.co2_ahorrado) AS co2_total,
         SUM(ia.agua_ahorrada) AS agua_total,
         SUM(ia.energia_ahorrada) AS energia_total,
         COUNT(DISTINCT ia.id_transaccion) AS transacciones
  FROM IMPACTO_AMBIENTAL ia
  WHERE ia.id_periodo = p_id_periodo
  GROUP BY ia.id_usuario
  ORDER BY co2_total DESC
  LIMIT p_limit;
END$$
DELIMITER ;

-- 2.6 Registrar actividad sostenible (otorga créditos y genera movimiento)
DROP PROCEDURE IF EXISTS sp_registrar_actividad_sostenible;
DELIMITER $$
CREATE PROCEDURE sp_registrar_actividad_sostenible(
  IN p_id_usuario INT,
  IN p_id_tipo_actividad INT,
  IN p_descripcion TEXT,
  IN p_creditos_otorgados INT,
  IN p_evidencia_url VARCHAR(500)
)
BEGIN
  DECLARE v_mov_bono INT;

  INSERT INTO ACTIVIDAD_SOSTENIBLE (id_usuario, id_tipo_actividad, descripcion, creditos_otorgados, evidencia_url)
  VALUES (p_id_usuario, p_id_tipo_actividad, p_descripcion, p_creditos_otorgados, p_evidencia_url);

  -- Asegurar billetera
  INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
  VALUES (p_id_usuario, 'ACTIVA', 0, 0.00, NULL);

  SET v_mov_bono = fn_get_tipo_mov('BONO_ACTIVIDAD');
  IF v_mov_bono IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO BONO_ACTIVIDAD no existe';
  END IF;

  INSERT INTO MOVIMIENTO_CREDITOS
    (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
  VALUES
    (p_id_usuario, v_mov_bono, (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='AJUSTE' LIMIT 1),
     p_creditos_otorgados, 'Bono por actividad sostenible', 0, 0, LAST_INSERT_ID());
END$$
DELIMITER ;

-- 2.7 Obtener historial de usuario (movimientos + transacciones relacionadas)
DROP PROCEDURE IF EXISTS sp_obtener_historial_usuario;
DELIMITER $$
CREATE PROCEDURE sp_obtener_historial_usuario(IN p_id_usuario INT)
BEGIN
  -- Movimientos
  SELECT 'MOVIMIENTO' AS tipo, m.id_movimiento AS id,
         m.id_usuario, tm.nombre AS tipo_movimiento, tr.nombre AS tipo_referencia,
         m.cantidad, m.saldo_anterior, m.saldo_posterior, m.id_referencia
  FROM MOVIMIENTO_CREDITOS m
  JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_movimiento = m.id_tipo_movimiento
  JOIN TIPO_REFERENCIA tr ON tr.id_tipo_referencia = m.id_tipo_referencia
  WHERE m.id_usuario = p_id_usuario

  UNION ALL

  -- Transacciones como comprador o vendedor
  SELECT 'TRANSACCION' AS tipo, t.id_transaccion AS id,
         p_id_usuario AS id_usuario, 'N/A' AS tipo_movimiento, 'TRANSACCION' AS tipo_referencia,
         t.cantidad_creditos AS cantidad, NULL AS saldo_anterior, NULL AS saldo_posterior, t.id_publicacion AS id_referencia
  FROM TRANSACCION t
  WHERE t.id_comprador = p_id_usuario OR t.id_vendedor = p_id_usuario;
END$$
DELIMITER ;

-- 2.8 Cálculo e inserción de impacto ambiental para una transacción
DROP PROCEDURE IF EXISTS sp_calcular_e_insertar_impacto;
DELIMITER $$
CREATE PROCEDURE sp_calcular_e_insertar_impacto(IN p_id_transaccion INT)
BEGIN
  DECLARE v_id_usuario_c INT;
  DECLARE v_id_usuario_v INT;
  DECLARE v_id_publicacion INT;
  DECLARE v_id_categoria INT;
  DECLARE v_creditos BIGINT;
  DECLARE v_valor_pub BIGINT;
  DECLARE v_unidades DECIMAL(18,6);
  DECLARE v_co2 DECIMAL(12,6);
  DECLARE v_agua DECIMAL(12,6);
  DECLARE v_energia DECIMAL(12,6);
  DECLARE v_id_periodo INT;

  -- Datos base de la transacción y publicación
  SELECT id_comprador, id_vendedor, id_publicacion, cantidad_creditos
  INTO v_id_usuario_c, v_id_usuario_v, v_id_publicacion, v_creditos
  FROM TRANSACCION WHERE id_transaccion = p_id_transaccion;

  SELECT id_categoria, valor_creditos INTO v_id_categoria, v_valor_pub
  FROM PUBLICACION WHERE id_publicacion = v_id_publicacion;

  IF v_valor_pub IS NULL OR v_valor_pub = 0 THEN
    SET v_unidades = 1; -- fallback: 1 unidad si no hay valor_creditos
  ELSE
    SET v_unidades = v_creditos / v_valor_pub;
  END IF;

  -- Equivalencias por categoría (si no hay, 0)
  SELECT 
     IFNULL(co2_por_unidad,0), IFNULL(agua_por_unidad,0), IFNULL(energia_por_unidad,0)
  INTO v_co2, v_agua, v_energia
  FROM EQUIVALENCIA_IMPACTO
  WHERE id_categoria = v_id_categoria
  LIMIT 1;

  SET v_co2 = v_co2 * v_unidades;
  SET v_agua = v_agua * v_unidades;
  SET v_energia = v_energia * v_unidades;

  -- Periodo: requiere que exista un periodo activo o que se suministre por otra vía.
  -- Aquí elegimos el primero por simplicidad.
  SELECT id_periodo INTO v_id_periodo FROM PERIODO ORDER BY id_periodo DESC LIMIT 1;
  IF v_id_periodo IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay PERIODO definido para registrar impacto';
  END IF;

  -- Inserta impacto para comprador y vendedor (si aplica tu lógica, aquí lo registramos al comprador)
  INSERT INTO IMPACTO_AMBIENTAL
    (id_usuario, id_transaccion, id_categoria, co2_ahorrado, agua_ahorrada, energia_ahorrada, id_periodo)
  VALUES
    (v_id_usuario_c, p_id_transaccion, v_id_categoria, v_co2, v_agua, v_energia, v_id_periodo);
END$$
DELIMITER ;


/*= 3) TRIGGERS (AUTOMÁTICOS)   */

-- 3.1 BEFORE INSERT MOVIMIENTO_CREDITOS: calcular saldos y chequear signo
DROP TRIGGER IF EXISTS trg_movcred_before_ins;
DELIMITER $$
CREATE TRIGGER trg_movcred_before_ins
BEFORE INSERT ON MOVIMIENTO_CREDITOS
FOR EACH ROW
BEGIN
  DECLARE v_saldo BIGINT;
  DECLARE v_signo VARCHAR(20);

  -- Saldo actual
  SELECT saldo_creditos INTO v_saldo FROM BILLETERA WHERE id_usuario = NEW.id_usuario;
  IF v_saldo IS NULL THEN
    -- si no existe billetera -> crear
    INSERT INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (NEW.id_usuario, 'ACTIVA', 0, 0.00, NULL);
    SET v_saldo = 0;
  END IF;

  -- Signo asociado al tipo de movimiento
  SELECT sm.nombre INTO v_signo
  FROM SIGNO_X_TIPO_MOV sx
  JOIN SIGNO_MOVIMIENTO sm ON sm.id_signo = sx.id_signo
  WHERE sx.id_tipo_movimiento = NEW.id_tipo_movimiento
  LIMIT 1;

  IF v_signo IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de movimiento no tiene signo asociado';
  END IF;

  -- Calcular saldos
  SET NEW.saldo_anterior = v_saldo;
  IF v_signo = 'NEGATIVO' THEN
    IF v_saldo < NEW.cantidad THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente para movimiento';
    END IF;
    SET NEW.saldo_posterior = v_saldo - NEW.cantidad;
  ELSE
    SET NEW.saldo_posterior = v_saldo + NEW.cantidad;
  END IF;
END$$
DELIMITER ;

-- 3.2 AFTER INSERT MOVIMIENTO_CREDITOS: actualizar saldo de billetera
DROP TRIGGER IF EXISTS trg_movcred_after_ins;
DELIMITER $$
CREATE TRIGGER trg_movcred_after_ins
AFTER INSERT ON MOVIMIENTO_CREDITOS
FOR EACH ROW
BEGIN
  UPDATE BILLETERA
  SET saldo_creditos = NEW.saldo_posterior
  WHERE id_usuario = NEW.id_usuario;
END$$
DELIMITER ;

-- 3.3 BEFORE INSERT TRANSACCION: verificación de saldo del comprador
DROP TRIGGER IF EXISTS trg_trans_before_ins;
DELIMITER $$
CREATE TRIGGER trg_trans_before_ins
BEFORE INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
  IF fn_verificar_saldo(NEW.id_comprador, NEW.cantidad_creditos) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente para crear la transacción';
  END IF;
END$$
DELIMITER ;

-- 3.4 AFTER INSERT TRANSACCION: registrar en bitácora
DROP TRIGGER IF EXISTS trg_trans_after_ins;
DELIMITER $$
CREATE TRIGGER trg_trans_after_ins
AFTER INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA_INTERCAMBIO (id_transaccion, id_usuario_origen, id_usuario_destino, cantidad_creditos, descripcion)
  VALUES (NEW.id_transaccion, NEW.id_comprador, NEW.id_vendedor, NEW.cantidad_creditos, 'Transacción creada');
END$$
DELIMITER ;

-- 3.5 AFTER UPDATE TRANSACCION: registrar cambio de estado en bitácora
DROP TRIGGER IF EXISTS trg_trans_after_upd;
DELIMITER $$
CREATE TRIGGER trg_trans_after_upd
AFTER UPDATE ON TRANSACCION
FOR EACH ROW
BEGIN
  IF (OLD.estado <> NEW.estado) THEN
    INSERT INTO BITACORA_INTERCAMBIO (id_transaccion, id_usuario_origen, id_usuario_destino, cantidad_creditos, descripcion)
    VALUES (NEW.id_transaccion, NEW.id_comprador, NEW.id_vendedor, NEW.cantidad_creditos,
            CONCAT('Estado actualizado a ', NEW.estado));
  END IF;
END$$
DELIMITER ;

-- 3.6 AFTER INSERT PUBLICACION: bonificación por publicación si hay promociones activas
DROP TRIGGER IF EXISTS trg_publicacion_after_ins_bono;
DELIMITER $$
CREATE TRIGGER trg_publicacion_after_ins_bono
AFTER INSERT ON PUBLICACION
FOR EACH ROW
BEGIN
  DECLARE v_bono_total BIGINT DEFAULT 0;
  DECLARE v_mov_bono INT;

  -- Sumar créditos de promociones activas asociadas a la publicación
  SELECT IFNULL(SUM(p.creditos_otorgados),0) INTO v_bono_total
  FROM PROMOCION_PUBLICACION pp
  JOIN PROMOCION p ON p.id_promocion = pp.id_promocion
  WHERE pp.id_publicacion = NEW.id_publicacion
    AND p.estado = 'ACTIVA'
    AND NOW() BETWEEN p.fecha_inicio AND p.fecha_fin;

  IF v_bono_total > 0 THEN
    -- Asegurar billetera
    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (NEW.id_usuario, 'ACTIVA', 0, 0.00, NULL);

    -- Tipo movimiento
    SET v_mov_bono = fn_get_tipo_mov('BONO_PUBLICACION');
    IF v_mov_bono IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO BONO_PUBLICACION no existe';
    END IF;

    INSERT INTO MOVIMIENTO_CREDITOS
      (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
    VALUES
      (NEW.id_usuario, v_mov_bono, (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='AJUSTE' LIMIT 1),
       v_bono_total, CONCAT('Bono por publicación #', NEW.id_publicacion), 0, 0, NEW.id_publicacion);
  END IF;
END$$
DELIMITER ;

