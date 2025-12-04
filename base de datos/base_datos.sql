DROP DATABASE IF EXISTS CREDITOS_VERDES2;
CREATE DATABASE CREDITOS_VERDES2
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE CREDITOS_VERDES2;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1) CATÁLOGOS / BASE

CREATE TABLE ROL (
  id_rol INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE PERMISO (
  id_permiso INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE RESULTADO_ACCESO (
  id_resultado INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CATEGORIA (
  id_categoria INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE UNIDAD_MEDIDA (
  id_um INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  simbolo VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE UBICACION (
  id_ubicacion INT PRIMARY KEY AUTO_INCREMENT,
  direccion VARCHAR(500) NOT NULL,
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  latitud DECIMAL(9,6),
  longitud DECIMAL(9,6)
) ENGINE=InnoDB;

CREATE TABLE TIPO_PUBLICACION (
  id_tipo_publicacion INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE TIPO_REFERENCIA (
  id_tipo_referencia INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE TIPO_MOVIMIENTO (
  id_tipo_movimiento INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE SIGNO_MOVIMIENTO (
  id_signo INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(20) NOT NULL UNIQUE  -- POSITIVO | NEGATIVO
) ENGINE=InnoDB;

CREATE TABLE PAQUETE_CREDITOS (
  id_paquete INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  cantidad_creditos BIGINT NOT NULL,
  precio_bs DECIMAL(12,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE TIPO_PROMOCION (
  id_tipo_promocion INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE TIPO_LOGRO (
  id_tipo_logro INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE TIPO_ACTIVIDAD (
  id_tipo_actividad INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE UBICACION_PUBLICIDAD (
  id_ubicacion INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  precio_base DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE TIPO_REPORTE (
  id_tipo_reporte INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE PERIODO (
  id_periodo INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  fecha_inicio DATE NULL,
  fecha_fin DATE NULL
) ENGINE=InnoDB;

CREATE INDEX ix_periodo_rango ON PERIODO (fecha_inicio, fecha_fin);

CREATE TABLE DIMENSION_AMBIENTAL (
  id_dimension INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  unidad_base VARCHAR(20),
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- 2) USUARIOS Y SEGURIDAD

CREATE TABLE USUARIO (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  id_rol INT NOT NULL,
  estado ENUM('ACTIVO','SUSPENDIDO','BLOQUEADO','ELIMINADO') NOT NULL DEFAULT 'ACTIVO',
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  correo VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(25),
  url_perfil VARCHAR(120) UNIQUE,
  CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol) REFERENCES ROL(id_rol)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE ROL_PERMISO (
  id_rol INT NOT NULL,
  id_permiso INT NOT NULL,
  PRIMARY KEY (id_rol, id_permiso),
  CONSTRAINT fk_rp_rol FOREIGN KEY (id_rol) REFERENCES ROL(id_rol)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_rp_permiso FOREIGN KEY (id_permiso) REFERENCES PERMISO(id_permiso)
    ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE BITACORA_ACCESO (
  id_acceso INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  fecha DATETIME,
  direccion_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(500),
  id_resultado INT NOT NULL,
  CONSTRAINT fk_bitacc_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_bitacc_resultado FOREIGN KEY (id_resultado) REFERENCES RESULTADO_ACCESO(id_resultado)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX ix_bitacceso_usuario_fecha ON BITACORA_ACCESO (id_usuario, fecha);

-- 3) PUBLICACIONES / PRODUCTOS / SERVICIOS

CREATE TABLE PUBLICACION (
  id_publicacion INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_categoria INT NOT NULL,
  id_tipo_publicacion INT NOT NULL,
  estado ENUM('BORRADOR','PUBLICADA','PAUSADA','AGOTADA','OCULTA','ELIMINADA') DEFAULT 'PUBLICADA',
  id_ubicacion INT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  valor_creditos BIGINT NOT NULL,
  imagen_url VARCHAR(500),
  CONSTRAINT fk_publicacion_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_publicacion_categoria FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_publicacion_tipopub FOREIGN KEY (id_tipo_publicacion) REFERENCES TIPO_PUBLICACION(id_tipo_publicacion)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_publicacion_ubicacion FOREIGN KEY (id_ubicacion) REFERENCES UBICACION(id_ubicacion)
    ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT ck_pub_valor_creditos CHECK (valor_creditos > 0)
) ENGINE=InnoDB;

CREATE INDEX ix_pub_usuario_estado   ON PUBLICACION (id_usuario, estado);
CREATE INDEX ix_pub_categoria_estado ON PUBLICACION (id_categoria, estado);

CREATE TABLE PRODUCTO (
  id_producto INT PRIMARY KEY AUTO_INCREMENT,
  id_categoria INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255),
  precio DECIMAL(12,2),
  peso DECIMAL(10,2),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE SERVICIO (
  id_servicio INT PRIMARY KEY AUTO_INCREMENT,
  id_categoria INT NOT NULL,
  estado ENUM('ACTIVO','PAUSADO','INACTIVO','ELIMINADO') DEFAULT 'ACTIVO',
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2),
  duracion_min SMALLINT,
  CONSTRAINT fk_servicio_categoria FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE PUBLICACION_PRODUCTO (
  id_publicacion INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad DECIMAL(15,4) NOT NULL,
  id_um INT NOT NULL,
  PRIMARY KEY (id_publicacion, id_producto),
  CONSTRAINT fk_pprd_publicacion FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_pprd_producto FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_pprd_um FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE PUBLICACION_SERVICIO (
  id_publicacion INT NOT NULL,
  id_servicio INT NOT NULL,
  horario VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_publicacion, id_servicio),
  CONSTRAINT fk_pserv_publicacion FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_pserv_servicio FOREIGN KEY (id_servicio) REFERENCES SERVICIO(id_servicio)
    ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE CALIFICACION (
  id_calificacion INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_publicacion INT NOT NULL,
  estrellas TINYINT NOT NULL,
  comentario VARCHAR(300),
  UNIQUE (id_usuario, id_publicacion),
  CONSTRAINT fk_calif_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_calif_publicacion FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_calif_estrellas CHECK (estrellas BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- 4) BILLETERA / MOVIMIENTOS / COMPRAS

CREATE TABLE BILLETERA (
  id_billetera INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL UNIQUE,
  estado ENUM('ACTIVA','BLOQUEADA','CERRADA') DEFAULT 'ACTIVA',
  saldo_creditos BIGINT DEFAULT 0,
  saldo_bs DECIMAL(12,2) DEFAULT 0.00,
  cuenta_bancaria VARCHAR(100),
  CONSTRAINT fk_billetera_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE SIGNO_TIPO_MOV (
  id_tipo_movimiento INT NOT NULL,
  id_signo INT NOT NULL,
  creado_en DATETIME NULL,
  PRIMARY KEY (id_tipo_movimiento, id_signo),
  CONSTRAINT fk_sxtm_tipomov FOREIGN KEY (id_tipo_movimiento) REFERENCES TIPO_MOVIMIENTO(id_tipo_movimiento)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_sxtm_signo FOREIGN KEY (id_signo) REFERENCES SIGNO_MOVIMIENTO(id_signo)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX ix_sxtm_signo ON SIGNO_TIPO_MOV (id_signo);

CREATE TABLE COMPRA_CREDITOS (
  id_compra INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_paquete INT NOT NULL,
  monto_bs DECIMAL(12,2) NOT NULL,
  estado ENUM('PENDIENTE','APROBADO','RECHAZADO','FALLIDO','REVERTIDO') DEFAULT 'PENDIENTE',
  id_transaccion_pago VARCHAR(255),
  UNIQUE (id_transaccion_pago),
  CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_compra_paquete FOREIGN KEY (id_paquete) REFERENCES PAQUETE_CREDITOS(id_paquete)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_compra_monto CHECK (monto_bs >= 0)
) ENGINE=InnoDB;

CREATE TABLE MOVIMIENTO_CREDITOS (
  id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_tipo_movimiento INT NOT NULL,
  id_tipo_referencia INT NOT NULL,
  cantidad BIGINT NOT NULL,
  descripcion VARCHAR(255),
  saldo_anterior BIGINT NOT NULL,
  saldo_posterior BIGINT NOT NULL,
  id_referencia INT NULL,
  CONSTRAINT fk_mov_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_mov_tipomov FOREIGN KEY (id_tipo_movimiento) REFERENCES TIPO_MOVIMIENTO(id_tipo_movimiento)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_mov_tiporef FOREIGN KEY (id_tipo_referencia) REFERENCES TIPO_REFERENCIA(id_tipo_referencia)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_mov_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB;

CREATE INDEX ix_mov_tiporef  ON MOVIMIENTO_CREDITOS (id_tipo_referencia);
CREATE INDEX ix_mov_creado   ON MOVIMIENTO_CREDITOS (id_movimiento);
CREATE INDEX ix_mov_usuario  ON MOVIMIENTO_CREDITOS (id_usuario, id_movimiento);

-- 5) TRANSACCIONES / BITÁCORA

CREATE TABLE TRANSACCION (
  id_transaccion INT PRIMARY KEY AUTO_INCREMENT,
  id_comprador INT NOT NULL,
  id_vendedor INT NOT NULL,
  id_publicacion INT NOT NULL,
  cantidad_creditos BIGINT NOT NULL,
  estado ENUM('SOLICITADA','ACEPTADA','RECHAZADA','CANCELADA','COMPLETADA','ANULADA') DEFAULT 'SOLICITADA',
  CONSTRAINT fk_tx_comprador FOREIGN KEY (id_comprador) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_tx_vendedor FOREIGN KEY (id_vendedor) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_tx_publicacion FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX ix_trans_estado   ON TRANSACCION (estado);
CREATE INDEX ix_tx_comprador   ON TRANSACCION (id_comprador);
CREATE INDEX ix_tx_vendedor    ON TRANSACCION (id_vendedor);
CREATE INDEX ix_tx_publicacion ON TRANSACCION (id_publicacion);

CREATE TABLE BITACORA_INTERCAMBIO (
  id_bitacora INT PRIMARY KEY AUTO_INCREMENT,
  id_transaccion INT NOT NULL,
  id_usuario_origen INT NOT NULL,
  id_usuario_destino INT NOT NULL,
  cantidad_creditos BIGINT NOT NULL,
  descripcion VARCHAR(500),
  CONSTRAINT fk_bi_transaccion FOREIGN KEY (id_transaccion) REFERENCES TRANSACCION(id_transaccion)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_bi_usr_origen FOREIGN KEY (id_usuario_origen) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_bi_usr_destino FOREIGN KEY (id_usuario_destino) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX ix_bitacora_trx ON BITACORA_INTERCAMBIO (id_transaccion);

-- 6) PROMOCIONES / LOGROS / PUBLICIDAD

CREATE TABLE PROMOCION (
  id_promocion INT PRIMARY KEY AUTO_INCREMENT,
  id_tipo_promocion INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  creditos_otorgados BIGINT NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  estado ENUM('PROGRAMADA','ACTIVA','PAUSADA','FINALIZADA','CANCELADA') DEFAULT 'PROGRAMADA',
  CONSTRAINT fk_promocion_tipo FOREIGN KEY (id_tipo_promocion) REFERENCES TIPO_PROMOCION(id_tipo_promocion)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX ix_promocion_activa ON PROMOCION (estado, fecha_inicio, fecha_fin);

CREATE TABLE PROMOCION_PUBLICACION (
  id_promocion INT NOT NULL,
  id_publicacion INT NOT NULL,
  PRIMARY KEY (id_promocion, id_publicacion),
  CONSTRAINT fk_pp_promocion FOREIGN KEY (id_promocion) REFERENCES PROMOCION(id_promocion)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_pp_publicacion FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion)
    ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX ix_promopub_pub  ON PROMOCION_PUBLICACION (id_publicacion);
CREATE INDEX ix_promopub_prom ON PROMOCION_PUBLICACION (id_promocion);

CREATE TABLE LOGRO (
  id_logro INT PRIMARY KEY AUTO_INCREMENT,
  id_tipo_logro INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  meta_requerida BIGINT NOT NULL,
  creditos_recompensa BIGINT NOT NULL,
  CONSTRAINT fk_logro_tipo FOREIGN KEY (id_tipo_logro) REFERENCES TIPO_LOGRO(id_tipo_logro)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE USUARIO_LOGRO (
  id_usuario_logro INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_logro INT NOT NULL,
  progreso_actual BIGINT DEFAULT 0,
  UNIQUE (id_usuario, id_logro),
  CONSTRAINT fk_ulogro_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_ulogro_logro FOREIGN KEY (id_logro) REFERENCES LOGRO(id_logro)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE PUBLICIDAD (
  id_publicidad INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_ubicacion INT NOT NULL,
  estado ENUM('PROGRAMADA','ACTIVA','PAUSADA','FINALIZADA','CANCELADA') DEFAULT 'PROGRAMADA',
  titulo VARCHAR(200) NOT NULL,
  descripcion VARCHAR(255),
  url_destino VARCHAR(500),
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  costo_creditos BIGINT NOT NULL,
  CONSTRAINT fk_publicidad_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_publicidad_ubipub FOREIGN KEY (id_ubicacion) REFERENCES UBICACION_PUBLICIDAD(id_ubicacion)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

-- 7) ACTIVIDADES Y REPORTES

CREATE TABLE ACTIVIDAD_SOSTENIBLE (
  id_actividad INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_tipo_actividad INT NOT NULL,
  descripcion TEXT NOT NULL,
  creditos_otorgados INT NOT NULL,
  evidencia_url VARCHAR(500),
  CONSTRAINT fk_act_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_act_tipo FOREIGN KEY (id_tipo_actividad) REFERENCES TIPO_ACTIVIDAD(id_tipo_actividad)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE REPORTE_IMPACTO (
  id_reporte INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NULL,
  id_tipo_reporte INT NOT NULL,
  id_periodo INT NOT NULL,
  total_co2_ahorrado DECIMAL(12,6) NOT NULL,
  total_agua_ahorrada DECIMAL(12,6) NOT NULL,
  total_energia_ahorrada DECIMAL(12,6) NOT NULL,
  total_transacciones BIGINT NOT NULL,
  total_usuarios_activos BIGINT NOT NULL,
  CONSTRAINT fk_rep_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_rep_tiporep FOREIGN KEY (id_tipo_reporte) REFERENCES TIPO_REPORTE(id_tipo_reporte)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_rep_periodo FOREIGN KEY (id_periodo) REFERENCES PERIODO(id_periodo)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX ix_rep_unico_helper ON REPORTE_IMPACTO (id_tipo_reporte, id_periodo, id_usuario);

-- 8) AMBIENTAL

CREATE TABLE EQUIVALENCIA_IMPACTO (
  id_equivalencia INT PRIMARY KEY AUTO_INCREMENT,
  id_categoria INT NOT NULL,
  id_um INT NULL,
  co2_por_unidad DECIMAL(12,6) NOT NULL,
  agua_por_unidad DECIMAL(12,6) NOT NULL,
  energia_por_unidad DECIMAL(12,6) NOT NULL,
  UNIQUE (id_categoria, id_um),
  CONSTRAINT fk_eq_cat FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_eq_um FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IMPACTO_AMBIENTAL (
  id_impacto INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_transaccion INT NOT NULL,
  id_categoria INT NOT NULL,
  co2_ahorrado DECIMAL(12,6) NOT NULL,
  agua_ahorrada DECIMAL(12,6) NOT NULL,
  energia_ahorrada DECIMAL(12,6) NOT NULL,
  id_periodo INT NOT NULL,
  CONSTRAINT fk_imp_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_imp_tx FOREIGN KEY (id_transaccion) REFERENCES TRANSACCION(id_transaccion)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_imp_cat FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_imp_periodo FOREIGN KEY (id_periodo) REFERENCES PERIODO(id_periodo)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX ix_impa_periodo          ON IMPACTO_AMBIENTAL (id_periodo);
CREATE INDEX ix_impa_usuario_periodo  ON IMPACTO_AMBIENTAL (id_usuario, id_periodo);
CREATE INDEX ix_impa_categoria        ON IMPACTO_AMBIENTAL (id_categoria);

CREATE TABLE EVENTO_AMBIENTAL (
  id_evento INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_dimension INT NOT NULL,
  fuente ENUM('PUBLICACION','TRANSACCION') NOT NULL,
  id_fuente INT NOT NULL,
  categoria VARCHAR(100),
  valor DECIMAL(18,6) NOT NULL,
  id_um INT NULL,
  contaminacion_reducida DECIMAL(18,6),
  descripcion VARCHAR(255),
  CONSTRAINT fk_ev_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_ev_dimension FOREIGN KEY (id_dimension) REFERENCES DIMENSION_AMBIENTAL(id_dimension)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_ev_um FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

-- Índices de apoyo
CREATE INDEX ix_tipomov_nombre ON TIPO_MOVIMIENTO (nombre);
CREATE INDEX ix_tiporef_nombre ON TIPO_REFERENCIA (nombre);
CREATE INDEX ix_compra_estado  ON COMPRA_CREDITOS (estado);

SET FOREIGN_KEY_CHECKS = 1;

-- 9) FUNCIONES

-- Busca el id_tipo_movimiento dado su nombre (RECARGA, INTERCAMBIO_IN, etc.).
-- Se usa en varios SP y triggers para no quemar IDs a mano.
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

-- Devuelve 1 si el usuario tiene saldo_creditos ≥ monto, si no, 0.
-- Se usa para validar que el usuario pueda pagar/intercambiar.
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

-- 10) PROCEDIMIENTOS

/*Flujo completo de aprobación de compra de créditos:
Valida usuario y paquete.
Verifica que el id_transaccion_pago no esté repetido.
Inserta la billetera si no existe.
Inserta la compra como APROBADO con el precio del paquete.
Obtiene el tipo de movimiento RECARGA.
Inserta un MOVIMIENTO_CREDITOS por la cantidad de créditos del paquete.*/

-- Tipos de movimiento para bonos de compras
INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion) VALUES
  ('BONO_PRIMERA_COMPRA','Bono por primera compra de créditos'),
  ('BONO_RECOMPRAS','Bono por compras recurrentes de créditos'),
  ('BONO_BIENVENIDA','Bono de bienvenida por registro de usuario');

DROP PROCEDURE IF EXISTS sp_compra_creditos_aprobar;
DELIMITER $$

CREATE PROCEDURE sp_compra_creditos_aprobar(
  IN p_id_usuario INT,
  IN p_id_paquete INT,
  IN p_id_transaccion_pago VARCHAR(255)
)
BEGIN
  DECLARE v_creditos BIGINT;
  DECLARE v_id_tipo_mov_recarga INT;
  DECLARE v_id_tiporef_compra INT;
  DECLARE v_id_tiporef_ajuste INT;
  DECLARE v_id_compra INT;

  DECLARE v_total_compras INT DEFAULT 0;
  DECLARE v_mov_bono_primera INT;
  DECLARE v_mov_bono_frec INT;
  DECLARE v_monto_bono BIGINT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- Validaciones básicas
  IF p_id_usuario IS NULL OR p_id_paquete IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Usuario y paquete son obligatorios';
  END IF;

  IF p_id_transaccion_pago IS NOT NULL
     AND EXISTS (SELECT 1 FROM COMPRA_CREDITOS WHERE id_transaccion_pago = p_id_transaccion_pago) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Pago ya registrado';
  END IF;

  -- Créditos del paquete
  SELECT cantidad_creditos INTO v_creditos
  FROM PAQUETE_CREDITOS
  WHERE id_paquete = p_id_paquete;

  IF v_creditos IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Paquete no existe';
  END IF;

  -- Tipos de referencia usados: COMPRA y AJUSTE
  SELECT id_tipo_referencia
  INTO v_id_tiporef_compra
  FROM TIPO_REFERENCIA
  WHERE nombre = 'COMPRA'
  LIMIT 1;

  IF v_id_tiporef_compra IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_REFERENCIA COMPRA no existe';
  END IF;

  SELECT id_tipo_referencia
  INTO v_id_tiporef_ajuste
  FROM TIPO_REFERENCIA
  WHERE nombre = 'AJUSTE'
  LIMIT 1;

  IF v_id_tiporef_ajuste IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_REFERENCIA AJUSTE no existe';
  END IF;

  -- Tipo de movimiento principal: RECARGA
  SET v_id_tipo_mov_recarga = fn_get_tipo_mov('RECARGA');
  IF v_id_tipo_mov_recarga IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO RECARGA no existe';
  END IF;

  START TRANSACTION;

    -- Asegurar billetera
    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (p_id_usuario, 'ACTIVA', 0, 0.00, NULL);

    -- Registrar la compra como APROBADA
    INSERT INTO COMPRA_CREDITOS (id_usuario, id_paquete, monto_bs, estado, id_transaccion_pago)
    SELECT p_id_usuario, p_id_paquete, precio_bs, 'APROBADO', p_id_transaccion_pago
    FROM PAQUETE_CREDITOS
    WHERE id_paquete = p_id_paquete;

    SET v_id_compra = LAST_INSERT_ID();

    -- Movimiento de RECARGA normal
    INSERT INTO MOVIMIENTO_CREDITOS
      (id_usuario, id_tipo_movimiento, id_tipo_referencia,
       cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
    VALUES
      (p_id_usuario, v_id_tipo_mov_recarga, v_id_tiporef_compra,
       v_creditos, 'Recarga por compra de paquete', 0, 0, v_id_compra);

    -- Total de compras APROBADAS del usuario (después de esta)
    SELECT COUNT(*)
    INTO v_total_compras
    FROM COMPRA_CREDITOS
    WHERE id_usuario = p_id_usuario
      AND estado = 'APROBADO';

    -- BONO 1: primera compra de créditos
    IF v_total_compras = 1 THEN
      SET v_mov_bono_primera = fn_get_tipo_mov('BONO_PRIMERA_COMPRA');

      IF v_mov_bono_primera IS NULL THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO BONO_PRIMERA_COMPRA no existe';
      END IF;

      -- cantidad de bono para la primera compra (ajústalo a tu gusto)
      SET v_monto_bono = 10;

      INSERT INTO MOVIMIENTO_CREDITOS
        (id_usuario, id_tipo_movimiento, id_tipo_referencia,
         cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
      VALUES
        (p_id_usuario, v_mov_bono_primera, v_id_tiporef_ajuste,
         v_monto_bono,
         'Bono por primera compra de créditos',
         0, 0, v_id_compra);
    END IF;

    -- BONO 2: fidelidad por 5, 10 y 25 compras de créditos
    IF v_total_compras IN (5, 10, 25) THEN
      SET v_mov_bono_frec = fn_get_tipo_mov('BONO_RECOMPRAS');

      IF v_mov_bono_frec IS NULL THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO BONO_RECOMPRAS no existe';
      END IF;

      -- Monto según el hito alcanzado
      IF v_total_compras = 5 THEN
        SET v_monto_bono = 20;
      ELSEIF v_total_compras = 10 THEN
        SET v_monto_bono = 40;
      ELSEIF v_total_compras = 25 THEN
        SET v_monto_bono = 100;
      END IF;

      INSERT INTO MOVIMIENTO_CREDITOS
        (id_usuario, id_tipo_movimiento, id_tipo_referencia,
         cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
      VALUES
        (p_id_usuario, v_mov_bono_frec, v_id_tiporef_ajuste,
         v_monto_bono,
         CONCAT('Bono por ', v_total_compras, ' compras de créditos'),
         0, 0, v_id_compra);
    END IF;

  COMMIT;
END$$

DELIMITER ;

/*Flujo completo de aprobación de compra de créditos:
Valida usuario y paquete.
Verifica que el id_transaccion_pago no esté repetido.
Inserta la billetera si no existe.
Inserta la compra como APROBADO con el precio del paquete.
Obtiene el tipo de movimiento RECARGA.
Inserta un MOVIMIENTO_CREDITOS por la cantidad de créditos del paquete.*/
USE CREDITOS_VERDES2;

DROP PROCEDURE IF EXISTS sp_realizar_intercambio;
DELIMITER $$

CREATE PROCEDURE sp_realizar_intercambio(
  IN p_id_comprador INT,
  IN p_id_publicacion INT,
  IN p_creditos BIGINT
)
BEGIN
  DECLARE v_id_vendedor    INT;
  DECLARE v_valor_creditos BIGINT;
  DECLARE v_creditos_tx    BIGINT;
  DECLARE v_id_tx          INT;
  DECLARE v_mov_in         INT;
  DECLARE v_mov_out        INT;
  DECLARE v_saldo_comp     BIGINT;
  DECLARE v_estado_pub     VARCHAR(20);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- 1) Obtener vendedor, valor y estado de la publicación (y bloquearla)
  SELECT id_usuario, valor_creditos, estado
    INTO v_id_vendedor, v_valor_creditos, v_estado_pub
  FROM PUBLICACION
  WHERE id_publicacion = p_id_publicacion
  FOR UPDATE;

  IF v_id_vendedor IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Publicacion no existe';
  END IF;

  -- Solo se puede intercambiar si esta PUBLICADA
  IF UPPER(v_estado_pub) <> 'PUBLICADA' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La publicacion no esta disponible para intercambio';
  END IF;

  IF p_id_comprador = v_id_vendedor THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No puedes intercambiar con tu propia publicacion';
  END IF;

  -- 2) Validar valor de la publicacion
  IF v_valor_creditos IS NULL OR v_valor_creditos <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La publicacion no tiene un valor de creditos valido';
  END IF;

  -- 3) Creditos que realmente usara la transaccion
  SET v_creditos_tx = v_valor_creditos;

  -- Validar que lo que mande el backend coincida (defensa extra)
  IF p_creditos IS NOT NULL AND p_creditos <> v_creditos_tx THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La cantidad de creditos debe coincidir con el valor de la publicacion';
  END IF;

  START TRANSACTION;

    -- 4) Asegurar billeteras
    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (p_id_comprador, 'ACTIVA', 0, 0.00, NULL);

    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (v_id_vendedor, 'ACTIVA', 0, 0.00, NULL);

    -- 5) Verificar saldo del comprador
    SELECT saldo_creditos
      INTO v_saldo_comp
    FROM BILLETERA
    WHERE id_usuario = p_id_comprador
    FOR UPDATE;

    IF v_saldo_comp < v_creditos_tx THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Saldo insuficiente';
    END IF;

    -- 6) Crear la transaccion
    INSERT INTO TRANSACCION (id_comprador, id_vendedor, id_publicacion, cantidad_creditos, estado)
    VALUES (p_id_comprador, v_id_vendedor, p_id_publicacion, v_creditos_tx, 'ACEPTADA');

    SET v_id_tx = LAST_INSERT_ID();

    -- 7) Tipos de movimiento de intercambio
    SET v_mov_in  = fn_get_tipo_mov('INTERCAMBIO_IN');
    SET v_mov_out = fn_get_tipo_mov('INTERCAMBIO_OUT');

    IF v_mov_in IS NULL OR v_mov_out IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Tipos de movimiento de intercambio no configurados';
    END IF;

    -- 8) Movimientos de creditos: comprador (OUT) y vendedor (IN)
    INSERT INTO MOVIMIENTO_CREDITOS
      (id_usuario, id_tipo_movimiento, id_tipo_referencia,
       cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
    VALUES
      -- Comprador: egreso
      (
        p_id_comprador,
        v_mov_out,
        (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='TRANSACCION' LIMIT 1),
        v_creditos_tx,
        CONCAT('Pago por transaccion #', v_id_tx),
        0, 0, v_id_tx
      ),
      -- Vendedor: ingreso
      (
        v_id_vendedor,
        v_mov_in,
        (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='TRANSACCION' LIMIT 1),
        v_creditos_tx,
        CONCAT('Credito recibido por transaccion #', v_id_tx),
        0, 0, v_id_tx
      );

    -- 9) Bitacora de intercambio
    INSERT INTO BITACORA_INTERCAMBIO
      (id_transaccion, id_usuario_origen, id_usuario_destino, cantidad_creditos, descripcion)
    VALUES
      (v_id_tx, p_id_comprador, v_id_vendedor, v_creditos_tx, 'Intercambio realizado');

    -- 10) Impacto ambiental
    CALL sp_calcular_e_insertar_impacto(v_id_tx);

    -- 11) Marcar la publicacion como AGOTADA
    UPDATE PUBLICACION
    SET estado = 'AGOTADA'
    WHERE id_publicacion = p_id_publicacion;

  COMMIT;
END$$

DELIMITER ;

/*Genera un reporte agregado en la tabla REPORTE_IMPACTO:
Suma CO₂, agua, energía, número de transacciones y usuarios activos,
para un período y opcionalmente un usuario.
Borra el reporte previo del mismo período/tipo/usuario.
Inserta el nuevo resumen.*/
DROP PROCEDURE IF EXISTS sp_generar_reporte_impacto;
DELIMITER $$
CREATE PROCEDURE sp_generar_reporte_impacto(
  IN p_id_tipo_reporte INT,
  IN p_id_periodo INT,
  IN p_id_usuario INT
)
BEGIN
  DECLARE v_total_co2 DECIMAL(12,6);
  DECLARE v_total_ag  DECIMAL(12,6);
  DECLARE v_total_en  DECIMAL(12,6);
  DECLARE v_total_tx  BIGINT;
  DECLARE v_total_users BIGINT;

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

  DELETE FROM REPORTE_IMPACTO
  WHERE id_tipo_reporte = p_id_tipo_reporte
    AND id_periodo = p_id_periodo
    AND ( (p_id_usuario IS NULL AND id_usuario IS NULL) OR id_usuario = p_id_usuario );

  INSERT INTO REPORTE_IMPACTO
    (id_usuario, id_tipo_reporte, id_periodo,
     total_co2_ahorrado, total_agua_ahorrada, total_energia_ahorrada,
     total_transacciones, total_usuarios_activos)
  VALUES
    (p_id_usuario, p_id_tipo_reporte, p_id_periodo,
     v_total_co2, v_total_ag, v_total_en, v_total_tx, v_total_users);
END$$
DELIMITER ;

/*Registra una actividad sostenible y otorga un bono de créditos:
Inserta la actividad en ACTIVIDAD_SOSTENIBLE.
Se asegura de que el usuario tenga billetera.
Obtiene tipo de movimiento BONO_ACTIVIDAD.
Inserta un MOVIMIENTO_CREDITOS positivo (créditos_otorgados).*/
ALTER TABLE ACTIVIDAD_SOSTENIBLE
  ADD COLUMN estado ENUM('PENDIENTE','APROBADA','RECHAZADA')
    NOT NULL DEFAULT 'PENDIENTE'
    AFTER creditos_otorgados,
  ADD COLUMN aprobado_en DATETIME NULL
    AFTER estado;

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
  INSERT INTO ACTIVIDAD_SOSTENIBLE (
    id_usuario,
    id_tipo_actividad,
    descripcion,
    creditos_otorgados,
    evidencia_url,
    estado
  )
  VALUES (
    p_id_usuario,
    p_id_tipo_actividad,
    p_descripcion,
    p_creditos_otorgados,
    p_evidencia_url,
    'PENDIENTE'
  );
END$$

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_aprobar_actividad_sostenible;
DELIMITER $$

CREATE PROCEDURE sp_aprobar_actividad_sostenible(
  IN p_id_actividad INT,
  IN p_id_admin INT     -- por ahora solo para futura auditoría
)
BEGIN
  DECLARE v_id_usuario INT;
  DECLARE v_creditos   INT;
  DECLARE v_estado     ENUM('PENDIENTE','APROBADA','RECHAZADA');
  DECLARE v_mov_bono   INT;
  DECLARE v_id_tiporef INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- Obtener datos de la actividad
  SELECT id_usuario, creditos_otorgados, estado
    INTO v_id_usuario, v_creditos, v_estado
  FROM ACTIVIDAD_SOSTENIBLE
  WHERE id_actividad = p_id_actividad
  FOR UPDATE;

  IF v_id_usuario IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Actividad no existe';
  END IF;

  IF v_estado <> 'PENDIENTE' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo se pueden aprobar actividades en estado PENDIENTE';
  END IF;

  -- Tipo de movimiento BONO_ACTIVIDAD
  SET v_mov_bono = fn_get_tipo_mov('BONO_ACTIVIDAD');
  IF v_mov_bono IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO BONO_ACTIVIDAD no existe';
  END IF;

  -- Tipo de referencia ACTIVIDAD_SOSTENIBLE (ya lo tienes en tu seed)
  SELECT id_tipo_referencia
    INTO v_id_tiporef
  FROM TIPO_REFERENCIA
  WHERE nombre = 'ACTIVIDAD_SOSTENIBLE'
  LIMIT 1;

  IF v_id_tiporef IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_REFERENCIA ACTIVIDAD_SOSTENIBLE no existe';
  END IF;

  START TRANSACTION;

    -- Asegurar billetera
    INSERT IGNORE INTO BILLETERA (
      id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria
    )
    VALUES (v_id_usuario, 'ACTIVA', 0, 0.00, NULL);

    -- Movimiento de bono por actividad aprobada
    INSERT INTO MOVIMIENTO_CREDITOS (
      id_usuario,
      id_tipo_movimiento,
      id_tipo_referencia,
      cantidad,
      descripcion,
      saldo_anterior,
      saldo_posterior,
      id_referencia
    )
    VALUES (
      v_id_usuario,
      v_mov_bono,
      v_id_tiporef,
      v_creditos,
      CONCAT('Bono por actividad sostenible #', p_id_actividad),
      0, 0,
      p_id_actividad
    );

    -- Marcar la actividad como APROBADA
    UPDATE ACTIVIDAD_SOSTENIBLE
    SET estado      = 'APROBADA',
        aprobado_en = NOW()
    WHERE id_actividad = p_id_actividad;

  COMMIT;
END$$

DELIMITER ;
DROP PROCEDURE IF EXISTS sp_rechazar_actividad_sostenible;
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_rechazar_actividad_sostenible;
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_rechazar_actividad_sostenible;
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_rechazar_actividad_sostenible;
DELIMITER $$

CREATE PROCEDURE sp_rechazar_actividad_sostenible(
  IN p_id_actividad INT,
  IN p_id_admin INT
)
BEGIN
  UPDATE ACTIVIDAD_SOSTENIBLE
  SET estado = 'RECHAZADA'
  WHERE id_actividad = p_id_actividad
    AND estado = 'PENDIENTE';

  IF ROW_COUNT() = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Actividad no existe o no está en estado PENDIENTE';
  END IF;
END $$

DELIMITER ;



/*sp_obtener_historial_usuario
Devuelve un historial mixto de:
Movimientos de créditos
Transacciones del usuario (como comprador o vendedor)
En una sola consulta (con UNION ALL).*/
DROP PROCEDURE IF EXISTS sp_obtener_historial_usuario;
DELIMITER $$
CREATE PROCEDURE sp_obtener_historial_usuario(IN p_id_usuario INT)
BEGIN
  SELECT 'MOVIMIENTO' AS tipo, m.id_movimiento AS id,
         m.id_usuario, tm.nombre AS tipo_movimiento, tr.nombre AS tipo_referencia,
         m.cantidad, m.saldo_anterior, m.saldo_posterior, m.id_referencia
  FROM MOVIMIENTO_CREDITOS m
  JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_movimiento = m.id_tipo_movimiento
  JOIN TIPO_REFERENCIA tr ON tr.id_tipo_referencia = m.id_tipo_referencia
  WHERE m.id_usuario = p_id_usuario

  UNION ALL

  SELECT 'TRANSACCION' AS tipo, t.id_transaccion AS id,
         p_id_usuario AS id_usuario, 'N/A' AS tipo_movimiento, 'TRANSACCION' AS tipo_referencia,
         t.cantidad_creditos AS cantidad, NULL AS saldo_anterior, NULL AS saldo_posterior, t.id_publicacion AS id_referencia
  FROM TRANSACCION t
  WHERE t.id_comprador = p_id_usuario OR t.id_vendedor = p_id_usuario;
END$$
DELIMITER ;

/*Calcula y guarda el impacto ambiental de una transacción:
Obtiene comprador, vendedor, publicación y créditos usados.
Lee categoría y valor_creditos de la publicación.
Calcula cuántas “unidades” representa la transacción (créditos / valor_pub).
Busca equivalencias de impacto en EQUIVALENCIA_IMPACTO.
Multiplica por las unidades para obtener CO₂, agua, energía.
Toma el último PERIODO.
Inserta el registro en IMPACTO_AMBIENTAL para el comprador.*/
USE CREDITOS_VERDES2;

DROP PROCEDURE IF EXISTS sp_calcular_e_insertar_impacto;
DELIMITER $$

CREATE PROCEDURE sp_calcular_e_insertar_impacto(IN p_id_transaccion INT)
BEGIN
  DECLARE v_id_usuario_c   INT;
  DECLARE v_id_usuario_v   INT;
  DECLARE v_id_publicacion INT;
  DECLARE v_id_categoria   INT;

  DECLARE v_creditos  BIGINT;
  DECLARE v_valor_pub BIGINT;
  DECLARE v_unidades  DECIMAL(18,6);

  DECLARE v_co2_unit     DECIMAL(12,6) DEFAULT 0;
  DECLARE v_agua_unit    DECIMAL(12,6) DEFAULT 0;
  DECLARE v_energia_unit DECIMAL(12,6) DEFAULT 0;

  DECLARE v_co2     DECIMAL(12,6) DEFAULT 0;
  DECLARE v_agua    DECIMAL(12,6) DEFAULT 0;
  DECLARE v_energia DECIMAL(12,6) DEFAULT 0;

  DECLARE v_id_periodo INT;

  /* Si el SELECT de equivalencias no encuentra fila,
     mantenemos 0,0,0 y NO lanzamos error */
  DECLARE CONTINUE HANDLER FOR NOT FOUND
  BEGIN
    SET v_co2_unit = 0;
    SET v_agua_unit = 0;
    SET v_energia_unit = 0;
  END;

  -- 1) Obtener datos básicos de la transacción
  SELECT id_comprador, id_vendedor, id_publicacion, cantidad_creditos
    INTO v_id_usuario_c, v_id_usuario_v, v_id_publicacion, v_creditos
  FROM TRANSACCION
  WHERE id_transaccion = p_id_transaccion;

  IF v_id_usuario_c IS NULL OR v_id_publicacion IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Transacción no encontrada para cálculo de impacto';
  END IF;

  -- 2) Categoría y valor de la publicación
  SELECT id_categoria, valor_creditos
    INTO v_id_categoria, v_valor_pub
  FROM PUBLICACION
  WHERE id_publicacion = v_id_publicacion;

  -- 3) Unidades “equivalentes” de la transacción
  IF v_valor_pub IS NULL OR v_valor_pub <= 0 THEN
    SET v_unidades = 1;              -- fallback: 1 unidad
  ELSE
    SET v_unidades = v_creditos / v_valor_pub;
  END IF;

  -- 4) Equivalencias de impacto por categoría
  SET v_co2_unit = 0;
  SET v_agua_unit = 0;
  SET v_energia_unit = 0;

  SELECT co2_por_unidad, agua_por_unidad, energia_por_unidad
    INTO v_co2_unit, v_agua_unit, v_energia_unit
  FROM EQUIVALENCIA_IMPACTO
  WHERE id_categoria = v_id_categoria
  LIMIT 1;

  -- 5) Cálculo final (garantizado ≠ NULL)
  SET v_co2     = IFNULL(v_co2_unit, 0)    * v_unidades;
  SET v_agua    = IFNULL(v_agua_unit, 0)   * v_unidades;
  SET v_energia = IFNULL(v_energia_unit, 0)* v_unidades;

  -- 6) Obtener período (último si no hay otro criterio)
  SELECT id_periodo
    INTO v_id_periodo
  FROM PERIODO
  ORDER BY fecha_inicio DESC, id_periodo DESC
  LIMIT 1;

  IF v_id_periodo IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No hay PERIODO definido para registrar impacto';
  END IF;

  -- 7) Insertar impacto ambiental para el COMPRADOR
  INSERT INTO IMPACTO_AMBIENTAL
    (id_usuario,
     id_transaccion,
     id_categoria,
     co2_ahorrado,
     agua_ahorrada,
     energia_ahorrada,
     id_periodo)
  VALUES
    (v_id_usuario_c,
     p_id_transaccion,
     v_id_categoria,
     v_co2,
     v_agua,
     v_energia,
     v_id_periodo);
END$$

DELIMITER ;


-- 11) TRIGGERS

/*Antes de insertar un MOVIMIENTO_CREDITOS:
Garantiza que el usuario tenga billetera.
Obtiene su saldo actual.
Obtiene si el movimiento es POSITIVO o NEGATIVO.
Calcula saldo_anterior y saldo_posterior.
Si es NEGATIVO y no alcanza el saldo, lanza error.*/
DROP TRIGGER IF EXISTS trg_movcred_before_ins;
DELIMITER $$
CREATE TRIGGER trg_movcred_before_ins
BEFORE INSERT ON MOVIMIENTO_CREDITOS
FOR EACH ROW
BEGIN
  DECLARE v_saldo BIGINT;
  DECLARE v_signo VARCHAR(20);

  SELECT saldo_creditos INTO v_saldo FROM BILLETERA WHERE id_usuario = NEW.id_usuario;
  IF v_saldo IS NULL THEN
    INSERT INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (NEW.id_usuario, 'ACTIVA', 0, 0.00, NULL);
    SET v_saldo = 0;
  END IF;

  SELECT sm.nombre INTO v_signo
  FROM SIGNO_TIPO_MOV sx
  JOIN SIGNO_MOVIMIENTO sm ON sm.id_signo = sx.id_signo
  WHERE sx.id_tipo_movimiento = NEW.id_tipo_movimiento
  LIMIT 1;

  IF v_signo IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de movimiento no tiene signo asociado';
  END IF;

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

/*Después de insertar el movimiento:
Actualiza la BILLETERA con el nuevo saldo_posterior.*/
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

/*Antes de insertar una TRANSACCION:
Llama a fn_verificar_saldo para revisar si el comprador tiene créditos suficientes.
Si no, lanza error.*/
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

/*Después de insertar una TRANSACCION:
Inserta un registro en BITACORA_INTERCAMBIO (“Transacción creada”).*/
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

/*Después de actualizar una TRANSACCION:
Si cambió de estado, inserta en BITACORA_INTERCAMBIO un historial del cambio*/
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

/*Cuando se crea una PUBLICACION:
Suma los créditos de promociones ACTIVAS asociadas a esa publicación.
Si hay bono:
crea billetera si no existe
obtiene tipo BONO_PUBLICACION
inserta MOVIMIENTO_CREDITOS positivo con el bono.*/
DROP TRIGGER IF EXISTS trg_publicacion_after_ins_bono;
DELIMITER $$
CREATE TRIGGER trg_publicacion_after_ins_bono
AFTER INSERT ON PUBLICACION
FOR EACH ROW
BEGIN
  DECLARE v_bono_total BIGINT DEFAULT 0;
  DECLARE v_mov_bono INT;

  SELECT IFNULL(SUM(p.creditos_otorgados),0) INTO v_bono_total
  FROM PROMOCION_PUBLICACION pp
  JOIN PROMOCION p ON p.id_promocion = pp.id_promocion
  WHERE pp.id_publicacion = NEW.id_publicacion
    AND p.estado = 'ACTIVA'
    AND NOW() BETWEEN p.fecha_inicio AND p.fecha_fin;

  IF v_bono_total > 0 THEN
    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (NEW.id_usuario, 'ACTIVA', 0, 0.00, NULL);

    SET v_mov_bono = fn_get_tipo_mov('BONO_PUBLICACION');
    IF v_mov_bono IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO BONO_PUBLICACION no existe';
    END IF;

    INSERT INTO MOVIMIENTO_CREDITOS
      (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
    VALUES
      (NEW.id_usuario, v_mov_bono,
       (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='AJUSTE' LIMIT 1),
       v_bono_total, CONCAT('Bono por publicación #', NEW.id_publicacion), 0, 0, NEW.id_publicacion);
  END IF;
END$$
DELIMITER ;

-- NUEVO: bono al VINCULAR promoción a publicación (flujo real común)
DROP TRIGGER IF EXISTS trg_promopub_after_ins_bono;
DELIMITER $$
CREATE TRIGGER trg_promopub_after_ins_bono
AFTER INSERT ON PROMOCION_PUBLICACION
FOR EACH ROW
trg: BEGIN
  DECLARE v_id_usuario INT;
  DECLARE v_bono BIGINT;
  DECLARE v_mov_bono INT;

  SELECT p.creditos_otorgados INTO v_bono
  FROM PROMOCION p
  WHERE p.id_promocion = NEW.id_promocion
    AND p.estado = 'ACTIVA'
    AND NOW() BETWEEN p.fecha_inicio AND p.fecha_fin
  LIMIT 1;

  IF v_bono IS NULL OR v_bono <= 0 THEN
    LEAVE trg;
  END IF;

  SELECT id_usuario INTO v_id_usuario
  FROM PUBLICACION
  WHERE id_publicacion = NEW.id_publicacion;

  IF v_id_usuario IS NULL THEN
    LEAVE trg;
  END IF;

  INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
  VALUES (v_id_usuario, 'ACTIVA', 0, 0.00, NULL);

  SET v_mov_bono = fn_get_tipo_mov('BONO_PUBLICACION');
  IF v_mov_bono IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO BONO_PUBLICACION no existe';
  END IF;

  INSERT INTO MOVIMIENTO_CREDITOS
    (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion,
     saldo_anterior, saldo_posterior, id_referencia)
  VALUES
    (v_id_usuario, v_mov_bono,
     (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='AJUSTE' LIMIT 1),
     v_bono, CONCAT('Bono por promo vinculada a publicación #', NEW.id_publicacion),
     0, 0, NEW.id_publicacion);
END trg$$
DELIMITER ;

-- 12) FULLTEXT (buscador)

ALTER TABLE PUBLICACION
  ADD FULLTEXT ft_pub_titulo_desc (titulo, descripcion);

-- 13) SEED FUNCIONAL (deja datos de demo listos)

-- Roles, permisos mínimos (permiso útil para admin si lo usas)
INSERT IGNORE INTO ROL (nombre, descripcion) VALUES
  ('ADMIN','Administrador'),('USUARIO','usuario normal'),('ONG','Organización');

INSERT IGNORE INTO PERMISO (nombre, descripcion) VALUES
  ('GESTION_USUARIOS','CRUD usuarios'),('VER_REPORTES','Acceso a reportes');

INSERT IGNORE INTO ROL_PERMISO
SELECT (SELECT id_rol FROM ROL WHERE nombre='ADMIN'),
       (SELECT id_permiso FROM PERMISO WHERE nombre='GESTION_USUARIOS')
UNION ALL
SELECT (SELECT id_rol FROM ROL WHERE nombre='ADMIN'),
       (SELECT id_permiso FROM PERMISO WHERE nombre='VER_REPORTES');

INSERT IGNORE INTO RESULTADO_ACCESO (nombre, descripcion)
VALUES ('OK','Inicio de sesión correcto'),('FAIL','Credenciales inválidas');

INSERT IGNORE INTO CATEGORIA (nombre, descripcion)
VALUES ('Bicicletas','Movilidad'),('Tecnología','Electrónica');

INSERT IGNORE INTO UNIDAD_MEDIDA (nombre, simbolo)
VALUES ('Unidad','u'),('Kilogramo','kg'),('KilogramoCO2','kgCO2'),('Litro','L'),('kWh','kWh');

INSERT IGNORE INTO UBICACION (direccion, ciudad, provincia, latitud, longitud)
VALUES ('Av. Central 123','La Paz','La Paz',-16.5,-68.15),
       ('Calle 9 #456','Cochabamba','Cochabamba',-17.392,-66.159);

INSERT IGNORE INTO TIPO_PUBLICACION (nombre, descripcion)
VALUES ('PRODUCTO','Publicación de producto'),('SERVICIO','Publicación de servicio');

INSERT IGNORE INTO TIPO_REFERENCIA (nombre) VALUES ('COMPRA'),('TRANSACCION'),('AJUSTE');

INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion) VALUES
  ('RECARGA','Ingreso por compra de créditos'),
  ('INTERCAMBIO_IN','Ingreso por intercambio'),
  ('INTERCAMBIO_OUT','Egreso por intercambio'),
  ('BONO_PUBLICACION','Bono por promo/publicación'),
  ('BONO_ACTIVIDAD','Bono por actividad sostenible');

INSERT IGNORE INTO SIGNO_MOVIMIENTO (nombre) VALUES ('POSITIVO'),('NEGATIVO');

-- Ambos son POSITIVOS: bonos por compras y bienvenida
USE CREDITOS_VERDES2;

-- 1) Borramos las relaciones de signo actuales
TRUNCATE TABLE SIGNO_TIPO_MOV;

-- 2) Volvemos a crearlas bien

-- POSITIVOS (suman créditos)
INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm ON sm.nombre = 'POSITIVO'
WHERE tm.nombre IN (
  'RECARGA',
  'INTERCAMBIO_IN',
  'BONO_PUBLICACION',
  'BONO_ACTIVIDAD',
  'BONO_PRIMERA_COMPRA',
  'BONO_RECOMPRAS',
  'BONO_BIENVENIDA',
  'BONO_METAS_LOGRO',
  'RECOMPENSA_REFERIDO',
  'BONO_EVENTO',
  'BONO_TEMPORADA',
  'CREDITO_DE_PROMOCION',
  'AJUSTE_ADMIN_POSITIVO',
  'REVERSO_INTERCAMBIO'
);

-- NEGATIVOS (restan créditos)
INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm ON sm.nombre = 'NEGATIVO'
WHERE tm.nombre IN (
  'INTERCAMBIO_OUT',
  'AJUSTE_ADMIN_NEGATIVO',
  'REVERSO_RECARGA',
  'PENALIZACION'
);

INSERT IGNORE INTO TIPO_PROMOCION (nombre, descripcion) VALUES ('LANZAMIENTO','Promoción de lanzamiento');
INSERT IGNORE INTO TIPO_LOGRO (nombre, descripcion) VALUES ('PRIMERA_VENTA','Primer intercambio exitoso');
INSERT IGNORE INTO TIPO_ACTIVIDAD (nombre, descripcion) VALUES ('RECICLAJE','Reciclaje domiciliario');
INSERT IGNORE INTO UBICACION_PUBLICIDAD (nombre, descripcion, precio_base) VALUES ('HOME_TOP','Banner cabecera', 120.00);
INSERT IGNORE INTO TIPO_REPORTE (nombre, descripcion) VALUES ('MENSUAL','KPIs mensuales');

INSERT IGNORE INTO PERIODO (nombre, descripcion, fecha_inicio, fecha_fin)
VALUES ('2025-11','Noviembre 2025','2025-11-01','2025-11-30');

INSERT IGNORE INTO DIMENSION_AMBIENTAL (codigo, nombre, unidad_base, descripcion)
VALUES ('CO2','Dióxido de carbono','kg','CO2 evitado'),
       ('AGUA','Agua ahorrada','L','Litros ahorrados'),
       ('ENERGIA','Energía ahorrada','kWh','Energía');

-- Usuarios demo
INSERT IGNORE INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='USUARIO'),'ACTIVO','Ana','Rojas','ana@demo.com','70000001','/p/ana'),
  ((SELECT id_rol FROM ROL WHERE nombre='USUARIO'),'ACTIVO','Luis','Quispe','luis@demo.com','70000002','/p/luis');

INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
SELECT id_usuario, 'ACTIVA', 0, 0.00, NULL FROM USUARIO;

-- Producto y servicio
INSERT IGNORE INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
       'Bici Urbana', 'Marco aluminio 21v', 1200.00, 14.5;

INSERT IGNORE INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
SELECT (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
       'ACTIVO', 'Mantenimiento PC', 'Limpieza y optimización', 90.00, 60;

-- Publicación de producto (Luis)
INSERT IGNORE INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='luis@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Bicicleta urbana aluminio',
  'Bici urbana ligera, marco de aluminio, 21 velocidades.',
  300, 'https://img/bici1.jpg';

INSERT IGNORE INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bicicleta urbana aluminio'),
  (SELECT id_producto FROM PRODUCTO WHERE nombre='Bici Urbana'),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- Publicación de servicio (Luis)
INSERT IGNORE INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='luis@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Mantenimiento y limpieza de PC',
  'Servicio técnico: limpieza, cambio de pasta térmica y pruebas.',
  120, 'https://img/serv1.jpg';

INSERT IGNORE INTO PUBLICACION_SERVICIO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento y limpieza de PC'),
  (SELECT id_servicio FROM SERVICIO WHERE nombre='Mantenimiento PC'),
  'L-V 09:00-18:00';

-- Promo activa y vinculación (dispara bono)
INSERT IGNORE INTO PROMOCION (id_tipo_promocion, nombre, descripcion, creditos_otorgados, fecha_inicio, fecha_fin, estado)
SELECT
  (SELECT id_tipo_promocion FROM TIPO_PROMOCION WHERE nombre='LANZAMIENTO'),
  'Promo Bicis', 'Bono por bicis destacadas', 50,
  NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY, 'ACTIVA';

INSERT IGNORE INTO PROMOCION_PUBLICACION
SELECT
  (SELECT id_promocion FROM PROMOCION WHERE nombre='Promo Bicis'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bicicleta urbana aluminio');

-- Equivalencia de impacto (Bicicletas por unidad)
INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'),
  12.500000, 45.000000, 5.750000;

-- Paquetes (100 y 500 créditos)
INSERT IGNORE INTO PAQUETE_CREDITOS (nombre, cantidad_creditos, precio_bs, activo)
VALUES ('Pack 100', 100, 50.00, TRUE),
       ('Pack 500', 500, 240.00, TRUE);

-- 14) PRUEBA REAL (deja datos consistentes para demo)

-- 14.1 Compra de créditos (Ana RECARGA 500)
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-DEMO-001'
);

-- 14.2 Intercambio: Ana compra la bicicleta (300 créditos)
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bicicleta urbana aluminio'),
  300
);

-- Completar transacción (bitácora AFTER UPDATE)
SET @id_last_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION
SET estado = 'COMPLETADA'
WHERE id_transaccion = @id_last_tx;

-- 14.3 Actividad sostenible (bono)
CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó 5kg de papel para reciclaje', 15,
  'https://evidencias/reciclaje1.jpg'
);

-- 14.4 Reporte mensual global + ranking + historial
CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO WHERE nombre='2025-11'),
  NULL
);

