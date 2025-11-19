CREATE database CREDITOS_VERDES;
USE CREDITOS_VERDES;
-- CATÁLOGOS / BASE
   
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

CREATE TABLE FACTOR_CONVERSION (
  id_factor INT PRIMARY KEY AUTO_INCREMENT,
  id_um_origen INT NOT NULL,
  id_um_destino INT NOT NULL,
  factor DECIMAL(18,8) NOT NULL,
  descripcion VARCHAR(255),
  CONSTRAINT uk_factor_par UNIQUE (id_um_origen, id_um_destino)
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
  nombre VARCHAR(20) NOT NULL UNIQUE
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
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE DIMENSION_AMBIENTAL (
  id_dimension INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  unidad_base VARCHAR(20),
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

/* USUARIOS Y SEGURIDAD*/
CREATE TABLE USUARIO (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  id_rol INT NOT NULL,
  estado ENUM('ACTIVO','SUSPENDIDO','BLOQUEADO','ELIMINADO') NOT NULL DEFAULT 'ACTIVO',
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  correo VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(25),
  url_perfil VARCHAR(120) UNIQUE
) ENGINE=InnoDB;

CREATE TABLE ROL_PERMISO (
  id_rol INT NOT NULL,
  id_permiso INT NOT NULL,
  PRIMARY KEY (id_rol, id_permiso)
) ENGINE=InnoDB;

CREATE TABLE BITACORA_ACCESO (
  id_acceso INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  fecha DATETIME,
  direccion_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(500),
  id_resultado INT NOT NULL
) ENGINE=InnoDB;

/* PUBLICACIONES / PRODUCTOS / SERVICIOS*/
CREATE TABLE PUBLICACION (
  id_publicacion INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_categoria INT NOT NULL,
  id_tipo_publicacion INT NOT NULL,
  estado ENUM('BORRADOR','PUBLICADA','PAUSADA','AGOTADA','OCULTA','ELIMINADA') NOT NULL DEFAULT 'PUBLICADA',
  id_ubicacion INT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  valor_creditos BIGINT NOT NULL,
  imagen_url VARCHAR(500)
) ENGINE=InnoDB;

CREATE TABLE PRODUCTO (
  id_producto INT PRIMARY KEY AUTO_INCREMENT,
  id_categoria INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255),
  precio DECIMAL(12,2),
  peso DECIMAL(10,2)
) ENGINE=InnoDB;

CREATE TABLE SERVICIO (
  id_servicio INT PRIMARY KEY AUTO_INCREMENT,
  id_categoria INT NOT NULL,
  estado ENUM('ACTIVO','PAUSADO','INACTIVO','ELIMINADO') NOT NULL DEFAULT 'ACTIVO',
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2),
  duracion_min SMALLINT
) ENGINE=InnoDB;

CREATE TABLE PUBLICACION_PRODUCTO (
  id_publicacion INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad DECIMAL(15,4) NOT NULL,
  id_um INT NOT NULL,
  PRIMARY KEY (id_publicacion, id_producto)
) ENGINE=InnoDB;

CREATE TABLE PUBLICACION_SERVICIO (
  id_publicacion INT NOT NULL,
  id_servicio INT NOT NULL,
  horario VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_publicacion, id_servicio)
) ENGINE=InnoDB;

CREATE TABLE CALIFICACION (
  id_calificacion INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_publicacion INT NOT NULL,
  estrellas TINYINT NOT NULL,
  comentario VARCHAR(300),
  CONSTRAINT uk_calif_user_pub UNIQUE (id_usuario, id_publicacion)
) ENGINE=InnoDB;

