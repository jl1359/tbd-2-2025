CREATE DATABASE IF NOT EXISTS servineo
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE servineo;

CREATE TABLE rol (
  id_rol           INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol       VARCHAR(50) NOT NULL UNIQUE,
  descripcion_rol  VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE usuario (
  id_us            INT AUTO_INCREMENT PRIMARY KEY,
  id_rol           INT NOT NULL,
  nombre_us        VARCHAR(50) NOT NULL,
  apellido_us      VARCHAR(50) NOT NULL,
  correo_us        VARCHAR(100) NOT NULL UNIQUE,
  telefono_us      VARCHAR(20),
  direccion_us     VARCHAR(255),
  ciudad_us        VARCHAR(100),
  pais_us          VARCHAR(100),
  fecha_registro   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado_us        TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE detalle_usuario (
  id_us                  INT PRIMARY KEY,
  cant_pub               INT DEFAULT 0,
  ultimo_ingreso         DATETIME,
  likes                  INT DEFAULT 0,
  favoritos              INT DEFAULT 0,
  denuncias              INT DEFAULT 0,
  intercambios_realizados INT DEFAULT 0,
  huella_contaminacion   DECIMAL(10,2) DEFAULT 0,
  CONSTRAINT fk_detalle_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE acceso (
  id_acceso        INT AUTO_INCREMENT PRIMARY KEY,
  id_us            INT NOT NULL,
  fecha_acceso     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_acc           VARCHAR(100),
  estado_acc       TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_acceso_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE contrasena (
  id_contra        INT AUTO_INCREMENT PRIMARY KEY,
  id_us            INT NOT NULL UNIQUE,
  hash_contra      TEXT NOT NULL,
  salt_contra      TEXT NOT NULL,
  fecha_cambio     DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contra_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE billetera (
  id_billetera       INT AUTO_INCREMENT PRIMARY KEY,
  id_us              INT NOT NULL UNIQUE,
  monto_total        DECIMAL(10,2) NOT NULL DEFAULT 0,
  actualizacion_bill DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_billetera_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ubicacion (
  id_ubi         INT AUTO_INCREMENT PRIMARY KEY,
  direccion_ubi  VARCHAR(150) NOT NULL,
  lat            DECIMAL(10,6),
  lon            DECIMAL(10,6),
  referencia     VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE unidad_medida (
  id_um        INT AUTO_INCREMENT PRIMARY KEY,
  nombre_um    VARCHAR(50) NOT NULL UNIQUE,
  simbolo_um   VARCHAR(10) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE categoria_servicio (
  id_cat_serv      INT AUTO_INCREMENT PRIMARY KEY,
  nombre_cat_serv  VARCHAR(100) NOT NULL UNIQUE,
  desc_cat_serv    VARCHAR(200)
) ENGINE=InnoDB;

CREATE TABLE estado_servicio (
  id_estado_serv     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_estado_serv VARCHAR(50) NOT NULL,
  desc_estado_serv   VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE servicio (
  id_servicio    INT AUTO_INCREMENT PRIMARY KEY,
  id_us          INT NOT NULL,
  id_cat_serv    INT NOT NULL,
  id_estado_serv INT NOT NULL,
  nombre_serv    VARCHAR(100) NOT NULL,
  desc_serv      VARCHAR(200),
  precio_serv    DECIMAL(10,2) NOT NULL,
  duracion_serv  INT,
  estado_serv    TINYINT(1) DEFAULT 1,
  id_um          INT,
  CONSTRAINT fk_serv_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_serv_categoria
    FOREIGN KEY (id_cat_serv) REFERENCES categoria_servicio(id_cat_serv)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_serv_estado
    FOREIGN KEY (id_estado_serv) REFERENCES estado_servicio(id_estado_serv)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_serv_um
    FOREIGN KEY (id_um) REFERENCES unidad_medida(id_um)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE categoria_producto (
  id_cat_prod          INT AUTO_INCREMENT PRIMARY KEY,
  nombre_cat_prod      VARCHAR(50) NOT NULL UNIQUE,
  descripcion_cat_prod VARCHAR(150)
) ENGINE=InnoDB;

CREATE TABLE producto (
  id_prod     INT AUTO_INCREMENT PRIMARY KEY,
  id_cat_prod INT NOT NULL,
  nombre_prod VARCHAR(50) NOT NULL,
  desc_prod   VARCHAR(150),
  precio_prod DECIMAL(10,2) NOT NULL,
  peso_prod   DECIMAL(10,2),
  id_um       INT,
  CONSTRAINT fk_prod_categoria
    FOREIGN KEY (id_cat_prod) REFERENCES categoria_producto(id_cat_prod)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_prod_um
    FOREIGN KEY (id_um) REFERENCES unidad_medida(id_um)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;


CREATE TABLE estado_publicacion (
  id_estado_pub     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_estado_pub VARCHAR(50) NOT NULL,
  desc_estado_pub   VARCHAR(50)
) ENGINE=InnoDB;

CREATE TABLE publicacion (
  id_pub         INT AUTO_INCREMENT PRIMARY KEY,
  id_us          INT NOT NULL,
  id_estado_pub  INT NOT NULL,
  titulo_pub     VARCHAR(100) NOT NULL,
  desc_pub       VARCHAR(200),
  valor_creditos DECIMAL(10,2) DEFAULT 0,
  fecha_pub      DATETIME DEFAULT CURRENT_TIMESTAMP,
  activa         TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_pub_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pub_estado
    FOREIGN KEY (id_estado_pub) REFERENCES estado_publicacion(id_estado_pub)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE publicacion_servicio (
  id_pub      INT NOT NULL,
  id_servicio INT NOT NULL,
  horario     VARCHAR(120),
  PRIMARY KEY (id_pub, id_servicio),
  CONSTRAINT fk_pubserv_pub
    FOREIGN KEY (id_pub) REFERENCES publicacion(id_pub)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pubserv_serv
    FOREIGN KEY (id_servicio) REFERENCES servicio(id_servicio)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE publicacion_producto (
  id_pub  INT NOT NULL,
  id_prod INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id_pub, id_prod),
  CONSTRAINT fk_pubprod_pub
    FOREIGN KEY (id_pub) REFERENCES publicacion(id_pub)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pubprod_prod
    FOREIGN KEY (id_prod) REFERENCES producto(id_prod)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


CREATE TABLE estado_promocion (
  id_estado_prom     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_estado_prom VARCHAR(100) NOT NULL,
  desc_estado_prom   VARCHAR(250)
) ENGINE=InnoDB;

CREATE TABLE promocion (
  id_prom        INT AUTO_INCREMENT PRIMARY KEY,
  id_estado_prom INT NOT NULL,
  titulo_prom    VARCHAR(50) NOT NULL,
  desc_prom      VARCHAR(100),
  fecha_ini_prom DATE NOT NULL,
  fecha_fin_prom DATE NOT NULL,
  descuento      DECIMAL(5,2) DEFAULT 0,
  activa         TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_prom_estado
    FOREIGN KEY (id_estado_prom) REFERENCES estado_promocion(id_estado_prom)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE promocion_servicios (
  id_prom     INT NOT NULL,
  id_servicio INT NOT NULL,
  PRIMARY KEY (id_prom, id_servicio),
  CONSTRAINT fk_promserv_prom
    FOREIGN KEY (id_prom) REFERENCES promocion(id_prom)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_promserv_serv
    FOREIGN KEY (id_servicio) REFERENCES servicio(id_servicio)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE promocion_productos (
  id_prom INT NOT NULL,
  id_prod INT NOT NULL,
  PRIMARY KEY (id_prom, id_prod),
  CONSTRAINT fk_promprod_prom
    FOREIGN KEY (id_prom) REFERENCES promocion(id_prom)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_promprod_prod
    FOREIGN KEY (id_prod) REFERENCES producto(id_prod)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


CREATE TABLE organizacion (
  id_org         INT AUTO_INCREMENT PRIMARY KEY,
  nombre_org     VARCHAR(100) NOT NULL,
  sitio_web      VARCHAR(150),
  telefono_org   VARCHAR(20),
  correo_org     VARCHAR(100),
  direccion_org  VARCHAR(255),
  descripcion_org VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE reporte (
  id_reporte   INT AUTO_INCREMENT PRIMARY KEY,
  id_us        INT NOT NULL,
  id_pub       INT,
  tipo_repor   INT,
  medio_repor  VARCHAR(200),
  desc_repor   TEXT,
  estado_repor TINYINT(1) DEFAULT 1,
  fecha_repor  DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reporte_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reporte_pub
    FOREIGN KEY (id_pub) REFERENCES publicacion(id_pub)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE tipo_bitacora (
  id_tipo_bit   INT AUTO_INCREMENT PRIMARY KEY,
  nombre_bit    VARCHAR(65) NOT NULL UNIQUE,
  desc_tipo_bit VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE bitacora (
  id_bitacora  INT AUTO_INCREMENT PRIMARY KEY,
  id_tipo_bit  INT,
  desc_bit     VARCHAR(200),
  ip_direccion VARCHAR(100),
  fecha_bit    DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bit_tipo
    FOREIGN KEY (id_tipo_bit) REFERENCES tipo_bitacora(id_tipo_bit)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE paquete_credito (
  id_paquete   INT AUTO_INCREMENT PRIMARY KEY,
  nombre_paq   VARCHAR(50) NOT NULL,
  cantidad_cred INT NOT NULL,
  precio_cred  DECIMAL(10,2) NOT NULL,
  estado       TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE compra_credito (
  id_compra      INT AUTO_INCREMENT PRIMARY KEY,
  id_paquete     INT,
  id_us          INT NOT NULL,
  monto_cred     DECIMAL(10,2) NOT NULL,
  estado_compra  TINYINT(1) DEFAULT 1,
  referencia_comp VARCHAR(100),
  proveedor_comp  VARCHAR(100),
  fecha_compra   DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_compra_paq
    FOREIGN KEY (id_paquete) REFERENCES paquete_credito(id_paquete)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_compra_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===========================
-- Intercambios / Transacciones / Movimientos
-- ===========================

CREATE TABLE intercambio (
  id_inter         INT AUTO_INCREMENT PRIMARY KEY,
  id_us_ofertante  INT NOT NULL,
  id_us_demandante INT NOT NULL,
  costo_inter      DECIMAL(10,2) DEFAULT 0,
  fecha_ini        DATETIME,
  fecha_fin        DATETIME,
  estado_inter     VARCHAR(30) DEFAULT 'pendiente',
  CONSTRAINT fk_inter_ofer
    FOREIGN KEY (id_us_ofertante) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inter_dema
    FOREIGN KEY (id_us_demandante) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE transaccion (
  id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
  id_inter       INT,
  id_us          INT NOT NULL,
  fecha_trans    DATETIME DEFAULT CURRENT_TIMESTAMP,
  monto_trans    DECIMAL(10,2) NOT NULL,
  exito_trans    TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_trans_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_trans_inter
    FOREIGN KEY (id_inter) REFERENCES intercambio(id_inter)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE tipo_movimiento (
  id_tipo_mov     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_tipo_mov VARCHAR(50) NOT NULL,
  descr_tipo_mov  VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE movimiento (
  id_mov       INT AUTO_INCREMENT PRIMARY KEY,
  id_us        INT NOT NULL,
  id_compra    INT,
  id_inter     INT,
  id_tipo_mov  INT NOT NULL,
  cant_mov     DECIMAL(10,2) NOT NULL,
  fecha_mov    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  desc_mov     VARCHAR(150),
  CONSTRAINT fk_mov_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mov_compra
    FOREIGN KEY (id_compra) REFERENCES compra_credito(id_compra)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_mov_inter
    FOREIGN KEY (id_inter) REFERENCES intercambio(id_inter)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_mov_tipo
    FOREIGN KEY (id_tipo_mov) REFERENCES tipo_movimiento(id_tipo_mov)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE recompensa (
  id_recompensa INT AUTO_INCREMENT PRIMARY KEY,
  tipo_recom    VARCHAR(100) NOT NULL,
  nombre_recom  VARCHAR(100) NOT NULL,
  monto_recom   DECIMAL(10,2) DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE usuario_logro (
  id_recompensa INT NOT NULL,
  id_us         INT NOT NULL,
  fecha_obtenido DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (id_recompensa, id_us),
  CONSTRAINT fk_ul_recompensa
    FOREIGN KEY (id_recompensa) REFERENCES recompensa(id_recompensa)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ul_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE evento (
  id_evento     INT AUTO_INCREMENT PRIMARY KEY,
  id_org        INT,
  nombre_even   VARCHAR(50) NOT NULL,
  desc_even     VARCHAR(200),
  fecha_ini_even DATE,
  fecha_fin_even DATE,
  precio_even   DECIMAL(10,2) DEFAULT 0,
  activo        TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_evento_org
    FOREIGN KEY (id_org) REFERENCES organizacion(id_org)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE evento_usuario (
  cod_evento_us INT AUTO_INCREMENT PRIMARY KEY,
  id_evento     INT NOT NULL,
  id_us         INT NOT NULL,
  fecha_reg     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_evento_user (id_evento, id_us),
  CONSTRAINT fk_eu_evento
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_eu_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE dimension_impacto (
  id_dim         INT AUTO_INCREMENT PRIMARY KEY,
  nombre_dim     VARCHAR(150) NOT NULL,
  descripcion_dim VARCHAR(150),
  co2            VARCHAR(70),
  agua           VARCHAR(70),
  energia        VARCHAR(70),
  desechos       VARCHAR(70)
) ENGINE=InnoDB;

CREATE TABLE impacto_mensual (
  id_impacto  INT AUTO_INCREMENT PRIMARY KEY,
  mes_impacto DATE NOT NULL,
  id_dim      INT NOT NULL,
  id_us       INT NOT NULL,
  UNI_id_um   INT,
  USU_id_um   INT,
  valor_total DECIMAL(10,2) DEFAULT 0,
  CONSTRAINT fk_impmen_dim
    FOREIGN KEY (id_dim) REFERENCES dimension_impacto(id_dim)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_impmen_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_impmen_uni_um
    FOREIGN KEY (UNI_id_um) REFERENCES unidad_medida(id_um)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_impmen_usu_um
    FOREIGN KEY (USU_id_um) REFERENCES unidad_medida(id_um)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE evento_impacto (
  id_eimpacto     INT AUTO_INCREMENT PRIMARY KEY,
  id_evento       INT NOT NULL,
  categoria_evento VARCHAR(50),
  fecha_registro  DATETIME DEFAULT CURRENT_TIMESTAMP,
  notas           TEXT,
  CONSTRAINT fk_eimpacto_evento
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE evento_impacto_detalle (
  id_detalle    INT AUTO_INCREMENT PRIMARY KEY,
  id_eimpacto   INT NOT NULL,
  id_dim        INT NOT NULL,
  id_um         INT,
  valor_impacto DECIMAL(12,2),
  CONSTRAINT fk_eimpdet_eimp
    FOREIGN KEY (id_eimpacto) REFERENCES evento_impacto(id_eimpacto)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_eimpdet_dim
    FOREIGN KEY (id_dim) REFERENCES dimension_impacto(id_dim)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_eimpdet_um
    FOREIGN KEY (id_um) REFERENCES unidad_medida(id_um)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE potenciador (
  id_poten       INT AUTO_INCREMENT PRIMARY KEY,
  id_us          INT NOT NULL,
  nombre_poten   VARCHAR(50) NOT NULL,
  precio_poten   DECIMAL(10,2) NOT NULL,
  duracion_poten INT, -- días
  fecha_ini_poten DATE,
  fecha_fin_poten DATE,
  estado_poten   TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_poten_usuario
    FOREIGN KEY (id_us) REFERENCES usuario(id_us)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE INDEX idx_usuario_correo ON usuario(correo_us);
CREATE INDEX idx_pub_estado ON publicacion(id_estado_pub);
CREATE INDEX idx_servicio_cat ON servicio(id_cat_serv);
CREATE INDEX idx_producto_cat ON producto(id_cat_prod);
CREATE INDEX idx_prom_activa ON promocion(activa);
CREATE INDEX idx_mov_us_fecha ON movimiento(id_us, fecha_mov);
CREATE INDEX idx_trans_user_fecha ON transaccion(id_us, fecha_trans);
CREATE INDEX idx_evento_org ON evento(id_org);
