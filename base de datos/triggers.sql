USE CreditosVerdes;

-- 0) UTILIDADES BÁSICAS (tipos y seeds)

DROP PROCEDURE IF EXISTS SP_CARGAR_TIPOS_BASE;
DELIMITER $$
CREATE PROCEDURE SP_CARGAR_TIPOS_BASE()
BEGIN
  -- TIPO_BITACORA mínimos
  INSERT IGNORE INTO TIPO_BITACORA(nombre, descripcion) VALUES
    ('AUDITORIA','Eventos de auditoría'),
    ('NEGOCIO','Eventos de negocio'),
    ('SEGURIDAD','Eventos de seguridad');

  -- TIPO_MOVIMIENTO mínimos
  INSERT IGNORE INTO TIPO_MOVIMIENTO(nombre, signo, descripcion) VALUES
    ('BONO_PUBLICAR','IN','Créditos por publicar'),
    ('COMPRA_CREDITO','IN','Acreditación por compra'),
    ('AJUSTE_ADMIN_IN','IN','Ajuste manual (bono)'),
    ('PAGO_INTERCAMBIO','OUT','Salida por intercambio'),
    ('AJUSTE_ADMIN_OUT','OUT','Ajuste manual (penalización)');

  -- UNIDADES mínimas usadas en ambiental
  INSERT IGNORE INTO UNIDAD_MEDIDA(id_um, nombre, simbolo) VALUES
    (1,'Unidad','u'), (2,'Kilogramo','kg'), (3,'Gramo','g'), (4,'Litro','L'),
    (5,'Metro','m'), (6,'Metro cuadrado','m2'), (7,'Hora','h');
END$$
DELIMITER ;

-- 1) FUNCIONES (Ambiental y Bonos)

DROP FUNCTION IF EXISTS FN_CO2_EQUIVALENTE;
DELIMITER $$
CREATE FUNCTION FN_CO2_EQUIVALENTE(
  p_id_dim INT,
  p_valor DECIMAL(18,6),
  p_id_um_origen INT
) RETURNS DECIMAL(18,6)
DETERMINISTIC
BEGIN
  -- Convierte p_valor a unidad base de la dimensión usando FACTOR_CONVERSION
  DECLARE v_factor DECIMAL(18,8) DEFAULT 1;
  DECLARE v_result DECIMAL(18,6);

  SELECT factor
    INTO v_factor
    FROM FACTOR_CONVERSION
   WHERE id_dim = p_id_dim
     AND id_um_origen = p_id_um_origen
   ORDER BY id_factor DESC
   LIMIT 1;

  SET v_result = ROUND(p_valor * IFNULL(v_factor,1), 6);
  RETURN v_result;
END$$
DELIMITER ;

DROP FUNCTION IF EXISTS FN_EQUIVALENTE_AMBIENTAL;
DELIMITER $$
CREATE FUNCTION FN_EQUIVALENTE_AMBIENTAL(
  p_id_dim INT,
  p_valor DECIMAL(18,6),
  p_id_um_origen INT
) RETURNS DECIMAL(18,6)
DETERMINISTIC
BEGIN
  -- Alias semántico: hoy lo equiparamos a CO2e en kg.
  RETURN FN_CO2_EQUIVALENTE(p_id_dim, p_valor, p_id_um_origen);
END$$
DELIMITER ;

-- [CUMPLE CRITERIO: Función de verificación de campaña/bono → devuelve multiplicador activo]
-- Devuelve multiplicador vigente según PROMOCION ACTIVA: 1 + (descuento/100).
-- Si no hay campaña activa, retorna 1.0 (sin multiplicar).
DROP FUNCTION IF EXISTS FN_MULTIPLICADOR_BONO;
DELIMITER $$
CREATE FUNCTION FN_MULTIPLICADOR_BONO()
RETURNS DECIMAL(6,3)
DETERMINISTIC
BEGIN
  DECLARE v_mult DECIMAL(6,3) DEFAULT 1.0;
  DECLARE v_desc DECIMAL(5,2);

  SELECT descuento
    INTO v_desc
    FROM PROMOCION
   WHERE estado='ACTIVA'
     AND fecha_ini <= CURDATE()
     AND fecha_fin >= CURDATE()
   ORDER BY fecha_ini DESC
   LIMIT 1;

  IF v_desc IS NOT NULL THEN
    SET v_mult = ROUND(1 + (v_desc/100), 3);
  END IF;

  RETURN v_mult;
END$$
DELIMITER ;

-- 2) USUARIOS Y SEGURIDAD

-- BIT helpers (valores por defecto desde catálogo)
SET @BIT_AUDITORIA := (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='AUDITORIA' LIMIT 1);
SET @BIT_NEGOCIO   := (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='NEGOCIO'   LIMIT 1);
SET @BIT_SEGURIDAD := (SELECT id_tipo_bit FROM TIPO_BITACORA WHERE nombre='SEGURIDAD' LIMIT 1);

DROP TRIGGER IF EXISTS TRG_USUARIO_AFTER_INSERT_AUDIT;

/*Crea automáticamente la BILLETERA del usuario y registra en BITACORA.*/
DELIMITER $$
CREATE TRIGGER TRG_USUARIO_AFTER_INSERT_AUDIT
AFTER INSERT ON USUARIO
FOR EACH ROW
BEGIN
  INSERT INTO BILLETERA(id_us) VALUES(NEW.id_us);

  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion,ip)
  VALUES(COALESCE(@BIT_AUDITORIA,1), NEW.id_us, 'USUARIO', NEW.id_us,
         'CREATE', CONCAT('Alta usuario: ', NEW.nombre,' ',NEW.apellido,' (',NEW.email,')'), NULL);
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_USUARIO_AFTER_UPDATE_ESTADO;

/*Si cambia activo, registra en BITACORA el cambio de estado.*/
DELIMITER $$
CREATE TRIGGER TRG_USUARIO_AFTER_UPDATE_ESTADO
AFTER UPDATE ON USUARIO
FOR EACH ROW
BEGIN
  IF NEW.activo <> OLD.activo THEN
    INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion,ip)
    VALUES(COALESCE(@BIT_AUDITORIA,1), NEW.id_us, 'USUARIO', NEW.id_us,
           'CAMBIAR_ESTADO',
           CONCAT('activo: ', OLD.activo, ' -> ', NEW.activo), NULL);
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_ACCESO_AFTER_INSERT_LOGIN_LOG;

