DROP DATABASE IF EXISTS TruequeComercioCircular;
CREATE DATABASE IF NOT EXISTS TruequeComercioCircular
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE TruequeComercioCircular;

-- Catálogos / Estados

CREATE TABLE ROL (
  id_rol INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_rol_nombre (nombre)
) ;

CREATE TABLE ESTADO_PUBLICACION (
  id_estado_pub INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_est_pub_nombre (nombre)
);

CREATE TABLE ESTADO_SERVICIO (
  id_estado_serv INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_est_serv_nombre (nombre)
);

CREATE TABLE ESTADO_PROMOCION (
  id_estado_prom INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_est_prom_nombre (nombre)
);

CREATE TABLE ESTADO_TRANSACCION (
  id_estado_trans INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_est_trans_nombre (nombre)
);

CREATE TABLE ESTADO_REPORTE (
  id_estado_rep INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_est_rep_nombre (nombre)
);

-- Señal de signo para el cálculo de saldos

CREATE TABLE TIPO_MOVIMIENTO (
  id_tipo_mov INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  signo ENUM('IN','OUT') NOT NULL,        -- IN = abono/ingreso ^ OUT = débito/egreso
  descripcion VARCHAR(255),
  UNIQUE KEY uq_tipo_mov_nombre (nombre)
) ;

CREATE TABLE TIPO_BITACORA (
  id_tipo_bit INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_tipo_bit_nombre (nombre)
) ;

