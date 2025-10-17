USE TruequeComercioCircular;

-- =========================================
-- Helpers (vista de saldo y función mes)
-- =========================================
CREATE OR REPLACE VIEW VW_SALDO_USUARIO AS
SELECT
  m.id_us,
  COALESCE(SUM(CASE WHEN tm.signo = 'IN' THEN m.cantidad ELSE -m.cantidad END), 0) AS saldo
FROM MOVIMIENTO m
JOIN TIPO_MOVIMIENTO tm USING (id_tipo_mov)
GROUP BY m.id_us;

DELIMITER //
CREATE FUNCTION month_start(dt DATETIME)
RETURNS DATE DETERMINISTIC
BEGIN
  RETURN DATE_FORMAT(dt, '%Y-%m-01');
END;
//
DELIMITER ;

-- =========================================
-- 1) Usuario: autocrear DETALLE y BILLETERA
-- =========================================
DROP TRIGGER IF EXISTS trg_usuario_ai_detalle_billetera;
DELIMITER //
CREATE TRIGGER trg_usuario_ai_detalle_billetera
AFTER INSERT ON USUARIO
FOR EACH ROW
BEGIN
  INSERT INTO DETALLE_USUARIO (id_us) VALUES (NEW.id_us);
  INSERT INTO BILLETERA (id_us, cuenta_bancaria) VALUES (NEW.id_us, NULL);
END;
//
DELIMITER ;

-- =====================================================
-- 2) PUBLICACION: mantener DETALLE_USUARIO.cant_anuncios
-- =====================================================
DROP TRIGGER IF EXISTS trg_publicacion_ai_contador;
DELIMITER //
CREATE TRIGGER trg_publicacion_ai_contador
AFTER INSERT ON PUBLICACION
FOR EACH ROW
BEGIN
  UPDATE DETALLE_USUARIO
  SET cant_anuncios = cant_anuncios + 1
  WHERE id_us = NEW.id_us;
END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_publicacion_ad_contador;
DELIMITER //
CREATE TRIGGER trg_publicacion_ad_contador
AFTER DELETE ON PUBLICACION
FOR EACH ROW
BEGIN
  UPDATE DETALLE_USUARIO
  SET cant_anuncios = GREATEST(cant_anuncios - 1, 0)
  WHERE id_us = OLD.id_us;
END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_publicacion_au_contador_transfer;
DELIMITER //
CREATE TRIGGER trg_publicacion_au_contador_transfer
AFTER UPDATE ON PUBLICACION
FOR EACH ROW
BEGIN
  IF NEW.id_us <> OLD.id_us THEN
    UPDATE DETALLE_USUARIO
      SET cant_anuncios = GREATEST(cant_anuncios - 1, 0)
    WHERE id_us = OLD.id_us;
    UPDATE DETALLE_USUARIO
      SET cant_anuncios = cant_anuncios + 1
    WHERE id_us = NEW.id_us;
  END IF;
END;
//
DELIMITER ;

-- =========================================
-- 3) MOVIMIENTO: evitar saldo negativo en OUT
-- =========================================
DROP TRIGGER IF EXISTS trg_movimiento_bi_no_overdraft;
DELIMITER //
CREATE TRIGGER trg_movimiento_bi_no_overdraft
BEFORE INSERT ON MOVIMIENTO
FOR EACH ROW
BEGIN
  DECLARE v_signo ENUM('IN','OUT');
  DECLARE v_saldo DECIMAL(15,2);

  SELECT signo INTO v_signo FROM TIPO_MOVIMIENTO WHERE id_tipo_mov = NEW.id_tipo_mov;

  IF v_signo = 'OUT' THEN
    SELECT COALESCE(SUM(CASE WHEN tm.signo='IN' THEN m.cantidad ELSE -m.cantidad END),0)
      INTO v_saldo
    FROM MOVIMIENTO m
    JOIN TIPO_MOVIMIENTO tm USING(id_tipo_mov)
    WHERE m.id_us = NEW.id_us;

    IF NEW.cantidad > v_saldo THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Saldo insuficiente para realizar movimiento OUT';
    END IF;
  END IF;
END;
//
DELIMITER ;

