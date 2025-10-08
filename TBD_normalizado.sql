
CREATE DATABASE EconomiaTrueque;
USE EconomiaTrueque;

CREATE TABLE ROL (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE ESTADO_PUBLICACION (
    id_estado_pub INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE ESTADO_SERVICIO (
    id_estado_serv INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE ESTADO_PROMOCION (
    id_estado_prom INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE TIPO_MOVIMIENTO (
    id_tipo_mov INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE TIPO_BITACORA (
    id_tipo_bit INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE UNIDAD_MEDIDA (
    id_um INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    simbolo VARCHAR(10) NOT NULL
);

CREATE TABLE USUARIO (
    id_us INT PRIMARY KEY AUTO_INCREMENT,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_rol) REFERENCES ROL(id_rol)
);

CREATE TABLE DETALLE_USUARIO (
    id_us INT PRIMARY KEY,
    cant_anuncios INT DEFAULT 0,
    ult_ingreso DATETIME,
    likes INT DEFAULT 0,
    favoritos INT DEFAULT 0,
    denuncias INT DEFAULT 0,
    ventas INT DEFAULT 0,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us) ON DELETE CASCADE
);

CREATE TABLE ACCESO (
    id_acc INT PRIMARY KEY AUTO_INCREMENT,
    id_us INT NOT NULL,
    fecha_acc DATETIME DEFAULT CURRENT_TIMESTAMP,
    exito BOOLEAN NOT NULL,
    ip VARCHAR(45),
    agente VARCHAR(500),
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE CONTRASENA (
    id_cmb INT PRIMARY KEY AUTO_INCREMENT,
    id_us INT NOT NULL,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE BILLETERA (
    id_us INT PRIMARY KEY,
    cuenta_bancaria VARCHAR(100),
    saldo DECIMAL(15,2) DEFAULT 0,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us) ON DELETE CASCADE
);

CREATE TABLE UBICACION (
    id_ub INT PRIMARY KEY AUTO_INCREMENT,
    direccion VARCHAR(500) NOT NULL
);


CREATE TABLE ORGANIZACION (
    id_org INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    correo VARCHAR(255),
    telefono VARCHAR(20),
    direccion VARCHAR(500),
    fecha_fundacion DATE,
    sitio_web VARCHAR(500),
    descripcion TEXT
);

CREATE TABLE EVENTO (
    cod_evento INT PRIMARY KEY AUTO_INCREMENT,
    id_org INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_ini DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_org) REFERENCES ORGANIZACION(id_org)
);

CREATE TABLE EVENTO_USUARIO (
    cod_evento INT,
    id_us INT,
    PRIMARY KEY (cod_evento, id_us),
    FOREIGN KEY (cod_evento) REFERENCES EVENTO(cod_evento) ON DELETE CASCADE,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us) ON DELETE CASCADE
);

CREATE TABLE CATEGORIA_PRODUCTO (
    id_cat_prod INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);


CREATE TABLE PRODUCTO (
    id_prod INT PRIMARY KEY AUTO_INCREMENT,
    id_cat_prod INT NOT NULL,
    id_subcat_prod INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(15,2) NOT NULL,
    peso DECIMAL(10,2),
    FOREIGN KEY (id_cat_prod) REFERENCES CATEGORIA_PRODUCTO(id_cat_prod)
);

CREATE TABLE CATEGORIA_SERVICIO (
    id_cat_serv INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE SERVICIO (
    id_serv INT PRIMARY KEY AUTO_INCREMENT,
    id_cat_serv INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(15,2) NOT NULL,
    duracion_min INT,
    id_estado_serv INT NOT NULL,
    FOREIGN KEY (id_cat_serv) REFERENCES CATEGORIA_SERVICIO(id_cat_serv),
    FOREIGN KEY (id_estado_serv) REFERENCES ESTADO_SERVICIO(id_estado_serv)
);

CREATE TABLE PUBLICACION (
    id_pub INT PRIMARY KEY AUTO_INCREMENT,
    id_us INT NOT NULL,
    id_ub INT NOT NULL,
    id_estado_pub INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    valor_creditos DECIMAL(15,2) NOT NULL,
    fecha_pub DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_act DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_ub) REFERENCES UBICACION(id_ub),
    FOREIGN KEY (id_estado_pub) REFERENCES ESTADO_PUBLICACION(id_estado_pub)
);

CREATE TABLE PUBLICACION_PRODUCTO (
    id_pub INT,
    id_prod INT,
    cantidad INT NOT NULL,
    id_um INT NOT NULL,
    PRIMARY KEY (id_pub, id_prod),
    FOREIGN KEY (id_pub) REFERENCES PUBLICACION(id_pub) ON DELETE CASCADE,
    FOREIGN KEY (id_prod) REFERENCES PRODUCTO(id_prod),
    FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
);

CREATE TABLE PUBLICACION_SERVICIO (
    id_pub INT,
    id_serv INT,
    horario VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_pub, id_serv),
    FOREIGN KEY (id_pub) REFERENCES PUBLICACION(id_pub) ON DELETE CASCADE,
    FOREIGN KEY (id_serv) REFERENCES SERVICIO(id_serv)
);

CREATE TABLE POTENCIADOR (
    id_poten INT PRIMARY KEY AUTO_INCREMENT,
    id_us INT NOT NULL,
    id_pub INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    duracion_dias INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_pub) REFERENCES PUBLICACION(id_pub)
);

CREATE TABLE PROMOCION (
    id_prom INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_ini DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    banner VARCHAR(500),
    descuento DECIMAL(5,2) NOT NULL,
    id_estado_prom INT NOT NULL,
    FOREIGN KEY (id_estado_prom) REFERENCES ESTADO_PROMOCION(id_estado_prom)
);

CREATE TABLE PROMOCION_PRODUCTO (
    id_prom INT,
    id_prod INT,
    PRIMARY KEY (id_prom, id_prod),
    FOREIGN KEY (id_prom) REFERENCES PROMOCION(id_prom) ON DELETE CASCADE,
    FOREIGN KEY (id_prod) REFERENCES PRODUCTO(id_prod)
);

CREATE TABLE PROMOCION_SERVICIO (
    id_prom INT,
    id_serv INT,
    PRIMARY KEY (id_prom, id_serv),
    FOREIGN KEY (id_prom) REFERENCES PROMOCION(id_prom) ON DELETE CASCADE,
    FOREIGN KEY (id_serv) REFERENCES SERVICIO(id_serv)
);

CREATE TABLE PAQUETE_CREDITO (
    id_paquete INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    cantidad_creditos INT NOT NULL,
    precio DECIMAL(15,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE COMPRA_CREDITO (
    id_compra INT PRIMARY KEY AUTO_INCREMENT,
    id_us INT NOT NULL,
    id_paquete INT NOT NULL,
    creditos INT NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    proveedor VARCHAR(100) NOT NULL,
    referencia VARCHAR(100),
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    aprobado_en DATETIME,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_paquete) REFERENCES PAQUETE_CREDITO(id_paquete)
);

CREATE TABLE INTERCAMBIO (
    id_inter INT PRIMARY KEY AUTO_INCREMENT,
    id_us_comp INT NOT NULL,
    id_us_vend INT NOT NULL,
    id_pub INT NOT NULL,
    id_ub_origen INT NOT NULL,
    id_ub_destino INT NOT NULL,
    id_um INT NOT NULL,
    costo_reembolso DECIMAL(15,2),
    fecha_sol DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_acept DATETIME,
    fecha_comp DATETIME,
    FOREIGN KEY (id_us_comp) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_us_vend) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_pub) REFERENCES PUBLICACION(id_pub),
    FOREIGN KEY (id_ub_origen) REFERENCES UBICACION(id_ub),
    FOREIGN KEY (id_ub_destino) REFERENCES UBICACION(id_ub),
    FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
);