-- Crear sp_obtener_ranking_usuarios

DROP PROCEDURE IF EXISTS sp_obtener_ranking_usuarios;
DELIMITER $$
CREATE PROCEDURE sp_obtener_ranking_usuarios(
  IN p_id_periodo INT,   -- puede ser NULL para tomar el último
  IN p_limit INT          -- top N (si es NULL, usa 10)
)
BEGIN
  DECLARE v_periodo INT;
  DECLARE v_limit INT;

  -- Determinar límite (valor por defecto si viene NULL)
  SET v_limit = IFNULL(p_limit, 10);

  -- Elegir período: el recibido o el último existente
  SET v_periodo = p_id_periodo;
  IF v_periodo IS NULL THEN
    SELECT id_periodo
      INTO v_periodo
    FROM PERIODO
    ORDER BY fecha_inicio DESC, id_periodo DESC
    LIMIT 1;
  END IF;

  -- Ranking de usuarios por CO2
  SELECT
      ia.id_usuario,
      SUM(ia.co2_ahorrado)     AS co2_total,
      SUM(ia.agua_ahorrada)    AS agua_total,
      SUM(ia.energia_ahorrada) AS energia_total,
      COUNT(DISTINCT ia.id_transaccion) AS transacciones
  FROM IMPACTO_AMBIENTAL ia
  WHERE ia.id_periodo = v_periodo
  GROUP BY ia.id_usuario
  ORDER BY co2_total DESC
  LIMIT v_limit;
