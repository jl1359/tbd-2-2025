use creditos_verdes2;

-- POBLAR LA BD

-- FUNCION QUE GENERA STRINGS ALEATORIOS
DROP FUNCTION IF EXISTS rand_str;
DELIMITER $$
CREATE FUNCTION rand_str(n INT)
RETURNS VARCHAR(255)
DETERMINISTIC
BEGIN
  DECLARE chars VARCHAR(80) DEFAULT 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  DECLARE outp VARCHAR(255) DEFAULT '';
  DECLARE i INT DEFAULT 0;
  WHILE i < n DO
    SET outp = CONCAT(outp, SUBSTRING(chars, FLOOR(1 + RAND()*52), 1));
    SET i = i + 1;
  END WHILE;
  RETURN outp;
END$$
DELIMITER ;

-- PROCEDIMIENTO QUE CREARA 500 USUARIOS + BILLETERAS
DELIMITER $$
CREATE PROCEDURE poblar_usuarios()
BEGIN
  DECLARE i INT DEFAULT 1;

  WHILE i <= 500 DO
    INSERT INTO USUARIO(id_rol, estado, nombre, apellido, correo, password_hash, telefono, url_perfil)
    VALUES (
      (SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),
      'ACTIVO',
      CONCAT('Usuario', i),
      CONCAT('Demo', i),
      CONCAT('u', i, '@test.com'),
      'HASH123',
      CONCAT('+5917', LPAD(FLOOR(RAND()*90000)+10000, 5, '0')),
      CONCAT('/p/u', i)
    );

    INSERT INTO BILLETERA(id_usuario, estado, saldo_creditos, saldo_bs)
    VALUES (LAST_INSERT_ID(),'ACTIVA',0,0);

    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;
-- DROP PROCEDURE poblar_usuarios;
-- EJECUTAMOS EL PROCEDIMIENTO:
CALL poblar_usuarios();
-- select * from usuario;

-- POBLADO DE CATEGORIAS, UNIDAD DE MEDIDA Y UBICACION
INSERT INTO CATEGORIA (nombre, descripcion)
SELECT CONCAT('Cat', n), 'Categoria generada'
FROM (
  SELECT ROW_NUMBER() OVER () AS n FROM INFORMATION_SCHEMA.COLUMNS LIMIT 200
) t;

INSERT INTO UNIDAD_MEDIDA (nombre, simbolo)
SELECT CONCAT('UM', n), CONCAT('u', n)
FROM (
  SELECT ROW_NUMBER() OVER () AS n FROM INFORMATION_SCHEMA.COLUMNS LIMIT 50
) t;

INSERT INTO UBICACION (direccion, ciudad, provincia, latitud, longitud)
SELECT CONCAT('Dir', n), 'CiudadTest', 'ProvTest', -17.3 + RAND()/10, -66.2 + RAND()/10
FROM (
  SELECT ROW_NUMBER() OVER () AS n FROM INFORMATION_SCHEMA.COLUMNS LIMIT 50
) t;

-- CREACION DE PROCEDIMIENTO QUE CREARA 1000 PRODUCTOS
DELIMITER $$
CREATE PROCEDURE poblar_productos()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE cat INT;

  WHILE i <= 1000 DO
    SET cat = (SELECT id_categoria FROM CATEGORIA ORDER BY RAND() LIMIT 1);

    INSERT INTO PRODUCTO(id_categoria, nombre, descripcion, precio, peso)
    VALUES (cat, CONCAT('Prod', i), 'Producto generico',
            FLOOR(RAND()*500)+50,
            (RAND()*5)+1);
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;
-- LLAMAMOS A LA FUNCION QUE CREARA LOS 1000 PRODUCTOS
CALL poblar_productos();
-- select * from producto;