/*Registra en BITACORA un login exitoso o fallido con IP y agente.*/
DELIMITER $$
CREATE TRIGGER TRG_ACCESO_AFTER_INSERT_LOGIN_LOG
AFTER INSERT ON ACCESO
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion,ip)
  VALUES(COALESCE(@BIT_SEGURIDAD,1), NEW.id_us, 'ACCESO', NEW.id_acc,
         IF(NEW.exito=1,'LOGIN_EXITOSO','LOGIN_FALLIDO'),
         CONCAT('Agente=',IFNULL(NEW.agente,'-')), NEW.ip);
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_CONTRASENA_AFTER_UPDATE_AUDIT;

/*Audita rotación de hash de contraseña en BITACORA.*/
DELIMITER $$
CREATE TRIGGER TRG_CONTRASENA_AFTER_UPDATE_AUDIT
AFTER UPDATE ON CONTRASENA
FOR EACH ROW
BEGIN
  IF NEW.hash <> OLD.hash OR NEW.algoritmo <> OLD.algoritmo THEN
    INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion,ip)
    VALUES(COALESCE(@BIT_SEGURIDAD,1), NEW.id_us, 'CONTRASENA', NEW.id_cmb,
           'ROTAR_HASH',
           CONCAT('algoritmo: ', OLD.algoritmo,' -> ',NEW.algoritmo), NULL);
  END IF;
END$$
DELIMITER ;

-- Procedimientos de usuario
DROP PROCEDURE IF EXISTS SP_USUARIO_CREAR;

/*Crea usuario activo, inserta su contraseña (BCRYPT), y registra en BITACORA */
DELIMITER $$
CREATE PROCEDURE SP_USUARIO_CREAR(
  IN p_id_rol INT, IN p_nombre VARCHAR(100), IN p_apellido VARCHAR(100),
  IN p_email VARCHAR(255), IN p_telefono VARCHAR(25),
  IN p_hash CHAR(60)
)
BEGIN
  DECLARE v_id INT;
  INSERT INTO USUARIO(id_rol,nombre,apellido,email,telefono,activo)
  VALUES(p_id_rol,p_nombre,p_apellido,p_email,p_telefono,TRUE);
  SET v_id = LAST_INSERT_ID();

  INSERT INTO CONTRASENA(id_us, algoritmo, hash)
  VALUES(v_id, 'BCRYPT', p_hash);

  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(COALESCE(@BIT_NEGOCIO,2), v_id, 'USUARIO', v_id, 'ALTA_COMPLETA', 'Usuario+Credenciales+Billetera listos');
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_USUARIO_CAMBIAR_ESTADO;

/*Cambia el estado activo/inactivo del usuario (el trigger audita).*/
DELIMITER $$
CREATE PROCEDURE SP_USUARIO_CAMBIAR_ESTADO(IN p_id_us INT, IN p_activo BOOLEAN)
BEGIN
  UPDATE USUARIO SET activo = p_activo WHERE id_us = p_id_us;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_CONTRASENA_ROTAR_HASH;

/*Actualiza hash/ y altera la fecha de cambio.*/
DELIMITER $$
CREATE PROCEDURE SP_CONTRASENA_ROTAR_HASH(
  IN p_id_us INT, IN p_nuevo_hash CHAR(60), IN p_algoritmo ENUM('BCRYPT','ARGON2ID','LEGACY')
)
BEGIN
  UPDATE CONTRASENA
     SET hash = p_nuevo_hash,
         algoritmo = p_algoritmo,
         fecha_cambio = NOW()
   WHERE id_us = p_id_us;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_USUARIO_OBTENER_SALDO;

/*Calcula saldo del usuario como IN − OUT a partir de MOVIMIENTO/TIPO_MOVIMIENTO.*/
DELIMITER $$
CREATE PROCEDURE SP_USUARIO_OBTENER_SALDO(IN p_id_us INT)
BEGIN
  SELECT
    IFNULL( SUM(CASE WHEN tm.signo='IN'  THEN m.cantidad ELSE 0 END), 0 )
    - IFNULL( SUM(CASE WHEN tm.signo='OUT' THEN m.cantidad ELSE 0 END), 0 )
    AS saldo
  FROM MOVIMIENTO m
  JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov = m.id_tipo_mov
  WHERE m.id_us = p_id_us;
END$$
DELIMITER ;

-- 3) CATÁLOGOS (validaciones anti-duplicado)

DROP TRIGGER IF EXISTS TRG_CATALOGO_BEFORE_INSERT_DUP_ROL;

/*Bloquea inserciones duplicadas por nombre.*/
DELIMITER $$
CREATE TRIGGER TRG_CATALOGO_BEFORE_INSERT_DUP_ROL
BEFORE INSERT ON ROL
FOR EACH ROW
BEGIN
  IF EXISTS(SELECT 1 FROM ROL WHERE nombre = NEW.nombre) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='ROL duplicado';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_CATALOGO_BEFORE_INSERT_DUP_UM;

/*Bloquea duplicados por nombre o simbolo.*/
DELIMITER $$
CREATE TRIGGER TRG_CATALOGO_BEFORE_INSERT_DUP_UM
BEFORE INSERT ON UNIDAD_MEDIDA
FOR EACH ROW
BEGIN
  IF EXISTS(SELECT 1 FROM UNIDAD_MEDIDA WHERE nombre = NEW.nombre OR simbolo = NEW.simbolo) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='UNIDAD_MEDIDA duplicada';
  END IF;
END$$
DELIMITER ;

-- 4) PUBLICACIONES

-- : Trigger de bonificación (+5 créditos por publicar)]
DROP TRIGGER IF EXISTS TRG_PUBLICACION_AFTER_INSERT_BONO_PUBLICAR;
DELIMITER $$
CREATE TRIGGER TRG_PUBLICACION_AFTER_INSERT_BONO_PUBLICAR
AFTER INSERT ON PUBLICACION
FOR EACH ROW
BEGIN
  DECLARE v_tipo INT;
  SELECT id_tipo_mov INTO v_tipo FROM TIPO_MOVIMIENTO WHERE nombre='BONO_PUBLICAR' LIMIT 1;
  IF v_tipo IS NOT NULL THEN
    INSERT INTO MOVIMIENTO(id_us,id_tipo_mov,cantidad,descripcion)
    VALUES(NEW.id_us, v_tipo, 5, 'Bono por crear publicación (+5 créditos)');
  END IF;

  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(COALESCE(@BIT_NEGOCIO,2), NEW.id_us, 'PUBLICACION', NEW.id_pub, 'PUBLICAR', NEW.titulo);
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_PUBLICACION_AFTER_UPDATE_ESTADO;

/*Audita cambios de estado en BITACORA.*/
DELIMITER $$
CREATE TRIGGER TRG_PUBLICACION_AFTER_UPDATE_ESTADO
AFTER UPDATE ON PUBLICACION
FOR EACH ROW
BEGIN
  IF NEW.estado <> OLD.estado THEN
    INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
    VALUES(COALESCE(@BIT_AUDITORIA,1), NEW.id_us, 'PUBLICACION', NEW.id_pub,
           'CAMBIAR_ESTADO', CONCAT(OLD.estado,' -> ',NEW.estado));
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_PUBLICACION_PRODUCTO_BEFORE_INSERT_VALIDAR;