END$$
DELIMITER ;

-- Ranking top 10 por CO2
CALL sp_obtener_ranking_usuarios(
  (SELECT id_periodo FROM PERIODO WHERE nombre='2025-11'), 10
);

-- Historial de Ana
CALL sp_obtener_historial_usuario(
  (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com')
);

-- 14.5 FULLTEXT sanity
SELECT id_publicacion, titulo
FROM PUBLICACION
WHERE MATCH(titulo, descripcion) AGAINST ('Bicicleta' IN NATURAL LANGUAGE MODE);

-- 14.6 Saldos
SELECT u.correo, b.saldo_creditos
FROM USUARIO u LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN ('ana@demo.com','luis@demo.com');

SELECT '✔ Esquema + triggers + seed + prueba listos.' AS status;

-- A) CAMPOS DE FECHA MÍNIMOS PARA REPORTES

ALTER TABLE PUBLICACION
  ADD COLUMN creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE COMPRA_CREDITOS
  ADD COLUMN creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE MOVIMIENTO_CREDITOS
  ADD COLUMN creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE TRANSACCION
  ADD COLUMN creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE ACTIVIDAD_SOSTENIBLE
  ADD COLUMN creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Índices sobre fechas para que los reportes no sean lentos

CREATE INDEX ix_pub_creado_en       ON PUBLICACION(creado_en);
CREATE INDEX ix_compra_creado_en    ON COMPRA_CREDITOS(creado_en);
CREATE INDEX ix_mov_creado_en       ON MOVIMIENTO_CREDITOS(creado_en);
CREATE INDEX ix_tx_creado_en        ON TRANSACCION(creado_en);
CREATE INDEX ix_actsost_creado_en   ON ACTIVIDAD_SOSTENIBLE(creado_en);

