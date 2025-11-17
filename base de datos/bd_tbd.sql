/* ============================================================
   CREDITOS_VERDES2 — ESQUEMA + TRIGGERS + SEED + PRUEBA
   Requisitos: MySQL 8.0.16+ (CHECK y FULLTEXT en InnoDB)
   ============================================================ */
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

-- ============================================
-- 10) PROCEDIMIENTOS
-- ============================================
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

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN ROLLBACK; RESIGNAL; END;

  IF p_id_usuario IS NULL OR p_id_paquete IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario y paquete son obligatorios';
  END IF;

  IF p_id_transaccion_pago IS NOT NULL AND
     EXISTS (SELECT 1 FROM COMPRA_CREDITOS WHERE id_transaccion_pago = p_id_transaccion_pago) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pago ya registrado';
  END IF;

  SELECT cantidad_creditos INTO v_creditos
  FROM PAQUETE_CREDITOS
  WHERE id_paquete = p_id_paquete;

  IF v_creditos IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Paquete no existe';
  END IF;

  START TRANSACTION;

    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (p_id_usuario, 'ACTIVA', 0, 0.00, NULL);

    INSERT INTO COMPRA_CREDITOS (id_usuario, id_paquete, monto_bs, estado, id_transaccion_pago)
    SELECT p_id_usuario, p_id_paquete, precio_bs, 'APROBADO', p_id_transaccion_pago
    FROM PAQUETE_CREDITOS WHERE id_paquete = p_id_paquete;

    SET v_id_tipo_mov = fn_get_tipo_mov('RECARGA');
    IF v_id_tipo_mov IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO RECARGA no existe';
    END IF;

    INSERT INTO MOVIMIENTO_CREDITOS
      (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
    VALUES
      (p_id_usuario, v_id_tipo_mov,
       (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='COMPRA' LIMIT 1),
       v_creditos, 'Recarga por compra de paquete', 0, 0, LAST_INSERT_ID());

  COMMIT;
END$$
DELIMITER ;

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
  DECLARE v_saldo_comp BIGINT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN ROLLBACK; RESIGNAL; END;

  SELECT id_usuario, valor_creditos INTO v_id_vendedor, v_valor_creditos
  FROM PUBLICACION WHERE id_publicacion = p_id_publicacion;

  IF v_id_vendedor IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Publicación no existe';
  END IF;
  IF p_id_comprador = v_id_vendedor THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No puedes intercambiar con tu propia publicación';
  END IF;

  START TRANSACTION;

    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (p_id_comprador, 'ACTIVA', 0, 0.00, NULL);
    INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
    VALUES (v_id_vendedor, 'ACTIVA', 0, 0.00, NULL);

    SELECT saldo_creditos INTO v_saldo_comp
    FROM BILLETERA WHERE id_usuario = p_id_comprador
    FOR UPDATE;

    IF v_saldo_comp < p_creditos THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente';
    END IF;

    INSERT INTO TRANSACCION (id_comprador, id_vendedor, id_publicacion, cantidad_creditos, estado)
    VALUES (p_id_comprador, v_id_vendedor, p_id_publicacion, p_creditos, 'ACEPTADA');
    SET v_id_tx = LAST_INSERT_ID();

    SET v_mov_in  = fn_get_tipo_mov('INTERCAMBIO_IN');
    SET v_mov_out = fn_get_tipo_mov('INTERCAMBIO_OUT');
    IF v_mov_in IS NULL OR v_mov_out IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipos de movimiento de intercambio no configurados';
    END IF;

    INSERT INTO MOVIMIENTO_CREDITOS
      (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
    VALUES
      (p_id_comprador, v_mov_out,
       (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='TRANSACCION' LIMIT 1),
       p_creditos, CONCAT('Pago por transacción #', v_id_tx), 0, 0, v_id_tx),
      (v_id_vendedor, v_mov_in,
       (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='TRANSACCION' LIMIT 1),
       p_creditos, CONCAT('Crédito recibido por transacción #', v_id_tx), 0, 0, v_id_tx);

    INSERT INTO BITACORA_INTERCAMBIO
      (id_transaccion, id_usuario_origen, id_usuario_destino, cantidad_creditos, descripcion)
    VALUES (v_id_tx, p_id_comprador, v_id_vendedor, p_creditos, 'Intercambio realizado');

    CALL sp_calcular_e_insertar_impacto(v_id_tx);

  COMMIT;
END$$
DELIMITER ;

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

  INSERT IGNORE INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
  VALUES (p_id_usuario, 'ACTIVA', 0, 0.00, NULL);

  SET v_mov_bono = fn_get_tipo_mov('BONO_ACTIVIDAD');
  IF v_mov_bono IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'TIPO_MOVIMIENTO BONO_ACTIVIDAD no existe';
  END IF;

  INSERT INTO MOVIMIENTO_CREDITOS
    (id_usuario, id_tipo_movimiento, id_tipo_referencia, cantidad, descripcion, saldo_anterior, saldo_posterior, id_referencia)
  VALUES
    (p_id_usuario, v_mov_bono,
     (SELECT id_tipo_referencia FROM TIPO_REFERENCIA WHERE nombre='AJUSTE' LIMIT 1),
     p_creditos_otorgados, 'Bono por actividad sostenible', 0, 0, LAST_INSERT_ID());
END$$
DELIMITER ;

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

  SELECT id_comprador, id_vendedor, id_publicacion, cantidad_creditos
    INTO v_id_usuario_c, v_id_usuario_v, v_id_publicacion, v_creditos
  FROM TRANSACCION WHERE id_transaccion = p_id_transaccion;

  SELECT id_categoria, valor_creditos INTO v_id_categoria, v_valor_pub
  FROM PUBLICACION WHERE id_publicacion = v_id_publicacion;

  IF v_valor_pub IS NULL OR v_valor_pub = 0 THEN
    SET v_unidades = 1;
  ELSE
    SET v_unidades = v_creditos / v_valor_pub;
  END IF;

  SELECT IFNULL(co2_por_unidad,0), IFNULL(agua_por_unidad,0), IFNULL(energia_por_unidad,0)
    INTO v_co2, v_agua, v_energia
  FROM EQUIVALENCIA_IMPACTO
  WHERE id_categoria = v_id_categoria
  LIMIT 1;

  SET v_co2     = v_co2 * v_unidades;
  SET v_agua    = v_agua * v_unidades;
  SET v_energia = v_energia * v_unidades;

  SELECT id_periodo INTO v_id_periodo
  FROM PERIODO
  ORDER BY id_periodo DESC
  LIMIT 1;

  IF v_id_periodo IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay PERIODO definido para registrar impacto';
  END IF;

  INSERT INTO IMPACTO_AMBIENTAL
    (id_usuario, id_transaccion, id_categoria, co2_ahorrado, agua_ahorrada, energia_ahorrada, id_periodo)
  VALUES
    (v_id_usuario_c, p_id_transaccion, v_id_categoria, v_co2, v_agua, v_energia, v_id_periodo);
END$$
DELIMITER ;

-- ============================================
-- 11) TRIGGERS
-- ============================================
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

-- ============================================
-- 12) FULLTEXT (buscador)
-- ============================================
ALTER TABLE PUBLICACION
  ADD FULLTEXT ft_pub_titulo_desc (titulo, descripcion);