/*Valida que cantidad sea > 0.*/
DELIMITER $$
CREATE TRIGGER TRG_PUBLICACION_PRODUCTO_BEFORE_INSERT_VALIDAR
BEFORE INSERT ON PUBLICACION_PRODUCTO
FOR EACH ROW
BEGIN
  IF NEW.cantidad <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Cantidad debe ser > 0';
  END IF;
END$$
DELIMITER ;

-- Impacto estimado por publicación
DROP TRIGGER IF EXISTS TRG_PUBLICACION_AFTER_INSERT_IMPACTO;

/*Genera un EVENTO_AMBIENTAL estimado asociado a la publicación.*/
DELIMITER $$
CREATE TRIGGER TRG_PUBLICACION_AFTER_INSERT_IMPACTO
AFTER INSERT ON PUBLICACION
FOR EACH ROW
BEGIN
  -- Demo: asociamos dimensión CO2 (id_dim por codigo='CO2') y 1.0 u como estimado
  DECLARE v_dim INT DEFAULT (SELECT id_dim FROM DIMENSION_AMBIENTAL WHERE codigo='CO2' LIMIT 1);
  DECLARE v_um INT DEFAULT 1; -- 'u'
  DECLARE v_val DECIMAL(18,6) DEFAULT 1.0;
  DECLARE v_eq DECIMAL(18,6);

  IF v_dim IS NOT NULL THEN
    SET v_eq = FN_EQUIVALENTE_AMBIENTAL(v_dim, v_val, v_um);

    INSERT INTO EVENTO_AMBIENTAL(
      id_us,id_dim,fuente,id_fuente,categoria,valor,id_um,contaminacion_reducida,descripcion
    )
    VALUES(
      NEW.id_us, v_dim, 'PUBLICACION', NEW.id_pub, 'Publicación', v_val, v_um, v_eq,
      CONCAT('Impacto estimado de publicación ', NEW.titulo)
    );
  END IF;
END$$
DELIMITER ;

-- Procedimientos de publicaciones
DROP PROCEDURE IF EXISTS SP_PUBLICACION_CREAR_PRODUCTO;

/*Crea publicación de producto y línea en PUBLICACION_PRODUCTO. (El trigger de bono suma +5 y el de impacto registra EVENTO_AMBIENTAL).*/
DELIMITER $$
CREATE PROCEDURE SP_PUBLICACION_CREAR_PRODUCTO(
  IN p_id_us INT, IN p_id_ub INT,
  IN p_titulo VARCHAR(255), IN p_descripcion TEXT,
  IN p_valor_creditos DECIMAL(15,2),
  IN p_id_prod INT, IN p_cantidad DECIMAL(15,4), IN p_id_um INT
)
BEGIN
  DECLARE v_id_pub INT;
  INSERT INTO PUBLICACION(id_us,id_ub,tipo,titulo,descripcion,valor_creditos,estado)
  VALUES(p_id_us,p_id_ub,'PRODUCTO',p_titulo,p_descripcion,p_valor_creditos,'PUBLICADA');
  SET v_id_pub = LAST_INSERT_ID();

  INSERT INTO PUBLICACION_PRODUCTO(id_pub,id_prod,cantidad,id_um)
  VALUES(v_id_pub,p_id_prod,p_cantidad,p_id_um);

  SELECT v_id_pub AS id_pub;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_PUBLICACION_CREAR_SERVICIO;

/*Crea publicación de servicio y su detalle.*/
DELIMITER $$
CREATE PROCEDURE SP_PUBLICACION_CREAR_SERVICIO(
  IN p_id_us INT, IN p_id_ub INT,
  IN p_titulo VARCHAR(255), IN p_descripcion TEXT,
  IN p_valor_creditos DECIMAL(15,2),
  IN p_id_serv INT, IN p_horario VARCHAR(100)
)
BEGIN
  DECLARE v_id_pub INT;
  INSERT INTO PUBLICACION(id_us,id_ub,tipo,titulo,descripcion,valor_creditos,estado)
  VALUES(p_id_us,p_id_ub,'SERVICIO',p_titulo,p_descripcion,p_valor_creditos,'PUBLICADA');
  SET v_id_pub = LAST_INSERT_ID();

  INSERT INTO PUBLICACION_SERVICIO(id_pub,id_serv,horario)
  VALUES(v_id_pub,p_id_serv,p_horario);

  SELECT v_id_pub AS id_pub;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_PUBLICACION_CAMBIAR_ESTADO;

/*Actualiza el estado de una publicación (auditable por trigger).*/
DELIMITER $$
CREATE PROCEDURE SP_PUBLICACION_CAMBIAR_ESTADO(
  IN p_id_pub INT,
  IN p_estado ENUM('BORRADOR','PUBLICADA','PAUSADA','AGOTADA','OCULTA','ELIMINADA')
)
BEGIN
  UPDATE PUBLICACION SET estado = p_estado WHERE id_pub = p_id_pub;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_PUBLICACION_ELIMINAR;

/*Marca la publicación como ELIMINADA.*/
DELIMITER $$
CREATE PROCEDURE SP_PUBLICACION_ELIMINAR(IN p_id_pub INT)
BEGIN
  UPDATE PUBLICACION SET estado='ELIMINADA' WHERE id_pub=p_id_pub;
END$$
DELIMITER ;

-- 5) PRODUCTOS Y SERVICIOS

DROP TRIGGER IF EXISTS TRG_PRODUCTO_BEFORE_UPDATE_PRECIO_VALIDO;

/*Impide precios negativos.*/
DELIMITER $$
CREATE TRIGGER TRG_PRODUCTO_BEFORE_UPDATE_PRECIO_VALIDO
BEFORE UPDATE ON PRODUCTO
FOR EACH ROW
BEGIN
  IF NEW.precio < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Precio no puede ser negativo';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_SERVICIO_BEFORE_UPDATE_ESTADO;

/*mpide reactivar servicios ya ELIMINADO.*/
DELIMITER $$
CREATE TRIGGER TRG_SERVICIO_BEFORE_UPDATE_ESTADO
BEFORE UPDATE ON SERVICIO
FOR EACH ROW
BEGIN
  -- Ejemplo de reglas simples: no pasar de ELIMINADO a ACTIVO
  IF OLD.estado='ELIMINADO' AND NEW.estado<>'ELIMINADO' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='No se puede reactivar un servicio eliminado';
  END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_PRODUCTO_ACTUALIZAR_DATOS;