CREATE TABLE UNIDAD_MEDIDA (
  id_um INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  simbolo VARCHAR(10) NOT NULL,
  UNIQUE KEY uq_um_nombre (nombre),
  UNIQUE KEY uq_um_simbolo (simbolo)
) ;
-- Entidades base de usuarios
CREATE TABLE USUARIO (
  id_us INT PRIMARY KEY AUTO_INCREMENT,
  id_rol INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (id_rol) REFERENCES ROL(id_rol)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE DETALLE_USUARIO (
  id_us INT PRIMARY KEY,
  cant_anuncios INT NOT NULL DEFAULT 0,
  ult_ingreso DATETIME,
  likes INT NOT NULL DEFAULT 0,
  favoritos INT NOT NULL DEFAULT 0,
  denuncias INT NOT NULL DEFAULT 0,
  ventas INT NOT NULL DEFAULT 0,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE ACCESO (
  id_acc INT PRIMARY KEY AUTO_INCREMENT,
  id_us INT NOT NULL,
  fecha_acc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exito BOOLEAN NOT NULL,
  ip VARCHAR(45),
  agente VARCHAR(500),
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
) ;

CREATE TABLE CONTRASENA (
  id_cmb INT PRIMARY KEY AUTO_INCREMENT,
  id_us INT NOT NULL,
  hash VARBINARY(255) NOT NULL,  -- bcrypt/argon2
  fecha_cambio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_contrasena_usuario (id_us),
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Sin 'saldo' (lo calculamos vía vista)

CREATE TABLE BILLETERA (
  id_us INT PRIMARY KEY,
  cuenta_bancaria VARCHAR(100),
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Ubicación / Organización / Eventos

CREATE TABLE UBICACION (
  id_ub INT PRIMARY KEY AUTO_INCREMENT,
  direccion VARCHAR(500) NOT NULL,
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  lat DECIMAL(9,6),
  lon DECIMAL(9,6)
) ;

CREATE TABLE ORGANIZACION (
  id_org INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  correo VARCHAR(255),
  telefono VARCHAR(20),
  direccion VARCHAR(500),
  fecha_fundacion DATE,
  sitio_web VARCHAR(500),
  descripcion TEXT,
  UNIQUE KEY uq_org_nombre (nombre)
) ;

CREATE TABLE EVENTO (
  cod_evento INT PRIMARY KEY AUTO_INCREMENT,
  id_org INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_ini DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (id_org) REFERENCES ORGANIZACION(id_org)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_evento_fechas CHECK (fecha_fin >= fecha_ini),
  CONSTRAINT chk_evento_precio CHECK (precio >= 0)
) ;

CREATE TABLE EVENTO_USUARIO (
  cod_evento INT,
  id_us INT,
  PRIMARY KEY (cod_evento, id_us),
  FOREIGN KEY (cod_evento) REFERENCES EVENTO(cod_evento)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
) ;

-- Productos / Servicios / Publicaciones

CREATE TABLE CATEGORIA_PRODUCTO (
  id_cat_prod INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_cat_prod_nombre (nombre)
) ;

CREATE TABLE PRODUCTO (
  id_prod INT PRIMARY KEY AUTO_INCREMENT,
  id_cat_prod INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(15,2) NOT NULL,
  peso DECIMAL(10,2),
  FOREIGN KEY (id_cat_prod) REFERENCES CATEGORIA_PRODUCTO(id_cat_prod)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_producto_precio CHECK (precio >= 0),
  CONSTRAINT chk_producto_peso CHECK (peso IS NULL OR peso >= 0)
) ;

CREATE TABLE CATEGORIA_SERVICIO (
  id_cat_serv INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_cat_serv_nombre (nombre)
);

CREATE TABLE SERVICIO (
  id_serv INT PRIMARY KEY AUTO_INCREMENT,
  id_cat_serv INT NOT NULL,
  id_us INT NOT NULL, -- dueño del servicio
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(15,2) NOT NULL,
  duracion_min INT,
  id_estado_serv INT NOT NULL,
  FOREIGN KEY (id_cat_serv) REFERENCES CATEGORIA_SERVICIO(id_cat_serv)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_estado_serv) REFERENCES ESTADO_SERVICIO(id_estado_serv)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_servicio_precio CHECK (precio >= 0),
  CONSTRAINT chk_servicio_duracion CHECK (duracion_min IS NULL OR duracion_min >= 0)
) ;

CREATE TABLE PUBLICACION (
  id_pub INT PRIMARY KEY AUTO_INCREMENT,
  id_us INT NOT NULL,
  id_ub INT NOT NULL,
  id_estado_pub INT NOT NULL,
  tipo ENUM('PRODUCTO','SERVICIO') NOT NULL, -- REGLA: una publicación es de un solo tipo
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  valor_creditos DECIMAL(15,2) NOT NULL DEFAULT 0,
  fecha_pub DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_act DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_ub) REFERENCES UBICACION(id_ub)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_estado_pub) REFERENCES ESTADO_PUBLICACION(id_estado_pub)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_publicacion_creditos CHECK (valor_creditos >= 0),
  CONSTRAINT chk_pub_fechas CHECK (fecha_act >= fecha_pub)
);

CREATE TABLE PUBLICACION_PRODUCTO (
  id_pub INT,
  id_prod INT,
  cantidad INT NOT NULL,
  id_um INT NOT NULL,
  PRIMARY KEY (id_pub, id_prod),
  FOREIGN KEY (id_pub) REFERENCES PUBLICACION(id_pub)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_prod) REFERENCES PRODUCTO(id_prod)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_pubprod_cantidad CHECK (cantidad > 0)
) ;

CREATE TABLE PUBLICACION_SERVICIO (
  id_pub INT,
  id_serv INT,
  horario VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_pub, id_serv),
  FOREIGN KEY (id_pub) REFERENCES PUBLICACION(id_pub)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_serv) REFERENCES SERVICIO(id_serv)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Potenciadores / Promociones

CREATE TABLE POTENCIADOR (
  id_poten INT PRIMARY KEY AUTO_INCREMENT,
  id_us INT NOT NULL,
  id_pub INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  duracion_dias INT NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_pub) REFERENCES PUBLICACION(id_pub)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_poten_precio CHECK (precio >= 0),
  CONSTRAINT chk_poten_duracion CHECK (duracion_dias > 0),
  CONSTRAINT chk_poten_fechas CHECK (fecha_fin >= fecha_inicio)
) ;