-- B1) vw_usuario_actividad
--    - Todas las acciones que consideramos "actividad"

DROP VIEW IF EXISTS vw_usuario_actividad;
CREATE VIEW vw_usuario_actividad AS
SELECT u.id_usuario,
       u.nombre,
       u.correo,
       b.fecha AS fecha_actividad,
       'LOGIN' AS tipo_actividad
FROM USUARIO u
JOIN BITACORA_ACCESO b ON b.id_usuario = u.id_usuario

UNION ALL

SELECT u.id_usuario,
       u.nombre,
       u.correo,
       p.creado_en AS fecha_actividad,
       'PUBLICACION' AS tipo_actividad
FROM USUARIO u
JOIN PUBLICACION p ON p.id_usuario = u.id_usuario

UNION ALL

SELECT u.id_usuario,
       u.nombre,
       u.correo,
       t.creado_en AS fecha_actividad,
       'TX_COMPRADOR' AS tipo_actividad
FROM USUARIO u
JOIN TRANSACCION t ON t.id_comprador = u.id_usuario

UNION ALL

SELECT u.id_usuario,
       u.nombre,
       u.correo,
       t.creado_en AS fecha_actividad,
       'TX_VENDEDOR' AS tipo_actividad
FROM USUARIO u
JOIN TRANSACCION t ON t.id_vendedor = u.id_usuario;