/*Actualiza atributos de un producto.*/
DELIMITER $$
CREATE PROCEDURE SP_PRODUCTO_ACTUALIZAR_DATOS(
  IN p_id_prod INT, IN p_nombre VARCHAR(255), IN p_descripcion VARCHAR(255),
  IN p_precio DECIMAL(15,2), IN p_peso DECIMAL(10,2)
)
BEGIN
  UPDATE PRODUCTO
     SET nombre=p_nombre, descripcion=p_descripcion, precio=p_precio, peso=p_peso,
         actualizado_por = actualizado_por,
         id_cat = id_cat
   WHERE id_prod=p_id_prod;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_SERVICIO_EDITAR;

/*Actualiza atributos/estado de un servicio.*/
DELIMITER $$
CREATE PROCEDURE SP_SERVICIO_EDITAR(
  IN p_id_serv INT, IN p_nombre VARCHAR(255), IN p_descripcion TEXT,
  IN p_precio DECIMAL(15,2), IN p_duracion SMALLINT,
  IN p_estado ENUM('ACTIVO','PAUSADO','INACTIVO','ELIMINADO')
)
BEGIN
  UPDATE SERVICIO
     SET nombre=p_nombre, descripcion=p_descripcion, precio=p_precio,
         duracion_min=p_duracion, estado=p_estado
   WHERE id_serv=p_id_serv;
END$$
DELIMITER ;

-- 6) PROMOCIONES

DROP TRIGGER IF EXISTS TRG_PROMOCION_BEFORE_INSERT_FECHAS;

/*Valida que fecha_fin ≥ fecha_ini.*/
DELIMITER $$
CREATE TRIGGER TRG_PROMOCION_BEFORE_INSERT_FECHAS
BEFORE INSERT ON PROMOCION
FOR EACH ROW
BEGIN
  IF NEW.fecha_fin < NEW.fecha_ini THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='fecha_fin no puede ser menor a fecha_ini';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_PROMOCION_AFTER_UPDATE_ACTIVACION;

/*Autogestiona estado → ACTIVA/FINALIZADA según fechas actuales.*/
DELIMITER $$
CREATE TRIGGER TRG_PROMOCION_AFTER_UPDATE_ACTIVACION
AFTER UPDATE ON PROMOCION
FOR EACH ROW
BEGIN
  IF NEW.fecha_ini <= CURDATE() AND NEW.fecha_fin >= CURDATE() AND NEW.estado<>'FINALIZADA' THEN
    UPDATE PROMOCION SET estado='ACTIVA' WHERE id_prom=NEW.id_prom;
  END IF;
  IF NEW.fecha_fin < CURDATE() AND NEW.estado<>'FINALIZADA' THEN
    UPDATE PROMOCION SET estado='FINALIZADA' WHERE id_prom=NEW.id_prom;
  END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_PROMOCION_CREAR;

/*Inserta una promoción en estado PROGRAMADA.*/
DELIMITER $$
CREATE PROCEDURE SP_PROMOCION_CREAR(
  IN p_titulo VARCHAR(255), IN p_desc VARCHAR(255),
  IN p_ini DATE, IN p_fin DATE, IN p_descuento DECIMAL(5,2)
)
BEGIN
  INSERT INTO PROMOCION(titulo,descripcion,fecha_ini,fecha_fin,descuento,estado)
  VALUES(p_titulo,p_desc,p_ini,p_fin,p_descuento,'PROGRAMADA');
  SELECT LAST_INSERT_ID() AS id_prom;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_PROMOCION_APLICAR_A_PRODUCTO;

/*Relaciona una promoción con un PRODUCTO o SERVICIO.*/
DELIMITER $$
CREATE PROCEDURE SP_PROMOCION_APLICAR_A_PRODUCTO(
  IN p_id_prom INT,
  IN p_entidad ENUM('PRODUCTO','SERVICIO'),
  IN p_id_entidad INT
)
BEGIN
  INSERT INTO PROMOCION_APLICA(id_prom,entidad,id_entidad)
  VALUES(p_id_prom,p_entidad,p_id_entidad);
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_PROMOCION_FINALIZAR;

/*Marca una promoción como FINALIZADA.*/
DELIMITER $$
CREATE PROCEDURE SP_PROMOCION_FINALIZAR(IN p_id_prom INT)
BEGIN
  UPDATE PROMOCION SET estado='FINALIZADA' WHERE id_prom=p_id_prom;
END$$
DELIMITER ;

-- 7) CRÉDITOS Y COMPRAS

DROP TRIGGER IF EXISTS TRG_COMPRA_CREDITO_AFTER_INSERT_MOVIMIENTO;

/*Registra el evento de registro de compra en BITACORA.*/
DELIMITER $$
CREATE TRIGGER TRG_COMPRA_CREDITO_AFTER_INSERT_MOVIMIENTO
AFTER INSERT ON COMPRA_CREDITO
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(COALESCE(@BIT_NEGOCIO,2), NEW.id_us, 'COMPRA_CREDITO', NEW.id_compra,
         'REGISTRAR', CONCAT('Proveedor=',NEW.proveedor,'; Monto=',NEW.monto));
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_COMPRA_CREDITO_AFTER_UPDATE_APROBADA;

/*Al asignar aprobado_en, acredita créditos (MOVIMIENTO tipo ‘COMPRA_CREDITO’) y audita.
Con SP_COMPRA_CREDITO_REGISTRAR se calcula la cantidad; este trigger es quien inserta el MOVIMIENTO al aprobar*/
DELIMITER $$
CREATE TRIGGER TRG_COMPRA_CREDITO_AFTER_UPDATE_APROBADA
AFTER UPDATE ON COMPRA_CREDITO
FOR EACH ROW
BEGIN
  DECLARE v_tipo INT;
  IF OLD.aprobado_en IS NULL AND NEW.aprobado_en IS NOT NULL THEN
    SELECT id_tipo_mov INTO v_tipo FROM TIPO_MOVIMIENTO WHERE nombre='COMPRA_CREDITO' LIMIT 1;
    IF v_tipo IS NOT NULL THEN
      INSERT INTO MOVIMIENTO(id_us,id_tipo_mov,cantidad,descripcion,id_compra)
      VALUES(NEW.id_us, v_tipo, NEW.creditos,
             'Acreditación por compra de créditos (aprobada)', NEW.id_compra);
    END IF;

    INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
    VALUES(COALESCE(@BIT_NEGOCIO,2), NEW.id_us, 'COMPRA_CREDITO', NEW.id_compra,
           'APROBAR', 'Compra aprobada');
  END IF;
END$$
DELIMITER ;