/* BILLETERA / PAGOS / MOVIMIENTOS*/
CREATE TABLE BILLETERA (
  id_billetera INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL UNIQUE,
  estado ENUM('ACTIVA','BLOQUEADA','CERRADA') NOT NULL DEFAULT 'ACTIVA',
  saldo_creditos BIGINT NOT NULL DEFAULT 0,
  saldo_bs DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  cuenta_bancaria VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE SIGNO_X_TIPO_MOV (
  id_tipo_movimiento INT NOT NULL,
  id_signo INT NOT NULL,
  creado_en DATETIME NULL,
  PRIMARY KEY (id_tipo_movimiento, id_signo)
) ENGINE=InnoDB;

CREATE TABLE COMPRA_CREDITOS (
  id_compra INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_paquete INT NOT NULL,
  monto_bs DECIMAL(12,2) NOT NULL,
  estado ENUM('PENDIENTE','APROBADO','RECHAZADO','FALLIDO','REVERTIDO') NOT NULL DEFAULT 'PENDIENTE',
  id_transaccion_pago VARCHAR(255),
  CONSTRAINT uk_txpago UNIQUE (id_transaccion_pago)
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
  id_referencia INT NULL
) ENGINE=InnoDB;

/* TRANSACCIONES (INTERCAMBIOS)*/
CREATE TABLE TRANSACCION (
  id_transaccion INT PRIMARY KEY AUTO_INCREMENT,
  id_comprador INT NOT NULL,
  id_vendedor INT NOT NULL,
  id_publicacion INT NOT NULL,
  cantidad_creditos BIGINT NOT NULL,
  estado ENUM('SOLICITADA','ACEPTADA','RECHAZADA','CANCELADA','COMPLETADA','ANULADA') NOT NULL DEFAULT 'SOLICITADA'
) ENGINE=InnoDB;

CREATE TABLE BITACORA_INTERCAMBIO (
  id_bitacora INT PRIMARY KEY AUTO_INCREMENT,
  id_transaccion INT NOT NULL,
  id_usuario_origen INT NOT NULL,
  id_usuario_destino INT NOT NULL,
  cantidad_creditos BIGINT NOT NULL,
  descripcion VARCHAR(500)
) ENGINE=InnoDB;

/* PROMOCIONES Y GAMIFICACIÓN    */
CREATE TABLE PROMOCION (
  id_promocion INT PRIMARY KEY AUTO_INCREMENT,
  id_tipo_promocion INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  creditos_otorgados BIGINT NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  estado ENUM('PROGRAMADA','ACTIVA','PAUSADA','FINALIZADA','CANCELADA') NOT NULL DEFAULT 'PROGRAMADA'
) ENGINE=InnoDB;

CREATE TABLE PROMOCION_PUBLICACION (
  id_promocion INT NOT NULL,
  id_publicacion INT NOT NULL,
  PRIMARY KEY (id_promocion, id_publicacion)
) ENGINE=InnoDB;

CREATE TABLE LOGRO (
  id_logro INT PRIMARY KEY AUTO_INCREMENT,
  id_tipo_logro INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  meta_requerida BIGINT NOT NULL,
  creditos_recompensa BIGINT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE USUARIO_LOGRO (
  id_usuario_logro INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_logro INT NOT NULL,
  progreso_actual BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT uk_user_logro UNIQUE (id_usuario, id_logro)
) ENGINE=InnoDB;

/* ACTIVIDADES SOSTENIBLES*/
CREATE TABLE ACTIVIDAD_SOSTENIBLE (
  id_actividad INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_tipo_actividad INT NOT NULL,
  descripcion TEXT NOT NULL,
  creditos_otorgados INT NOT NULL,
  evidencia_url VARCHAR(500)
) ENGINE=InnoDB;

/* PUBLICIDAD*/
CREATE TABLE PUBLICIDAD (
  id_publicidad INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_ubicacion INT NOT NULL,
  estado ENUM('PROGRAMADA','ACTIVA','PAUSADA','FINALIZADA','CANCELADA') NOT NULL DEFAULT 'PROGRAMADA',
  titulo VARCHAR(200) NOT NULL,
  descripcion VARCHAR(255),
  url_destino VARCHAR(500),
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  costo_creditos BIGINT NOT NULL,
  clicks BIGINT NOT NULL DEFAULT 0,
  impresiones BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

/* ===========================
   REPORTES
   =========================== */
CREATE TABLE REPORTE_IMPACTO (
  id_reporte INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NULL,
  id_tipo_reporte INT NOT NULL,
  id_periodo INT NOT NULL,
  total_co2_ahorrado DECIMAL(12,6) NOT NULL,
  total_agua_ahorrada DECIMAL(12,6) NOT NULL,
  total_energia_ahorrada DECIMAL(12,6) NOT NULL,
  total_transacciones BIGINT NOT NULL,
  total_usuarios_activos BIGINT NOT NULL
) ENGINE=InnoDB;

/* AMBIENTAL*/
CREATE TABLE EQUIVALENCIA_IMPACTO (
  id_equivalencia INT PRIMARY KEY AUTO_INCREMENT,
  id_categoria INT NOT NULL,
  id_um INT NULL,
  co2_por_unidad DECIMAL(12,6) NOT NULL,
  agua_por_unidad DECIMAL(12,6) NOT NULL,
  energia_por_unidad DECIMAL(12,6) NOT NULL,
  CONSTRAINT uk_eq_cat_um UNIQUE (id_categoria, id_um)
) ENGINE=InnoDB;

CREATE TABLE IMPACTO_AMBIENTAL (
  id_impacto INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_transaccion INT NOT NULL,
  id_categoria INT NOT NULL,
  co2_ahorrado DECIMAL(12,6) NOT NULL,
  agua_ahorrada DECIMAL(12,6) NOT NULL,
  energia_ahorrada DECIMAL(12,6) NOT NULL,
  id_periodo INT NOT NULL
) ENGINE=InnoDB;

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
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

/* ÍNDICES (para FKs y consultas frecuentes)*/
-- USUARIO
CREATE INDEX ix_usuario_rol ON USUARIO (id_rol);

-- BITACORA_ACCESO
CREATE INDEX ix_bitacceso_usuario ON BITACORA_ACCESO (id_usuario);
CREATE INDEX ix_bitacceso_resultado ON BITACORA_ACCESO (id_resultado);

-- PUBLICACION
CREATE INDEX ix_pub_usuario ON PUBLICACION (id_usuario);
CREATE INDEX ix_pub_categoria ON PUBLICACION (id_categoria);
CREATE INDEX ix_pub_tipopub ON PUBLICACION (id_tipo_publicacion);
CREATE INDEX ix_pub_ubicacion ON PUBLICACION (id_ubicacion);

-- PRODUCTO / SERVICIO
CREATE INDEX ix_prod_categoria ON PRODUCTO (id_categoria);
CREATE INDEX ix_serv_categoria ON SERVICIO (id_categoria);

-- PUBLICACION_PRODUCTO / SERVICIO
CREATE INDEX ix_pubprod_um ON PUBLICACION_PRODUCTO (id_um);
CREATE INDEX ix_pubserv_pub ON PUBLICACION_SERVICIO (id_publicacion);
CREATE INDEX ix_pubserv_serv ON PUBLICACION_SERVICIO (id_servicio);

-- BILLETERA
CREATE INDEX ix_billetera_usuario ON BILLETERA (id_usuario);

-- COMPRA_CREDITOS
CREATE INDEX ix_compra_usuario ON COMPRA_CREDITOS (id_usuario);
CREATE INDEX ix_compra_paquete ON COMPRA_CREDITOS (id_paquete);

-- MOVIMIENTO_CREDITOS
CREATE INDEX ix_mov_user ON MOVIMIENTO_CREDITOS (id_usuario);
CREATE INDEX ix_mov_tipomov ON MOVIMIENTO_CREDITOS (id_tipo_movimiento);
CREATE INDEX ix_mov_tiporef ON MOVIMIENTO_CREDITOS (id_tipo_referencia);

-- TRANSACCION
CREATE INDEX ix_tx_comprador ON TRANSACCION (id_comprador);
CREATE INDEX ix_tx_vendedor ON TRANSACCION (id_vendedor);
CREATE INDEX ix_tx_publicacion ON TRANSACCION (id_publicacion);

-- BITACORA_INTERCAMBIO
CREATE INDEX ix_bitint_tx ON BITACORA_INTERCAMBIO (id_transaccion);
CREATE INDEX ix_bitint_origen ON BITACORA_INTERCAMBIO (id_usuario_origen);
CREATE INDEX ix_bitint_destino ON BITACORA_INTERCAMBIO (id_usuario_destino);


-- ACTIVIDAD_SOSTENIBLE
CREATE INDEX ix_actsos_usuario ON ACTIVIDAD_SOSTENIBLE (id_usuario);
CREATE INDEX ix_actsos_tipo ON ACTIVIDAD_SOSTENIBLE (id_tipo_actividad);

-- PUBLICIDAD
CREATE INDEX ix_publicidad_usuario ON PUBLICIDAD (id_usuario);
CREATE INDEX ix_publicidad_ubi ON PUBLICIDAD (id_ubicacion);

-- REPORTE_IMPACTO
CREATE INDEX ix_repimp_usuario ON REPORTE_IMPACTO (id_usuario);
CREATE INDEX ix_repimp_tiporep ON REPORTE_IMPACTO (id_tipo_reporte);
CREATE INDEX ix_repimp_periodo ON REPORTE_IMPACTO (id_periodo);

-- EQUIVALENCIA_IMPACTO
CREATE INDEX ix_eqimp_categoria ON EQUIVALENCIA_IMPACTO (id_categoria);
CREATE INDEX ix_eqimp_um ON EQUIVALENCIA_IMPACTO (id_um);

-- IMPACTO_AMBIENTAL
CREATE INDEX ix_impamb_usuario ON IMPACTO_AMBIENTAL (id_usuario);
CREATE INDEX ix_impamb_tx ON IMPACTO_AMBIENTAL (id_transaccion);
CREATE INDEX ix_impamb_categoria ON IMPACTO_AMBIENTAL (id_categoria);
CREATE INDEX ix_impamb_periodo ON IMPACTO_AMBIENTAL (id_periodo);

/* CLAVES FORÁNEAS*/
-- USUARIO / ROL
ALTER TABLE USUARIO
  ADD CONSTRAINT fk_usuario_rol
  FOREIGN KEY (id_rol) REFERENCES ROL(id_rol);

-- ROL_PERMISO
ALTER TABLE ROL_PERMISO
  ADD CONSTRAINT fk_rolperm_rol
  FOREIGN KEY (id_rol) REFERENCES ROL(id_rol),
  ADD CONSTRAINT fk_rolperm_perm
  FOREIGN KEY (id_permiso) REFERENCES PERMISO(id_permiso);

-- BITACORA_ACCESO
ALTER TABLE BITACORA_ACCESO
  ADD CONSTRAINT fk_bitacceso_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_bitacceso_resultado
  FOREIGN KEY (id_resultado) REFERENCES RESULTADO_ACCESO(id_resultado);

-- FACTOR_CONVERSION
ALTER TABLE FACTOR_CONVERSION
  ADD CONSTRAINT fk_factor_um_origen
  FOREIGN KEY (id_um_origen) REFERENCES UNIDAD_MEDIDA(id_um),
  ADD CONSTRAINT fk_factor_um_destino
  FOREIGN KEY (id_um_destino) REFERENCES UNIDAD_MEDIDA(id_um);

-- PUBLICACION / PRODUCTO / SERVICIO
ALTER TABLE PUBLICACION
  ADD CONSTRAINT fk_pub_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_pub_categoria
  FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria),
  ADD CONSTRAINT fk_pub_tipopub
  FOREIGN KEY (id_tipo_publicacion) REFERENCES TIPO_PUBLICACION(id_tipo_publicacion),
  ADD CONSTRAINT fk_pub_ubicacion
  FOREIGN KEY (id_ubicacion) REFERENCES UBICACION(id_ubicacion);

ALTER TABLE PRODUCTO
  ADD CONSTRAINT fk_producto_categoria
  FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria);

ALTER TABLE SERVICIO
  ADD CONSTRAINT fk_servicio_categoria
  FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria);

