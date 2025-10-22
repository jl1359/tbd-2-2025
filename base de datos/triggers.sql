/* ============================================================
   PAQUETE DE REGLAS DE NEGOCIO, AUDITORÍA Y MANTENIMIENTO
   MySQL 8.x – Trueque/Intercambios/Publicaciones
   ============================================================ */
USE TruequeComercioCircular;
/* ============================================================
   DELIMITERS / PREP
============================================================ */
DELIMITER $$

/* ============================================================
   HELPERS (utilidades internas sin tocar tablas)
   - Resolución de IDs por nombre (evitamos asumir IDs)
============================================================ */
DROP FUNCTION IF EXISTS fn_id_estado_publicacion $$
CREATE FUNCTION fn_id_estado_publicacion(p_nombre VARCHAR(50))
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE v_id INT;
  SELECT id_estado_pub INTO v_id
  FROM ESTADO_PUBLICACION
  WHERE nombre = p_nombre
  LIMIT 1;
  RETURN v_id;
END $$

DROP FUNCTION IF EXISTS fn_id_estado_servicio $$
CREATE FUNCTION fn_id_estado_servicio(p_nombre VARCHAR(50))
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE v_id INT;
  SELECT id_estado_serv INTO v_id
  FROM ESTADO_SERVICIO
  WHERE nombre = p_nombre
  LIMIT 1;
  RETURN v_id;
END $$

DROP FUNCTION IF EXISTS fn_id_tipo_mov_por_signo $$
CREATE FUNCTION fn_id_tipo_mov_por_signo(p_signo ENUM('IN','OUT'))
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE v_id INT;
  SELECT id_tipo_mov INTO v_id
  FROM TIPO_MOVIMIENTO
  WHERE signo = p_signo
  ORDER BY id_tipo_mov ASC
  LIMIT 1;
  RETURN v_id;
END $$

/* ============================================================
   FUNCTIONS (requeridas)
============================================================ */

/* 1) fn_saldo(p_id_us) – saldo usando MOVIMIENTO y signo de TIPO_MOVIMIENTO */
DROP FUNCTION IF EXISTS fn_saldo $$
CREATE FUNCTION fn_saldo(p_id_us INT)
RETURNS DECIMAL(18,2)
DETERMINISTIC
BEGIN
  RETURN IFNULL((
    SELECT SUM(CASE tm.signo WHEN 'IN' THEN m.cantidad ELSE -m.cantidad END)
    FROM MOVIMIENTO m
    JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov = m.id_tipo_mov
    WHERE m.id_us = p_id_us
  ), 0.00);
END $$

/* 2) fn_convertir_unidades – usa FACTOR_CONVERSION (mismo id_dim) */
DROP FUNCTION IF EXISTS fn_convertir_unidades $$
CREATE FUNCTION fn_convertir_unidades(
  p_id_dim INT,
  p_id_um_origen INT,
  p_id_um_dest INT,
  p_valor DECIMAL(18,6)
) RETURNS DECIMAL(18,6)
DETERMINISTIC
BEGIN
  DECLARE v_factor DECIMAL(18,6);
  SELECT factor INTO v_factor
  FROM FACTOR_CONVERSION
  WHERE id_dim = p_id_dim
    AND id_um_origen = p_id_um_origen
    AND id_um_dest = p_id_um_dest
  LIMIT 1;

  IF v_factor IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No existe factor de conversión para esas unidades/dimensión';
  END IF;

  RETURN p_valor * v_factor;
END $$

/* 3) fn_nivel_por_puntos – simple mapeo por tramos */
DROP FUNCTION IF EXISTS fn_nivel_por_puntos $$
CREATE FUNCTION fn_nivel_por_puntos(p_puntos INT)
RETURNS VARCHAR(30)
DETERMINISTIC
BEGIN
  RETURN CASE
    WHEN p_puntos < 100 THEN 'BRONCE'
    WHEN p_puntos < 500 THEN 'PLATA'
    WHEN p_puntos < 1500 THEN 'ORO'
    ELSE 'DIAMANTE'
  END;
END $$

/* 4) fn_reputacion_usuario – no hay tabla de calificaciones en el modelo.
      Devolvemos NULL y documentamos la limitación. */
DROP FUNCTION IF EXISTS fn_reputacion_usuario $$
CREATE FUNCTION fn_reputacion_usuario(p_id_us INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
  /* SIN fuente de datos de calificaciones en este esquema */
  RETURN NULL;
END $$

/* 5) fn_total_intercambios – cantidad total (como comp o vend) */
DROP FUNCTION IF EXISTS fn_total_intercambios $$
CREATE FUNCTION fn_total_intercambios(p_id_us INT)
RETURNS INT
DETERMINISTIC
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM INTERCAMBIO i
    WHERE i.id_us_comp = p_id_us OR i.id_us_vend = p_id_us
  );