CREATE TABLE TRANSACCION (
    id_trans INT PRIMARY KEY AUTO_INCREMENT,
    id_us INT NOT NULL,
    id_us2 INT NOT NULL,
    id_inter INT,
    cod_evento INT,
    fecha_trans DATETIME DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(15,2) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_us2) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_inter) REFERENCES INTERCAMBIO(id_inter),
    FOREIGN KEY (cod_evento) REFERENCES EVENTO(cod_evento)
);

CREATE TABLE MOVIMIENTO (
    id_mov INT PRIMARY KEY AUTO_INCREMENT,
    id_us INT NOT NULL,
    id_tipo_mov INT NOT NULL,
    cantidad DECIMAL(15,2) NOT NULL,
    fecha_mov DATETIME DEFAULT CURRENT_TIMESTAMP,
    descripcion VARCHAR(255),
    id_inter INT,
    id_compra INT,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_tipo_mov) REFERENCES TIPO_MOVIMIENTO(id_tipo_mov),
    FOREIGN KEY (id_inter) REFERENCES INTERCAMBIO(id_inter),
    FOREIGN KEY (id_compra) REFERENCES COMPRA_CREDITO(id_compra)
);

CREATE TABLE ORIGEN_IMPACTO (
    id_origen_imp INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE DIMENSION_IMPACTO (
    id_dim INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE DIMENSION_UNIDAD (
    id_dim INT,
    id_um INT,
    PRIMARY KEY (id_dim, id_um),
    FOREIGN KEY (id_dim) REFERENCES DIMENSION_IMPACTO(id_dim),
    FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
);

CREATE TABLE FACTOR_CONVERSION (
    id_dim INT,
    id_um_origen INT,
    id_um_dest INT,
    factor DECIMAL(15,6) NOT NULL,
    PRIMARY KEY (id_dim, id_um_origen, id_um_dest),
    FOREIGN KEY (id_dim) REFERENCES DIMENSION_IMPACTO(id_dim),
    FOREIGN KEY (id_um_origen) REFERENCES UNIDAD_MEDIDA(id_um),
    FOREIGN KEY (id_um_dest) REFERENCES UNIDAD_MEDIDA(id_um)
);

CREATE TABLE EVENTO_IMPACTO (
    id_impacto INT PRIMARY KEY AUTO_INCREMENT,
    id_us INT NOT NULL,
    id_origen_imp INT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_origen_imp) REFERENCES ORIGEN_IMPACTO(id_origen_imp)
);

CREATE TABLE EVENTO_IMPACTO_DETALLE (
    id_impacto INT,
    id_dim INT,
    valor DECIMAL(15,4) NOT NULL,
    id_um INT NOT NULL,
    PRIMARY KEY (id_impacto, id_dim),
    FOREIGN KEY (id_impacto) REFERENCES EVENTO_IMPACTO(id_impacto) ON DELETE CASCADE,
    FOREIGN KEY (id_dim) REFERENCES DIMENSION_IMPACTO(id_dim),
    FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
);

CREATE TABLE IMPACTO_MENSUAL (
    ym DATE,
    id_us INT,
    id_dim INT,
    categoria VARCHAR(100),
    valor_total DECIMAL(15,4) NOT NULL,
    id_um INT NOT NULL,
    PRIMARY KEY (ym, id_us, id_dim, categoria),
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_dim) REFERENCES DIMENSION_IMPACTO(id_dim),
    FOREIGN KEY (id_um) REFERENCES UNIDAD_MEDIDA(id_um)
);