ALTER TABLE PUBLICACION_PRODUCTO
  ADD CONSTRAINT fk_pubprod_publicacion
  FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion),
  ADD CONSTRAINT fk_pubprod_producto
  FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto),
  ADD CONSTRAINT fk_pubprod_um
  FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um);

ALTER TABLE PUBLICACION_SERVICIO
  ADD CONSTRAINT fk_pubserv_publicacion
  FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion),
  ADD CONSTRAINT fk_pubserv_servicio
  FOREIGN KEY (id_servicio) REFERENCES SERVICIO(id_servicio);

ALTER TABLE CALIFICACION
  ADD CONSTRAINT fk_calif_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_calif_publicacion
  FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion);

-- BILLETERA / MOVIMIENTOS / COMPRAS
ALTER TABLE BILLETERA
  ADD CONSTRAINT fk_billetera_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario);

ALTER TABLE SIGNO_X_TIPO_MOV
  ADD CONSTRAINT fk_sxtm_tipo
  FOREIGN KEY (id_tipo_movimiento) REFERENCES TIPO_MOVIMIENTO(id_tipo_movimiento),
  ADD CONSTRAINT fk_sxtm_signo
  FOREIGN KEY (id_signo) REFERENCES SIGNO_MOVIMIENTO(id_signo);