-- =====================================================
-- 4) COMPRA_CREDITO: acreditar al aprobar la compra
-- =====================================================
DROP TRIGGER IF EXISTS trg_compra_credito_au_acreditar;
DELIMITER //
CREATE TRIGGER trg_compra_credito_au_acreditar
AFTER UPDATE ON COMPRA_CREDITO
FOR EACH ROW
BEGIN
  -- Dispara solo cuando pasa de no aprobado a aprobado
  IF OLD.aprobado_en IS NULL AND NEW.aprobado_en IS NOT NULL THEN
    INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, fecha_mov, descripcion, id_compra)
    SELECT
      NEW.id_us,
      -- cualquier tipo de movimiento con signo IN; ajusta si tienes un tipo específico "RECARGA"
      (SELECT id_tipo_mov FROM TIPO_MOVIMIENTO WHERE signo='IN' ORDER BY id_tipo_mov LIMIT 1),
      NEW.creditos,
      NEW.aprobado_en,
      CONCAT('Aprobación compra de créditos #', NEW.id_compra),
      NEW.id_compra;
  END IF;
END;
//
DELIMITER ;

-- =====================================================
-- 5) POTENCIADOR: activar/ desactivar según fechas
-- =====================================================
DROP TRIGGER IF EXISTS trg_potenciador_bi_flag_activo;
DELIMITER //
CREATE TRIGGER trg_potenciador_bi_flag_activo
BEFORE INSERT ON POTENCIADOR
FOR EACH ROW
BEGIN
  SET NEW.activo = (NEW.fecha_inicio <= NOW() AND NEW.fecha_fin >= NOW());
END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_potenciador_bu_flag_activo;
DELIMITER //
CREATE TRIGGER trg_potenciador_bu_flag_activo
BEFORE UPDATE ON POTENCIADOR
FOR EACH ROW
BEGIN
  SET NEW.activo = (NEW.fecha_inicio <= NOW() AND NEW.fecha_fin >= NOW());
END;
//
DELIMITER ;

-- =========================================================================
-- 6) IMPACTO AMBIENTAL: consolidación en IMPACTO_MENSUAL
-- =========================================================================
-- INSERT
DROP TRIGGER IF EXISTS trg_ei_detalle_ai_to_mensual;
DELIMITER //
CREATE TRIGGER trg_ei_detalle_ai_to_mensual
AFTER INSERT ON EVENTO_IMPACTO_DETALLE
FOR EACH ROW
BEGIN
  INSERT INTO IMPACTO_MENSUAL (ym, id_us, id_dim, categoria, valor_total, id_um)
  SELECT
    month_start(ei.creado_en),
    ei.id_us,
    NEW.id_dim,
    ei.categoria,
    NEW.valor,
    NEW.id_um
  FROM EVENTO_IMPACTO ei
  WHERE ei.id_impacto = NEW.id_impacto
  ON DUPLICATE KEY UPDATE
    valor_total = valor_total + VALUES(valor_total),
    id_um = VALUES(id_um);
END;
//
DELIMITER ;

-- UPDATE
DROP TRIGGER IF EXISTS trg_ei_detalle_au_to_mensual;
DELIMITER //
CREATE TRIGGER trg_ei_detalle_au_to_mensual
AFTER UPDATE ON EVENTO_IMPACTO_DETALLE
FOR EACH ROW
BEGIN
  DECLARE v_delta DECIMAL(15,4);
  SET v_delta = NEW.valor - OLD.valor;

  IF v_delta <> 0 OR NEW.id_um <> OLD.id_um THEN
    INSERT INTO IMPACTO_MENSUAL (ym, id_us, id_dim, categoria, valor_total, id_um)
    SELECT
      month_start(ei.creado_en),
      ei.id_us,
      NEW.id_dim,
      ei.categoria,
      v_delta,
      NEW.id_um
    FROM EVENTO_IMPACTO ei
    WHERE ei.id_impacto = NEW.id_impacto
    ON DUPLICATE KEY UPDATE
      valor_total = valor_total + VALUES(valor_total),
      id_um = VALUES(id_um);
  END IF;
END;
//
DELIMITER ;

-- DELETE
DROP TRIGGER IF EXISTS trg_ei_detalle_ad_to_mensual;
DELIMITER //
CREATE TRIGGER trg_ei_detalle_ad_to_mensual
AFTER DELETE ON EVENTO_IMPACTO_DETALLE
FOR EACH ROW
BEGIN
  INSERT INTO IMPACTO_MENSUAL (ym, id_us, id_dim, categoria, valor_total, id_um)
  SELECT
    month_start(ei.creado_en),
    ei.id_us,
    OLD.id_dim,
    ei.categoria,
    -OLD.valor,
    OLD.id_um
  FROM EVENTO_IMPACTO ei
  WHERE ei.id_impacto = OLD.id_impacto
  ON DUPLICATE KEY UPDATE
    valor_total = GREATEST(valor_total + VALUES(valor_total), 0);
END;
//
DELIMITER ;

