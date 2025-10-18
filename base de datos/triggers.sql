USE TruequeComercioCircular;

/*DROP VIEW IF EXISTS VW_SALDO;
CREATE VIEW VW_SALDO AS
SELECT 
  u.id_us,
  COALESCE(SUM(CASE WHEN tm.signo = 'IN' THEN m.cantidad ELSE -m.cantidad END), 0) AS saldo
FROM USUARIO u
LEFT JOIN MOVIMIENTO m   ON m.id_us = u.id_us
LEFT JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov = m.id_tipo_mov
GROUP BY u.id_us;
*/
DROP FUNCTION IF EXISTS fn_saldo;
DELIMITER $$
CREATE FUNCTION fn_saldo(p_id_us INT)
RETURNS DECIMAL(15,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v DECIMAL(15,2);
  SELECT COALESCE(SUM(CASE WHEN tm.signo='IN' THEN m.cantidad ELSE -m.cantidad END),0)
    INTO v
  FROM MOVIMIENTO m
  JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov = m.id_tipo_mov
  WHERE m.id_us = p_id_us;
  RETURN COALESCE(v,0);
END$$
DELIMITER ;

-- TRIGGERS

/*trigger para que al crear un usuario, inicializa su DETALLE_USUARIO y su BILLETERA y escribe en BITACORA.
Por que: Evita olvidar registros derivados y deja rastro de auditoría.*/
DROP TRIGGER IF EXISTS trg_usuario_after_insert;
DELIMITER $$
CREATE TRIGGER trg_usuario_after_insert
AFTER INSERT ON USUARIO
FOR EACH ROW
BEGIN
  INSERT INTO DETALLE_USUARIO (id_us) VALUES (NEW.id_us);
  INSERT INTO BILLETERA (id_us) VALUES (NEW.id_us);
  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion)
  VALUES (1, NEW.id_us, 'USUARIO', NEW.id_us, 'CREAR', CONCAT('Registro de nuevo usuario: ', NEW.nombre, ' ', NEW.apellido));
END$$
DELIMITER ;

/* trigger para que registre en BITACORA cada login (exitoso o fallido), con IP y fecha.
Porque ayuda en la Trazabilidad y seguridad.*/
DROP TRIGGER IF EXISTS trg_acceso_after_insert;
DELIMITER $$
CREATE TRIGGER trg_acceso_after_insert
AFTER INSERT ON ACCESO
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip, fecha)
  VALUES (2, NEW.id_us, 'ACCESO', NEW.id_acc, 
          IF(NEW.exito, 'LOGIN_EXITOSO', 'LOGIN_FALLIDO'),
          IF(NEW.exito, 'Inicio de sesión correcto', 'Intento fallido de inicio de sesión'),
          NEW.ip, NEW.fecha_acc);
END$$
DELIMITER ;

/*trigger Para que Sube cant_anuncios del dueño y registra en BITACORA.
porque nos da las metricas por usuario y auditoría.*/
DROP TRIGGER IF EXISTS trg_publicacion_after_insert;
DELIMITER $$
CREATE TRIGGER trg_publicacion_after_insert
AFTER INSERT ON PUBLICACION
FOR EACH ROW
BEGIN
  UPDATE DETALLE_USUARIO 
     SET cant_anuncios = cant_anuncios + 1
   WHERE id_us = NEW.id_us;

  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion)
  VALUES (3, NEW.id_us, 'PUBLICACION', NEW.id_pub, 'CREAR', 'Publicación creada');
END$$
DELIMITER ;
/*trigger para que Baja cant_anuncios del dueño (sin quedar negativo) y registra en BITACORA.
porque nos ayuda a Mantener métricas consistentes y rastro.*/
DROP TRIGGER IF EXISTS trg_publicacion_after_delete;
DELIMITER $$
CREATE TRIGGER trg_publicacion_after_delete
AFTER DELETE ON PUBLICACION
FOR EACH ROW
BEGIN
  UPDATE DETALLE_USUARIO 
     SET cant_anuncios = GREATEST(0, cant_anuncios - 1)
   WHERE id_us = OLD.id_us;

  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion)
  VALUES (3, OLD.id_us, 'PUBLICACION', OLD.id_pub, 'ELIMINAR', 'Publicación eliminada');