END $$

/* 6) fn_total_reciclado – suma IMPACTO_MENSUAL.valor_total (si existe) */
DROP FUNCTION IF EXISTS fn_total_reciclado $$
CREATE FUNCTION fn_total_reciclado(p_id_us INT)
RETURNS DECIMAL(18,4)
DETERMINISTIC
BEGIN
  RETURN IFNULL((
    SELECT SUM(valor_total)
    FROM IMPACTO_MENSUAL
    WHERE id_us = p_id_us
  ), 0.0000);
END $$

/* 7) fn_valor_monetario_puntos – conversión simple (constante 0.10) */
DROP FUNCTION IF EXISTS fn_valor_monetario_puntos $$
CREATE FUNCTION fn_valor_monetario_puntos(p_puntos INT)
RETURNS DECIMAL(18,2)
DETERMINISTIC
BEGIN
  /* Ajusta la tasa si lo necesitas (no hay tabla de parámetros en el modelo) */
  RETURN ROUND(p_puntos * 0.10, 2);
END $$

/* ============================================================
   TRIGGERS – 1) Auditoría y Logs
============================================================ */

/* Auditoría de creación/modificación de USUARIO */
DROP TRIGGER IF EXISTS trg_usuario_after_insert_bitacora $$
CREATE TRIGGER trg_usuario_after_insert_bitacora
AFTER INSERT ON USUARIO
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip)
  VALUES (
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1),
    NEW.id_us, 'USUARIO', NEW.id_us, 'CREATE',
    JSON_OBJECT('nombre',NEW.nombre,'apellido',NEW.apellido,'email',NEW.email),
    NULL
  );
END $$

DROP TRIGGER IF EXISTS trg_usuario_after_update_bitacora $$
CREATE TRIGGER trg_usuario_after_update_bitacora
AFTER UPDATE ON USUARIO
FOR EACH ROW
BEGIN
  IF NEW.nombre <> OLD.nombre OR NEW.apellido <> OLD.apellido
     OR NEW.email <> OLD.email OR NEW.activo <> OLD.activo THEN
    INSERT INTO BITACORA(id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip)
    VALUES (
      (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1),
      NEW.id_us, 'USUARIO', NEW.id_us, 'UPDATE',
      JSON_OBJECT('old', JSON_OBJECT('nombre',OLD.nombre,'apellido',OLD.apellido,'email',OLD.email,'activo',OLD.activo),
                  'new', JSON_OBJECT('nombre',NEW.nombre,'apellido',NEW.apellido,'email',NEW.email,'activo',NEW.activo)),
      NULL
    );
  END IF;
END $$

/* Bitácora de cambios en PUBLICACION (incluye estado) */
DROP TRIGGER IF EXISTS trg_publicacion_after_update_estado $$
CREATE TRIGGER trg_publicacion_after_update_estado
AFTER UPDATE ON PUBLICACION
FOR EACH ROW
BEGIN
  IF NEW.id_estado_pub <> OLD.id_estado_pub THEN
    INSERT INTO BITACORA(id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip)
    VALUES (
      (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1),
      NEW.id_us, 'PUBLICACION', NEW.id_pub, 'CAMBIO_ESTADO',
      JSON_OBJECT('old_estado', OLD.id_estado_pub, 'new_estado', NEW.id_estado_pub),
      NULL
    );
  END IF;
END $$

/* Log de TRANSACCION financiera */
DROP TRIGGER IF EXISTS trg_transaccion_after_insert_log $$
CREATE TRIGGER trg_transaccion_after_insert_log
AFTER INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip)
  VALUES (
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='FINANZAS' LIMIT 1),
    NEW.id_us, 'TRANSACCION', NEW.id_trans, 'CREATE',
    JSON_OBJECT('de',NEW.id_us,'para',NEW.id_us2,'monto',NEW.monto,'intercambio',NEW.id_inter,'estado',NEW.id_estado_trans),
    NULL
  );
END $$

/* Registro de ACCESO (ya existe tabla ACCESO; solo auditar) */
DROP TRIGGER IF EXISTS trg_acceso_after_insert_log $$
CREATE TRIGGER trg_acceso_after_insert_log
AFTER INSERT ON ACCESO
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip)
  VALUES (
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='ACCESO' LIMIT 1),
    NEW.id_us, 'ACCESO', NEW.id_acc, IF(NEW.exito,'LOGIN_OK','LOGIN_FAIL'),
    JSON_OBJECT('agente',NEW.agente),
    NEW.ip
  );
END $$

