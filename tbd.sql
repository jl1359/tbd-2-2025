
CREATE DATABASE plataforma_trueque_verde;
USE plataforma_trueque_verde;

CREATE TABLE ROLES(
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE CATEGORIAS(
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE USUARIOS(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_rol INT DEFAULT 1,
    saldo_creditos DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);


CREATE TABLE PUBLICACIONES (
    id_publicacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_categoria INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo ENUM('producto', 'servicio') NOT NULL,
    valor_creditos DECIMAL(10,2) NOT NULL,
    estado ENUM('activa', 'inactiva', 'vendida', 'eliminada') DEFAULT 'activa',
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    imagen_url VARCHAR(500),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE TRANSACCIONES(
    id_transaccion INT PRIMARY KEY AUTO_INCREMENT,
    id_publicacion INT NOT NULL,
    id_comprador INT NOT NULL,
    id_vendedor INT NOT NULL,
    creditos_transferidos DECIMAL(10,2) NOT NULL,
    fecha_transaccion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'completada', 'cancelada', 'rechazada') DEFAULT 'pendiente',
    calificacion_comprador TINYINT CHECK (calificacion_comprador BETWEEN 1 AND 5),
    calificacion_vendedor TINYINT CHECK (calificacion_vendedor BETWEEN 1 AND 5),
    comentarios TEXT,
    FOREIGN KEY (id_publicacion) REFERENCES PUBLICACIONES(id_publicacion),
    FOREIGN KEY (id_comprador) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_vendedor) REFERENCES USUARIOS(id_usuario)
);

CREATE TABLE COMPRA_CREDITOS (
    id_compra INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    cantidad_creditos DECIMAL(10,2) NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'Bs',
    metodo_pago VARCHAR(50),
    fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'completada', 'fallida') DEFAULT 'pendiente',
    transaccion_id VARCHAR(100),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);

CREATE TABLE BITACORA_INTERCAMBIOS (
    id_bitacora INT PRIMARY KEY AUTO_INCREMENT,
    id_transaccion INT,
    id_usuario_origen INT,
    id_usuario_destino INT,
    tipo_operacion ENUM('compra', 'venta', 'bonificacion', 'incentivo'),
    creditos DECIMAL(10,2),
    descripcion TEXT,
    fecha_operacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_transaccion) REFERENCES TRANSACCIONES(id_transaccion),
    FOREIGN KEY (id_usuario_origen) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_usuario_destino) REFERENCES USUARIOS(id_usuario)
);

CREATE TABLE BITACORA_CREDITOS (
    id_bitacora_credito INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    tipo_movimiento ENUM('compra', 'intercambio_ganancia', 'intercambio_gasto', 'incentivo', 'bonificacion'),
    creditos_anteriores DECIMAL(10,2),
    creditos_movimiento DECIMAL(10,2),
    creditos_nuevos DECIMAL(10,2),
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    id_referencia INT, 
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);

CREATE TABLE BITACORA_ACCESO (
    id_acceso INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    email VARCHAR(255),
    tipo_acceso ENUM('login', 'logout', 'intento_fallido'),
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    exitoso BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);

CREATE TABLE IMPACTO_AMBIENTAL (
    id_impacto INT PRIMARY KEY AUTO_INCREMENT,
    id_transaccion INT NOT NULL,
    id_categoria INT NOT NULL,
    co2_ahorrado DECIMAL(10,2), 
    fecha_calculo DATE,
    FOREIGN KEY (id_transaccion) REFERENCES TRANSACCIONES(id_transaccion),
    FOREIGN KEY (id_categoria) REFERENCES CATEGORIAS(id_categoria)
);

CREATE INDEX idx_usuarios_email ON USUARIOS(email);
CREATE INDEX idx_publicaciones_estado ON PUBLICACIONES(estado);
CREATE INDEX idx_publicaciones_categoria ON PUBLICACIONES(id_categoria);
CREATE INDEX idx_transacciones_comprador ON TRANSACCIONES(id_comprador);
CREATE INDEX idx_transacciones_vendedor ON TRANSACCIONES(id_vendedor);
CREATE INDEX idx_transacciones_estado ON TRANSACCIONES(estado);
CREATE INDEX idx_bitacora_acceso_fecha ON BITACORA_ACCESO(fecha_hora);

-- Trigger para actualizar saldo automáticamente
DELIMITER //
CREATE TRIGGER after_transaccion_completada
    AFTER UPDATE ON TRANSACCIONES
    FOR EACH ROW