-- PROCEDIMIENTO QUE CREARA SERVICIOS ALEATORIOS
DELIMITER $$
CREATE PROCEDURE poblar_servicios()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE cat INT;

  WHILE i <= 500 DO
    SET cat = (SELECT id_categoria FROM CATEGORIA ORDER BY RAND() LIMIT 1);

    INSERT INTO SERVICIO(id_categoria, estado, nombre, descripcion, precio, duracion_min)
    VALUES (cat, 'ACTIVO',
            CONCAT('Serv', i),
            'Servicio generico',
            FLOOR(RAND()*150)+20,
            FLOOR(RAND()*120)+30);

    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;
-- LLAMAMOS AL PROCEDIMIENTO QUE CREARA 500 SERVICIOS
CALL poblar_servicios();
-- select * from servicio;

-- PROCEDIMIENTO QUE CREARA PUBLICACIONES 
DELIMITER $$
CREATE PROCEDURE poblar_publicaciones()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE usr INT;
  DECLARE cat INT;
  DECLARE ub INT;
  DECLARE tpub INT;

  WHILE i <= 3000 DO
    SET usr = (SELECT id_usuario FROM USUARIO ORDER BY RAND() LIMIT 1);
    SET cat = (SELECT id_categoria FROM CATEGORIA ORDER BY RAND() LIMIT 1);
    SET ub  = (SELECT id_ubicacion FROM UBICACION ORDER BY RAND() LIMIT 1);
    SET tpub = (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION ORDER BY RAND() LIMIT 1);

    INSERT INTO PUBLICACION
    (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos)
    VALUES (
      usr, cat, tpub, 'PUBLICADA', ub,
      CONCAT('Publicacion ', i),
      'Descripcion generada',
      FLOOR(RAND()*200)+20
    );

    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;
-- LLAMAMOS AL PROC QUE CREARAR 1000 PUBLICACIONES ENTRE SERVICIOS Y PRODUCTOS
CALL poblar_publicaciones();
-- select * from publicacion;

-- VINCULAMOS A PUBLICACIONES CON PRODUCTO O SERVICIO SEGUN CORRESPONDA
INSERT INTO PUBLICACION_PRODUCTO(id_publicacion, id_producto, cantidad, id_um)
SELECT p.id_publicacion,
       (SELECT id_producto FROM PRODUCTO ORDER BY RAND() LIMIT 1),
       1,
       (SELECT id_um FROM UNIDAD_MEDIDA ORDER BY RAND() LIMIT 1)
FROM PUBLICACION p
JOIN TIPO_PUBLICACION tp ON tp.id_tipo_publicacion = p.id_tipo_publicacion
WHERE tp.nombre = 'PRODUCTO';

INSERT INTO PUBLICACION_SERVICIO(id_publicacion, id_servicio, horario)
SELECT p.id_publicacion,
       (SELECT id_servicio FROM SERVICIO ORDER BY RAND() LIMIT 1),
       'L-V 09:00-18:00'
FROM PUBLICACION p
JOIN TIPO_PUBLICACION tp ON tp.id_tipo_publicacion = p.id_tipo_publicacion
WHERE tp.nombre = 'SERVICIO';

-- PROC QUE POBLARA LA COMPRA DE CREDITOS
DELIMITER $$
CREATE PROCEDURE poblar_recargas()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE usr INT;
  DECLARE paq INT;

  WHILE i <= 800 DO
    SET usr = (SELECT id_usuario FROM USUARIO ORDER BY RAND() LIMIT 1);
    SET paq = (SELECT id_paquete FROM PAQUETE_CREDITOS ORDER BY RAND() LIMIT 1);

    CALL sp_compra_creditos_aprobar(usr, paq, CONCAT('TXREC', i));
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL poblar_recargas();

-- POBLAR INTERCAMBIOS REALES 

-- PRIMERO CREAMOS PERIODO PARA QUE NO FALLE LA POBLACION
INSERT INTO PERIODO (nombre, descripcion, fecha_inicio, fecha_fin)
SELECT '2025-12', 'Diciembre 2025', '2025-12-01', '2025-12-31'
WHERE NOT EXISTS (SELECT 1 FROM PERIODO);