-- B2) vw_mov_creditos_signo
--    - Movimiento + signo POSITIVO/NEGATIVO ya resuelto

DROP VIEW IF EXISTS vw_mov_creditos_signo;
CREATE VIEW vw_mov_creditos_signo AS
SELECT m.*,
       sm.nombre AS signo_mov
FROM MOVIMIENTO_CREDITOS m
JOIN SIGNO_TIPO_MOV sx
  ON sx.id_tipo_movimiento = m.id_tipo_movimiento
JOIN SIGNO_MOVIMIENTO sm
  ON sm.id_signo = sx.id_signo;

-- B3) vw_transacciones_categoria
--    - Transacción + categoría de la publicación

DROP VIEW IF EXISTS vw_transacciones_categoria;
CREATE VIEW vw_transacciones_categoria AS
SELECT t.id_transaccion,
       t.id_comprador,
       t.id_vendedor,
       t.id_publicacion,
       t.cantidad_creditos,
       t.estado,
       t.creado_en,
       c.id_categoria,
       c.nombre AS categoria
FROM TRANSACCION t
JOIN PUBLICACION p
  ON p.id_publicacion = t.id_publicacion
JOIN CATEGORIA c
  ON c.id_categoria = p.id_categoria;

-- C1) Usuarios activos entre p_desde y p_hasta

DROP PROCEDURE IF EXISTS sp_rep_usuarios_activos;
DELIMITER $$
CREATE PROCEDURE sp_rep_usuarios_activos(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  SELECT id_usuario,
         nombre,
         correo,
         MIN(fecha_actividad) AS primera_actividad,
         MAX(fecha_actividad) AS ultima_actividad,
         COUNT(*) AS total_acciones
  FROM vw_usuario_actividad
  WHERE fecha_actividad BETWEEN p_desde AND p_hasta
  GROUP BY id_usuario, nombre, correo
  ORDER BY ultima_actividad DESC;
END$$
DELIMITER ;

-- C2) Usuarios abandonados (sin actividad en rango)

DROP PROCEDURE IF EXISTS sp_rep_usuarios_abandonados;
DELIMITER $$
CREATE PROCEDURE sp_rep_usuarios_abandonados(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  SELECT
    u.id_usuario,
    u.nombre,
    u.correo,
    u.estado
  FROM USUARIO u
  LEFT JOIN (
    SELECT DISTINCT id_usuario
    FROM vw_usuario_actividad
    WHERE fecha_actividad BETWEEN p_desde AND p_hasta
  ) ua
    ON ua.id_usuario = u.id_usuario
  WHERE ua.id_usuario IS NULL   -- no tuvo actividad en el rango
    AND u.estado = 'ACTIVO';
END$$
DELIMITER ;

-- C3) Ingresos por venta de créditos

DROP PROCEDURE IF EXISTS sp_rep_ingresos_creditos;
DELIMITER $$
CREATE PROCEDURE sp_rep_ingresos_creditos(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  SELECT
    DATE(c.creado_en) AS fecha,
    SUM(p.cantidad_creditos) AS total_creditos,
    SUM(c.monto_bs)          AS total_bs
  FROM COMPRA_CREDITOS c
  JOIN PAQUETE_CREDITOS p
    ON p.id_paquete = c.id_paquete
  WHERE c.estado = 'APROBADO'
    AND c.creado_en BETWEEN p_desde AND p_hasta
  GROUP BY DATE(c.creado_en)
  ORDER BY fecha;
END$$
DELIMITER ;

-- C5) Intercambios por categoría

DROP PROCEDURE IF EXISTS sp_rep_intercambios_por_categoria;
DELIMITER $$
CREATE PROCEDURE sp_rep_intercambios_por_categoria(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  SELECT categoria,
         COUNT(id_transaccion) AS total_intercambios
  FROM vw_transacciones_categoria
  WHERE creado_en BETWEEN p_desde AND p_hasta
    AND estado IN ('ACEPTADA','COMPLETADA')
  GROUP BY categoria
  ORDER BY total_intercambios DESC;
END$$
DELIMITER ;

-- C6) Publicaciones vs intercambios por categoría

DROP PROCEDURE IF EXISTS sp_rep_publicaciones_vs_intercambios;
DELIMITER $$
CREATE PROCEDURE sp_rep_publicaciones_vs_intercambios(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  -- Publicaciones por categoría en el rango
  SELECT
    pub.categoria,
    pub.publicaciones,
    COALESCE(tx.intercambios, 0) AS intercambios,
    CASE
      WHEN pub.publicaciones = 0 THEN NULL
      ELSE COALESCE(tx.intercambios, 0) / pub.publicaciones
    END AS ratio_intercambio
  FROM (
    SELECT
      c.nombre AS categoria,
      COUNT(p.id_publicacion) AS publicaciones
    FROM PUBLICACION p
    JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
    WHERE p.creado_en BETWEEN p_desde AND p_hasta
    GROUP BY c.nombre
  ) AS pub
  LEFT JOIN (
    SELECT
      categoria,
      COUNT(id_transaccion) AS intercambios
    FROM vw_transacciones_categoria
    WHERE creado_en BETWEEN p_desde AND p_hasta
      AND estado IN ('ACEPTADA','COMPLETADA')
    GROUP BY categoria
  ) AS tx
    ON tx.categoria = pub.categoria

  UNION ALL

  -- Categorías con intercambios pero sin publicaciones en el rango
  SELECT
    tx_only.categoria,
    0 AS publicaciones,
    tx_only.intercambios,
    NULL AS ratio_intercambio
  FROM (
    SELECT
      categoria,
      COUNT(id_transaccion) AS intercambios
    FROM vw_transacciones_categoria
    WHERE creado_en BETWEEN p_desde AND p_hasta
      AND estado IN ('ACEPTADA','COMPLETADA')
    GROUP BY categoria
  ) AS tx_only
  LEFT JOIN (
    SELECT DISTINCT c.nombre AS categoria
    FROM PUBLICACION p
    JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
    WHERE p.creado_en BETWEEN p_desde AND p_hasta
  ) AS pub_exist
    ON pub_exist.categoria = tx_only.categoria
  WHERE pub_exist.categoria IS NULL;
END$$
DELIMITER ;

-- C7) Impacto acumulado por período (lectura directa)
--     Asume que ya corriste sp_generar_reporte_impacto antes

DROP PROCEDURE IF EXISTS sp_generar_reporte_impacto;
DELIMITER $$

CREATE PROCEDURE sp_generar_reporte_impacto(
  IN p_id_tipo_reporte INT,
  IN p_id_periodo      INT,   -- NULL = usar último período
  IN p_id_usuario      INT    -- NULL = global, no NULL = por usuario
)
BEGIN
  DECLARE v_total_co2      DECIMAL(18,6) DEFAULT 0;
  DECLARE v_total_ag       DECIMAL(18,6) DEFAULT 0;
  DECLARE v_total_en       DECIMAL(18,6) DEFAULT 0;
  DECLARE v_total_tx       BIGINT        DEFAULT 0;
  DECLARE v_total_users    BIGINT        DEFAULT 0;
  DECLARE v_id_reporte_new INT;
  DECLARE v_periodo        INT;

  -- 0) Resolver período: argumento o último PERIODO
  SET v_periodo = p_id_periodo;

  IF v_periodo IS NULL THEN
    SELECT id_periodo
      INTO v_periodo
    FROM PERIODO
    ORDER BY fecha_inicio DESC, id_periodo DESC
    LIMIT 1;

    IF v_periodo IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No existe ningún PERIODO definido para generar reporte';
    END IF;
  END IF;

  -- 1) Calcular totales desde IMPACTO_AMBIENTAL
  IF p_id_usuario IS NULL THEN
    -- GLOBAL (todos los usuarios)
    SELECT
      IFNULL(SUM(co2_ahorrado), 0),
      IFNULL(SUM(agua_ahorrada), 0),
      IFNULL(SUM(energia_ahorrada), 0),
      COUNT(DISTINCT id_transaccion),
      COUNT(DISTINCT id_usuario)
    INTO
      v_total_co2,
      v_total_ag,
      v_total_en,
      v_total_tx,
      v_total_users
    FROM IMPACTO_AMBIENTAL
    WHERE id_periodo = v_periodo;
  ELSE
    -- SOLO UN USUARIO
    SELECT
      IFNULL(SUM(co2_ahorrado), 0),
      IFNULL(SUM(agua_ahorrada), 0),
      IFNULL(SUM(energia_ahorrada), 0),
      COUNT(DISTINCT id_transaccion),
      COUNT(DISTINCT id_usuario)
    INTO
      v_total_co2,
      v_total_ag,
      v_total_en,
      v_total_tx,
      v_total_users
    FROM IMPACTO_AMBIENTAL
    WHERE id_periodo = v_periodo
      AND id_usuario = p_id_usuario;
  END IF;

  -- 2) Limpiar reporte anterior (si existe)
  DELETE FROM REPORTE_IMPACTO
  WHERE id_tipo_reporte = p_id_tipo_reporte
    AND id_periodo      = v_periodo
    AND (
         (p_id_usuario IS NULL AND id_usuario IS NULL)
         OR id_usuario = p_id_usuario
        );

  -- 3) Insertar nuevo reporte
  INSERT INTO REPORTE_IMPACTO
    (id_usuario, id_tipo_reporte, id_periodo,
     total_co2_ahorrado, total_agua_ahorrada, total_energia_ahorrada,
     total_transacciones, total_usuarios_activos)
  VALUES
    (p_id_usuario, p_id_tipo_reporte, v_periodo,
     v_total_co2, v_total_ag, v_total_en,
     v_total_tx, v_total_users);

  SET v_id_reporte_new = LAST_INSERT_ID();

  -- 4) Devolver el registro insertado
  SELECT *
  FROM   REPORTE_IMPACTO
  WHERE  id_reporte = v_id_reporte_new;
END$$

DELIMITER ;


ALTER TABLE USUARIO
  ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''
  AFTER correo;
  
ALTER TABLE BITACORA_ACCESO
  MODIFY fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP PROCEDURE IF EXISTS sp_rep_creditos_generados_vs_consumidos;