ALTER TABLE COMPRA_CREDITOS
  ADD CONSTRAINT fk_compra_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_compra_paquete
  FOREIGN KEY (id_paquete) REFERENCES PAQUETE_CREDITOS(id_paquete);

ALTER TABLE MOVIMIENTO_CREDITOS
  ADD CONSTRAINT fk_movcred_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_movcred_tipomov
  FOREIGN KEY (id_tipo_movimiento) REFERENCES TIPO_MOVIMIENTO(id_tipo_movimiento),
  ADD CONSTRAINT fk_movcred_tiporef
  FOREIGN KEY (id_tipo_referencia) REFERENCES TIPO_REFERENCIA(id_tipo_referencia);

-- TRANSACCION / BITÁCORA
ALTER TABLE TRANSACCION
  ADD CONSTRAINT fk_tx_comprador
  FOREIGN KEY (id_comprador) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_tx_vendedor
  FOREIGN KEY (id_vendedor) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_tx_publicacion
  FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion);

ALTER TABLE BITACORA_INTERCAMBIO
  ADD CONSTRAINT fk_bitint_tx
  FOREIGN KEY (id_transaccion) REFERENCES TRANSACCION(id_transaccion),
  ADD CONSTRAINT fk_bitint_usuario_origen
  FOREIGN KEY (id_usuario_origen) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_bitint_usuario_destino
  FOREIGN KEY (id_usuario_destino) REFERENCES USUARIO(id_usuario);