-- Procedimiento de compra de créditos → convierte Bs a créditos y aplica bono;
--  el movimiento se registra cuando se APRUEBA (trigger anterior)]
DROP PROCEDURE IF EXISTS SP_COMPRA_CREDITO_REGISTRAR;
DELIMITER $$
CREATE PROCEDURE SP_COMPRA_CREDITO_REGISTRAR(
  IN p_id_us INT,
  IN p_id_paquete INT,                -- paquete para inferir la tasa (cred/bs)
  IN p_creditos INT,                  -- opcional: si viene NULL/0 se calcula
  IN p_monto DECIMAL(15,2),           -- Bs
  IN p_proveedor VARCHAR(100),
  IN p_referencia VARCHAR(100)
)
BEGIN
  DECLARE v_cred_paquete INT;
  DECLARE v_precio_paquete DECIMAL(15,2);
  DECLARE v_tasa DECIMAL(15,6);
  DECLARE v_calc INT;
  DECLARE v_mult DECIMAL(6,3);

  -- Lee paquete para tasa
  SELECT cantidad_creditos, precio
    INTO v_cred_paquete, v_precio_paquete
    FROM PAQUETE_CREDITO
   WHERE id_paquete = p_id_paquete
   LIMIT 1;

  SET v_tasa = CASE WHEN v_precio_paquete IS NULL OR v_precio_paquete = 0
                    THEN 0
                    ELSE (v_cred_paquete / v_precio_paquete) END;

  -- Calcula créditos desde monto cuando no vienen explícitos
  IF p_creditos IS NULL OR p_creditos = 0 THEN
    SET v_calc = ROUND(p_monto * v_tasa, 0);
  ELSE
    SET v_calc = p_creditos;
  END IF;

  -- Aplica multiplicador de campaña (si hay campaña activa)
  SET v_mult = FN_MULTIPLICADOR_BONO();
  SET v_calc = FLOOR(v_calc * v_mult);

  INSERT INTO COMPRA_CREDITO(id_us,id_paquete,creditos,monto,proveedor,referencia)
  VALUES(p_id_us,p_id_paquete,v_calc,p_monto,p_proveedor,p_referencia);

  SELECT LAST_INSERT_ID() AS id_compra,
         v_tasa AS tasa_paquete,
         v_mult AS multiplicador_aplicado,
         v_calc AS creditos_resultantes;
END$$
DELIMITER ;

USE CreditosVerdes;

-- 8) INTERCAMBIOS / TRANSACCIONES / MOVIMIENTOS

DROP TRIGGER IF EXISTS TRG_INTERCAMBIO_BEFORE_INSERT_VALIDAR_SALDO;

/*Verifica que el comprador tenga saldo suficiente para cantidad. (Cumple “validación de saldo”)*/
DELIMITER $$
CREATE TRIGGER TRG_INTERCAMBIO_BEFORE_INSERT_VALIDAR_SALDO
BEFORE INSERT ON INTERCAMBIO
FOR EACH ROW
BEGIN
  DECLARE v_in DECIMAL(15,2);
  DECLARE v_out DECIMAL(15,2);
  DECLARE v_saldo DECIMAL(15,2);

  SELECT IFNULL(SUM(CASE WHEN tm.signo='IN'  THEN m.cantidad END),0),
         IFNULL(SUM(CASE WHEN tm.signo='OUT' THEN m.cantidad END),0)
    INTO v_in, v_out
    FROM MOVIMIENTO m
    JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov=m.id_tipo_mov
   WHERE m.id_us = NEW.id_us_comp;

  SET v_saldo = v_in - v_out;

  IF NEW.cantidad <= 0 OR v_saldo < NEW.cantidad THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT='Saldo insuficiente o monto inválido para solicitar intercambio';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_INTERCAMBIO_AFTER_UPDATE_COMPLETAR;

/*Al pasar a COMPLETADO, descuenta créditos del comprador (MOVIMIENTO ‘PAGO_INTERCAMBIO’) y crea la TRANSACCION confirmada.*/
DELIMITER $$
CREATE TRIGGER TRG_INTERCAMBIO_AFTER_UPDATE_COMPLETAR
AFTER UPDATE ON INTERCAMBIO
FOR EACH ROW
BEGIN
  DECLARE v_tipo_out INT;
  IF OLD.estado<>'COMPLETADO' AND NEW.estado='COMPLETADO' THEN
    -- OUT para comprador (paga)
    SELECT id_tipo_mov INTO v_tipo_out FROM TIPO_MOVIMIENTO WHERE nombre='PAGO_INTERCAMBIO' LIMIT 1;
    IF v_tipo_out IS NOT NULL THEN
      INSERT INTO MOVIMIENTO(id_us,id_tipo_mov,cantidad,descripcion,id_inter)
      VALUES(NEW.id_us_comp, v_tipo_out, NEW.cantidad, 'Pago por intercambio', NEW.id_inter);
    END IF;

    -- TRANSACCION confirmada comprador -> vendedor
    INSERT INTO TRANSACCION(id_us,id_us2,id_inter,fecha_trans,monto,estado)
    VALUES(NEW.id_us_comp, NEW.id_us_vend, NEW.id_inter, NOW(), NEW.cantidad, 'CONFIRMADA');
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_INTERCAMBIO_AFTER_INSERT_IMPACTO;

/*Crea EVENTO_AMBIENTAL “potencial” asociado al intercambio solicitado.*/
DELIMITER $$
CREATE TRIGGER TRG_INTERCAMBIO_AFTER_INSERT_IMPACTO
AFTER INSERT ON INTERCAMBIO
FOR EACH ROW
BEGIN
  -- Crea evento ambiental "potencial" al solicitar
  DECLARE v_dim INT DEFAULT (SELECT id_dim FROM DIMENSION_AMBIENTAL WHERE codigo='CO2' LIMIT 1);
  DECLARE v_eq DECIMAL(18,6);
  IF v_dim IS NOT NULL THEN
    SET v_eq = FN_EQUIVALENTE_AMBIENTAL(v_dim, NEW.cantidad, IFNULL(NEW.id_um,1));
    INSERT INTO EVENTO_AMBIENTAL(
      id_us,id_dim,fuente,id_fuente,categoria,valor,id_um,contaminacion_reducida,descripcion
    )
    VALUES(
      NEW.id_us_comp, v_dim, 'INTERCAMBIO', NEW.id_inter, 'Intercambio',
      NEW.cantidad, IFNULL(NEW.id_um,1), v_eq,
      'Impacto potencial por intercambio solicitado'
    );
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_TRANSACCION_BEFORE_INSERT_VALIDAR_SALDOS;

/*Valida que monto > 0.*/
DELIMITER $$
CREATE TRIGGER TRG_TRANSACCION_BEFORE_INSERT_VALIDAR_SALDOS
BEFORE INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
  IF NEW.monto <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Monto inválido';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_TRANSACCION_AFTER_INSERT_AUDIT;