DELIMITER $$
CREATE PROCEDURE sp_rep_creditos_generados_vs_consumidos(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  SELECT
    SUM(
      CASE
        WHEN signo_mov = 'POSITIVO' THEN cantidad
        ELSE 0
      END
    ) AS creditos_generados,
    SUM(
      CASE
        WHEN signo_mov = 'NEGATIVO' THEN cantidad
        ELSE 0
      END
    ) AS creditos_consumidos
  FROM vw_mov_creditos_signo
  WHERE creado_en BETWEEN p_desde AND p_hasta;
END$$
DELIMITER ;

USE CREDITOS_VERDES2;

-- TABLA: SUSCRIPCION_PREMIUM
CREATE TABLE IF NOT EXISTS SUSCRIPCION_PREMIUM (
  id_suscripcion INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_fin DATETIME NULL,
  estado ENUM('ACTIVA','CANCELADA','VENCIDA') NOT NULL DEFAULT 'ACTIVA',
  monto_bs DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_suscrip_usuario
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX ix_suscrip_usuario_estado
  ON SUSCRIPCION_PREMIUM (id_usuario, estado);

CREATE INDEX ix_suscrip_fechas
  ON SUSCRIPCION_PREMIUM (fecha_inicio, fecha_fin);

DROP PROCEDURE IF EXISTS sp_rep_usuarios_premium;
DELIMITER $$
CREATE PROCEDURE sp_rep_usuarios_premium(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  DECLARE v_total_usuarios BIGINT DEFAULT 0;
  DECLARE v_nuevos_premium BIGINT DEFAULT 0;
  DECLARE v_premium_activos BIGINT DEFAULT 0;
  DECLARE v_ingresos_bs DECIMAL(12,2) DEFAULT 0.00;

  -- Total de usuarios activos en el sistema
  SELECT COUNT(*) INTO v_total_usuarios
  FROM USUARIO
  WHERE estado = 'ACTIVO';

  -- Usuarios que ADQUIRIERON la suscripción en el rango (alta)
  SELECT COUNT(DISTINCT id_usuario) INTO v_nuevos_premium
  FROM SUSCRIPCION_PREMIUM
  WHERE fecha_inicio BETWEEN p_desde AND p_hasta;

  -- Usuarios con suscripción ACTIVA en el rango
  SELECT COUNT(DISTINCT id_usuario) INTO v_premium_activos
  FROM SUSCRIPCION_PREMIUM
  WHERE estado = 'ACTIVA'
    AND fecha_inicio <= p_hasta
    AND (fecha_fin IS NULL OR fecha_fin >= p_desde);

  -- Ingresos por suscripción en el rango
  SELECT IFNULL(SUM(monto_bs), 0.00) INTO v_ingresos_bs
  FROM SUSCRIPCION_PREMIUM
  WHERE fecha_inicio BETWEEN p_desde AND p_hasta;

  -- Resultado del reporte
  SELECT
    p_desde AS desde,
    p_hasta AS hasta,
    v_total_usuarios        AS total_usuarios_activos,
    v_nuevos_premium        AS usuarios_nuevos_premium,
    v_premium_activos       AS usuarios_premium_activos,
    v_ingresos_bs           AS ingresos_suscripcion_bs,
    CASE
      WHEN v_total_usuarios = 0 THEN NULL
      ELSE ROUND(100 * v_premium_activos / v_total_usuarios, 2)
    END AS porcentaje_adopcion_premium;
END$$
DELIMITER ;

USE CREDITOS_VERDES2;

DROP TRIGGER IF EXISTS trg_usuario_after_ins_bono_bienvenida;
DELIMITER $$

CREATE TRIGGER trg_usuario_after_ins_bono_bienvenida
AFTER INSERT ON USUARIO
FOR EACH ROW
BEGIN
  DECLARE v_mov_bono   INT;
  DECLARE v_id_tiporef INT;
  DECLARE v_bono       BIGINT DEFAULT 5;  -- bono de bienvenida (5 créditos)

  -- 1) Asegurar billetera
  INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
  VALUES (NEW.id_usuario, 'ACTIVA', 0, 0.00, NULL);

  -- 2) Tipo de movimiento BONO_BIENVENIDA
  SET v_mov_bono = fn_get_tipo_mov('BONO_BIENVENIDA');
  IF v_mov_bono IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO BONO_BIENVENIDA no existe';
  END IF;

  -- 3) Tipo de referencia AJUSTE
  SELECT id_tipo_referencia
  INTO v_id_tiporef
  FROM TIPO_REFERENCIA
  WHERE nombre = 'AJUSTE'
  LIMIT 1;

  IF v_id_tiporef IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_REFERENCIA AJUSTE no existe';
  END IF;

  -- 4) Movimiento de bono de bienvenida
  INSERT INTO MOVIMIENTO_CREDITOS
    (id_usuario, id_tipo_movimiento, id_tipo_referencia,
     cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
  VALUES
    (NEW.id_usuario, v_mov_bono, v_id_tiporef,
     v_bono,
     CONCAT('Bono de bienvenida para el usuario #', NEW.id_usuario),
     0, 0, NEW.id_usuario);
END$$

DELIMITER ;

INSERT IGNORE INTO PAQUETE_CREDITOS (nombre, cantidad_creditos, precio_bs, activo) VALUES
('Pack 50', 50, 25.00, true ),
('Pack 250', 250, 250.00, true ),
('Pack 1000', 1000, 450.00, TRUE),
('Pack 2000', 2000, 850.00, TRUE),
('Pack 5000', 5000, 2000.00, TRUE);

INSERT IGNORE INTO CATEGORIA (nombre, descripcion) VALUES
('Ropa', 'Prendas de vestir reutilizables'),
('Electrodomésticos', 'Equipos del hogar en buen estado'),
('Muebles', 'Muebles reciclados o restaurados'),
('Libros', 'Libros usados en buen estado'),
('Juguetes', 'Juguetes reutilizables'),
('Accesorios', 'Accesorios personales y de moda'),
('Tecnología Reacondicionada', 'Equipos electrónicos restaurados'),
('Hogar', 'Artículos del hogar reutilizables'),
('Deportes', 'Equipos deportivos de segunda mano'),
('Oficina', 'Material y mobiliario de oficina reciclado');

INSERT IGNORE INTO UNIDAD_MEDIDA (nombre, simbolo) VALUES
('Pieza', 'pz'),
('Metro', 'm'),
('Metro cuadrado', 'm2'),
('Metro cúbico', 'm3'),
('Gramo', 'g'),
('Tonelada', 't'),
('Kilómetro', 'km'),
('Paquete', 'paq'),
('Servicio', 'srv'),
('Unidad de reciclaje', 'urc');

INSERT IGNORE INTO TIPO_ACTIVIDAD (nombre, descripcion) VALUES
('Reciclaje de Plástico', 'Separación y entrega de plástico reciclable'),
('Reciclaje de Papel', 'Recolección y entrega de papel'),
('Reciclaje de Electrónicos', 'Entrega de RAEE'),
('Limpieza de Parques', 'Participación en brigada de limpieza'),
('Limpieza de Calles', 'Jornadas de limpieza urbana'),
('Reforestación', 'Plantación de árboles'),
('Educación Ambiental', 'Talleres o charlas ambientales'),
('Compostaje', 'Generación de abono mediante materia orgánica'),
('Transporte Sostenible', 'Uso de bicicleta o transporte público'),
('Reciclaje de Vidrio', 'Entrega de botellas y frascos reciclables');

INSERT IGNORE INTO TIPO_LOGRO (nombre, descripcion) VALUES
('PRIMERA_COMPRA', 'Realizó su primera compra en la plataforma'),
('DIEZ_COMPRAS', 'Realizó 10 compras'),
('CINCUENTA_COMPRAS', 'Realizó 50 compras'),
('PRIMERA_ACTIVIDAD', 'Completó su primera actividad sostenible'),
('RECICLADOR_EXPERTO', 'Completó 20 actividades de reciclaje'),
('VENDENDOR_NIVEL_1', 'Realizó 5 ventas exitosas'),
('VENDENDOR_NIVEL_2', 'Realizó 20 ventas exitosas'),
('REFERIDOR', 'Invitó a 3 nuevos usuarios'),
('SUPER_VERDE', 'Ahorró más de 50 kg de CO₂'),
('CAMPEON_AMBIENTAL', 'Ahorró más de 200 kg de CO₂');

INSERT IGNORE INTO TIPO_PROMOCION (nombre, descripcion) VALUES
('BONO_BIENVENIDA', 'Promoción para nuevos usuarios'),
('TEMPORADA', 'Promoción por fechas especiales'),
('EVENTO_AMBIENTAL', 'Promoción por el Día de la Tierra u otros'),
('FIN_DE_SEMANA', 'Descuentos del fin de semana'),
('PRIMERA_PUBLICACION', 'Promoción por primera publicación'),
('ACTIVIDAD_PREMIUM', 'Promociones para usuarios premium'),
('BONO_REFERIDOS', 'Promoción por referir amigos'),
('PROMO_LIMITADA', 'Promoción por tiempo limitado'),
('BONO_RECICLAJE', 'Promoción por actividades de reciclaje'),
('EVENTO_CIUDAD', 'Promoción especial para tu ciudad');

INSERT IGNORE INTO TIPO_REPORTE (nombre, descripcion) VALUES
('DIARIO', 'Reporte del día'),
('SEMANAL', 'Reporte semanal'),
('TRIMESTRAL', 'Reporte del trimestre'),
('SEMESTRAL', 'Reporte semestral'),
('ANUAL', 'Reporte anual'),
('RANGO_PERSONALIZADO', 'Reporte para rangos definidos por usuario'),
('IMPACTO_GENERAL', 'Reporte general de impacto'),
('MOVIMIENTOS', 'Reporte de movimientos por usuario'),
('INTERCAMBIOS', 'Reporte de intercambios por categoría'),
('PUBLICACIONES', 'Reporte de publicaciones del período');

INSERT IGNORE INTO DIMENSION_AMBIENTAL (codigo, nombre, unidad_base, descripcion) VALUES
('RESIDUOS', 'Residuos evitados', 'kg', 'Cantidad de residuos que no llegan a vertederos'),
('ARBOLES_EQ', 'Árboles equivalentes', 'unidad', 'Equivalencia en árboles'),
('KM_NO_AUTO', 'Kilómetros sin auto', 'km', 'Kilómetros que no se hicieron en auto'),
('PLASTICO_REC', 'Plástico reciclado', 'kg', 'Kilos de plástico reciclado'),
('VIDRIO_REC', 'Vidrio reciclado', 'kg', 'Kilos de vidrio reciclado'),
('PAPEL_REC', 'Papel reciclado', 'kg', 'Kilos de papel reciclado'),
('ENERGIA_SOLAR', 'Energía solar aprovechada', 'kWh', 'Energía fotovoltaica generada'),
('AGUA_REUTIL', 'Agua reutilizada', 'L', 'Litros de agua reutilizada'),
('BIOCOMPOST', 'Compost generado', 'kg', 'Materia orgánica convertida en compost'),
('RAEE_REC', 'Electrónicos reciclados', 'kg', 'Residuos electrónicos gestionados');

INSERT IGNORE INTO UBICACION_PUBLICIDAD (nombre, descripcion, precio_base) VALUES
('HOME_MIDDLE', 'Banner medio en home', 90.00),
('HOME_BOTTOM', 'Banner inferior en home', 80.00),
('SIDEBAR_TOP', 'Publicidad arriba del sidebar', 70.00),
('SIDEBAR_MIDDLE', 'Publicidad en el centro del sidebar', 60.00),
('SIDEBAR_BOTTOM', 'Publicidad inferior del sidebar', 50.00),
('PUBLICACIONES_TOP', 'Banner superior en listado de publicaciones', 110.00),
('PUBLICACIONES_MIDDLE', 'Banner medio del listado', 95.00),
('PERFIL_TOP', 'Banner en perfil de usuario', 75.00),
('CARRITO_TOP', 'Banner en la vista de transacciones', 85.00),
('BUSQUEDA_TOP', 'Banner en resultados de búsqueda', 120.00);

INSERT IGNORE INTO TIPO_PUBLICACION (nombre, descripcion) VALUES
('DONACION', 'Publicación gratuita sin intercambio'),
('TRUEQUE', 'Intercambio directo entre usuarios'),
('SUBASTA', 'Publicación estilo subasta'),
('ALQUILER', 'Renta temporal de artículos'),
('CLASE', 'Clases o tutorías ofrecidas'),
('EVENTO', 'Eventos sostenibles o comunitarios'),
('TALLER', 'Talleres educativos'),
('REPARACION', 'Servicios de reparación y mantenimiento'),
('PAQUETE', 'Paquetes combinados de productos/servicios'),
('OFERTA_DESTACADA', 'Publicaciones destacadas por tiempo limitado');

INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion) VALUES
('AJUSTE_ADMIN_POSITIVO', 'Ajuste manual por parte de administración (ingreso)'),
('AJUSTE_ADMIN_NEGATIVO', 'Ajuste manual por parte de administración (egreso)'),
('REVERSO_RECARGA', 'Reversión de una recarga fallida o revertida'),
('REVERSO_INTERCAMBIO', 'Reversión de un intercambio cancelado'),
('PENALIZACION', 'Penalización por mal uso de la plataforma'),
('RECOMPENSA_REFERIDO', 'Bonificación por referir usuarios'),
('BONO_EVENTO', 'Bono otorgado por evento especial'),
('BONO_TEMPORADA', 'Bono por temporada (Navidad, Año Nuevo, etc.)'),
('BONO_METAS_LOGRO', 'Recompensa por alcanzar ciertos logros'),
('CREDITO_DE_PROMOCION', 'Créditos otorgados totalmente por promociones');

INSERT IGNORE INTO TIPO_REFERENCIA (nombre) VALUES
('BONO'),
('PREMIO'),
('PENALIZACION'),
('REVERSO'),
('DEVOLUCION'),
('REFERIDO'),
('PUBLICIDAD'),
('SUSCRIPCION_PREMIUM'),
('ACTIVIDAD_SOSTENIBLE'),
('PROMOCION');

INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
VALUES
((SELECT id_categoria FROM CATEGORIA WHERE nombre='Ropa'), 
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 3.5, 2400, 1.2),