CREATE TABLE PROMOCION (
  id_prom INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_ini DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  banner VARCHAR(500),
  descuento DECIMAL(5,2) NOT NULL, -- 0..100 %
  id_estado_prom INT NOT NULL,
  FOREIGN KEY (id_estado_prom) REFERENCES ESTADO_PROMOCION(id_estado_prom)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_prom_fechas CHECK (fecha_fin >= fecha_ini),
  CONSTRAINT chk_prom_desc CHECK (descuento >= 0 AND descuento <= 100)
) ;

CREATE TABLE PROMOCION_PRODUCTO (
  id_prom INT,
  id_prod INT,
  PRIMARY KEY (id_prom, id_prod),
  FOREIGN KEY (id_prom) REFERENCES PROMOCION(id_prom)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_prod) REFERENCES PRODUCTO(id_prod)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE PROMOCION_SERVICIO (
  id_prom INT,
  id_serv INT,
  PRIMARY KEY (id_prom, id_serv),
  FOREIGN KEY (id_prom) REFERENCES PROMOCION(id_prom)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_serv) REFERENCES SERVICIO(id_serv)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

-- Créditos / Movimientos / Transacciones

CREATE TABLE PAQUETE_CREDITO (
  id_paquete INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  cantidad_creditos INT NOT NULL,
  precio DECIMAL(15,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_paq_creditos CHECK (cantidad_creditos > 0),
  CONSTRAINT chk_paq_precio CHECK (precio >= 0),
  UNIQUE KEY uq_paquete_nombre (nombre)
) ;

CREATE TABLE COMPRA_CREDITO (
  id_compra INT PRIMARY KEY AUTO_INCREMENT,
  id_us INT NOT NULL,
  id_paquete INT NOT NULL,
  creditos INT NOT NULL,
  monto DECIMAL(15,2) NOT NULL,
  proveedor VARCHAR(100) NOT NULL,
  referencia VARCHAR(100),
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  aprobado_en DATETIME,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_paquete) REFERENCES PAQUETE_CREDITO(id_paquete)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_compra_creditos CHECK (creditos > 0),
  CONSTRAINT chk_compra_monto CHECK (monto >= 0)
) ;

-- Estados de intercambio + cantidad
CREATE TABLE ESTADO_INTERCAMBIO (
  id_estado_inter INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(255)
) ;

CREATE TABLE INTERCAMBIO (
  id_inter INT PRIMARY KEY AUTO_INCREMENT,
  id_us_comp INT NOT NULL,  -- comprador/solicitante
  id_us_vend INT NOT NULL,  -- vendedor/ofertante
  id_pub INT NOT NULL,
  id_ub_origen INT NOT NULL,
  id_ub_destino INT NOT NULL,
  id_um INT NOT NULL,
  cantidad DECIMAL(15,4) NOT NULL,
  costo_reembolso DECIMAL(15,2),
  fecha_sol DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_acept DATETIME,
  fecha_comp DATETIME,
  id_estado_inter INT NOT NULL,
  FOREIGN KEY (id_us_comp) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_us_vend) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_pub) REFERENCES PUBLICACION(id_pub)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_ub_origen) REFERENCES UBICACION(id_ub)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_ub_destino) REFERENCES UBICACION(id_ub)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_estado_inter) REFERENCES ESTADO_INTERCAMBIO(id_estado_inter)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_inter_costo CHECK (costo_reembolso IS NULL OR costo_reembolso >= 0),
  CONSTRAINT chk_inter_fechas CHECK (
      (fecha_acept IS NULL OR fecha_acept >= fecha_sol)
  AND (fecha_comp  IS NULL OR fecha_comp  >= COALESCE(fecha_acept, fecha_sol))
  )
) ;