/* Auditoría de REPORTE (moderación) */
DROP TRIGGER IF EXISTS trg_reporte_after_insert_log $$
CREATE TRIGGER trg_reporte_after_insert_log
AFTER INSERT ON REPORTE
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip)
  VALUES (
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='MODERACION' LIMIT 1),
    NEW.id_reportante, 'REPORTE', NEW.id_reporte, 'CREATE',
    JSON_OBJECT('usuario_reportado',NEW.id_usuario_reportado,'pub_reportada',NEW.id_pub_reportada,'motivo',NEW.motivo),
    NULL
  );
END $$

/* ============================================================
   TRIGGERS – 2) Integridad de Datos
============================================================ */

/* Validación de estados de PUBLICACION coherentes con stock = 0 (si aplica) */
DELIMITER $$

/* Reemplazo del trigger de stock->PAUSADA */
DELIMITER $$

DROP TRIGGER IF EXISTS trg_publicacion_before_update_stock_guard $$
CREATE TRIGGER trg_publicacion_before_update_stock_guard
BEFORE UPDATE ON PUBLICACION
FOR EACH ROW
BEGIN
  DECLARE v_stock_total DECIMAL(18,4) DEFAULT 0;
  DECLARE v_id_pausada INT;

  /* Solo aplica si la publicación es de tipo PRODUCTO */
  IF NEW.tipo = 'PRODUCTO' THEN
    /* Suma el stock del detalle */
    SELECT IFNULL(SUM(pp.cantidad),0)
      INTO v_stock_total
      FROM PUBLICACION_PRODUCTO pp
     WHERE pp.id_pub = NEW.id_pub;

    /* ID del estado PAUSADA (ajusta el nombre si usas otro) */
    SET v_id_pausada = fn_id_estado_publicacion('PAUSADA');

    /* Si el stock es 0 => forzar PAUSADA en la fila que se actualiza */
    IF v_id_pausada IS NOT NULL
       AND v_stock_total = 0
       AND NEW.id_estado_pub <> v_id_pausada THEN
      SET NEW.id_estado_pub = v_id_pausada;
    END IF;
  END IF;
END $$
DELIMITER ;

/* Control de fechas consistentes extra: PROMOCION (CHECK ya existe, reforzamos) */
DELIMITER $$

DROP TRIGGER IF EXISTS trg_promocion_before_insert_validar_fechas $$
CREATE TRIGGER trg_promocion_before_insert_validar_fechas
BEFORE INSERT ON PROMOCION
FOR EACH ROW
BEGIN
  IF NEW.fecha_fin < NEW.fecha_ini THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PROMOCION: fecha_fin no puede ser menor a fecha_ini';
  END IF;
END $$

DELIMITER ;


/* Verificación de saldos de créditos al crear MOVIMIENTO (evita negativos) */
DELIMITER $$

DROP TRIGGER IF EXISTS trg_movimiento_before_insert_saldo $$
CREATE TRIGGER trg_movimiento_before_insert_saldo
BEFORE INSERT ON MOVIMIENTO
FOR EACH ROW
BEGIN
  DECLARE v_signo VARCHAR(3);
  DECLARE v_saldo DECIMAL(18,2);

  /* Obtener el signo del tipo de movimiento */
  SELECT tm.signo
    INTO v_signo
    FROM TIPO_MOVIMIENTO tm
   WHERE tm.id_tipo_mov = NEW.id_tipo_mov
   LIMIT 1;

  /* Validaciones básicas */
  IF v_signo IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Tipo de movimiento inexistente';
  END IF;

  IF v_signo NOT IN ('IN','OUT') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Tipo de movimiento inválido: signo debe ser IN u OUT';
  END IF;

  /* Si es débito (OUT), verificar saldo suficiente */
  IF v_signo = 'OUT' THEN
    IF NEW.cantidad <= 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cantidad debe ser > 0 para débitos';
    END IF;

    SET v_saldo = fn_saldo(NEW.id_us);

    IF v_saldo - NEW.cantidad < 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Saldo insuficiente para débito';
    END IF;
  END IF;
END $$

DELIMITER ;


/* Validación de transiciones básicas de INTERCAMBIO:
   - No permitir cambiar comprador/vendedor/id_pub tras creado
*/
DELIMITER $$

DROP TRIGGER IF EXISTS trg_intercambio_before_update_transicion $$
CREATE TRIGGER trg_intercambio_before_update_transicion
BEFORE UPDATE ON INTERCAMBIO
FOR EACH ROW
BEGIN
  /* Impedir cambios en comprador, vendedor y publicación (null-safe) */
  IF NOT (NEW.id_us_comp <=> OLD.id_us_comp)
     OR NOT (NEW.id_us_vend <=> OLD.id_us_vend)
     OR NOT (NEW.id_pub     <=> OLD.id_pub) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No se puede cambiar comprador/vendedor/publicación en un intercambio';
  END IF;
END $$

DELIMITER ;