-- ============================================
-- 13) SEED FUNCIONAL (deja datos de demo listos)
-- ============================================
-- Roles, permisos mínimos (permiso útil para admin si lo usas)
INSERT IGNORE INTO ROL (nombre, descripcion) VALUES
  ('ADMIN','Administrador'),('COMPRADOR','Comprador'),('VENDEDOR','Vendedor'),('ONG','Organización');

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

INSERT IGNORE INTO SIGNO_TIPO_MOV (id_tipo_movimiento, id_signo, creado_en)
SELECT tm.id_tipo_movimiento, sm.id_signo, NOW()
FROM TIPO_MOVIMIENTO tm
JOIN SIGNO_MOVIMIENTO sm
ON ((tm.nombre IN ('RECARGA','INTERCAMBIO_IN','BONO_PUBLICACION','BONO_ACTIVIDAD') AND sm.nombre='POSITIVO')
 OR  (tm.nombre = 'INTERCAMBIO_OUT' AND sm.nombre='NEGATIVO'));

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
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Ana','Rojas','ana@demo.com','70000001','/p/ana'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Luis','Quispe','luis@demo.com','70000002','/p/luis');

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

-- ============================================
-- 14) PRUEBA REAL (deja datos consistentes para demo)
-- ============================================

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

-- ============================================================
-- FIX: Crear sp_obtener_ranking_usuarios (faltaba en el script)
-- ============================================================
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

-- ============================================
-- FIN
-- ============================================
SELECT '✔ Esquema + triggers + seed + prueba listos.' AS status;

-- ============================================
-- A) CAMPOS DE FECHA MÍNIMOS PARA REPORTES
-- ============================================

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
-- ============================================
-- B1) vw_usuario_actividad
--    - Todas las acciones que consideramos "actividad"
-- ============================================
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
-- ============================================
-- B2) vw_mov_creditos_signo
--    - Movimiento + signo POSITIVO/NEGATIVO ya resuelto
-- ============================================
DROP VIEW IF EXISTS vw_mov_creditos_signo;
CREATE VIEW vw_mov_creditos_signo AS
SELECT m.*,
       sm.nombre AS signo_mov
FROM MOVIMIENTO_CREDITOS m
JOIN SIGNO_TIPO_MOV sx
  ON sx.id_tipo_movimiento = m.id_tipo_movimiento
JOIN SIGNO_MOVIMIENTO sm
  ON sm.id_signo = sx.id_signo;