/*Audita la confirmación de la transacción en BITACORA.*/
DELIMITER $$
CREATE TRIGGER TRG_TRANSACCION_AFTER_INSERT_AUDIT
AFTER INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(COALESCE(@BIT_NEGOCIO,2), NEW.id_us, 'TRANSACCION', NEW.id_trans,
         'CONFIRMAR', CONCAT('Hacia usuario ', NEW.id_us2, '; Monto=', NEW.monto));
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_MOVIMIENTO_BEFORE_INSERT_SIGNO;

/*Valida que el tipo de movimiento exista y que cantidad > 0.*/
DELIMITER $$
CREATE TRIGGER TRG_MOVIMIENTO_BEFORE_INSERT_SIGNO
BEFORE INSERT ON MOVIMIENTO
FOR EACH ROW
BEGIN
  DECLARE v_signo ENUM('IN','OUT');
  SELECT signo INTO v_signo FROM TIPO_MOVIMIENTO WHERE id_tipo_mov=NEW.id_tipo_mov;
  IF v_signo IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Tipo de movimiento inválido';
  END IF;
  IF NEW.cantidad <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Cantidad debe ser > 0';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_MOVIMIENTO_AFTER_INSERT_BITACORA;

/*Audita cada MOVIMIENTO insertado (tipo y cantidad).*/
DELIMITER $$
CREATE TRIGGER TRG_MOVIMIENTO_AFTER_INSERT_BITACORA
AFTER INSERT ON MOVIMIENTO
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(COALESCE(@BIT_AUDITORIA,1), NEW.id_us, 'MOVIMIENTO', NEW.id_mov,
         'INSERT', CONCAT('Tipo=', NEW.id_tipo_mov, '; Cantidad=', NEW.cantidad));
END$$
DELIMITER ;

-- Procedimientos billetera/movimientos
DROP PROCEDURE IF EXISTS SP_MOVIMIENTO_AJUSTE_ADMIN;

/*Inserta un MOVIMIENTO de ajuste administrativo (bono o penalización).*/
DELIMITER $$
CREATE PROCEDURE SP_MOVIMIENTO_AJUSTE_ADMIN(
  IN p_id_us INT,
  IN p_signo ENUM('IN','OUT'),
  IN p_cantidad DECIMAL(15,2),
  IN p_desc VARCHAR(255)
)
BEGIN
  DECLARE v_tipo INT;
  IF p_signo='IN' THEN
    SELECT id_tipo_mov INTO v_tipo FROM TIPO_MOVIMIENTO WHERE nombre='AJUSTE_ADMIN_IN' LIMIT 1;
  ELSE
    SELECT id_tipo_mov INTO v_tipo FROM TIPO_MOVIMIENTO WHERE nombre='AJUSTE_ADMIN_OUT' LIMIT 1;
  END IF;
  IF v_tipo IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Tipo de ajuste no configurado'; END IF;
  INSERT INTO MOVIMIENTO(id_us,id_tipo_mov,cantidad,descripcion)
  VALUES(p_id_us, v_tipo, p_cantidad, p_desc);
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_SALDO_USUARIO_CALCULAR;

/*Wrapper que llama a SP_USUARIO_OBTENER_SALDO.*/
DELIMITER $$
CREATE PROCEDURE SP_SALDO_USUARIO_CALCULAR(IN p_id_us INT)
BEGIN
  CALL SP_USUARIO_OBTENER_SALDO(p_id_us);
END$$
DELIMITER ;

-- 9) REPORTES Y RECOMPENSAS

DROP TRIGGER IF EXISTS TRG_REPORTE_AFTER_INSERT_AUDIT;

/*Audita la creación de reportes (moderación).*/
DELIMITER $$
CREATE TRIGGER TRG_REPORTE_AFTER_INSERT_AUDIT
AFTER INSERT ON REPORTE
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(COALESCE(@BIT_AUDITORIA,1), NEW.id_reportante, 'REPORTE', NEW.id_reporte, 'CREAR', NEW.motivo);
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_USUARIO_LOGRO_AFTER_INSERT_AUDIT;

/*Audita la asignación de logros/recompensas.*/
DELIMITER $$
CREATE TRIGGER TRG_USUARIO_LOGRO_AFTER_INSERT_AUDIT
AFTER INSERT ON USUARIO_LOGRO
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(COALESCE(@BIT_NEGOCIO,2), NEW.id_us, 'USUARIO_LOGRO', NEW.id_rec, 'OTORGAR', 'Logro asignado');
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_REPORTE_CREAR;

/*Crea un reporte de moderación y retorna su id.*/
DELIMITER $$
CREATE PROCEDURE SP_REPORTE_CREAR(
  IN p_id_reportante INT,
  IN p_id_usuario_reportado INT,
  IN p_id_pub INT,
  IN p_motivo VARCHAR(500)
)
BEGIN
  INSERT INTO REPORTE(id_reportante,id_usuario_reportado,id_pub_reportada,motivo)
  VALUES(p_id_reportante,p_id_usuario_reportado,p_id_pub,p_motivo);
  SELECT LAST_INSERT_ID() AS id_reporte;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_REPORTE_RESOLVER;

/*Marca reporte como RESUELTO o DESCARTADO*/
DELIMITER $$
CREATE PROCEDURE SP_REPORTE_RESOLVER(
  IN p_id_reporte INT,
  IN p_id_admin INT,
  IN p_estado ENUM('RESUELTO','DESCARTADO')
)
BEGIN
  UPDATE REPORTE
     SET estado=p_estado, id_admin_resuelve=p_id_admin
   WHERE id_reporte=p_id_reporte;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_LOGRO_OTORGAR;

/*Asigna un logro/recompensa a un usuario con fecha actual.*/
DELIMITER $$
CREATE PROCEDURE SP_LOGRO_OTORGAR(IN p_id_us INT, IN p_id_rec INT)
BEGIN
  INSERT INTO USUARIO_LOGRO(id_us,id_rec,fecha_obtencion)
  VALUES(p_id_us,p_id_rec,CURDATE());
END$$
DELIMITER ;

-- 10) BITÁCORA Y AUDITORÍA

DROP TRIGGER IF EXISTS TRG_BITACORA_BEFORE_INSERT_METADATA;

/*Autoasigna fecha y id_tipo_bit por defecto si vienen nulos.*/
DELIMITER $$
CREATE TRIGGER TRG_BITACORA_BEFORE_INSERT_METADATA
BEFORE INSERT ON BITACORA
FOR EACH ROW
BEGIN
  IF NEW.fecha IS NULL THEN SET NEW.fecha = NOW(); END IF;
  IF NEW.id_tipo_bit IS NULL THEN SET NEW.id_tipo_bit = COALESCE(@BIT_AUDITORIA,1); END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_PRODUCTO_AFTER_UPDATE_BIT;