/* ============================================================
   TRIGGERS – 3) Negocio
============================================================ */
SHOW TRIGGERS LIKE 'INTERCAMBIO'\G

/* 3.1) trg_intercambio_before_insert_validaciones */

DELIMITER $$

DROP TRIGGER IF EXISTS trg_intercambio_before_insert_validaciones $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_intercambio_before_insert_validaciones
BEFORE INSERT ON INTERCAMBIO
FOR EACH ROW
BEGIN
  DECLARE v_tipo VARCHAR(20);
  DECLARE v_stock_total DECIMAL(18,4) DEFAULT 0;

  /* Comprador y vendedor distintos */
  IF NEW.id_us_comp = NEW.id_us_vend THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Comprador y vendedor no pueden ser el mismo usuario';
  END IF;

  /* Cantidad positiva */
  IF NEW.cantidad <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cantidad solicitada debe ser > 0';
  END IF;

  /* Publicación debe existir */
  SELECT tipo
    INTO v_tipo
    FROM PUBLICACION
   WHERE id_pub = NEW.id_pub
   LIMIT 1;

  IF v_tipo IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Publicación no existe';
  END IF;

  /* Si es PRODUCTO, validar stock suficiente */
  IF v_tipo = 'PRODUCTO' THEN
    SELECT IFNULL(SUM(pp.cantidad),0)
      INTO v_stock_total
      FROM PUBLICACION_PRODUCTO pp
     WHERE pp.id_pub = NEW.id_pub;

    IF v_stock_total < NEW.cantidad THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente en la publicación';
    END IF;
  END IF;
END $$
DELIMITER ;


/* 3.2) trg_publicacion_tipo_guardrail – no permitir cambiar tipo si ya tiene vínculos */
DELIMITER $$

DROP TRIGGER IF EXISTS trg_publicacion_tipo_guardrail $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_publicacion_tipo_guardrail
BEFORE UPDATE ON PUBLICACION
FOR EACH ROW
BEGIN
  /* Solo validar si intentan cambiar el tipo */
  IF NEW.tipo <> OLD.tipo THEN
    /* Si hay vínculos existentes a producto o servicio, bloquear */
    IF EXISTS (SELECT 1 FROM PUBLICACION_PRODUCTO  WHERE id_pub = OLD.id_pub)
       OR EXISTS (SELECT 1 FROM PUBLICACION_SERVICIO WHERE id_pub = OLD.id_pub) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede cambiar el tipo de la publicación con vínculos existentes';
    END IF;
  END IF;
END $$

DELIMITER ;


/* 3.3) trg_transaccion_before_insert_validar_saldo – evita saldo negativo del origen */
DELIMITER $$

DROP TRIGGER IF EXISTS trg_transaccion_before_insert_validar_saldo $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_transaccion_before_insert_validar_saldo
BEFORE INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
  DECLARE v_saldo DECIMAL(18,2) DEFAULT 0;

  /* Calcula saldo actual del usuario usando la función helper */
  SET v_saldo = fn_saldo(NEW.id_us);

  /* Si el saldo resultante sería negativo, se bloquea */
  IF v_saldo - NEW.monto < 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Saldo insuficiente para la transacción';
  END IF;
END $$

DELIMITER ;


/* 3.4) trg_publicacion_before_insert_validar_stock – para PRODUCTO vía detalle */
DELIMITER $$

/* 3.4) Validar que solo se agregue stock a publicaciones de tipo PRODUCTO */
DROP TRIGGER IF EXISTS trg_pubprod_before_insert_validar_stock $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_pubprod_before_insert_validar_stock
BEFORE INSERT ON PUBLICACION_PRODUCTO
FOR EACH ROW
BEGIN
  DECLARE v_tipo VARCHAR(20);
  SELECT tipo
    INTO v_tipo
    FROM PUBLICACION
   WHERE id_pub = NEW.id_pub
   LIMIT 1;

  IF v_tipo IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Publicación inexistente';
  END IF;

  IF v_tipo <> 'PRODUCTO' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No puede asociarse PRODUCTO a una publicación de tipo SERVICIO';
  END IF;

  IF NEW.cantidad <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cantidad debe ser > 0';
  END IF;
END $$