-- PROMOCIÓN / LOGROS
ALTER TABLE PROMOCION
  ADD CONSTRAINT fk_promo_tipo
  FOREIGN KEY (id_tipo_promocion) REFERENCES TIPO_PROMOCION(id_tipo_promocion);

ALTER TABLE PROMOCION_PUBLICACION
  ADD CONSTRAINT fk_promopub_promo
  FOREIGN KEY (id_promocion) REFERENCES PROMOCION(id_promocion),
  ADD CONSTRAINT fk_promopub_pub
  FOREIGN KEY (id_publicacion) REFERENCES PUBLICACION(id_publicacion);

ALTER TABLE LOGRO
  ADD CONSTRAINT fk_logro_tipo
  FOREIGN KEY (id_tipo_logro) REFERENCES TIPO_LOGRO(id_tipo_logro);

ALTER TABLE USUARIO_LOGRO
  ADD CONSTRAINT fk_userlogro_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_userlogro_logro
  FOREIGN KEY (id_logro) REFERENCES LOGRO(id_logro);

-- ACTIVIDADES SOSTENIBLES
ALTER TABLE ACTIVIDAD_SOSTENIBLE
  ADD CONSTRAINT fk_actsos_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_actsos_tipo
  FOREIGN KEY (id_tipo_actividad) REFERENCES TIPO_ACTIVIDAD(id_tipo_actividad);

-- PUBLICIDAD
ALTER TABLE PUBLICIDAD
  ADD CONSTRAINT fk_publicidad_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_publicidad_ubi
  FOREIGN KEY (id_ubicacion) REFERENCES UBICACION_PUBLICIDAD(id_ubicacion);

-- REPORTES
ALTER TABLE REPORTE_IMPACTO
  ADD CONSTRAINT fk_repimp_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_repimp_tiporep
  FOREIGN KEY (id_tipo_reporte) REFERENCES TIPO_REPORTE(id_tipo_reporte),
  ADD CONSTRAINT fk_repimp_periodo
  FOREIGN KEY (id_periodo) REFERENCES PERIODO(id_periodo);

-- AMBIENTAL
ALTER TABLE EQUIVALENCIA_IMPACTO
  ADD CONSTRAINT fk_eqimp_categoria
  FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria),
  ADD CONSTRAINT fk_eqimp_um
  FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um);

ALTER TABLE IMPACTO_AMBIENTAL
  ADD CONSTRAINT fk_impamb_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_impamb_tx
  FOREIGN KEY (id_transaccion) REFERENCES TRANSACCION(id_transaccion),
  ADD CONSTRAINT fk_impamb_categoria
  FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria),
  ADD CONSTRAINT fk_impamb_periodo
  FOREIGN KEY (id_periodo) REFERENCES PERIODO(id_periodo);

ALTER TABLE EVENTO_AMBIENTAL
  ADD CONSTRAINT fk_eventoamb_usuario
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
  ADD CONSTRAINT fk_eventoamb_dimension
  FOREIGN KEY (id_dimension) REFERENCES DIMENSION_AMBIENTAL(id_dimension),
  ADD CONSTRAINT fk_eventoamb_um
  FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um);