END$$
DELIMITER ;
/*trigger para que Valide que la publicación sea de tipo PRODUCTO.
Porque da Integridad semántica (no unir servicio↔producto).*/
DROP TRIGGER IF EXISTS trg_pubprod_before_insert;
DELIMITER $$
CREATE TRIGGER trg_pubprod_before_insert
BEFORE INSERT ON PUBLICACION_PRODUCTO
FOR EACH ROW
BEGIN
  DECLARE v_tipo ENUM('PRODUCTO','SERVICIO');
  SELECT tipo INTO v_tipo FROM PUBLICACION WHERE id_pub = NEW.id_pub;
  IF v_tipo <> 'PRODUCTO' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PUBLICACION_PRODUCTO requiere PUBLICACION.tipo=PRODUCTO';
  END IF;
END$$
DELIMITER ;
/* trigger para que Valide que la publicación sea SERVICIO y que el dueño del servicio sea el mismo que el de la publicación.
Porque da Consistencia de propiedad y tipo.*/
DROP TRIGGER IF EXISTS trg_pubserv_before_insert;
DELIMITER $$
CREATE TRIGGER trg_pubserv_before_insert
BEFORE INSERT ON PUBLICACION_SERVICIO
FOR EACH ROW
BEGIN
  DECLARE v_tipo ENUM('PRODUCTO','SERVICIO');
  DECLARE v_us_pub INT;
  DECLARE v_us_serv INT;

  SELECT tipo, id_us INTO v_tipo, v_us_pub FROM PUBLICACION WHERE id_pub = NEW.id_pub;
  SELECT id_us INTO v_us_serv FROM SERVICIO WHERE id_serv = NEW.id_serv;

  IF v_tipo <> 'SERVICIO' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PUBLICACION_SERVICIO requiere PUBLICACION.tipo=SERVICIO';
  END IF;

  IF v_us_pub <> v_us_serv THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El dueño del SERVICIO debe coincidir con el dueño de la PUBLICACION';
  END IF;
END$$
DELIMITER ;
/*trigger para que Si el tipo de movimiento es OUT, impide que el débito deje saldo negativo (usa fn_saldo).
Para no permitir “números rojos”.*/
DROP TRIGGER IF EXISTS trg_movimiento_before_insert;
DELIMITER $$
CREATE TRIGGER trg_movimiento_before_insert
BEFORE INSERT ON MOVIMIENTO
FOR EACH ROW
BEGIN
  DECLARE v_signo ENUM('IN','OUT');
  DECLARE v_saldo DECIMAL(15,2);

  SELECT signo INTO v_signo FROM TIPO_MOVIMIENTO WHERE id_tipo_mov = NEW.id_tipo_mov;

  IF v_signo = 'OUT' THEN
    SET v_saldo = fn_saldo(NEW.id_us);
    IF v_saldo < NEW.cantidad THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente para realizar el débito';
    END IF;
  END IF;
END$$
DELIMITER ;
/*trigger para registrar en BITACORA el movimiento (ABONO/DEBITO) con monto y fecha.
Para la Auditoría financiera.*/
DROP TRIGGER IF EXISTS trg_movimiento_after_insert;
DELIMITER $$
CREATE TRIGGER trg_movimiento_after_insert
AFTER INSERT ON MOVIMIENTO
FOR EACH ROW
BEGIN
  DECLARE v_signo ENUM('IN','OUT');
  SELECT signo INTO v_signo FROM TIPO_MOVIMIENTO WHERE id_tipo_mov = NEW.id_tipo_mov;

  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, fecha)
  VALUES (4, NEW.id_us, 'MOVIMIENTO', NEW.id_mov, 
          IF(v_signo='IN','ABONO','DEBITO'),
          CONCAT('Movimiento ', v_signo, ' de ', NEW.cantidad, IFNULL(CONCAT(' (', NEW.descripcion, ')'), '')),
          NEW.fecha_mov);