/* 3.6) Movimientos automáticos al crear un intercambio (cargo/abono) */
DROP TRIGGER IF EXISTS trg_intercambio_after_insert_movimientos $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_intercambio_after_insert_movimientos
AFTER INSERT ON INTERCAMBIO
FOR EACH ROW
BEGIN
  DECLARE v_credito_unit DECIMAL(15,2);
  DECLARE v_total       DECIMAL(15,2);
  DECLARE v_id_mov_out  INT;
  DECLARE v_id_mov_in   INT;

  /* Precio en créditos definido en PUBLICACION */
  SELECT valor_creditos
    INTO v_credito_unit
    FROM PUBLICACION
   WHERE id_pub = NEW.id_pub
   LIMIT 1;

  SET v_total     = IFNULL(v_credito_unit,0) * NEW.cantidad;
  SET v_id_mov_out = fn_id_tipo_mov_por_signo('OUT');
  SET v_id_mov_in  = fn_id_tipo_mov_por_signo('IN');

  IF v_total > 0 AND v_id_mov_out IS NOT NULL AND v_id_mov_in IS NOT NULL THEN
    /* CARGO al comprador */
    INSERT INTO MOVIMIENTO(id_us, id_tipo_mov, cantidad, descripcion, id_inter)
    VALUES (NEW.id_us_comp, v_id_mov_out, v_total, 'Intercambio - cargo por compra', NEW.id_inter);

    /* ABONO al vendedor */
    INSERT INTO MOVIMIENTO(id_us, id_tipo_mov, cantidad, descripcion, id_inter)
    VALUES (NEW.id_us_vend, v_id_mov_in, v_total, 'Intercambio - abono por venta', NEW.id_inter);
  END IF;
END $$

/* 3.7) Auditoría de cambio de estado en intercambio */
DROP TRIGGER IF EXISTS trg_intercambio_after_update_estado $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_intercambio_after_update_estado
AFTER UPDATE ON INTERCAMBIO
FOR EACH ROW
BEGIN
  IF NEW.id_estado_inter <> OLD.id_estado_inter THEN
    INSERT INTO BITACORA(id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip)
    VALUES (
      (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1),
      NEW.id_us_comp, 'INTERCAMBIO', NEW.id_inter, 'CAMBIO_ESTADO',
      JSON_OBJECT('old_estado',OLD.id_estado_inter,'new_estado',NEW.id_estado_inter),
      NULL
    );
  END IF;
END $$

/* 3.8) Impedir activar un servicio que está SUSPENDIDO directamente */
DROP TRIGGER IF EXISTS trg_servicio_before_update_validar_estado $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_servicio_before_update_validar_estado
BEFORE UPDATE ON SERVICIO
FOR EACH ROW
BEGIN
  DECLARE v_id_act INT; 
  DECLARE v_id_sus INT;

  SET v_id_act = fn_id_estado_servicio('ACTIVO');
  SET v_id_sus = fn_id_estado_servicio('SUSPENDIDO');

  IF v_id_act IS NOT NULL AND v_id_sus IS NOT NULL THEN
    IF OLD.id_estado_serv = v_id_sus AND NEW.id_estado_serv = v_id_act THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede activar directamente un servicio SUSPENDIDO';
    END IF;
  END IF;
END $$

/* 4.1) Archivar snapshot de publicación antes del delete */
DROP TRIGGER IF EXISTS trg_publicacion_before_delete_archive $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_publicacion_before_delete_archive
BEFORE DELETE ON PUBLICACION
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion)
  VALUES(
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='ARCHIVO' LIMIT 1),
    OLD.id_us, 'PUBLICACION', OLD.id_pub, 'DELETE_ARCHIVE',
    JSON_OBJECT('titulo',OLD.titulo,'tipo',OLD.tipo,'valor_creditos',OLD.valor_creditos,'fecha_pub',OLD.fecha_pub)
  );
END $$

/* 4.2) Estadísticas de anuncios por usuario */
DROP TRIGGER IF EXISTS trg_publicacion_after_insert_stats $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_publicacion_after_insert_stats
AFTER INSERT ON PUBLICACION
FOR EACH ROW
BEGIN
  INSERT INTO DETALLE_USUARIO(id_us,cant_anuncios)
  VALUES (NEW.id_us,1)
  ON DUPLICATE KEY UPDATE cant_anuncios = cant_anuncios + 1;
END $$

DROP TRIGGER IF EXISTS trg_publicacion_after_delete_stats $$
CREATE DEFINER=CURRENT_USER TRIGGER trg_publicacion_after_delete_stats
AFTER DELETE ON PUBLICACION
FOR EACH ROW
BEGIN
  UPDATE DETALLE_USUARIO
  SET cant_anuncios = GREATEST(cant_anuncios - 1, 0)
  WHERE id_us = OLD.id_us;
END $$

/* ---------- Procedimientos (los que pegaste) ---------- */

DROP PROCEDURE IF EXISTS sp_crear_publicacion $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_crear_publicacion(
  IN p_id_us INT, IN p_id_ub INT, IN p_id_estado_pub INT,
  IN p_tipo VARCHAR(20),
  IN p_titulo VARCHAR(255), IN p_descripcion TEXT,
  IN p_valor_creditos DECIMAL(15,2)
)
BEGIN
  INSERT INTO PUBLICACION(id_us,id_ub,id_estado_pub,tipo,titulo,descripcion,valor_creditos)
  VALUES (p_id_us,p_id_ub,p_id_estado_pub,p_tipo,p_titulo,p_descripcion,p_valor_creditos);

  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1),
    p_id_us,'PUBLICACION',LAST_INSERT_ID(),'CREATE',
    JSON_OBJECT('titulo',p_titulo,'tipo',p_tipo,'valor_creditos',p_valor_creditos)
  );