/*Audita edición de productos.*/
DELIMITER $$
CREATE TRIGGER TRG_PRODUCTO_AFTER_UPDATE_BIT
AFTER UPDATE ON PRODUCTO
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(COALESCE(@BIT_AUDITORIA,1), NEW.actualizado_por, 'PRODUCTO', NEW.id_prod, 'UPDATE', 'Edición de producto');
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS TRG_SERVICIO_AFTER_UPDATE_BIT;

/*Audita edición de servicios.*/
DELIMITER $$
CREATE TRIGGER TRG_SERVICIO_AFTER_UPDATE_BIT
AFTER UPDATE ON SERVICIO
FOR EACH ROW
BEGIN
  INSERT INTO BITACORA(id_tipo_bit,id_us,entidad,id_entidad,accion,descripcion)
  VALUES(COALESCE(@BIT_AUDITORIA,1), NEW.actualizado_por, 'SERVICIO', NEW.id_serv, 'UPDATE', 'Edición de servicio');
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_BITACORA_BUSCAR;

/*Busca registros de BITACORA filtrando por usuario, entidad y rango temporal (hasta 1000 resultados).*/
DELIMITER $$
CREATE PROCEDURE SP_BITACORA_BUSCAR(
  IN p_id_us INT,
  IN p_entidad VARCHAR(100),
  IN p_fecha_desde DATETIME,
  IN p_fecha_hasta DATETIME
)
BEGIN
  SELECT *
    FROM BITACORA
   WHERE (p_id_us IS NULL OR id_us = p_id_us)
     AND (p_entidad IS NULL OR entidad = p_entidad)
     AND (p_fecha_desde IS NULL OR fecha >= p_fecha_desde)
     AND (p_fecha_hasta IS NULL OR fecha <= p_fecha_hasta)
   ORDER BY fecha DESC
   LIMIT 1000;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_BITACORA_PURGA_MENSUAL;

/*Elimina de BITACORA entradas anteriores al umbral de meses indicado.*/
DELIMITER $$
CREATE PROCEDURE SP_BITACORA_PURGA_MENSUAL(IN p_meses INT)
BEGIN
  DELETE FROM BITACORA
   WHERE fecha < DATE_SUB(CURDATE(), INTERVAL p_meses MONTH);
END$$
DELIMITER ;

-- 11) AMBIENTAL (EVENTO -> IMPACTO_MENSUAL)

DROP TRIGGER IF EXISTS TRG_EVENTO_AMBIENTAL_AFTER_INSERT_AGREGAR;

/*Actualiza/Acumula el IMPACTO_MENSUAL (valor y CO₂e) del mes correspondiente.*/
DELIMITER $$
CREATE TRIGGER TRG_EVENTO_AMBIENTAL_AFTER_INSERT_AGREGAR
AFTER INSERT ON EVENTO_AMBIENTAL
FOR EACH ROW
BEGIN
  DECLARE v_anio SMALLINT; DECLARE v_mes TINYINT;
  SET v_anio = YEAR(NEW.creado_en); SET v_mes = MONTH(NEW.creado_en);

  INSERT INTO IMPACTO_MENSUAL(
    anio,mes,id_us,id_dim,valor_total,contaminacion_reducida_total
  )
  VALUES(
    v_anio,v_mes,NEW.id_us,NEW.id_dim,NEW.valor,NEW.contaminacion_reducida
  )
  ON DUPLICATE KEY UPDATE
    valor_total = valor_total + NEW.valor,
    contaminacion_reducida_total =
      IFNULL(contaminacion_reducida_total,0) + IFNULL(NEW.contaminacion_reducida,0),
    actualizado_en = NOW();
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_IMPACTO_REGISTRAR_PUBLICACION;

/*Inserta EVENTO_AMBIENTAL de tipo “Publicación” y calcula CO₂e.*/
DELIMITER $$
CREATE PROCEDURE SP_IMPACTO_REGISTRAR_PUBLICACION(
  IN p_id_us INT,
  IN p_id_pub INT,
  IN p_id_dim INT,
  IN p_valor DECIMAL(18,6),
  IN p_id_um INT,
  IN p_desc VARCHAR(255)
)
BEGIN
  INSERT INTO EVENTO_AMBIENTAL(
    id_us,id_dim,fuente,id_fuente,categoria,valor,id_um,contaminacion_reducida,descripcion
  )
  VALUES(
    p_id_us,p_id_dim,'PUBLICACION',p_id_pub,'Publicación',p_valor,p_id_um,
    FN_EQUIVALENTE_AMBIENTAL(p_id_dim,p_valor,p_id_um), p_desc
  );
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_IMPACTO_REGISTRAR_INTERCAMBIO;

/*Inserta EVENTO_AMBIENTAL de tipo “Intercambio” y calcula CO₂e.*/
DELIMITER $$
CREATE PROCEDURE SP_IMPACTO_REGISTRAR_INTERCAMBIO(
  IN p_id_us INT,
  IN p_id_inter INT,
  IN p_id_dim INT,
  IN p_valor DECIMAL(18,6),
  IN p_id_um INT,
  IN p_desc VARCHAR(255)
)
BEGIN
  INSERT INTO EVENTO_AMBIENTAL(
    id_us,id_dim,fuente,id_fuente,categoria,valor,id_um,contaminacion_reducida,descripcion
  )
  VALUES(
    p_id_us,p_id_dim,'INTERCAMBIO',p_id_inter,'Intercambio',p_valor,p_id_um,
    FN_EQUIVALENTE_AMBIENTAL(p_id_dim,p_valor,p_id_um), p_desc
  );
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_IMPACTO_MENSUAL_RECALCULAR;

/*Recalcula desde cero la tabla IMPACTO_MENSUAL con base en EVENTO_AMBIENTAL del período dado.*/
DELIMITER $$
CREATE PROCEDURE SP_IMPACTO_MENSUAL_RECALCULAR(IN p_anio SMALLINT, IN p_mes TINYINT)
BEGIN
  DELETE FROM IMPACTO_MENSUAL WHERE anio=p_anio AND mes=p_mes;

  INSERT INTO IMPACTO_MENSUAL(anio,mes,id_us,id_dim,valor_total,contaminacion_reducida_total)
  SELECT p_anio, p_mes, id_us, id_dim,
         SUM(valor) AS valor_total,
         SUM(IFNULL(contaminacion_reducida,0)) AS contaminacion_reducida_total
    FROM EVENTO_AMBIENTAL
   WHERE YEAR(creado_en)=p_anio AND MONTH(creado_en)=p_mes
   GROUP BY id_us,id_dim;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_REPORTE_AMBIENTAL_MENSUAL;