END$$
DELIMITER ;
/*trigger Para registrar en BITACORA los reportes, con motivo y fecha.
Para la Trazabilidad de moderación.*/
DROP TRIGGER IF EXISTS trg_reporte_after_insert;
DELIMITER $$
CREATE TRIGGER trg_reporte_after_insert
AFTER INSERT ON REPORTE
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, fecha)
  VALUES (5, NEW.id_reportante, 'REPORTE', NEW.id_reporte, 'CREAR', CONCAT('Motivo: ', NEW.motivo), NEW.fecha_reporte);
END$$
DELIMITER ;
/*trigger para que Si cambia id_estado_serv, lo deja en BITACORA (antes→después).
Para tener un historial de estados.*/
DROP TRIGGER IF EXISTS trg_servicio_after_update;
DELIMITER $$
CREATE TRIGGER trg_servicio_after_update
AFTER UPDATE ON SERVICIO
FOR EACH ROW
BEGIN
  IF NEW.id_estado_serv <> OLD.id_estado_serv THEN
    INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion)
    VALUES (7, NEW.id_us, 'SERVICIO', NEW.id_serv, 'ACTUALIZAR_ESTADO',
            CONCAT('Estado de servicio cambiado de ', OLD.id_estado_serv, ' a ', NEW.id_estado_serv));
  END IF;
END$$
DELIMITER ;
/*trigger para auditar cambios de estado/fechas (aceptación/completado).
Para el Seguimiento del ciclo del intercambio.*/
DROP TRIGGER IF EXISTS trg_intercambio_after_update;
DELIMITER $$
CREATE TRIGGER trg_intercambio_after_update
AFTER UPDATE ON INTERCAMBIO
FOR EACH ROW
BEGIN
  IF NEW.id_estado_inter <> OLD.id_estado_inter 
     OR NEW.fecha_acept <> OLD.fecha_acept
     OR NEW.fecha_comp <> OLD.fecha_comp THEN
    INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion)
    VALUES (6, NEW.id_us_comp, 'INTERCAMBIO', NEW.id_inter, 'ACTUALIZAR',
            CONCAT('Estado:', OLD.id_estado_inter, '→', NEW.id_estado_inter,
                   '; Acept:', IFNULL(DATE_FORMAT(NEW.fecha_acept,'%Y-%m-%d %H:%i'), 'NULL'),
                   '; Comp:',  IFNULL(DATE_FORMAT(NEW.fecha_comp,'%Y-%m-%d %H:%i'), 'NULL')));
  END IF;
END$$
DELIMITER ;
/*trigger Para Hacer “upsert” en IMPACTO_MENSUAL (acumula valor por mes/usuario/dimensión/categoría).
Para agregar automáticamente métricas mensuales para reportes.*/
DROP TRIGGER IF EXISTS trg_evento_impacto_det_after_insert;
DELIMITER $$
CREATE TRIGGER trg_evento_impacto_det_after_insert
AFTER INSERT ON EVENTO_IMPACTO_DETALLE
FOR EACH ROW
BEGIN
  DECLARE v_id_us INT;
  DECLARE v_fecha DATETIME;
  DECLARE v_ym DATE;

  SELECT ei.id_us, ei.creado_en
    INTO v_id_us, v_fecha
  FROM EVENTO_IMPACTO ei
  WHERE ei.id_impacto = NEW.id_impacto;

  SET v_ym = DATE_FORMAT(v_fecha, '%Y-%m-01');

  INSERT INTO IMPACTO_MENSUAL (ym, id_us, id_dim, categoria, valor_total, id_um)
  SELECT v_ym, v_id_us, NEW.id_dim, (SELECT categoria FROM EVENTO_IMPACTO WHERE id_impacto = NEW.id_impacto),
         NEW.valor, NEW.id_um
  ON DUPLICATE KEY UPDATE
    valor_total = valor_total + VALUES(valor_total);
END$$
DELIMITER ;