END $$

/* (El resto de tus procedimientos están OK; puedes dejarlos tal cual.
   Si quieres, cambia también los parámetros ENUM por VARCHAR para consistencia.) */

DELIMITER ;


USE TruequeComercioCircular;

DELIMITER $$

/* ============================================================
   PROCEDIMIENTOS – CORREGIDOS Y PROBADOS
============================================================ */

/* ---------- Gestión de publicaciones ---------- */

DROP PROCEDURE IF EXISTS sp_cambiar_estado_publicacion $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_cambiar_estado_publicacion(
  IN p_id_pub INT, IN p_nuevo_estado INT
)
BEGIN
  DECLARE v_id_us INT;
  DECLARE v_old INT;

  SELECT id_us, id_estado_pub
    INTO v_id_us, v_old
    FROM PUBLICACION
   WHERE id_pub = p_id_pub
   FOR UPDATE;

  UPDATE PUBLICACION
     SET id_estado_pub = p_nuevo_estado
   WHERE id_pub = p_id_pub;

  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES (
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1),
    v_id_us,'PUBLICACION',p_id_pub,'CAMBIO_ESTADO',
    JSON_OBJECT('old_estado',v_old,'new_estado',p_nuevo_estado)
  );
END $$


DROP PROCEDURE IF EXISTS sp_actualizar_stock_publicacion $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_actualizar_stock_publicacion(
  IN p_id_pub INT, IN p_id_prod INT, IN p_nueva_cant INT, IN p_id_um INT
)
BEGIN
  INSERT INTO PUBLICACION_PRODUCTO(id_pub,id_prod,cantidad,id_um)
  VALUES (p_id_pub,p_id_prod,p_nueva_cant,p_id_um)
  ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad),
                           id_um = VALUES(id_um);
END $$


DROP PROCEDURE IF EXISTS sp_finalizar_publicacion $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_finalizar_publicacion(IN p_id_pub INT)
BEGIN
  DECLARE v_id_final INT;
  SET v_id_final = fn_id_estado_publicacion('PAUSADA');
  IF v_id_final IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Estado PAUSADA no definido';
  END IF;
  CALL sp_cambiar_estado_publicacion(p_id_pub, v_id_final);
END $$


DROP PROCEDURE IF EXISTS sp_eliminar_publicacion_segura $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_eliminar_publicacion_segura(IN p_id_pub INT)
BEGIN
  /* Archivo previo (trigger BEFORE DELETE ya guarda snapshot) */
  DELETE FROM PUBLICACION WHERE id_pub = p_id_pub;
END $$


/* ---------- Gestión de intercambios ---------- */

DROP PROCEDURE IF EXISTS sp_crear_intercambio $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_crear_intercambio(
  IN p_id_us_comp INT, IN p_id_us_vend INT, IN p_id_pub INT,
  IN p_id_ub_origen INT, IN p_id_ub_destino INT,
  IN p_id_um INT, IN p_cantidad DECIMAL(15,4), IN p_id_estado_inter INT
)
BEGIN
  INSERT INTO INTERCAMBIO(
    id_us_comp,id_us_vend,id_pub,id_ub_origen,id_ub_destino,
    id_um,cantidad,id_estado_inter
  ) VALUES (
    p_id_us_comp,p_id_us_vend,p_id_pub,p_id_ub_origen,p_id_ub_destino,
    p_id_um,p_cantidad,p_id_estado_inter
  );
END $$


DROP PROCEDURE IF EXISTS sp_intercambio_aceptar $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_intercambio_aceptar(IN p_id_inter INT)
BEGIN
  UPDATE INTERCAMBIO
     SET fecha_acept = NOW()
   WHERE id_inter = p_id_inter;
END $$


DROP PROCEDURE IF EXISTS sp_intercambio_cancelar $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_intercambio_cancelar(
  IN p_id_inter INT, IN p_id_estado_cancel INT
)
BEGIN
  UPDATE INTERCAMBIO
     SET id_estado_inter = p_id_estado_cancel
   WHERE id_inter = p_id_inter;
END $$


DROP PROCEDURE IF EXISTS sp_intercambio_confirmar_entrega $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_intercambio_confirmar_entrega(
  IN p_id_inter INT, IN p_id_estado_conf INT
)
BEGIN
  UPDATE INTERCAMBIO
     SET fecha_comp = NOW(),
         id_estado_inter = p_id_estado_conf
   WHERE id_inter = p_id_inter;