-- EQUIVALENCIAS PARA TODAS LAS CATEGORÍAS SIN EQUIVALENCIA
INSERT INTO EQUIVALENCIA_IMPACTO (id_categoria, co2_por_unidad, agua_por_unidad, energia_por_unidad)
SELECT c.id_categoria, 0.2, 1.5, 0.05
FROM CATEGORIA c
WHERE NOT EXISTS (
  SELECT 1
  FROM EQUIVALENCIA_IMPACTO e
  WHERE e.id_categoria = c.id_categoria
);

-- AGREGAR VALORES POR DEFECTO PARA NO ROMPER TRIGGERS
ALTER TABLE IMPACTO_AMBIENTAL 
MODIFY co2_ahorrado DECIMAL(18,6) NOT NULL DEFAULT 0,
MODIFY agua_ahorrada DECIMAL(18,6) NOT NULL DEFAULT 0,
MODIFY energia_ahorrada DECIMAL(18,6) NOT NULL DEFAULT 0;

-- PROC PARA POBLAR INTERCAMBIOS
DROP PROCEDURE IF EXISTS poblar_intercambios;
DELIMITER $$

CREATE PROCEDURE poblar_intercambios()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE comp INT;
  DECLARE pub INT;
  DECLARE precio DECIMAL(15,2);
  DECLARE vendedor INT;
  DECLARE v_err INT DEFAULT 0;

  -- Cualquier error SQL dentro del procedimiento NO lo corta,
  -- sólo setea v_err = 1 y continúa.
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
  BEGIN
    SET v_err = 1;
  END;

  WHILE i <= 1200 DO
    
    -- comprador aleatorio
    SET comp = (
      SELECT id_usuario
      FROM USUARIO
      ORDER BY RAND()
      LIMIT 1
    );

    -- publicación aleatoria con equivalencia ambiental
    SET pub = (
      SELECT p.id_publicacion
      FROM PUBLICACION p
      JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
      JOIN EQUIVALENCIA_IMPACTO e ON e.id_categoria = c.id_categoria
      ORDER BY RAND()
      LIMIT 1
    );

    -- precio + vendedor de esa publicación
    SELECT valor_creditos, id_usuario
    INTO precio, vendedor
    FROM PUBLICACION
    WHERE id_publicacion = pub;

    -- evita que el comprador sea el mismo que el vendedor
    IF comp <> vendedor THEN
      SET v_err = 0;
      CALL sp_realizar_intercambio(comp, pub, precio);
      -- si aquí hay "Saldo insuficiente" u otro error:
      -- sp_realizar_intercambio hace ROLLBACK de esa transacción
      -- y el handler pone v_err=1, pero el WHILE sigue.
    END IF;

    SET i = i + 1;
  END WHILE;

END$$
DELIMITER ;

-- LLAMAMOS AL PROC PARA POBLAR INTERCAMBIOS
call poblar_intercambios();
select * from transaccion;
select * from bitacora_intercambio;



-- POBLAR ACTIVIDADES SOSTENIBLES
DELIMITER $$
CREATE PROCEDURE poblar_actividades()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE usr INT;
  DECLARE tipo INT;

  WHILE i <= 1000 DO
    SET usr  = (SELECT id_usuario FROM USUARIO ORDER BY RAND() LIMIT 1);
    SET tipo = (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD ORDER BY RAND() LIMIT 1);

    CALL sp_registrar_actividad_sostenible(
      usr, tipo, 'Actividad generada', FLOOR(RAND()*30)+5, NULL
    );

    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL poblar_actividades();
SELECT * FROM TRANSACCION LIMIT 1000;
SELECT * FROM BITACORA_INTERCAMBIO LIMIT 1000;
SELECT * FROM IMPACTO_AMBIENTAL LIMIT 1000;

SELECT * FROM MOVIMIENTO_CREDITOS LIMIT 100;
SELECT * FROM BILLETERA LIMIT 100;