-- PROCEDIMIENTOS
/*procedimiento Para qué: Semillas mínimas en TIPO_MOVIMIENTO (IN/OUT) y TIPO_BITACORA.
Úsalo: Una sola vez al iniciar ambientes nuevos.*/
DROP PROCEDURE IF EXISTS sp_seed_basicos;
DELIMITER $$
CREATE PROCEDURE sp_seed_basicos()
BEGIN
  INSERT IGNORE INTO TIPO_MOVIMIENTO (id_tipo_mov, nombre, signo, descripcion) VALUES
    (1,'ABONO_COMPRA','IN','Créditos por compra'),
    (2,'ABONO_AJUSTE','IN','Ajuste contable'),
    (3,'DEBITO_INTERCAMBIO','OUT','Créditos usados en intercambio'),
    (4,'DEBITO_AJUSTE','OUT','Ajuste contable');

  INSERT IGNORE INTO TIPO_BITACORA (id_tipo_bit, nombre, descripcion) VALUES
    (1,'USUARIO','Eventos de usuario'),
    (2,'ACCESO','Logins'),
    (3,'PUBLICACION','Publicaciones'),
    (4,'MOVIMIENTO','Movimientos de crédito'),
    (5,'REPORTE','Reportes'),
    (6,'INTERCAMBIO','Intercambios'),
    (7,'SERVICIO','Servicios');
END$$
DELIMITER ;

/*procedimiento Para qué: Crea un movimiento (el trigger valida saldos y audita).
Úsalo: Recargas manuales, ajustes contables, débitos programados.*/
DROP PROCEDURE IF EXISTS sp_registrar_movimiento;
DELIMITER $$
CREATE PROCEDURE sp_registrar_movimiento(
  IN p_id_us INT,
  IN p_id_tipo_mov INT,
  IN p_cantidad DECIMAL(15,2),
  IN p_desc VARCHAR(255)
)
BEGIN
  INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, descripcion)
  VALUES (p_id_us, p_id_tipo_mov, p_cantidad, p_desc);
END$$
DELIMITER ;

/*procedimiento Para qué: Marca la compra como aprobada y crea un ABONO (tipo_mov IN=1) por los créditos de la compra.
Precondición: COMPRA_CREDITO existente; tipo_mov 1 debe ser IN (viene en sp_seed_basicos).*/
DROP PROCEDURE IF EXISTS sp_aprobar_compra_creditos;
DELIMITER $$
CREATE PROCEDURE sp_aprobar_compra_creditos(IN p_id_compra INT)
BEGIN
  DECLARE v_id_us INT;
  DECLARE v_creditos INT;

  SELECT id_us, creditos INTO v_id_us, v_creditos
  FROM COMPRA_CREDITO WHERE id_compra = p_id_compra;

  IF v_id_us IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Compra no encontrada';
  END IF;

  UPDATE COMPRA_CREDITO 
     SET aprobado_en = NOW()
   WHERE id_compra = p_id_compra;

  INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, id_compra, descripcion)
  VALUES (v_id_us, 1, v_creditos, p_id_compra, 'Compra de créditos aprobada');
END$$
DELIMITER ;

/*procedimiento Para qué: Inserta un intercambio en estado inicial y lo audita.
Úsalo: Al crear la “solicitud” del intercambio.*/
DROP PROCEDURE IF EXISTS sp_registrar_intercambio;
DELIMITER $$
CREATE PROCEDURE sp_registrar_intercambio(
  IN p_id_us_comp INT,
  IN p_id_us_vend INT,
  IN p_id_pub INT,
  IN p_id_ub_origen INT,
  IN p_id_ub_destino INT,
  IN p_id_um INT,
  IN p_cantidad DECIMAL(15,4)
)
BEGIN
  INSERT INTO INTERCAMBIO (id_us_comp, id_us_vend, id_pub, id_ub_origen, id_ub_destino, id_um, cantidad, id_estado_inter)
  VALUES (p_id_us_comp, p_id_us_vend, p_id_pub, p_id_ub_origen, p_id_ub_destino, p_id_um, p_cantidad, 1);

  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion)
  VALUES (6, p_id_us_comp, 'INTERCAMBIO', LAST_INSERT_ID(), 'SOLICITAR', 'Nuevo intercambio solicitado');