END $$


/* ---------- Gestión de usuarios ---------- */

DROP PROCEDURE IF EXISTS sp_registrar_usuario $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_registrar_usuario(
  IN p_id_rol INT, IN p_nombre VARCHAR(100), IN p_apellido VARCHAR(100),
  IN p_email VARCHAR(255), IN p_telefono VARCHAR(20), IN p_direccion VARCHAR(255)
)
BEGIN
  INSERT INTO USUARIO(id_rol,nombre,apellido,email,telefono,direccion)
  VALUES (p_id_rol,p_nombre,p_apellido,p_email,p_telefono,p_direccion);

  INSERT INTO DETALLE_USUARIO(id_us)
  VALUES (LAST_INSERT_ID());
END $$


DROP PROCEDURE IF EXISTS sp_actualizar_datos_usuario $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_actualizar_datos_usuario(
  IN p_id_us INT, IN p_nombre VARCHAR(100), IN p_apellido VARCHAR(100),
  IN p_email VARCHAR(255), IN p_telefono VARCHAR(20),
  IN p_direccion VARCHAR(255), IN p_activo BOOLEAN
)
BEGIN
  UPDATE USUARIO
     SET nombre = p_nombre,
         apellido = p_apellido,
         email = p_email,
         telefono = p_telefono,
         direccion = p_direccion,
         activo = p_activo
   WHERE id_us = p_id_us;
END $$


DROP PROCEDURE IF EXISTS sp_eliminar_usuario_seguro $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_eliminar_usuario_seguro(IN p_id_us INT)
BEGIN
  DELETE FROM USUARIO WHERE id_us = p_id_us;
END $$


DROP PROCEDURE IF EXISTS sp_actualizar_nivel_usuario $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_actualizar_nivel_usuario(
  IN p_id_us INT, IN p_puntos INT
)
BEGIN
  SELECT fn_nivel_por_puntos(p_puntos) AS nivel_sugerido;
END $$


DROP PROCEDURE IF EXISTS sp_bloquear_usuario_por_denuncias $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_bloquear_usuario_por_denuncias(
  IN p_id_us INT, IN p_umbral INT
)
BEGIN
  DECLARE v_den INT;
  SELECT denuncias INTO v_den
    FROM DETALLE_USUARIO
   WHERE id_us = p_id_us;

  IF v_den >= p_umbral THEN
    UPDATE USUARIO SET activo = FALSE WHERE id_us = p_id_us;
    INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
    VALUES (
      (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='MODERACION' LIMIT 1),
      p_id_us,'USUARIO',p_id_us,'BLOQUEO',
      JSON_OBJECT('motivo','umbral_denuncias','denuncias',v_den)
    );
  END IF;
END $$


/* ---------- Gestión de reportes ---------- */

DROP PROCEDURE IF EXISTS sp_reportar_publicacion $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_reportar_publicacion(
  IN p_id_reportante INT, IN p_id_usuario_reportado INT,
  IN p_id_pub_reportada INT, IN p_motivo VARCHAR(500),
  IN p_id_estado_rep INT
)
BEGIN
  INSERT INTO REPORTE(id_reportante,id_usuario_reportado,id_pub_reportada,motivo,id_estado_rep)
  VALUES (p_id_reportante,p_id_usuario_reportado,p_id_pub_reportada,p_motivo,p_id_estado_rep);
END $$


DROP PROCEDURE IF EXISTS sp_resolver_reporte $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_resolver_reporte(
  IN p_id_reporte INT, IN p_id_admin INT, IN p_nuevo_estado INT
)
BEGIN
  UPDATE REPORTE
     SET id_admin_resuelve = p_id_admin,
         id_estado_rep = p_nuevo_estado
   WHERE id_reporte = p_id_reporte;

  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES (
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='MODERACION' LIMIT 1),
    p_id_admin,'REPORTE',p_id_reporte,'RESOLVER',
    JSON_OBJECT('nuevo_estado',p_nuevo_estado)
  );
END $$


/* ---------- Gestión de servicios y promociones ---------- */

DROP PROCEDURE IF EXISTS sp_cambiar_estado_servicio $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_cambiar_estado_servicio(
  IN p_id_serv INT, IN p_nuevo_estado INT
)
BEGIN
  UPDATE SERVICIO
     SET id_estado_serv = p_nuevo_estado
   WHERE id_serv = p_id_serv;
END $$


DROP PROCEDURE IF EXISTS sp_crear_promocion $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_crear_promocion(
  IN p_titulo VARCHAR(255), IN p_desc TEXT,
  IN p_ini DATE, IN p_fin DATE,
  IN p_banner VARCHAR(500),
  IN p_descuento DECIMAL(5,2),
  IN p_id_estado_prom INT
)
BEGIN
  INSERT INTO PROMOCION(titulo,descripcion,fecha_ini,fecha_fin,banner,descuento,id_estado_prom)
  VALUES (p_titulo,p_desc,p_ini,p_fin,p_banner,p_descuento,p_id_estado_prom);