-- =====================================================
-- 7) INTERCAMBIO: sellar fechas según cambio de estado
--     - ACEPTADO  -> fecha_acept = NOW() (si estaba NULL)
--     - COMPLETADO-> fecha_comp = NOW() (si estaba NULL)
-- =====================================================
DROP TRIGGER IF EXISTS trg_intercambio_bu_fechas_por_estado;
DELIMITER //
CREATE TRIGGER trg_intercambio_bu_fechas_por_estado
BEFORE UPDATE ON INTERCAMBIO
FOR EACH ROW
BEGIN
  DECLARE v_nombre VARCHAR(50);
  IF NEW.id_estado_inter <> OLD.id_estado_inter THEN
    SELECT nombre INTO v_nombre FROM ESTADO_INTERCAMBIO WHERE id_estado_inter = NEW.id_estado_inter;

    IF v_nombre = 'ACEPTADO' AND (OLD.fecha_acept IS NULL OR NEW.fecha_acept IS NULL) THEN
      SET NEW.fecha_acept = NOW();
    END IF;

    IF v_nombre = 'COMPLETADO' AND (OLD.fecha_comp IS NULL OR NEW.fecha_comp IS NULL) THEN
      SET NEW.fecha_comp = NOW();
    END IF;
  END IF;
END;
//
DELIMITER ;

-- =====================================================
-- 8) TRANSACCION: al pasar a APROBADA, generar MOVIMIENTOS
-- =====================================================
DROP TRIGGER IF EXISTS trg_transaccion_au_generar_movs;
DELIMITER //
CREATE TRIGGER trg_transaccion_au_generar_movs
AFTER UPDATE ON TRANSACCION
FOR EACH ROW
BEGIN
  DECLARE v_estado VARCHAR(50);
  DECLARE v_id_in INT;
  DECLARE v_id_out INT;

  IF NEW.id_estado_trans <> OLD.id_estado_trans THEN
    SELECT nombre INTO v_estado FROM ESTADO_TRANSACCION WHERE id_estado_trans = NEW.id_estado_trans;

    IF v_estado = 'APROBADA' THEN
      -- Selecciona un tipo IN y OUT válidos (ajusta si tienes nombres específicos)
      SELECT id_tipo_mov INTO v_id_in  FROM TIPO_MOVIMIENTO WHERE signo='IN'  ORDER BY id_tipo_mov LIMIT 1;
      SELECT id_tipo_mov INTO v_id_out FROM TIPO_MOVIMIENTO WHERE signo='OUT' ORDER BY id_tipo_mov LIMIT 1;

      -- Débito del origen
      INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, fecha_mov, descripcion, id_inter)
      VALUES (NEW.id_us, v_id_out, NEW.monto, NEW.fecha_trans,
              CONCAT('Transacción #', NEW.id_trans, ' aprobada: débito'), NEW.id_inter);

      -- Crédito al destino
      INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, fecha_mov, descripcion, id_inter)
      VALUES (NEW.id_us2, v_id_in, NEW.monto, NEW.fecha_trans,
              CONCAT('Transacción #', NEW.id_trans, ' aprobada: crédito'), NEW.id_inter);
    END IF;
  END IF;
END;
//
DELIMITER ;

-- =====================================================
-- 9) (Opcional) BITÁCORA de PUBLICACION (auditoría simple)
--     Requiere que TIPO_BITACORA tenga algo como 'AUDITORIA'
-- =====================================================
DROP TRIGGER IF EXISTS trg_publicacion_ai_bitacora;
DELIMITER //
CREATE TRIGGER trg_publicacion_ai_bitacora
AFTER INSERT ON PUBLICACION
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, fecha)
  SELECT
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1),
    NEW.id_us,
    'PUBLICACION', NEW.id_pub,
    'INSERT',
    CONCAT('Creada publicación: ', NEW.titulo),
    NOW();
END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_publicacion_au_bitacora;
DELIMITER //
CREATE TRIGGER trg_publicacion_au_bitacora
AFTER UPDATE ON PUBLICACION
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, fecha)
  SELECT
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1),
    NEW.id_us,
    'PUBLICACION', NEW.id_pub,
    'UPDATE',
    'Actualizada publicación',
    NOW();
END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_publicacion_ad_bitacora;
DELIMITER //
CREATE TRIGGER trg_publicacion_ad_bitacora
AFTER DELETE ON PUBLICACION
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, fecha)
  SELECT
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1),
    OLD.id_us,
    'PUBLICACION', OLD.id_pub,
    'DELETE',
    CONCAT('Eliminada publicación: ', OLD.titulo),
    NOW();
END;
//
DELIMITER ;