/*Reporta por usuario y dimensión los totales del mes (valor y CO₂e).*/
DELIMITER $$
CREATE PROCEDURE SP_REPORTE_AMBIENTAL_MENSUAL(IN p_anio SMALLINT, IN p_mes TINYINT)
BEGIN
  SELECT im.id_us, u.nombre, u.apellido, im.id_dim, d.codigo, d.nombre AS dimension,
         im.valor_total, im.contaminacion_reducida_total
    FROM IMPACTO_MENSUAL im
    JOIN USUARIO u ON u.id_us=im.id_us
    JOIN DIMENSION_AMBIENTAL d ON d.id_dim=im.id_dim
   WHERE im.anio=p_anio AND im.mes=p_mes
   ORDER BY im.valor_total DESC;
END$$
DELIMITER ;

-- 12) ANALÍTICA Y ESTADÍSTICAS

DROP PROCEDURE IF EXISTS SP_REPORTE_MENSUAL_KPIS;

/*Devuelve KPIs del mes: #intercambios, #publicaciones, ingresos por compras de créditos y delta de créditos (IN − OUT).*/
DELIMITER $$
CREATE PROCEDURE SP_REPORTE_MENSUAL_KPIS(IN p_anio SMALLINT, IN p_mes TINYINT)
BEGIN
  SELECT
    (SELECT COUNT(*) FROM INTERCAMBIO WHERE YEAR(fecha_sol)=p_anio AND MONTH(fecha_sol)=p_mes) AS intercambios,
    (SELECT COUNT(*) FROM PUBLICACION WHERE YEAR(fecha_pub)=p_anio AND MONTH(fecha_pub)=p_mes) AS publicaciones,
    (SELECT IFNULL(SUM(monto),0) FROM COMPRA_CREDITO WHERE YEAR(creado_en)=p_anio AND MONTH(creado_en)=p_mes) AS ingresos,
    (SELECT IFNULL(SUM(cantidad),0) FROM MOVIMIENTO m JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov=m.id_tipo_mov
      WHERE tm.signo='IN' AND YEAR(m.fecha_mov)=p_anio AND MONTH(m.fecha_mov)=p_mes)
      - (SELECT IFNULL(SUM(cantidad),0) FROM MOVIMIENTO m JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov=m.id_tipo_mov
      WHERE tm.signo='OUT' AND YEAR(m.fecha_mov)=p_anio AND MONTH(m.fecha_mov)=p_mes) AS delta_creditos
  ;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_TOP_USUARIOS_RANKING;

/*Ranking de usuarios por creditos, impacto (CO₂e) o trans (transacciones).*/
DELIMITER $$
CREATE PROCEDURE SP_TOP_USUARIOS_RANKING(IN p_lim INT, IN p_criterio VARCHAR(20))
BEGIN
  IF p_criterio='creditos' THEN
    SELECT u.id_us,u.nombre,u.apellido,
      (SELECT IFNULL(SUM(CASE WHEN tm.signo='IN' THEN m.cantidad ELSE -m.cantidad END),0)
         FROM MOVIMIENTO m JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov=m.id_tipo_mov
        WHERE m.id_us=u.id_us) AS saldo
    FROM USUARIO u ORDER BY saldo DESC LIMIT p_lim;

  ELSEIF p_criterio='impacto' THEN
    SELECT u.id_us,u.nombre,u.apellido, IFNULL(SUM(im.contaminacion_reducida_total),0) AS co2e
      FROM USUARIO u LEFT JOIN IMPACTO_MENSUAL im ON im.id_us=u.id_us
     GROUP BY u.id_us ORDER BY co2e DESC LIMIT p_lim;

  ELSE
    SELECT u.id_us,u.nombre,u.apellido, COUNT(t.id_trans) AS trans
      FROM USUARIO u LEFT JOIN TRANSACCION t ON t.id_us=u.id_us OR t.id_us2=u.id_us
     GROUP BY u.id_us ORDER BY trans DESC LIMIT p_lim;
  END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_TOP_PUBLICACIONES;

/*Top publicaciones por cantidad de intercambios completados (tie-break por fecha_act).*/
DELIMITER $$
CREATE PROCEDURE SP_TOP_PUBLICACIONES(IN p_lim INT)
BEGIN
  SELECT p.id_pub, p.titulo, p.estado, p.valor_creditos,
         (SELECT COUNT(*) FROM INTERCAMBIO i WHERE i.id_pub=p.id_pub AND i.estado='COMPLETADO') AS completados
    FROM PUBLICACION p
   ORDER BY completados DESC, p.fecha_act DESC
   LIMIT p_lim;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_INGRESOS_POR_CREDITOS;

/*Suma mensual de ingresos por compras de créditos en el año.*/
DELIMITER $$
CREATE PROCEDURE SP_INGRESOS_POR_CREDITOS(IN p_anio SMALLINT)
BEGIN
  SELECT MONTH(creado_en) AS mes, IFNULL(SUM(monto),0) AS ingresos
    FROM COMPRA_CREDITO
   WHERE YEAR(creado_en)=p_anio
   GROUP BY MONTH(creado_en)
   ORDER BY mes;
END$$
DELIMITER ;

-- 13) MANTENIMIENTO

DROP PROCEDURE IF EXISTS SP_REINDEX_MANTENIMIENTO;

/*Ejecuta ANALYZE TABLE en tablas clave para mantenimiento/estadísticas del optimizador.*/
DELIMITER $$
CREATE PROCEDURE SP_REINDEX_MANTENIMIENTO()
BEGIN
  ANALYZE TABLE USUARIO, PUBLICACION, INTERCAMBIO, MOVIMIENTO, TRANSACCION, BITACORA;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_BACKUP_TABLAS_LOGICAS;

/*Crea tablas BKP (si no existen) y copia a BITACORA_BKP y EVENTO_AMBIENTAL_BKP los registros de más de 6 meses.*/
DELIMITER $$
CREATE PROCEDURE SP_BACKUP_TABLAS_LOGICAS()
BEGIN
  CREATE TABLE IF NOT EXISTS BITACORA_BKP LIKE BITACORA;
  INSERT INTO BITACORA_BKP SELECT * FROM BITACORA WHERE fecha < DATE_SUB(CURDATE(), INTERVAL 6 MONTH);

  CREATE TABLE IF NOT EXISTS EVENTO_AMBIENTAL_BKP LIKE EVENTO_AMBIENTAL;
  INSERT INTO EVENTO_AMBIENTAL_BKP SELECT * FROM EVENTO_AMBIENTAL WHERE creado_en < DATE_SUB(CURDATE(), INTERVAL 6 MONTH);
END$$
DELIMITER ;