END$$
DELIMITER ;

/*procedimiento Para qué: Completa el intercambio y genera dos movimientos: débito (comprador/OUT) y abono (vendedor/IN). Actualiza fecha de completado y audita.
Precondiciones: Tipos de movimiento pasados deben corresponder a OUT/IN respectivamente.*/
DROP PROCEDURE IF EXISTS sp_cerrar_intercambio;
DELIMITER $$
CREATE PROCEDURE sp_cerrar_intercambio(
  IN p_id_inter INT,
  IN p_monto DECIMAL(15,2),
  IN p_id_tipo_debito INT,
  IN p_id_tipo_abono INT
)
BEGIN
  DECLARE v_us_comp INT;
  DECLARE v_us_vend INT;

  SELECT id_us_comp, id_us_vend INTO v_us_comp, v_us_vend
  FROM INTERCAMBIO WHERE id_inter = p_id_inter;

  IF v_us_comp IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Intercambio no encontrado';
  END IF;

  INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, id_inter, descripcion)
  VALUES (v_us_comp, p_id_tipo_debito, p_monto, p_id_inter, 'Cierre de intercambio - débito comprador');

  INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, id_inter, descripcion)
  VALUES (v_us_vend, p_id_tipo_abono, p_monto, p_id_inter, 'Cierre de intercambio - abono vendedor');

  UPDATE INTERCAMBIO SET fecha_comp = NOW() WHERE id_inter = p_id_inter;

  INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion)
  VALUES (6, v_us_comp, 'INTERCAMBIO', p_id_inter, 'CERRAR', CONCAT('Intercambio cerrado por ', p_monto, ' créditos'));
END$$
DELIMITER ;

/*Para qué: Inserta un evento de impacto y su detalle. El trigger mensual agregará a IMPACTO_MENSUAL.
Úsalo: Cuando reportas reciclaje/agua/energía/CO₂ en unidades estandarizadas.*/
DROP PROCEDURE IF EXISTS sp_registrar_impacto;
DELIMITER $$
CREATE PROCEDURE sp_registrar_impacto(
  IN p_id_us INT,
  IN p_id_origen INT,
  IN p_categoria VARCHAR(100),
  IN p_id_dim INT,
  IN p_valor DECIMAL(15,4),
  IN p_id_um INT
)
BEGIN
  DECLARE v_id_impacto INT;

  INSERT INTO EVENTO_IMPACTO (id_us, id_origen_imp, categoria)
  VALUES (p_id_us, p_id_origen, p_categoria);
  SET v_id_impacto = LAST_INSERT_ID();

  INSERT INTO EVENTO_IMPACTO_DETALLE (id_impacto, id_dim, valor, id_um)
  VALUES (v_id_impacto, p_id_dim, p_valor, p_id_um);
END$$
DELIMITER ;

/*procedimiento Para qué: Otorga logros simples (ej. ≥10 anuncios) en USUARIO_LOGRO.

Úsalo: Post-acciones relevantes (crear publicación) o en jobs periódicos.*/
DROP PROCEDURE IF EXISTS sp_verificar_logros;
DELIMITER $$
CREATE PROCEDURE sp_verificar_logros(IN p_id_us INT)
BEGIN
  DECLARE v_anuncios INT;
  SELECT cant_anuncios INTO v_anuncios FROM DETALLE_USUARIO WHERE id_us = p_id_us;

  IF v_anuncios >= 10 THEN
    INSERT IGNORE INTO USUARIO_LOGRO (id_us, id_rec, fecha_obtencion)
    VALUES (p_id_us, 1, CURDATE());
  END IF;
END$$
DELIMITER ;

/*-- Vista resumen de auditoría
DROP VIEW IF EXISTS VW_AUDITORIA;
CREATE VIEW VW_AUDITORIA AS
SELECT b.fecha, tb.nombre AS tipo, b.entidad, b.id_entidad, b.accion, b.descripcion, b.id_us, b.ip
FROM BITACORA b
JOIN TIPO_BITACORA tb ON tb.id_tipo_bit = b.id_tipo_bit;*/