((SELECT id_categoria FROM CATEGORIA WHERE nombre='Electrodomésticos'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 22.1, 1200, 14.3),

((SELECT id_categoria FROM CATEGORIA WHERE nombre='Libros'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 1.1, 900, 0.5),

((SELECT id_categoria FROM CATEGORIA WHERE nombre='Juguetes'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 2.8, 1500, 0.9),

((SELECT id_categoria FROM CATEGORIA WHERE nombre='Muebles'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 40.0, 5000, 25.2),

((SELECT id_categoria FROM CATEGORIA WHERE nombre='Hogar'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 4.1, 1600, 3.3),

((SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología Reacondicionada'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 55.3, 4000, 40.7),

((SELECT id_categoria FROM CATEGORIA WHERE nombre='Deportes'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u'), 6.0, 2000, 4.0),

((SELECT id_categoria FROM CATEGORIA WHERE nombre='Reciclaje de Papel'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kg'), 0.9, 4000, 0.2),

((SELECT id_categoria FROM CATEGORIA WHERE nombre='Reciclaje de Electrónicos'),
 (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kg'), 10.5, 2000, 8.0);

INSERT IGNORE INTO PERIODO (nombre, descripcion, fecha_inicio, fecha_fin) VALUES
('2025-01', 'Enero 2025',     '2025-01-01', '2025-01-31'),
('2025-02', 'Febrero 2025',   '2025-02-01', '2025-02-28'),
('2025-03', 'Marzo 2025',     '2025-03-01', '2025-03-31'),
('2025-04', 'Abril 2025',     '2025-04-01', '2025-04-30'),
('2025-05', 'Mayo 2025',      '2025-05-01', '2025-05-31'),
('2025-06', 'Junio 2025',     '2025-06-01', '2025-06-30'),
('2025-07', 'Julio 2025',     '2025-07-01', '2025-07-31'),
('2025-08', 'Agosto 2025',    '2025-08-01', '2025-08-31'),
('2025-09', 'Septiembre 2025','2025-09-01', '2025-09-30'),
('2025-10', 'Octubre 2025',   '2025-10-01', '2025-10-31'),
('2025-11', 'Noviembre 2025', '2025-11-01', '2025-11-30'),
('2025-12', 'Diciembre 2025', '2025-12-01', '2025-12-31');

USE CREDITOS_VERDES2;

-- LOGROS BASE (si ya existen con mismo tipo, no pasará nada)
INSERT INTO LOGRO (id_tipo_logro, nombre, descripcion, meta_requerida, creditos_recompensa)
SELECT tl.id_tipo_logro,
       'Primera actividad sostenible',
       'Completa tu primera actividad sostenible aprobada',
       1,              -- meta: 1 actividad
       10              -- recompensa en créditos
FROM TIPO_LOGRO tl
WHERE tl.nombre = 'PRIMERA_ACTIVIDAD'
  AND NOT EXISTS (
    SELECT 1 FROM LOGRO l WHERE l.id_tipo_logro = tl.id_tipo_logro
  );

INSERT INTO LOGRO (id_tipo_logro, nombre, descripcion, meta_requerida, creditos_recompensa)
SELECT tl.id_tipo_logro,
       'Reciclador experto',
       'Completa 20 actividades sostenibles',
       20,             -- meta: 20 actividades
       50              -- recompensa
FROM TIPO_LOGRO tl
WHERE tl.nombre = 'RECICLADOR_EXPERTO'
  AND NOT EXISTS (
    SELECT 1 FROM LOGRO l WHERE l.id_tipo_logro = tl.id_tipo_logro
  );

INSERT INTO LOGRO (id_tipo_logro, nombre, descripcion, meta_requerida, creditos_recompensa)
SELECT tl.id_tipo_logro,
       'Primera compra',
       'Realiza tu primera transacción como comprador',
       1,
       10
FROM TIPO_LOGRO tl
WHERE tl.nombre = 'PRIMERA_COMPRA'
  AND NOT EXISTS (
    SELECT 1 FROM LOGRO l WHERE l.id_tipo_logro = tl.id_tipo_logro
  );

INSERT INTO LOGRO (id_tipo_logro, nombre, descripcion, meta_requerida, creditos_recompensa)
SELECT tl.id_tipo_logro,
       'Comprador frecuente',
       'Realiza 10 transacciones como comprador',
       10,
       40
FROM TIPO_LOGRO tl
WHERE tl.nombre = 'DIEZ_COMPRAS'
  AND NOT EXISTS (
    SELECT 1 FROM LOGRO l WHERE l.id_tipo_logro = tl.id_tipo_logro
  );

INSERT INTO LOGRO (id_tipo_logro, nombre, descripcion, meta_requerida, creditos_recompensa)
SELECT tl.id_tipo_logro,
       'Vendedor nivel 1',
       'Realiza 5 transacciones como vendedor',
       5,
       30
FROM TIPO_LOGRO tl
WHERE tl.nombre = 'VENDENDOR_NIVEL_1'
  AND NOT EXISTS (
    SELECT 1 FROM LOGRO l WHERE l.id_tipo_logro = tl.id_tipo_logro
  );

INSERT INTO LOGRO (id_tipo_logro, nombre, descripcion, meta_requerida, creditos_recompensa)
SELECT tl.id_tipo_logro,
       'Vendedor nivel 2',
       'Realiza 20 transacciones como vendedor',
       20,
       80
FROM TIPO_LOGRO tl
WHERE tl.nombre = 'VENDENDOR_NIVEL_2'
  AND NOT EXISTS (
    SELECT 1 FROM LOGRO l WHERE l.id_tipo_logro = tl.id_tipo_logro
  );
DROP PROCEDURE IF EXISTS sp_incrementar_progreso_logro;
DELIMITER $$

CREATE PROCEDURE sp_incrementar_progreso_logro(
  IN p_id_usuario INT,
  IN p_nombre_tipo_logro VARCHAR(100),
  IN p_incremento BIGINT
)
proc: BEGIN
  DECLARE v_id_logro INT;
  DECLARE v_meta BIGINT;
  DECLARE v_creditos BIGINT;

  DECLARE v_id_ulogro INT;
  DECLARE v_prog_actual BIGINT;
  DECLARE v_prog_nuevo BIGINT;

  DECLARE v_id_tipomov_bono INT;
  DECLARE v_id_tiporef_premio INT;

  -- Solo incrementos positivos
  IF p_incremento IS NULL OR p_incremento <= 0 THEN
    LEAVE proc;
  END IF;

  -- Buscar el LOGRO asociado al TIPO_LOGRO
  SELECT l.id_logro, l.meta_requerida, l.creditos_recompensa
  INTO v_id_logro, v_meta, v_creditos
  FROM LOGRO l
  JOIN TIPO_LOGRO tl ON tl.id_tipo_logro = l.id_tipo_logro
  WHERE tl.nombre = p_nombre_tipo_logro
  LIMIT 1;

  IF v_id_logro IS NULL THEN
    -- No hay logro definido para ese tipo, salimos silenciosamente
    LEAVE proc;
  END IF;

  -- Buscar/crear USUARIO_LOGRO
  SELECT id_usuario_logro, progreso_actual
  INTO v_id_ulogro, v_prog_actual
  FROM USUARIO_LOGRO
  WHERE id_usuario = p_id_usuario
    AND id_logro = v_id_logro
  FOR UPDATE;

  IF v_id_ulogro IS NULL THEN
    SET v_prog_actual = 0;
    INSERT INTO USUARIO_LOGRO (id_usuario, id_logro, progreso_actual)
    VALUES (p_id_usuario, v_id_logro, 0);
    SET v_id_ulogro = LAST_INSERT_ID();
  END IF;

  SET v_prog_nuevo = v_prog_actual + p_incremento;

  UPDATE USUARIO_LOGRO
  SET progreso_actual = v_prog_nuevo
  WHERE id_usuario_logro = v_id_ulogro;

  -- ¿Se acaba de cumplir la meta?
  IF v_prog_actual < v_meta AND v_prog_nuevo >= v_meta THEN

    -- Tipo de movimiento para logros
    SELECT id_tipo_movimiento
    INTO v_id_tipomov_bono
    FROM TIPO_MOVIMIENTO
    WHERE nombre = 'BONO_METAS_LOGRO'
    LIMIT 1;

    -- Tipo de referencia (usaremos PREMIO, ya existe)
    SELECT id_tipo_referencia
    INTO v_id_tiporef_premio
    FROM TIPO_REFERENCIA
    WHERE nombre = 'PREMIO'
    LIMIT 1;

    IF v_id_tipomov_bono IS NOT NULL AND v_id_tiporef_premio IS NOT NULL THEN
      INSERT INTO MOVIMIENTO_CREDITOS (
        id_usuario,
        id_tipo_movimiento,
        id_tipo_referencia,
        cantidad,
        descripcion,
        saldo_anterior,
        saldo_posterior,
        id_referencia
      )
      VALUES (
        p_id_usuario,
        v_id_tipomov_bono,
        v_id_tiporef_premio,
        v_creditos,
        CONCAT('Recompensa por logro ', p_nombre_tipo_logro),
        0, 0,
        v_id_logro
      );
    END IF;
  END IF;

END$$
DELIMITER ;
DROP TRIGGER IF EXISTS trg_logros_actividad_aprobada;
DELIMITER $$

CREATE TRIGGER trg_logros_actividad_aprobada
AFTER UPDATE ON ACTIVIDAD_SOSTENIBLE
FOR EACH ROW
BEGIN
  -- Solo cuando pasa a APROBADA
  IF OLD.estado <> 'APROBADA' AND NEW.estado = 'APROBADA' THEN
    CALL sp_incrementar_progreso_logro(NEW.id_usuario, 'PRIMERA_ACTIVIDAD', 1);
    CALL sp_incrementar_progreso_logro(NEW.id_usuario, 'RECICLADOR_EXPERTO', 1);
  END IF;
END$$

DELIMITER ;
DROP TRIGGER IF EXISTS trg_logros_transaccion_insert;
DELIMITER $$

CREATE TRIGGER trg_logros_transaccion_insert
AFTER INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
  -- Consideramos estado ACEPATADA o COMPLETADA como "transacción lograda"
  IF NEW.estado IN ('ACEPTADA','COMPLETADA') THEN
    -- Comprador
    CALL sp_incrementar_progreso_logro(NEW.id_comprador, 'PRIMERA_COMPRA', 1);
    CALL sp_incrementar_progreso_logro(NEW.id_comprador, 'DIEZ_COMPRAS', 1);

    -- Vendedor
    CALL sp_incrementar_progreso_logro(NEW.id_vendedor, 'VENDENDOR_NIVEL_1', 1);
    CALL sp_incrementar_progreso_logro(NEW.id_vendedor, 'VENDENDOR_NIVEL_2', 1);
  END IF;
END$$

DELIMITER ;
ALTER TABLE USUARIO_LOGRO
  ADD COLUMN creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN obtenido_en DATETIME NULL;

use creditos_verdes2;
ALTER TABLE PUBLICIDAD
  ADD COLUMN banner_url  VARCHAR(500) NULL,
  ADD COLUMN archivo_url VARCHAR(500) NULL;

ALTER TABLE BILLETERA
ADD COLUMN creditos_bloqueados BIGINT NOT NULL DEFAULT 0
AFTER saldo_creditos;

ALTER TABLE PUBLICIDAD
  MODIFY COLUMN estado ENUM(
    'PROGRAMADA',
    'ACTIVA',
    'PAUSADA',
    'FINALIZADA',
    'CANCELADA',
    'ELIMINADA'
  ) NOT NULL DEFAULT 'PROGRAMADA';

-- Tipo de movimiento: consumo por publicidad (NEGATIVO)
INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion)
VALUES ('PUBLICIDAD_CONSUMO', 'Consumo de créditos por publicidad');

-- Tipo de movimiento: reverso / devolución de publicidad (POSITIVO)
INSERT IGNORE INTO TIPO_MOVIMIENTO (nombre, descripcion)
VALUES ('REVERSO_PUBLICIDAD', 'Devolución de créditos por publicidad cancelada');

-- Asignar signos en SIGNO_TIPO_MOV (usa tu tabla SIGNO_MOVIMIENTO)
-- PUBLICIDAD_CONSUMO -> NEGATIVO
INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm ON sm.nombre = 'NEGATIVO'
WHERE tm.nombre = 'PUBLICIDAD_CONSUMO';

-- REVERSO_PUBLICIDAD -> POSITIVO
INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm ON sm.nombre = 'POSITIVO'
WHERE tm.nombre = 'REVERSO_PUBLICIDAD';

  
DROP PROCEDURE IF EXISTS sp_iniciar_intercambio_retencion;
DELIMITER $$

CREATE PROCEDURE sp_iniciar_intercambio_retencion(
  IN p_id_comprador   INT,
  IN p_id_publicacion INT
)
BEGIN
  DECLARE v_id_vendedor    INT;
  DECLARE v_valor_creditos BIGINT;
  DECLARE v_estado_pub     VARCHAR(20);
  DECLARE v_id_tx          INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- 1) Obtener datos de la publicación
  SELECT id_usuario, valor_creditos, estado
    INTO v_id_vendedor, v_valor_creditos, v_estado_pub
  FROM PUBLICACION
  WHERE id_publicacion = p_id_publicacion
  FOR UPDATE;

  IF v_id_vendedor IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Publicación no existe';
  END IF;

  IF UPPER(v_estado_pub) <> 'PUBLICADA' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La publicación no está disponible para intercambio';
  END IF;

  IF p_id_comprador = v_id_vendedor THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No puedes intercambiar con tu propia publicación';
  END IF;

  IF v_valor_creditos IS NULL OR v_valor_creditos <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La publicación no tiene un valor de créditos válido';
  END IF;

  START TRANSACTION;

    -- 2) Asegurar billeteras
    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (p_id_comprador, 'ACTIVA', 0, 0.00, NULL);

    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (v_id_vendedor, 'ACTIVA', 0, 0.00, NULL);

    -- 3) Crear la transacción en estado SOLICITADA
    --    AQUÍ se dispara trg_trans_before_ins que valida saldo (fn_verificar_saldo)
    INSERT INTO TRANSACCION (id_comprador, id_vendedor, id_publicacion, cantidad_creditos, estado)
    VALUES (p_id_comprador, v_id_vendedor, p_id_publicacion, v_valor_creditos, 'SOLICITADA');

    SET v_id_tx = LAST_INSERT_ID();

    -- 4) Retener créditos: bajar saldo_creditos y subir creditos_bloqueados
    UPDATE BILLETERA
    SET saldo_creditos      = saldo_creditos - v_valor_creditos,
        creditos_bloqueados = creditos_bloqueados + v_valor_creditos
    WHERE id_usuario = p_id_comprador;

    -- 5) Registrar en bitácora
    INSERT INTO BITACORA_INTERCAMBIO
      (id_transaccion, id_usuario_origen, id_usuario_destino, cantidad_creditos, descripcion)
    VALUES
      (v_id_tx, p_id_comprador, v_id_vendedor, v_valor_creditos, 'Intercambio iniciado con créditos retenidos');

  COMMIT;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_confirmar_intercambio_retencion;
DELIMITER $$

CREATE PROCEDURE sp_confirmar_intercambio_retencion(
  IN p_id_transaccion INT,
  IN p_id_usuario_accion INT   -- por si quieres auditar quién confirma
)
BEGIN
  DECLARE v_id_comprador   INT;
  DECLARE v_id_vendedor    INT;
  DECLARE v_id_publicacion INT;
  DECLARE v_creditos       BIGINT;
  DECLARE v_estado         VARCHAR(20);
  DECLARE v_mov_in         INT;
  DECLARE v_id_tiporef_tx  INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- 1) Datos de la transacción
  SELECT id_comprador, id_vendedor, id_publicacion, cantidad_creditos, estado
    INTO v_id_comprador, v_id_vendedor, v_id_publicacion, v_creditos, v_estado
  FROM TRANSACCION
  WHERE id_transaccion = p_id_transaccion
  FOR UPDATE;

  IF v_id_comprador IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Transacción no existe';
  END IF;

  IF v_estado <> 'SOLICITADA' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo se pueden confirmar transacciones en estado SOLICITADA';
  END IF;

  -- Tipo de movimiento ingreso por intercambio
  SET v_mov_in = fn_get_tipo_mov('INTERCAMBIO_IN');
  IF v_mov_in IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO INTERCAMBIO_IN no existe';
  END IF;

  -- Tipo de referencia TRANSACCION
  SELECT id_tipo_referencia
    INTO v_id_tiporef_tx
  FROM TIPO_REFERENCIA
  WHERE nombre = 'TRANSACCION'
  LIMIT 1;

  IF v_id_tiporef_tx IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_REFERENCIA TRANSACCION no existe';
  END IF;

  START TRANSACTION;

    -- 2) Liberar bloqueados del comprador (ya estaban descontados del saldo)
    UPDATE BILLETERA
    SET creditos_bloqueados = creditos_bloqueados - v_creditos
    WHERE id_usuario = v_id_comprador;

    -- 3) Asegurar billetera del vendedor
    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (v_id_vendedor, 'ACTIVA', 0, 0.00, NULL);

    -- 4) Movimiento de ingreso para el vendedor
    INSERT INTO MOVIMIENTO_CREDITOS
      (id_usuario, id_tipo_movimiento, id_tipo_referencia,
       cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
    VALUES
      (v_id_vendedor, v_mov_in, v_id_tiporef_tx,
       v_creditos,
       CONCAT('Créditos recibidos por transacción #', p_id_transaccion),
       0, 0, p_id_transaccion);

    -- 5) Actualizar estado transacción y publicación
    UPDATE TRANSACCION
    SET estado = 'COMPLETADA'
    WHERE id_transaccion = p_id_transaccion;

    UPDATE PUBLICACION
    SET estado = 'AGOTADA'
    WHERE id_publicacion = v_id_publicacion;

    -- 6) Bitácora
    INSERT INTO BITACORA_INTERCAMBIO
      (id_transaccion, id_usuario_origen, id_usuario_destino, cantidad_creditos, descripcion)
    VALUES
      (p_id_transaccion, v_id_comprador, v_id_vendedor, v_creditos,
       'Intercambio confirmado, créditos liberados al vendedor');

  COMMIT;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_cancelar_intercambio_retencion;
DELIMITER $$

CREATE PROCEDURE sp_cancelar_intercambio_retencion(
  IN p_id_transaccion INT,
  IN p_id_usuario_accion INT
)
BEGIN
  DECLARE v_id_comprador   INT;
  DECLARE v_id_vendedor    INT;
  DECLARE v_creditos       BIGINT;
  DECLARE v_estado         VARCHAR(20);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT id_comprador, id_vendedor, cantidad_creditos, estado
    INTO v_id_comprador, v_id_vendedor, v_creditos, v_estado
  FROM TRANSACCION
  WHERE id_transaccion = p_id_transaccion
  FOR UPDATE;

  IF v_id_comprador IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Transacción no existe';
  END IF;

  IF v_estado <> 'SOLICITADA' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo se pueden cancelar transacciones en estado SOLICITADA';
  END IF;

  START TRANSACTION;

    -- 1) Devolver créditos al comprador (soltar bloqueados)
    UPDATE BILLETERA
    SET saldo_creditos      = saldo_creditos + v_creditos,
        creditos_bloqueados = creditos_bloqueados - v_creditos
    WHERE id_usuario = v_id_comprador;

    -- 2) Actualizar estado
    UPDATE TRANSACCION
    SET estado = 'CANCELADA'
    WHERE id_transaccion = p_id_transaccion;

    -- 3) Bitácora
    INSERT INTO BITACORA_INTERCAMBIO
      (id_transaccion, id_usuario_origen, id_usuario_destino, cantidad_creditos, descripcion)
    VALUES
      (p_id_transaccion, v_id_comprador, v_id_vendedor, v_creditos,
       'Intercambio cancelado, créditos devueltos al comprador');

  COMMIT;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_publicidad_activar_retencion;