CREATE TABLE RECOMPENSA (
    id_rec INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    monto DECIMAL(15,2) NOT NULL
);

CREATE TABLE USUARIO_LOGRO (
    id_us INT,
    id_rec INT,
    fecha_obtencion DATE NOT NULL,
    PRIMARY KEY (id_us, id_rec),
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us) ON DELETE CASCADE,
    FOREIGN KEY (id_rec) REFERENCES RECOMPENSA(id_rec)
);

CREATE TABLE REPORTE (
    id_reporte INT PRIMARY KEY AUTO_INCREMENT,
    id_reportante INT NOT NULL,
    id_usuario_reportado INT,
    id_pub_reportada INT,
    motivo VARCHAR(500) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_admin_resuelve INT,
    FOREIGN KEY (id_reportante) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_usuario_reportado) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_pub_reportada) REFERENCES PUBLICACION(id_pub),
    FOREIGN KEY (id_admin_resuelve) REFERENCES USUARIO(id_us)
);

CREATE TABLE BITACORA (
    id_bitacora INT PRIMARY KEY AUTO_INCREMENT,
    id_tipo_bit INT NOT NULL,
    id_us INT,
    entidad VARCHAR(100) NOT NULL,
    id_entidad INT,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ip VARCHAR(45),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo_bit) REFERENCES TIPO_BITACORA(id_tipo_bit),
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE INDEX idx_usuario_email ON USUARIO(email);
CREATE INDEX idx_usuario_rol ON USUARIO(id_rol);
CREATE INDEX idx_publicacion_usuario ON PUBLICACION(id_us);
CREATE INDEX idx_publicacion_estado ON PUBLICACION(id_estado_pub);
CREATE INDEX idx_publicacion_fecha ON PUBLICACION(fecha_pub);
CREATE INDEX idx_intercambio_comprador ON INTERCAMBIO(id_us_comp);
CREATE INDEX idx_intercambio_vendedor ON INTERCAMBIO(id_us_vend);
CREATE INDEX idx_intercambio_fecha ON INTERCAMBIO(fecha_sol);
CREATE INDEX idx_transaccion_fecha ON TRANSACCION(fecha_trans);
CREATE INDEX idx_movimiento_usuario ON MOVIMIENTO(id_us);
CREATE INDEX idx_movimiento_fecha ON MOVIMIENTO(fecha_mov);
CREATE INDEX idx_evento_fecha ON EVENTO(fecha_ini);
CREATE INDEX idx_reporte_fecha ON REPORTE(fecha_reporte);
CREATE INDEX idx_bitacora_fecha ON BITACORA(fecha);
CREATE INDEX idx_impacto_usuario ON EVENTO_IMPACTO(id_us);
CREATE INDEX idx_impacto_fecha ON EVENTO_IMPACTO(creado_en);