CREATE TABLE TRANSACCION (
  id_trans INT PRIMARY KEY AUTO_INCREMENT,
  id_us INT NOT NULL,    -- origen
  id_us2 INT NOT NULL,   -- destino
  id_inter INT,
  cod_evento INT,
  fecha_trans DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto DECIMAL(15,2) NOT NULL,
  id_estado_trans INT NOT NULL,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_us2) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_inter) REFERENCES INTERCAMBIO(id_inter)
    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (cod_evento) REFERENCES EVENTO(cod_evento)
    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (id_estado_trans) REFERENCES ESTADO_TRANSACCION(id_estado_trans)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_trans_monto CHECK (monto >= 0)
) ;

CREATE TABLE MOVIMIENTO (
  id_mov INT PRIMARY KEY AUTO_INCREMENT,
  id_us INT NOT NULL,
  id_tipo_mov INT NOT NULL,
  cantidad DECIMAL(15,2) NOT NULL,
  fecha_mov DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descripcion VARCHAR(255),
  id_inter INT,
  id_compra INT,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_tipo_mov) REFERENCES TIPO_MOVIMIENTO(id_tipo_mov)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_inter) REFERENCES INTERCAMBIO(id_inter)
    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (id_compra) REFERENCES COMPRA_CREDITO(id_compra)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT chk_mov_cantidad CHECK (cantidad > 0)
) ;

-- Impacto ambiental
CREATE TABLE ORIGEN_IMPACTO (
  id_origen_imp INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_origen_imp_nombre (nombre)
) ;

CREATE TABLE DIMENSION_IMPACTO (
  id_dim INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  UNIQUE KEY uq_dim_imp_nombre (nombre)
);

CREATE TABLE DIMENSION_UNIDAD (
  id_dim INT,
  id_um INT,
  PRIMARY KEY (id_dim, id_um),
  FOREIGN KEY (id_dim) REFERENCES DIMENSION_IMPACTO(id_dim)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE FACTOR_CONVERSION (
  id_dim INT,
  id_um_origen INT,
  id_um_dest INT,
  factor DECIMAL(15,6) NOT NULL,
  PRIMARY KEY (id_dim, id_um_origen, id_um_dest),
  FOREIGN KEY (id_dim) REFERENCES DIMENSION_IMPACTO(id_dim)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_um_origen) REFERENCES UNIDAD_MEDIDA(id_um)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_um_dest) REFERENCES UNIDAD_MEDIDA(id_um)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_fc_pos CHECK (factor > 0)
);

CREATE TABLE EVENTO_IMPACTO (
  id_impacto INT PRIMARY KEY AUTO_INCREMENT,
  id_us INT NOT NULL,
  id_origen_imp INT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notas TEXT,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_origen_imp) REFERENCES ORIGEN_IMPACTO(id_origen_imp)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE EVENTO_IMPACTO_DETALLE (
  id_impacto INT,
  id_dim INT,
  valor DECIMAL(15,4) NOT NULL,
  id_um INT NOT NULL,
  PRIMARY KEY (id_impacto, id_dim),
  FOREIGN KEY (id_impacto) REFERENCES EVENTO_IMPACTO(id_impacto)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_dim) REFERENCES DIMENSION_IMPACTO(id_dim)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_ei_valor CHECK (valor >= 0)
);

CREATE TABLE IMPACTO_MENSUAL (
  ym DATE,                 -- usar día 1 del mes
  id_us INT,
  id_dim INT,
  categoria VARCHAR(100),
  valor_total DECIMAL(15,4) NOT NULL,
  id_um INT NOT NULL,
  -- columnas generadas para analítica
  anio  SMALLINT AS (YEAR(ym)) STORED,
  mes   TINYINT  AS (MONTH(ym)) STORED,
  PRIMARY KEY (ym, id_us, id_dim, categoria),
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_dim) REFERENCES DIMENSION_IMPACTO(id_dim)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_imp_mensual_valor CHECK (valor_total >= 0)
);

-- =============================================
-- Recompensas / Reportes / Bitácora
-- =============================================
CREATE TABLE RECOMPENSA (
  id_rec INT PRIMARY KEY AUTO_INCREMENT,
  tipo VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  monto DECIMAL(15,2) NOT NULL,
  CONSTRAINT chk_recompensa_monto CHECK (monto >= 0)
);

