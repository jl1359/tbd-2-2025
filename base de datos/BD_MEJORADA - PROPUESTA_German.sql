-- Mejora de la BD

-- NORMALIZADA HASTA 3FN
-- Agregando y tomando en cuenta en la BD "actividades sostenibles" y "suscripciones"
-- Se tienen 40 entidades, pero muchas son de tipos y esas una vez llenas solo se maneja su ID que es un numero.

create database Creditos_Verdes;
use Creditos_Verdes;

-- MoDULO DE ROLES Y PERMISOS
CREATE TABLE ROL (
    rol_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE PERMISO (
    permiso_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_permiso VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE ROL_PERMISO (
    rol_id INT NOT NULL,
    permiso_id INT NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES ROL(rol_id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES PERMISO(permiso_id) ON DELETE CASCADE
);

-- MODULO DE USUARIOS
CREATE TABLE USUARIO (
    usuario_id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foto_perfil_url VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'activo',
    FOREIGN KEY (rol_id) REFERENCES ROL(rol_id)
);

-- MODULO DE BILLETERA
CREATE TABLE BILLETERA (
    billetera_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    saldo_creditos INT DEFAULT 0,
    saldo_bs DECIMAL(10,2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'activa',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id) ON DELETE CASCADE
);

-- MODULO DE PAGOS Y MOVIMIENTOS
CREATE TABLE ESTADO_PAGO (
    estado_pago_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE TIPO_MOVIMIENTO (
    tipo_movimiento_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    afecta_saldo VARCHAR(10) NOT NULL CHECK (afecta_saldo IN ('positivo', 'negativo'))
);

CREATE TABLE PAQUETE_CREDITOS (
    paquete_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_paquete VARCHAR(100) NOT NULL,
    cantidad_creditos INT NOT NULL,
    precio_bs DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE COMPRA_CREDITOS (
    compra_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    paquete_id INT NOT NULL,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto_bs DECIMAL(10,2) NOT NULL,
    estado_pago_id INT NOT NULL,
    id_transaccion_pago VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (paquete_id) REFERENCES PAQUETE_CREDITOS(paquete_id),
    FOREIGN KEY (estado_pago_id) REFERENCES ESTADO_PAGO(estado_pago_id)
);

CREATE TABLE MOVIMIENTO_CREDITOS (
    movimiento_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_movimiento_id INT NOT NULL,
    cantidad INT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    saldo_anterior INT NOT NULL,
    saldo_posterior INT NOT NULL,
    referencia_id INT,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (tipo_movimiento_id) REFERENCES TIPO_MOVIMIENTO(tipo_movimiento_id)
);

-- MODULO DE PUBLICACIONES
CREATE TABLE CATEGORIA (
    categoria_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE TIPO_PUBLICACION (
    tipo_publicacion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE ESTADO_PUBLICACION (
    estado_publicacion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE PUBLICACION (
    publicacion_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    tipo_publicacion_id INT NOT NULL,
    estado_publicacion_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    valor_creditos INT NOT NULL CHECK (valor_creditos > 0),
    imagen_url VARCHAR(500),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (categoria_id) REFERENCES CATEGORIA(categoria_id),
    FOREIGN KEY (tipo_publicacion_id) REFERENCES TIPO_PUBLICACION(tipo_publicacion_id),
    FOREIGN KEY (estado_publicacion_id) REFERENCES ESTADO_PUBLICACION(estado_publicacion_id)
);

-- MODULO DE TRANSACCIONES
CREATE TABLE ESTADO_TRANSACCION (
    estado_transaccion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE TRANSACCION (
    transaccion_id INT AUTO_INCREMENT PRIMARY KEY,
    comprador_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    publicacion_id INT NOT NULL,
    cantidad_creditos INT NOT NULL CHECK (cantidad_creditos > 0),
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_transaccion_id INT NOT NULL,
    FOREIGN KEY (comprador_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (vendedor_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (publicacion_id) REFERENCES PUBLICACION(publicacion_id),
    FOREIGN KEY (estado_transaccion_id) REFERENCES ESTADO_TRANSACCION(estado_transaccion_id)
);

-- MODULO DE IMPACTO AMBIENTAL
CREATE TABLE EQUIVALENCIA_IMPACTO (
    equivalencia_id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT UNIQUE NOT NULL,
    co2_por_unidad DECIMAL(10,4) NOT NULL,
    agua_por_unidad DECIMAL(10,4) NOT NULL,
    energia_por_unidad DECIMAL(10,4) NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES CATEGORIA(categoria_id)
);

CREATE TABLE PERIODO (
    periodo_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IMPACTO_AMBIENTAL (
    impacto_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    transaccion_id INT NOT NULL,
    categoria_id INT NOT NULL,
    co2_ahorrado DECIMAL(10,4) NOT NULL,
    agua_ahorrada DECIMAL(10,4) NOT NULL,
    energia_ahorrada DECIMAL(10,4) NOT NULL,
    fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    periodo_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (transaccion_id) REFERENCES TRANSACCION(transaccion_id),
    FOREIGN KEY (categoria_id) REFERENCES CATEGORIA(categoria_id),
    FOREIGN KEY (periodo_id) REFERENCES PERIODO(periodo_id)
);

-- MODULO DE GAMIFICACIÓN
CREATE TABLE TIPO_LOGRO (
    tipo_logro_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE LOGRO (
    logro_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_logro VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_logro_id INT NOT NULL,
    meta_requerida INT NOT NULL,
    creditos_recompensa INT NOT NULL,
    FOREIGN KEY (tipo_logro_id) REFERENCES TIPO_LOGRO(tipo_logro_id)
);

CREATE TABLE USUARIO_LOGRO (
    usuario_logro_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    logro_id INT NOT NULL,
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progreso_actual INT DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (logro_id) REFERENCES LOGRO(logro_id),
    UNIQUE(usuario_id, logro_id)
);

CREATE TABLE TIPO_PROMOCION (
    tipo_promocion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE ESTADO_PROMOCION (
    estado_promocion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE PROMOCION (
    promocion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_promocion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_promocion_id INT NOT NULL,
    creditos_otorgados INT NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    estado_promocion_id INT NOT NULL,
    FOREIGN KEY (tipo_promocion_id) REFERENCES TIPO_PROMOCION(tipo_promocion_id),
    FOREIGN KEY (estado_promocion_id) REFERENCES ESTADO_PROMOCION(estado_promocion_id)
);

-- MODULO DE PUBLICIDAD
CREATE TABLE UBICACION_PUBLICIDAD (
    ubicacion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL
);

CREATE TABLE ESTADO_PUBLICIDAD (
    estado_publicidad_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE PUBLICIDAD (
    publicidad_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    estado_publicidad_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(500),
    url_destino VARCHAR(500),
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    costo_creditos INT NOT NULL,
    clicks INT DEFAULT 0,
    impresiones INT DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (ubicacion_id) REFERENCES UBICACION_PUBLICIDAD(ubicacion_id),
    FOREIGN KEY (estado_publicidad_id) REFERENCES ESTADO_PUBLICIDAD(estado_publicidad_id)
);

-- MODULO DE SUSCRIPCIONES
CREATE TABLE TIPO_SUSCRIPCION (
    tipo_suscripcion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    duracion_dias INT NOT NULL,
    descripcion TEXT
);

CREATE TABLE ESTADO_SUSCRIPCION (
    estado_suscripcion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE SUSCRIPCION_PREMIUM (
    suscripcion_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_suscripcion_id INT NOT NULL,
    estado_suscripcion_id INT NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    costo_creditos INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (tipo_suscripcion_id) REFERENCES TIPO_SUSCRIPCION(tipo_suscripcion_id),
    FOREIGN KEY (estado_suscripcion_id) REFERENCES ESTADO_SUSCRIPCION(estado_suscripcion_id)
);

-- MODULO DE REPORTES
CREATE TABLE TIPO_REPORTE (
    tipo_reporte_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE REPORTE_IMPACTO (
    reporte_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo_reporte_id INT NOT NULL,
    periodo_id INT NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_co2_ahorrado DECIMAL(12,4) NOT NULL,
    total_agua_ahorrada DECIMAL(12,4) NOT NULL,
    total_energia_ahorrada DECIMAL(12,4) NOT NULL,
    total_transacciones INT NOT NULL,
    total_usuarios_activos INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (tipo_reporte_id) REFERENCES TIPO_REPORTE(tipo_reporte_id),
    FOREIGN KEY (periodo_id) REFERENCES PERIODO(periodo_id)
);

-- MODULO DE AUDITORÍA
CREATE TABLE RESULTADO_ACCESO (
    resultado_acceso_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE BITACORA_ACCESO (
    acceso_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL,
    resultado_acceso_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (resultado_acceso_id) REFERENCES RESULTADO_ACCESO(resultado_acceso_id)
);

CREATE TABLE TIPO_MODIFICACION (
    tipo_modificacion_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE BITACORA_MODIFICACION (
    modificacion_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id INT NOT NULL,
    tipo_modificacion_id INT NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (tipo_modificacion_id) REFERENCES TIPO_MODIFICACION(tipo_modificacion_id)
);

CREATE TABLE BITACORA_INTERCAMBIO (
    bitacora_id INT AUTO_INCREMENT PRIMARY KEY,
    transaccion_id INT NOT NULL,
    usuario_origen_id INT NOT NULL,
    usuario_destino_id INT NOT NULL,
    cantidad_creditos INT NOT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion_accion TEXT,
    FOREIGN KEY (transaccion_id) REFERENCES TRANSACCION(transaccion_id),
    FOREIGN KEY (usuario_origen_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (usuario_destino_id) REFERENCES USUARIO(usuario_id)
);

-- MODULO DE ACTIVIDADES SOSTENIBLES
CREATE TABLE TIPO_ACTIVIDAD (
    tipo_actividad_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE ACTIVIDAD_SOSTENIBLE (
    actividad_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_actividad_id INT NOT NULL,
    descripcion TEXT NOT NULL,
    creditos_otorgados INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evidencia_url VARCHAR(500),
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(usuario_id),
    FOREIGN KEY (tipo_actividad_id) REFERENCES TIPO_ACTIVIDAD(tipo_actividad_id)
);



-- CONFIGURACION INICIAL DE ENTIDADES QUE PROPORCIONAN ROL O TIPO

-- INSERTAR ROLES BÁSICOS
INSERT INTO ROL (nombre_rol, descripcion) VALUES
('Usuario Común', 'Usuario regular que publica e intercambia'),
('Emprendedor', 'Ofrece productos/servicios sostenibles'),
('Administrador', 'Gestiona y audita el sistema');

-- INSERTAR PERMISOS
INSERT INTO PERMISO (nombre_permiso, descripcion) VALUES
('publicar_bienes', 'Puede publicar bienes para intercambio'),
('publicar_servicios', 'Puede publicar servicios'),
('comprar_creditos', 'Puede comprar créditos con dinero real'),
('gestionar_publicidad', 'Puede crear campañas publicitarias'),
('validar_transacciones', 'Puede aprobar/rechazar transacciones'),
('generar_reportes', 'Puede generar reportes del sistema'),
('auditar_sistema', 'Puede ver bitácoras y auditorías');

-- ASIGNAR PERMISOS A ROLES
INSERT INTO ROL_PERMISO (rol_id, permiso_id) VALUES
(1, 1), (1, 2), (1, 3),  -- Usuario Común
(2, 1), (2, 2), (2, 3), (2, 4),  -- Emprendedor (+ publicidad)
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7);  -- Administrador (todos)

-- CONFIGURAR ESTADOS DE PAGO
INSERT INTO ESTADO_PAGO (nombre) VALUES
('completado'), ('pendiente'), ('fallido'), ('reembolsado');

-- CONFIGURAR TIPOS DE MOVIMIENTO
INSERT INTO TIPO_MOVIMIENTO (nombre, descripcion, afecta_saldo) VALUES
('bonificación', 'Créditos por registro o promoción', 'positivo'),
('compra', 'Compra de créditos con dinero real', 'positivo'),
('intercambio_ganancia', 'Ganancia por venta/intercambio', 'positivo'),
('intercambio_gasto', 'Gasto por compra/intercambio', 'negativo'),
('publicidad', 'Pago por campaña publicitaria', 'negativo'),
('suscripción', 'Pago por suscripción premium', 'negativo');

-- CONFIGURAR PAQUETES DE CRÉDITOS
INSERT INTO PAQUETE_CREDITOS (nombre_paquete, cantidad_creditos, precio_bs) VALUES
('Paquete Básico', 50, 15.00),
('Paquete Standard', 100, 25.00),
('Paquete Premium', 200, 45.00);

-- CONFIGURAR CATEGORÍAS
INSERT INTO CATEGORIA (nombre_categoria, descripcion) VALUES
('Ropa', 'Prendas de vestir y accesorios'),
('Tecnología', 'Dispositivos electrónicos y gadgets'),
('Educación', 'Clases, cursos y tutorías'),
('Transporte', 'Servicios de movilidad'),
('Hogar', 'Muebles y artículos para el hogar'),
('Servicios', 'Servicios profesionales y personales');

-- CONFIGURAR TIPOS DE PUBLICACIÓN
INSERT INTO TIPO_PUBLICACION (nombre, descripcion) VALUES
('bien', 'Producto físico o artículo'),
('servicio', 'Servicio o actividad');

-- CONFIGURAR ESTADOS DE PUBLICACIÓN
INSERT INTO ESTADO_PUBLICACION (nombre) VALUES
('activa'), ('inactiva'), ('completada'), ('eliminada');

-- CONFIGURAR ESTADOS DE TRANSACCIÓN
INSERT INTO ESTADO_TRANSACCION (nombre) VALUES
('pendiente'), ('completada'), ('cancelada'), ('en_disputa');

-- CONFIGURAR EQUIVALENCIAS DE IMPACTO
INSERT INTO EQUIVALENCIA_IMPACTO (categoria_id, co2_por_unidad, agua_por_unidad, energia_por_unidad, unidad_medida) VALUES
(1, 2.5, 8000, 50, 'prenda'),        -- Ropa
(2, 15.0, 5000, 120, 'dispositivo'), -- Tecnología
(3, 0.1, 10, 2, 'hora'),             -- Educación
(4, 0.5, 50, 8, 'viaje'),            -- Transporte
(5, 8.0, 3000, 80, 'mueble'),        -- Hogar
(6, 0.2, 20, 3, 'servicio');         -- Servicios

-- CONFIGURAR PERIODOS
INSERT INTO PERIODO (nombre, descripcion) VALUES
('diario', 'Reporte diario de impacto'),
('semanal', 'Reporte semanal consolidado'),
('mensual', 'Reporte mensual para métricas'),
('trimestral', 'Reporte trimestral'),
('anual', 'Reporte anual de sostenibilidad');



-- INDICES PARA OPTIMIZACION:

CREATE INDEX idx_usuario_email ON USUARIO(email);
CREATE INDEX idx_publicacion_titulo ON PUBLICACION(titulo);
CREATE INDEX idx_publicacion_categoria ON PUBLICACION(categoria_id);
CREATE INDEX idx_publicacion_estado ON PUBLICACION(estado_publicacion_id);
CREATE INDEX idx_transaccion_fecha ON TRANSACCION(fecha_transaccion);
CREATE INDEX idx_transaccion_comprador ON TRANSACCION(comprador_id);
CREATE INDEX idx_transaccion_vendedor ON TRANSACCION(vendedor_id);
CREATE INDEX idx_movimiento_usuario_fecha ON MOVIMIENTO_CREDITOS(usuario_id, fecha_movimiento);
CREATE INDEX idx_impacto_usuario_periodo ON IMPACTO_AMBIENTAL(usuario_id, periodo_id);
CREATE INDEX idx_impacto_fecha ON IMPACTO_AMBIENTAL(fecha_calculo);
CREATE INDEX idx_usuario_rol ON USUARIO(rol_id);
CREATE INDEX idx_publicacion_usuario ON PUBLICACION(usuario_id);
CREATE INDEX idx_compra_creditos_usuario ON COMPRA_CREDITOS(usuario_id);
CREATE INDEX idx_movimiento_tipo ON MOVIMIENTO_CREDITOS(tipo_movimiento_id);
CREATE INDEX idx_suscripcion_usuario ON SUSCRIPCION_PREMIUM(usuario_id);


-- PROCEDIMIENTOS BASICOS:

-- 1. Compra de creditos:
DELIMITER //

CREATE PROCEDURE sp_comprar_creditos(
    IN p_usuario_id INT,
    IN p_paquete_id INT,
    IN p_id_transaccion_pago VARCHAR(255)
)
BEGIN
    DECLARE v_cantidad_creditos INT;
    DECLARE v_precio_bs DECIMAL(10,2);
    DECLARE v_saldo_actual INT;
    DECLARE v_saldo_bs_actual DECIMAL(10,2);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Obtener información del paquete
    SELECT cantidad_creditos, precio_bs 
    INTO v_cantidad_creditos, v_precio_bs
    FROM PAQUETE_CREDITOS 
    WHERE paquete_id = p_paquete_id;
    
    -- Obtener saldo actual
    SELECT saldo_creditos, saldo_bs 
    INTO v_saldo_actual, v_saldo_bs_actual
    FROM BILLETERA 
    WHERE usuario_id = p_usuario_id;
    
    -- Registrar compra
    INSERT INTO COMPRA_CREDITOS (
        usuario_id, paquete_id, monto_bs, estado_pago_id, id_transaccion_pago
    ) VALUES (
        p_usuario_id, p_paquete_id, v_precio_bs, 1, p_id_transaccion_pago
    );
    
    -- Actualizar billetera
    UPDATE BILLETERA 
    SET saldo_creditos = v_saldo_actual + v_cantidad_creditos,
        fecha_actualizacion = NOW()
    WHERE usuario_id = p_usuario_id;
    
    -- Registrar movimiento
    INSERT INTO MOVIMIENTO_CREDITOS (
        usuario_id, tipo_movimiento_id, cantidad, descripcion,
        saldo_anterior, saldo_posterior
    ) VALUES (
        p_usuario_id, 2, v_cantidad_creditos,
        CONCAT('Compra paquete #', p_paquete_id, ' - ', v_cantidad_creditos, ' créditos'),
        v_saldo_actual, v_saldo_actual + v_cantidad_creditos
    );
    
    COMMIT;
END//

DELIMITER ;

-- 2. Realizar intercambio:
DELIMITER //

CREATE PROCEDURE sp_realizar_intercambio(
    IN p_comprador_id INT,
    IN p_publicacion_id INT
)
BEGIN
    DECLARE v_vendedor_id INT;
    DECLARE v_cantidad_creditos INT;
    DECLARE v_titulo_publicacion VARCHAR(200);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Obtener información de la publicación
    SELECT usuario_id, valor_creditos, titulo
    INTO v_vendedor_id, v_cantidad_creditos, v_titulo_publicacion
    FROM PUBLICACION 
    WHERE publicacion_id = p_publicacion_id 
    AND estado_publicacion_id = 1;
    
    IF v_vendedor_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Publicación no encontrada o no disponible';
    END IF;
    
    -- Crear transacción
    INSERT INTO TRANSACCION (
        comprador_id, vendedor_id, publicacion_id, 
        cantidad_creditos, estado_transaccion_id
    ) VALUES (
        p_comprador_id, v_vendedor_id, p_publicacion_id,
        v_cantidad_creditos, 2  -- Completada
    );
    
    COMMIT;
END//

DELIMITER ;

-- 3. Generar reporte de impacto:
DELIMITER //

CREATE PROCEDURE sp_generar_reporte_impacto(
    IN p_usuario_id INT,
    IN p_periodo_id INT
)
BEGIN
    SELECT 
        u.nombre as usuario,
        SUM(ia.co2_ahorrado) as total_co2_ahorrado,
        SUM(ia.agua_ahorrada) as total_agua_ahorrada,
        SUM(ia.energia_ahorrada) as total_energia_ahorrada,
        COUNT(ia.transaccion_id) as total_transacciones,
        p.nombre as periodo
    FROM IMPACTO_AMBIENTAL ia
    JOIN USUARIO u ON ia.usuario_id = u.usuario_id
    JOIN PERIODO p ON ia.periodo_id = p.periodo_id
    WHERE (p_usuario_id IS NULL OR ia.usuario_id = p_usuario_id)
    AND ia.periodo_id = p_periodo_id
    GROUP BY ia.usuario_id, u.nombre, p.nombre
    ORDER BY total_co2_ahorrado DESC;
END//

DELIMITER ;

-- 4. Obtener ranking de usuarios:
DELIMITER //

CREATE PROCEDURE sp_obtener_ranking_usuarios(
    IN p_tipo_ranking VARCHAR(20) -- 'creditos', 'transacciones', 'impacto'
)
BEGIN
    IF p_tipo_ranking = 'creditos' THEN
        -- Ranking por saldo de créditos
        SELECT 
            u.nombre,
            b.saldo_creditos,
            COUNT(DISTINCT p.publicacion_id) as total_publicaciones,
            COUNT(DISTINCT t.transaccion_id) as total_transacciones
        FROM USUARIO u
        JOIN BILLETERA b ON u.usuario_id = b.usuario_id
        LEFT JOIN PUBLICACION p ON u.usuario_id = p.usuario_id
        LEFT JOIN TRANSACCION t ON u.usuario_id IN (t.comprador_id, t.vendedor_id)
        GROUP BY u.usuario_id, u.nombre, b.saldo_creditos
        ORDER BY b.saldo_creditos DESC
        LIMIT 10;
        
    ELSEIF p_tipo_ranking = 'transacciones' THEN
        -- Ranking por número de transacciones
        SELECT 
            u.nombre,
            COUNT(DISTINCT t.transaccion_id) as total_transacciones,
            b.saldo_creditos
        FROM USUARIO u
        JOIN BILLETERA b ON u.usuario_id = b.usuario_id
        LEFT JOIN TRANSACCION t ON u.usuario_id IN (t.comprador_id, t.vendedor_id)
        GROUP BY u.usuario_id, u.nombre, b.saldo_creditos
        ORDER BY total_transacciones DESC
        LIMIT 10;
        
    ELSEIF p_tipo_ranking = 'impacto' THEN
        -- Ranking por impacto ambiental
        SELECT 
            u.nombre,
            SUM(ia.co2_ahorrado) as total_co2_ahorrado,
            COUNT(DISTINCT ia.transaccion_id) as total_transacciones_impacto
        FROM USUARIO u
        JOIN IMPACTO_AMBIENTAL ia ON u.usuario_id = ia.usuario_id
        GROUP BY u.usuario_id, u.nombre
        ORDER BY total_co2_ahorrado DESC
        LIMIT 10;
    END IF;
END//

DELIMITER ;

-- 5. Verificar saldo:
DELIMITER //

CREATE PROCEDURE sp_verificar_saldo(
    IN p_usuario_id INT,
    IN p_cantidad_requerida INT,
    OUT p_saldo_suficiente BOOLEAN,
    OUT p_saldo_actual INT
)
BEGIN
    -- Obtener saldo actual
    SELECT saldo_creditos INTO p_saldo_actual
    FROM BILLETERA 
    WHERE usuario_id = p_usuario_id;
    
    -- Verificar si el saldo es suficiente
    IF p_saldo_actual >= p_cantidad_requerida THEN
        SET p_saldo_suficiente = TRUE;
    ELSE
        SET p_saldo_suficiente = FALSE;
    END IF;
END//

DELIMITER ;

-- 6. Registrar actividad sostenible:
DELIMITER //

CREATE PROCEDURE sp_registrar_actividad_sostenible(
    IN p_usuario_id INT,
    IN p_tipo_actividad_id INT,
    IN p_descripcion TEXT,
    IN p_evidencia_url VARCHAR(500)
)
BEGIN
    DECLARE v_creditos_otorgados INT;
    DECLARE v_saldo_actual INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Determinar créditos a otorgar según tipo de actividad
    CASE p_tipo_actividad_id
        WHEN 1 THEN SET v_creditos_otorgados = 10; -- Reciclaje
        WHEN 2 THEN SET v_creditos_otorgados = 15; -- Voluntariado
        WHEN 3 THEN SET v_creditos_otorgados = 8;  -- Educación ambiental
        ELSE SET v_creditos_otorgados = 5;         -- Otras actividades
    END CASE;
    
    -- Obtener saldo actual
    SELECT saldo_creditos INTO v_saldo_actual
    FROM BILLETERA 
    WHERE usuario_id = p_usuario_id;
    
    -- Registrar actividad
    INSERT INTO ACTIVIDAD_SOSTENIBLE (
        usuario_id, tipo_actividad_id, descripcion,
        creditos_otorgados, evidencia_url
    ) VALUES (
        p_usuario_id, p_tipo_actividad_id, p_descripcion,
        v_creditos_otorgados, p_evidencia_url
    );
    
    -- Actualizar billetera
    UPDATE BILLETERA 
    SET saldo_creditos = v_saldo_actual + v_creditos_otorgados,
        fecha_actualizacion = NOW()
    WHERE usuario_id = p_usuario_id;
    
    -- Registrar movimiento
    INSERT INTO MOVIMIENTO_CREDITOS (
        usuario_id, tipo_movimiento_id, cantidad, descripcion,
        saldo_anterior, saldo_posterior
    ) VALUES (
        p_usuario_id, 1, v_creditos_otorgados,
        CONCAT('Actividad sostenible: ', p_descripcion),
        v_saldo_actual, v_saldo_actual + v_creditos_otorgados
    );
    
    COMMIT;
END//

DELIMITER ;

-- 7. Obtener historial de usuario:
DELIMITER //

CREATE PROCEDURE sp_obtener_historial_usuario(
    IN p_usuario_id INT,
    IN p_limit INT
)
BEGIN
    -- Obtener movimientos de créditos
    SELECT 
        'movimiento' as tipo,
        mc.fecha_movimiento as fecha,
        tm.nombre as tipo_movimiento,
        mc.cantidad,
        mc.descripcion,
        mc.saldo_anterior,
        mc.saldo_posterior
    FROM MOVIMIENTO_CREDITOS mc
    JOIN TIPO_MOVIMIENTO tm ON mc.tipo_movimiento_id = tm.tipo_movimiento_id
    WHERE mc.usuario_id = p_usuario_id
    
    UNION ALL
    
    -- Obtener transacciones como comprador
    SELECT 
        'compra' as tipo,
        t.fecha_transaccion as fecha,
        'Compra' as tipo_movimiento,
        t.cantidad_creditos as cantidad,
        CONCAT('Compra: ', p.titulo) as descripcion,
        NULL as saldo_anterior,
        NULL as saldo_posterior
    FROM TRANSACCION t
    JOIN PUBLICACION p ON t.publicacion_id = p.publicacion_id
    WHERE t.comprador_id = p_usuario_id
    AND t.estado_transaccion_id = 2
    
    UNION ALL
    
    -- Obtener transacciones como vendedor
    SELECT 
        'venta' as tipo,
        t.fecha_transaccion as fecha,
        'Venta' as tipo_movimiento,
        t.cantidad_creditos as cantidad,
        CONCAT('Venta: ', p.titulo) as descripcion,
        NULL as saldo_anterior,
        NULL as saldo_posterior
    FROM TRANSACCION t
    JOIN PUBLICACION p ON t.publicacion_id = p.publicacion_id
    WHERE t.vendedor_id = p_usuario_id
    AND t.estado_transaccion_id = 2
    
    ORDER BY fecha DESC
    LIMIT p_limit;
END//

DELIMITER ;



-- TRIGGERS BASICOS: 

-- 1. Bonificacion por publicacion:
DELIMITER //

CREATE TRIGGER after_insert_publicacion
AFTER INSERT ON PUBLICACION
FOR EACH ROW
BEGIN
    DECLARE v_saldo_actual INT;
    DECLARE v_bonificacion INT DEFAULT 5;
    
    -- Obtener saldo actual
    SELECT saldo_creditos INTO v_saldo_actual 
    FROM BILLETERA 
    WHERE usuario_id = NEW.usuario_id;
    
    -- Actualizar billetera
    UPDATE BILLETERA 
    SET saldo_creditos = v_saldo_actual + v_bonificacion,
        fecha_actualizacion = NOW()
    WHERE usuario_id = NEW.usuario_id;
    
    -- Registrar movimiento
    INSERT INTO MOVIMIENTO_CREDITOS (
        usuario_id, tipo_movimiento_id, cantidad, descripcion,
        saldo_anterior, saldo_posterior
    ) VALUES (
        NEW.usuario_id, 1, v_bonificacion, 
        CONCAT('Bonificación por publicar: ', NEW.titulo),
        v_saldo_actual, v_saldo_actual + v_bonificacion
    );
END//

DELIMITER ;

-- 2. Actualizacion de saldo en transacciones:
DELIMITER //

CREATE TRIGGER after_insert_transaccion
AFTER INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
    DECLARE v_saldo_comprador INT;
    DECLARE v_saldo_vendedor INT;
    
    -- Verificar que la transacción esté completada
    IF NEW.estado_transaccion_id = 2 THEN
        -- Obtener saldos actuales
        SELECT saldo_creditos INTO v_saldo_comprador 
        FROM BILLETERA WHERE usuario_id = NEW.comprador_id;
        
        SELECT saldo_creditos INTO v_saldo_vendedor 
        FROM BILLETERA WHERE usuario_id = NEW.vendedor_id;
        
        -- Actualizar saldo del comprador (restar)
        UPDATE BILLETERA 
        SET saldo_creditos = v_saldo_comprador - NEW.cantidad_creditos,
            fecha_actualizacion = NOW()
        WHERE usuario_id = NEW.comprador_id;
        
        -- Actualizar saldo del vendedor (sumar)
        UPDATE BILLETERA 
        SET saldo_creditos = v_saldo_vendedor + NEW.cantidad_creditos,
            fecha_actualizacion = NOW()
        WHERE usuario_id = NEW.vendedor_id;
        
        -- Registrar movimiento del comprador
        INSERT INTO MOVIMIENTO_CREDITOS (
            usuario_id, tipo_movimiento_id, cantidad, descripcion,
            saldo_anterior, saldo_posterior, referencia_id
        ) VALUES (
            NEW.comprador_id, 4, NEW.cantidad_creditos,
            CONCAT('Compra transacción #', NEW.transaccion_id),
            v_saldo_comprador, v_saldo_comprador - NEW.cantidad_creditos,
            NEW.transaccion_id
        );
        
        -- Registrar movimiento del vendedor
        INSERT INTO MOVIMIENTO_CREDITOS (
            usuario_id, tipo_movimiento_id, cantidad, descripcion,
            saldo_anterior, saldo_posterior, referencia_id
        ) VALUES (
            NEW.vendedor_id, 3, NEW.cantidad_creditos,
            CONCAT('Venta transacción #', NEW.transaccion_id),
            v_saldo_vendedor, v_saldo_vendedor + NEW.cantidad_creditos,
            NEW.transaccion_id
        );
        
        -- Actualizar estado de la publicación a completada
        UPDATE PUBLICACION 
        SET estado_publicacion_id = 3 
        WHERE publicacion_id = NEW.publicacion_id;
    END IF;
END//

DELIMITER ;

-- 3. Calculo de Impacto ambiental:
DELIMITER //

CREATE TRIGGER after_insert_transaccion_impacto
AFTER INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
    DECLARE v_categoria_id INT;
    DECLARE v_co2_ahorrado DECIMAL(10,4);
    DECLARE v_agua_ahorrada DECIMAL(10,4);
    DECLARE v_energia_ahorrada DECIMAL(10,4);
    
    -- Verificar que la transacción esté completada
    IF NEW.estado_transaccion_id = 2 THEN
        -- Obtener categoría de la publicación
        SELECT p.categoria_id INTO v_categoria_id
        FROM PUBLICACION p
        WHERE p.publicacion_id = NEW.publicacion_id;
        
        -- Obtener equivalencias de impacto
        SELECT co2_por_unidad, agua_por_unidad, energia_por_unidad
        INTO v_co2_ahorrado, v_agua_ahorrada, v_energia_ahorrada
        FROM EQUIVALENCIA_IMPACTO
        WHERE categoria_id = v_categoria_id;
        
        -- Registrar impacto ambiental para el comprador
        INSERT INTO IMPACTO_AMBIENTAL (
            usuario_id, transaccion_id, categoria_id,
            co2_ahorrado, agua_ahorrada, energia_ahorrada, periodo_id
        ) VALUES (
            NEW.comprador_id, NEW.transaccion_id, v_categoria_id,
            v_co2_ahorrado, v_agua_ahorrada, v_energia_ahorrada, 3
        );
        
        -- Registrar impacto ambiental para el vendedor
        INSERT INTO IMPACTO_AMBIENTAL (
            usuario_id, transaccion_id, categoria_id,
            co2_ahorrado, agua_ahorrada, energia_ahorrada, periodo_id
        ) VALUES (
            NEW.vendedor_id, NEW.transaccion_id, v_categoria_id,
            v_co2_ahorrado, v_agua_ahorrada, v_energia_ahorrada, 3
        );
    END IF;
END//

DELIMITER ;

-- 4. Verificacion de saldo antes de una transaccion:
DELIMITER //

CREATE TRIGGER before_insert_transaccion
BEFORE INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
    DECLARE v_saldo_comprador INT;
    DECLARE v_estado_publicacion INT;
    
    -- Obtener saldo del comprador
    SELECT saldo_creditos INTO v_saldo_comprador
    FROM BILLETERA 
    WHERE usuario_id = NEW.comprador_id;
    
    -- Obtener estado de la publicación
    SELECT estado_publicacion_id INTO v_estado_publicacion
    FROM PUBLICACION 
    WHERE publicacion_id = NEW.publicacion_id;
    
    -- Verificar que el comprador tenga saldo suficiente
    IF v_saldo_comprador < NEW.cantidad_creditos THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Saldo insuficiente para realizar la transacción';
    END IF;
    
    -- Verificar que la publicación esté activa
    IF v_estado_publicacion != 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La publicación no está disponible para transacción';
    END IF;
    
    -- Verificar que no sea el mismo usuario
    IF NEW.comprador_id = NEW.vendedor_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No puede realizar transacciones consigo mismo';
    END IF;
END//

DELIMITER ;

-- 5. Registro automatico en bitacora:
DELIMITER //

CREATE TRIGGER after_insert_transaccion_bitacora
AFTER INSERT ON TRANSACCION
FOR EACH ROW
BEGIN
    -- Registrar en bitácora de intercambio
    INSERT INTO BITACORA_INTERCAMBIO (
        transaccion_id, usuario_origen_id, usuario_destino_id,
        cantidad_creditos, descripcion_accion
    ) VALUES (
        NEW.transaccion_id, NEW.comprador_id, NEW.vendedor_id,
        NEW.cantidad_creditos,
        CONCAT('Transacción creada - Estado: ', 
              (SELECT nombre FROM ESTADO_TRANSACCION WHERE estado_transaccion_id = NEW.estado_transaccion_id))
    );
END//

DELIMITER ;