END $$


DROP PROCEDURE IF EXISTS sp_finalizar_promocion $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_finalizar_promocion(
  IN p_id_prom INT, IN p_id_estado_final INT
)
BEGIN
  UPDATE PROMOCION
     SET id_estado_prom = p_id_estado_final
   WHERE id_prom = p_id_prom;
END $$


/* ---------- Gestión de transacciones y puntos ---------- */

DROP PROCEDURE IF EXISTS sp_registrar_transaccion $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_registrar_transaccion(
  IN p_id_us INT, IN p_id_us2 INT, IN p_id_inter INT,
  IN p_cod_evento INT, IN p_monto DECIMAL(15,2),
  IN p_id_estado_trans INT
)
BEGIN
  INSERT INTO TRANSACCION(id_us,id_us2,id_inter,cod_evento,monto,id_estado_trans)
  VALUES (p_id_us,p_id_us2,p_id_inter,p_cod_evento,p_monto,p_id_estado_trans);
END $$


DROP PROCEDURE IF EXISTS sp_recalcular_puntos_usuario $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_recalcular_puntos_usuario(IN p_id_us INT)
BEGIN
  SELECT fn_valor_monetario_puntos(CAST(fn_saldo(p_id_us) AS SIGNED)) AS valor_estimado;
END $$


DROP PROCEDURE IF EXISTS sp_reasignar_puntos_totales $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_reasignar_puntos_totales()
BEGIN
  SELECT u.id_us, u.nombre, u.apellido, fn_saldo(u.id_us) AS saldo
  FROM USUARIO u
  ORDER BY saldo DESC;
END $$


DROP PROCEDURE IF EXISTS sp_auditar_transaccion $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_auditar_transaccion(IN p_id_trans INT)
BEGIN
  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  SELECT 
    (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='FINANZAS' LIMIT 1),
    t.id_us,'TRANSACCION',t.id_trans,'AUDIT',
    JSON_OBJECT('us2',t.id_us2,'monto',t.monto,'estado',t.id_estado_trans)
  FROM TRANSACCION t
  WHERE t.id_trans = p_id_trans;
END $$


/* ---------- Mantenimiento y utilidades ---------- */

DROP PROCEDURE IF EXISTS sp_limpiar_bitacora_antigua $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_limpiar_bitacora_antigua(IN p_dias INT)
BEGIN
  DELETE FROM BITACORA
   WHERE fecha < (NOW() - INTERVAL p_dias DAY);
END $$


DROP PROCEDURE IF EXISTS sp_recalcular_estadisticas_generales $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_recalcular_estadisticas_generales()
BEGIN
  SELECT u.id_us, u.nombre, u.apellido,
         SUM(CASE tm.signo WHEN 'IN' THEN m.cantidad ELSE 0 END) AS total_abonos
    FROM USUARIO u
    LEFT JOIN MOVIMIENTO m ON m.id_us = u.id_us
    LEFT JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov = m.id_tipo_mov
   GROUP BY u.id_us;
END $$


DROP PROCEDURE IF EXISTS sp_generar_resumen_usuario $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_generar_resumen_usuario(IN p_id_us INT)
BEGIN
  SELECT
    u.id_us, u.nombre, u.apellido, u.email,
    fn_saldo(u.id_us) AS saldo,
    fn_total_intercambios(u.id_us) AS total_intercambios,
    fn_total_reciclado(u.id_us) AS total_reciclado
  FROM USUARIO u
  WHERE u.id_us = p_id_us;
END $$


DROP PROCEDURE IF EXISTS sp_generar_ranking_reciclaje $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_generar_ranking_reciclaje()
BEGIN
  SELECT u.id_us, u.nombre, u.apellido,
         SUM(IFNULL(im.valor_total,0)) AS total
    FROM USUARIO u
    LEFT JOIN IMPACTO_MENSUAL im ON im.id_us = u.id_us
   GROUP BY u.id_us
   ORDER BY total DESC;
END $$


DROP PROCEDURE IF EXISTS sp_sincronizar_auditorias $$
CREATE DEFINER=CURRENT_USER PROCEDURE sp_sincronizar_auditorias()
BEGIN
  SELECT entidad,
         COUNT(*) AS cnt,
         MIN(fecha) AS primero,
         MAX(fecha) AS ultimo
    FROM BITACORA
   GROUP BY entidad
   ORDER BY ultimo DESC;
END $$

/* ============================================================
   ✅ FIN DEL SCRIPT
============================================================ */
DELIMITER ;