CREATE TABLE USUARIO_LOGRO (
  id_us INT,
  id_rec INT,
  fecha_obtencion DATE NOT NULL,
  PRIMARY KEY (id_us, id_rec),
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_rec) REFERENCES RECOMPENSA(id_rec)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE REPORTE (
  id_reporte INT PRIMARY KEY AUTO_INCREMENT,
  id_reportante INT NOT NULL,
  id_usuario_reportado INT,
  id_pub_reportada INT,
  motivo VARCHAR(500) NOT NULL,
  fecha_reporte DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_admin_resuelve INT,
  id_estado_rep INT NOT NULL,
  FOREIGN KEY (id_reportante) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_usuario_reportado) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (id_pub_reportada) REFERENCES PUBLICACION(id_pub)
    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (id_admin_resuelve) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (id_estado_rep) REFERENCES ESTADO_REPORTE(id_estado_rep)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ;

CREATE TABLE BITACORA (
  id_bitacora INT PRIMARY KEY AUTO_INCREMENT,
  id_tipo_bit INT NOT NULL,
  id_us INT,
  entidad VARCHAR(100) NOT NULL,
  id_entidad INT,
  accion VARCHAR(100) NOT NULL,
  descripcion TEXT,
  ip VARCHAR(45),
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_tipo_bit) REFERENCES TIPO_BITACORA(id_tipo_bit)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
    ON UPDATE CASCADE ON DELETE SET NULL
) ;

-- Índices recomendados

CREATE INDEX idx_usuario_email ON USUARIO(email);
CREATE INDEX idx_usuario_rol ON USUARIO(id_rol);

CREATE INDEX idx_publicacion_usuario ON PUBLICACION(id_us);
CREATE INDEX idx_publicacion_estado ON PUBLICACION(id_estado_pub);
CREATE INDEX idx_publicacion_fecha ON PUBLICACION(fecha_pub);
CREATE INDEX idx_publicacion_ub ON PUBLICACION(id_ub);
CREATE INDEX idx_pub_usuario_fecha ON PUBLICACION(id_us, fecha_pub);

CREATE INDEX idx_serv_cat_estado ON SERVICIO(id_cat_serv, id_estado_serv);
CREATE INDEX idx_serv_usuario ON SERVICIO(id_us);
CREATE INDEX idx_serv_estado_user ON SERVICIO(id_estado_serv, id_us);

CREATE INDEX idx_producto_cat ON PRODUCTO(id_cat_prod);

CREATE INDEX idx_intercambio_comprador ON INTERCAMBIO(id_us_comp);
CREATE INDEX idx_intercambio_vendedor ON INTERCAMBIO(id_us_vend);
CREATE INDEX idx_intercambio_fecha ON INTERCAMBIO(fecha_sol);

CREATE INDEX idx_transaccion_fecha ON TRANSACCION(fecha_trans);
CREATE INDEX idx_transaccion_inter ON TRANSACCION(id_inter);

CREATE INDEX idx_movimiento_usuario ON MOVIMIENTO(id_us);
CREATE INDEX idx_movimiento_fecha ON MOVIMIENTO(fecha_mov);

CREATE INDEX idx_evento_fecha ON EVENTO(fecha_ini);
CREATE INDEX idx_evento_usuario ON EVENTO_USUARIO(id_us);

CREATE INDEX idx_reporte_fecha ON REPORTE(fecha_reporte);
CREATE INDEX idx_bitacora_fecha ON BITACORA(fecha);
CREATE INDEX idx_bitacora_objeto ON BITACORA(entidad, id_entidad, fecha);

CREATE INDEX idx_impacto_usuario ON EVENTO_IMPACTO(id_us);
CREATE INDEX idx_impacto_fecha ON EVENTO_IMPACTO(creado_en);
CREATE INDEX idx_imp_mensual_user_dim_mes ON IMPACTO_MENSUAL(id_us,id_dim,anio,mes);

CREATE INDEX idx_ub_geo ON UBICACION(ciudad, provincia);