-- ============================================
-- B3) vw_transacciones_categoria
--    - Transacción + categoría de la publicación
-- ============================================
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
-- ============================================
-- C1) Usuarios activos entre p_desde y p_hasta
-- ============================================
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
-- ============================================
-- C2) Usuarios abandonados (sin actividad en rango)
-- ============================================
DROP PROCEDURE IF EXISTS sp_rep_usuarios_abandonados;
DELIMITER $$
CREATE PROCEDURE sp_rep_usuarios_abandonados(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  -- Usuarios activos en el rango
  CREATE TEMPORARY TABLE tmp_usuarios_activos
  SELECT DISTINCT id_usuario
  FROM vw_usuario_actividad
  WHERE fecha_actividad BETWEEN p_desde AND p_hasta;

  -- Usuarios que NO están en la tabla temporal
  SELECT u.id_usuario,
         u.nombre,
         u.correo,
         u.estado
  FROM USUARIO u
  LEFT JOIN tmp_usuarios_activos ta
    ON ta.id_usuario = u.id_usuario
  WHERE ta.id_usuario IS NULL
    AND u.estado = 'ACTIVO';

  DROP TEMPORARY TABLE IF EXISTS tmp_usuarios_activos;
END$$
DELIMITER ;
-- ============================================
-- C3) Ingresos por venta de créditos
-- ============================================
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
-- ============================================
-- C4) Créditos generados vs consumidos
-- ============================================
DROP PROCEDURE IF EXISTS sp_rep_creditos_generados_vs_consumidos;
DELIMITER $$
CREATE PROCEDURE sp_rep_creditos_generados_vs_consumidos(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  SELECT
    SUM(CASE WHEN signo_mov = 'POSITIVO' THEN cantidad ELSE 0 END) AS creditos_generados,
    SUM(CASE WHEN signo_mov = 'NEGATIVO' THEN cantidad ELSE 0 END) AS creditos_consumidos
  FROM vw_mov_creditos_signo
  WHERE creado_en BETWEEN p_desde AND p_hasta;
END$$
DELIMITER ;
-- ============================================
-- C5) Intercambios por categoría
-- ============================================
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
-- ============================================
-- C6) Publicaciones vs intercambios por categoría
-- ============================================
-- Publicaciones vs intercambios por categoría (versión MySQL-friendly)
DROP PROCEDURE IF EXISTS sp_rep_publicaciones_vs_intercambios;
DELIMITER $$
CREATE PROCEDURE sp_rep_publicaciones_vs_intercambios(
  IN p_desde DATETIME,
  IN p_hasta DATETIME
)
BEGIN
  CREATE TEMPORARY TABLE tmp_pub_cat AS
  SELECT c.nombre AS categoria,
         COUNT(p.id_publicacion) AS publicaciones
  FROM PUBLICACION p
  JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
  WHERE p.creado_en BETWEEN p_desde AND p_hasta
  GROUP BY c.nombre;

  CREATE TEMPORARY TABLE tmp_tx_cat AS
  SELECT categoria,
         COUNT(id_transaccion) AS intercambios
  FROM vw_transacciones_categoria
  WHERE creado_en BETWEEN p_desde AND p_hasta
    AND estado IN ('ACEPTADA','COMPLETADA')
  GROUP BY categoria;

  -- LEFT JOIN (todas las categorías con publicaciones)
  SELECT
    p.categoria,
    p.publicaciones,
    COALESCE(t.intercambios, 0) AS intercambios,
    CASE
      WHEN p.publicaciones = 0 THEN NULL
      ELSE COALESCE(t.intercambios, 0) / p.publicaciones
    END AS ratio_intercambio
  FROM tmp_pub_cat p
  LEFT JOIN tmp_tx_cat t
    ON p.categoria = t.categoria

  UNION ALL

  -- Categorías que solo tienen intercambios, sin publicaciones en el rango
  SELECT
    t.categoria,
    0 AS publicaciones,
    t.intercambios,
    NULL AS ratio_intercambio
  FROM tmp_tx_cat t
  LEFT JOIN tmp_pub_cat p
    ON p.categoria = t.categoria
  WHERE p.categoria IS NULL;

  DROP TEMPORARY TABLE IF EXISTS tmp_pub_cat;
  DROP TEMPORARY TABLE IF EXISTS tmp_tx_cat;
END$$
DELIMITER ;

-- ============================================
-- C7) Impacto acumulado por período (lectura directa)
--     Asume que ya corriste sp_generar_reporte_impacto antes
-- ============================================
DROP PROCEDURE IF EXISTS sp_rep_impacto_acumulado;
DELIMITER $$
CREATE PROCEDURE sp_rep_impacto_acumulado(
  IN p_id_tipo_reporte INT,
  IN p_id_periodo INT
)
BEGIN
  SELECT
    id_usuario,
    total_co2_ahorrado,
    total_agua_ahorrada,
    total_energia_ahorrada,
    total_transacciones,
    total_usuarios_activos
  FROM REPORTE_IMPACTO
  WHERE id_tipo_reporte = p_id_tipo_reporte
    AND id_periodo = p_id_periodo;
END$$
DELIMITER ;

ALTER TABLE USUARIO
  ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''
  AFTER correo;