BEGIN
    IF NEW.estado = 'completada' AND OLD.estado != 'completada' THEN
        -- Descontar créditos al comprador
        UPDATE USUARIOS 
        SET saldo_creditos = saldo_creditos - NEW.creditos_transferidos
        WHERE id_usuario = NEW.id_comprador;
        
        -- Sumar créditos al vendedor
        UPDATE USUARIOS 
        SET saldo_creditos = saldo_creditos + NEW.creditos_transferidos
        WHERE id_usuario = NEW.id_vendedor;
        
        -- Registrar en bitácora de créditos
        INSERT INTO BITACORA_CREDITOS (id_usuario, tipo_movimiento, creditos_anteriores, creditos_movimiento, creditos_nuevos, descripcion, id_referencia)
        SELECT NEW.id_comprador, 'intercambio_gasto', saldo_creditos, -NEW.creditos_transferidos, saldo_creditos - NEW.creditos_transferidos, 'Compra realizada', NEW.id_transaccion
        FROM USUARIOS WHERE id_usuario = NEW.id_comprador;
        
        INSERT INTO BITACORA_CREDITOS (id_usuario, tipo_movimiento, creditos_anteriores, creditos_movimiento, creditos_nuevos, descripcion, id_referencia)
        SELECT NEW.id_vendedor, 'intercambio_ganancia', saldo_creditos, NEW.creditos_transferidos, saldo_creditos + NEW.creditos_transferidos, 'Venta realizada', NEW.id_transaccion
        FROM USUARIOS WHERE id_usuario = NEW.id_vendedor;
    END IF;
END//
DELIMITER ;

-- Tabla para mensajes entre usuarios
CREATE TABLE MENSAJES (
    id_mensaje INT PRIMARY KEY AUTO_INCREMENT,
    id_remitente INT NOT NULL,
    id_destinatario INT NOT NULL,
    id_publicacion INT,
    asunto VARCHAR(200),
    mensaje TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_remitente) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_destinatario) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_publicacion) REFERENCES PUBLICACIONES(id_publicacion)
);

-- Tabla para favoritos
CREATE TABLE FAVORITOS (
    id_favorito INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_publicacion INT NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_publicacion) REFERENCES PUBLICACIONES(id_publicacion),
    UNIQUE KEY unique_favorito (id_usuario, id_publicacion)
);

-- Tabla para ubicaciones/zonas de intercambio
CREATE TABLE UBICACIONES (
    id_ubicacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    direccion TEXT,
    ciudad VARCHAR(100),
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    es_principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);

-- Vista para dashboard de administración
CREATE VIEW VISTA_DASHBOARD AS
SELECT 
    (SELECT COUNT(*) FROM USUARIOS) as total_usuarios,
    (SELECT COUNT(*) FROM PUBLICACIONES WHERE estado = 'activa') as publicaciones_activas,
    (SELECT COUNT(*) FROM TRANSACCIONES WHERE estado = 'completada') as transacciones_completadas,
    (SELECT SUM(creditos_transferidos) FROM TRANSACCIONES WHERE estado = 'completada') as creditos_circulados,
    (SELECT SUM(co2_ahorrado) FROM IMPACTO_AMBIENTAL) as total_co2_ahorrado;

-- Vista para perfil de usuario
CREATE VIEW VISTA_PERFIL_USUARIO AS
SELECT 
    u.*,
    r.nombre_rol,
    COUNT(DISTINCT p.id_publicacion) as total_publicaciones,
    COUNT(DISTINCT t.id_transaccion) as total_transacciones,
    AVG(t.calificacion_vendedor) as rating_promedio
FROM USUARIOS u
LEFT JOIN ROLES r ON u.id_rol = r.id_rol
LEFT JOIN PUBLICACIONES p ON u.id_usuario = p.id_usuario
LEFT JOIN TRANSACCIONES t ON u.id_usuario = t.id_vendedor
GROUP BY u.id_usuario;

-- Procedimiento para registrar una transacción completa
DELIMITER //
CREATE PROCEDURE RealizarIntercambio(
    IN p_id_publicacion INT,
    IN p_id_comprador INT,
    IN p_calificacion_comprador TINYINT,
    IN p_calificacion_vendedor TINYINT,
    IN p_comentarios TEXT
)
BEGIN
    DECLARE v_id_vendedor INT;
    DECLARE v_creditos DECIMAL(10,2);
    
    -- Obtener información de la publicación
    SELECT id_usuario, valor_creditos INTO v_id_vendedor, v_creditos
    FROM PUBLICACIONES WHERE id_publicacion = p_id_publicacion;
    
    -- Insertar transacción
    INSERT INTO TRANSACCIONES (id_publicacion, id_comprador, id_vendedor, creditos_transferidos, calificacion_comprador, calificacion_vendedor, comentarios)
    VALUES (p_id_publicacion, p_id_comprador, v_id_vendedor, v_creditos, p_calificacion_comprador, p_calificacion_vendedor, p_comentarios);
    
    -- Actualizar estado de la publicación
    UPDATE PUBLICACIONES SET estado = 'vendida' WHERE id_publicacion = p_id_publicacion;
    
    SELECT LAST_INSERT_ID() as id_transaccion;
END//
DELIMITER ;