DELIMITER $$

CREATE PROCEDURE sp_publicidad_activar_retencion(
  IN p_id_publicidad INT,
  IN p_id_usuario INT   -- dueño o quien la activa
)
BEGIN
  DECLARE v_id_usuario_pub INT;
  DECLARE v_costo          BIGINT;
  DECLARE v_estado         VARCHAR(20);
  DECLARE v_saldo          BIGINT;
  DECLARE v_id_tipomov     INT;
  DECLARE v_id_tiporef     INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- 1) Datos de la publicidad
  SELECT id_usuario, costo_creditos, estado
    INTO v_id_usuario_pub, v_costo, v_estado
  FROM PUBLICIDAD
  WHERE id_publicidad = p_id_publicidad
  FOR UPDATE;

  IF v_id_usuario_pub IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Publicidad no existe';
  END IF;

  -- Opcional: validar que quien activa sea el dueño
  IF v_id_usuario_pub <> p_id_usuario THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No eres dueño de esta publicidad';
  END IF;

  IF v_estado <> 'PROGRAMADA' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo se pueden activar publicidades en estado PROGRAMADA';
  END IF;

  IF v_costo IS NULL OR v_costo <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La publicidad no tiene un costo de créditos válido';
  END IF;

  -- Tipo de movimiento PUBLICIDAD_CONSUMO
  SET v_id_tipomov = fn_get_tipo_mov('PUBLICIDAD_CONSUMO');
  IF v_id_tipomov IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO PUBLICIDAD_CONSUMO no existe';
  END IF;

  -- Tipo de referencia PUBLICIDAD
  SELECT id_tipo_referencia
    INTO v_id_tiporef
  FROM TIPO_REFERENCIA
  WHERE nombre = 'PUBLICIDAD'
  LIMIT 1;

  IF v_id_tiporef IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_REFERENCIA PUBLICIDAD no existe';
  END IF;

  START TRANSACTION;

    -- 2) Asegurar billetera
    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (v_id_usuario_pub, 'ACTIVA', 0, 0.00, NULL);

    -- 3) Verificar saldo suficiente
    SELECT saldo_creditos
      INTO v_saldo
    FROM BILLETERA
    WHERE id_usuario = v_id_usuario_pub
    FOR UPDATE;

    IF v_saldo < v_costo THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Saldo insuficiente para activar publicidad';
    END IF;

    -- 4) Registrar MOVIMIENTO_CREDITOS NEGATIVO (consumo)
    --    El trigger trg_movcred_before_ins hará el descuento real en saldo_creditos
    INSERT INTO MOVIMIENTO_CREDITOS (
      id_usuario,
      id_tipo_movimiento,
      id_tipo_referencia,
      cantidad,
      descripcion,
      saldo_anterior,
      saldo_posterior,
      id_referencia
    )
    VALUES (
      v_id_usuario_pub,
      v_id_tipomov,
      v_id_tiporef,
      v_costo,
      CONCAT('Consumo por activación publicidad #', p_id_publicidad),
      0,
      0,
      p_id_publicidad
    );

    -- 5) Marcar créditos como bloqueados (para saber que están reservados para esta campaña)
    UPDATE BILLETERA
    SET creditos_bloqueados = creditos_bloqueados + v_costo
    WHERE id_usuario = v_id_usuario_pub;

    -- 6) Marcar publicidad como ACTIVA
    UPDATE PUBLICIDAD
    SET estado = 'ACTIVA'
    WHERE id_publicidad = p_id_publicidad;

  COMMIT;
END$$

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_publicidad_finalizar_retencion;
DELIMITER $$

CREATE PROCEDURE sp_publicidad_finalizar_retencion(
  IN p_id_publicidad INT
)
BEGIN
  DECLARE v_id_usuario_pub INT;
  DECLARE v_costo          BIGINT;
  DECLARE v_estado         VARCHAR(20);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- 1) Datos de la publicidad
  SELECT id_usuario, costo_creditos, estado
    INTO v_id_usuario_pub, v_costo, v_estado
  FROM PUBLICIDAD
  WHERE id_publicidad = p_id_publicidad
  FOR UPDATE;

  IF v_id_usuario_pub IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Publicidad no existe';
  END IF;

  IF v_estado <> 'ACTIVA' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo se pueden finalizar publicidades en estado ACTIVA';
  END IF;

  IF v_costo IS NULL OR v_costo <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La publicidad no tiene un costo de créditos válido';
  END IF;

  START TRANSACTION;

    -- 2) Liberar bloqueados (los créditos ya fueron descontados al activar)
    UPDATE BILLETERA
    SET creditos_bloqueados = creditos_bloqueados - v_costo
    WHERE id_usuario = v_id_usuario_pub;

    -- 3) Marcar publicidad como FINALIZADA
    UPDATE PUBLICIDAD
    SET estado = 'FINALIZADA'
    WHERE id_publicidad = p_id_publicidad;

  COMMIT;
END$$

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_publicidad_cancelar_retencion;
DELIMITER $$

CREATE PROCEDURE sp_publicidad_cancelar_retencion(
  IN p_id_publicidad INT,
  IN p_id_usuario INT   -- quien solicita la cancelación (dueño o admin)
)
BEGIN
  DECLARE v_id_usuario_pub INT;
  DECLARE v_costo          BIGINT;
  DECLARE v_estado         VARCHAR(20);
  DECLARE v_id_tipomov     INT;
  DECLARE v_id_tiporef     INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- 1) Datos de la publicidad
  SELECT id_usuario, costo_creditos, estado
    INTO v_id_usuario_pub, v_costo, v_estado
  FROM PUBLICIDAD
  WHERE id_publicidad = p_id_publicidad
  FOR UPDATE;

  IF v_id_usuario_pub IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Publicidad no existe';
  END IF;

  -- Opcional: validar dueño (aquí podrías permitir ADMIN también)
  IF v_id_usuario_pub <> p_id_usuario THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No eres dueño de esta publicidad';
  END IF;

  IF v_estado NOT IN ('PROGRAMADA','ACTIVA','PAUSADA') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo se pueden cancelar publicidades PROGRAMADAS/ACTIVAS/PAUSADAS';
  END IF;

  IF v_costo IS NULL OR v_costo <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La publicidad no tiene un costo de créditos válido';
  END IF;

  -- Tipo de referencia PUBLICIDAD
  SELECT id_tipo_referencia
    INTO v_id_tiporef
  FROM TIPO_REFERENCIA
  WHERE nombre = 'PUBLICIDAD'
  LIMIT 1;

  IF v_id_tiporef IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TIPO_REFERENCIA PUBLICIDAD no existe';
  END IF;

  START TRANSACTION;

    -- Si estaba ACTIVA/PAUSADA, había consumo y bloqueo → devolver
    IF v_estado IN ('ACTIVA','PAUSADA') THEN

      -- Tipo de movimiento REVERSO_PUBLICIDAD (positivo)
      SET v_id_tipomov = fn_get_tipo_mov('REVERSO_PUBLICIDAD');
      IF v_id_tipomov IS NULL THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO REVERSO_PUBLICIDAD no existe';
      END IF;

      -- 1) Movimiento POSITIVO (devolución)
      INSERT INTO MOVIMIENTO_CREDITOS (
        id_usuario,
        id_tipo_movimiento,
        id_tipo_referencia,
        cantidad,
        descripcion,
        saldo_anterior,
        saldo_posterior,
        id_referencia
      )
      VALUES (
        v_id_usuario_pub,
        v_id_tipomov,
        v_id_tiporef,
        v_costo,
        CONCAT('Reverso por publicidad cancelada #', p_id_publicidad),
        0,
        0,
        p_id_publicidad
      );

      -- 2) Bajar los bloqueados (ya no están reservados)
      UPDATE BILLETERA
      SET creditos_bloqueados = creditos_bloqueados - v_costo
      WHERE id_usuario = v_id_usuario_pub;

    END IF;

    -- Si estaba PROGRAMADA, no hubo consumo ni bloqueo → solo estado

    -- 3) Marcar publicidad como CANCELADA
    UPDATE PUBLICIDAD
    SET estado = 'CANCELADA'
    WHERE id_publicidad = p_id_publicidad;

  COMMIT;
END$$

DELIMITER ;

ALTER TABLE REPORTE_IMPACTO
  MODIFY total_co2_ahorrado     DECIMAL(18,6) NOT NULL,
  MODIFY total_agua_ahorrada    DECIMAL(18,6) NOT NULL,
  MODIFY total_energia_ahorrada DECIMAL(18,6) NOT NULL;

ALTER TABLE IMPACTO_AMBIENTAL
  MODIFY co2_ahorrado     DECIMAL(18,6) NOT NULL,
  MODIFY agua_ahorrada    DECIMAL(18,6) NOT NULL,
  MODIFY energia_ahorrada DECIMAL(18,6) NOT NULL;