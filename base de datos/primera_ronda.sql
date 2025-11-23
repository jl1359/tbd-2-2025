USE CREDITOS_VERDES2;

-- 0) Asegurar equivalencia de impacto para Tecnología (por si acaso)

INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología' LIMIT 1),
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u' LIMIT 1),
  8.000000,
  30.000000,
  3.500000;

-- 1) Nuevos usuarios compradores + billeteras

INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Bruno','Rojas','bruno@demo.com','70000006','/p/bruno'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Elena','Suarez','elena@demo.com','70000007','/p/elena'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Fernando','Almeida','fernando@demo.com','70000008','/p/fernando'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Gaby','Flores','gaby@demo.com','70000009','/p/gaby'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Hugo','Vargas','hugo@demo.com','70000010','/p/hugo'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Irene','Paz','irene@demo.com','70000011','/p/irene'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Jorge','Campos','jorge@demo.com','70000012','/p/jorge');

-- Nuevos vendedores extra
INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Eco','Store','eco1@demo.com','70000013','/p/eco1'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','ReUse','Market','eco2@demo.com','70000014','/p/eco2');

-- Crear billetera para TODOS los usuarios nuevos (si no tienen)
INSERT INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
SELECT u.id_usuario, 'ACTIVA', 0, 0.00, NULL
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN (
  'bruno@demo.com','elena@demo.com','fernando@demo.com',
  'gaby@demo.com','hugo@demo.com','irene@demo.com','jorge@demo.com',
  'eco1@demo.com','eco2@demo.com'
)
AND b.id_billetera IS NULL;

-- 2) Más productos / servicios / publicaciones

-- Productos Bicicletas (venden Marta y eco1)
INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici Urbana Eco',
  'Bicicleta urbana reacondicionada con cuadro de aluminio.',
  1500.00,
  14.2;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici Plegable Ciudad',
  'Bicicleta plegable ideal para transporte multimodal.',
  1300.00,
  13.0;

-- Productos Tecnología (vende eco2)
INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'Laptop Reacondicionada i5',
  'Laptop reacondicionada con SSD de 256GB y 8GB RAM.',
  2200.00,
  2.1;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'Monitor 24 Reciclado',
  'Monitor de 24" reacondicionado, ideal oficina.',
  900.00,
  3.2;

-- Publicaciones de esos productos
INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='marta@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Bici Urbana Eco',
  'Reacondicionada, frenos en V, lista para uso diario.',
  320,
  'https://img/bici_urbana_eco.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Eco' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Bici Urbana Eco' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='eco1@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Bici Plegable Ciudad',
  'Fácil de transportar, incluye canastillo frontal.',
  280,
  'https://img/bici_plegable.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Plegable Ciudad' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Bici Plegable Ciudad' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- Publicaciones Tecnología (eco2)
INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='eco2@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Santa Cruz'),
  'Laptop Reacondicionada i5',
  'Ideal para teletrabajo y estudio.',
  350,
  'https://img/laptop_reuse.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Laptop Reacondicionada i5' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Laptop Reacondicionada i5' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='eco2@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Monitor 24 Reciclado',
  'Pantalla 24" reacondicionada, 75Hz, entrada HDMI.',
  220,
  'https://img/monitor_reciclado.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Monitor 24 Reciclado' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Monitor 24 Reciclado' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- Servicios de tecnología adicionales (los vende Marta)
INSERT INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'ACTIVO',
  'Mantenimiento laptop básico',
  'Limpieza interna y cambio de pasta térmica.',
  100.00,
  60;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='marta@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Mantenimiento laptop básico',
  'Incluye limpieza general y revisión de temperatura.',
  110,
  'https://img/serv_mant_laptop.jpg';

INSERT INTO PUBLICACION_SERVICIO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento laptop básico' LIMIT 1),
  (SELECT id_servicio   FROM SERVICIO   WHERE nombre='Mantenimiento laptop básico' LIMIT 1),
  'L-S 09:00-12:00';

-- 3) Compras de créditos masivas (≈ 20 operaciones)
--    Cada usuario compra varios paquetes

-- Usuarios que van a comprar créditos
SET @compradores := 'ana@demo.com,carla@demo.com,diego@demo.com,bruno@demo.com,elena@demo.com,fernando@demo.com,gaby@demo.com,hugo@demo.com,irene@demo.com,jorge@demo.com';

-- Ana (2 recargas)
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-ANA-002'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 100'),
  'PAY-ANA-003'
);

-- Carla
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-CARLA-002'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 100'),
  'PAY-CARLA-003'
);

-- Diego
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='diego@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-DIEGO-002'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='diego@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 100'),
  'PAY-DIEGO-003'
);

-- Bruno
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='bruno@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-BRUNO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='bruno@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 100'),
  'PAY-BRUNO-002'
);

-- Elena
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='elena@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-ELENA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='elena@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 100'),
  'PAY-ELENA-002'
);

-- Fernando
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='fernando@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-FERNANDO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='fernando@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 100'),
  'PAY-FERNANDO-002'
);

-- Gaby
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='gaby@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-GABY-001'
);

-- Hugo
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='hugo@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-HUGO-001'
);

-- Irene
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='irene@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-IRENE-001'
);

-- Jorge
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='jorge@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-JORGE-001'
);

-- 4) Intercambios masivos (≈ 20 operaciones)
--    Cada comprador adquiere productos/servicios distintos

-- Función auxiliar mental:
-- Bici Urbana Eco        -> 320 créditos
-- Bici Plegable Ciudad   -> 280 créditos
-- Laptop Reacondicionada -> 350 créditos
-- Monitor 24 Reciclado   -> 220 créditos
-- Mantenimiento laptop   -> 110 créditos
-- Mantenimiento y limpieza de PC (seed original) -> 120 créditos
-- Bicicleta montaña Pro  -> 450 créditos

-- 4.1 Ana compra Bici Urbana Eco y servicio de mantenimiento
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Eco' LIMIT 1),
  320
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento laptop básico' LIMIT 1),
  110
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.2 Carla compra servicio "Mantenimiento y limpieza de PC" y Monitor
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento y limpieza de PC' LIMIT 1),
  120
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Monitor 24 Reciclado' LIMIT 1),
  220
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.3 Diego compra Bici Plegable Ciudad
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='diego@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Plegable Ciudad' LIMIT 1),
  280
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.4 Bruno compra Laptop Reacondicionada y servicio de mantenimiento
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='bruno@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Laptop Reacondicionada i5' LIMIT 1),
  350
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='bruno@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento laptop básico' LIMIT 1),
  110
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.5 Elena compra Monitor y servicio
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='elena@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Monitor 24 Reciclado' LIMIT 1),
  220
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='elena@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Formateo e instalación de Windows' LIMIT 1),
  90
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.6 Fernando compra Bici Urbana Eco
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='fernando@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Eco' LIMIT 1),
  320
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.7 Gaby compra servicio "Formateo e instalación de Windows"
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='gaby@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Formateo e instalación de Windows' LIMIT 1),
  90
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.8 Hugo compra "Mantenimiento y limpieza de PC"
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='hugo@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento y limpieza de PC' LIMIT 1),
  120
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.9 Irene compra "Bicicleta montaña Pro"
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='irene@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bicicleta montaña Pro' LIMIT 1),
  450
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.10 Jorge compra "Bici Plegable Ciudad"
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='jorge@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Plegable Ciudad' LIMIT 1),
  280
);
SET @id_tx = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 5) Actividades sostenibles masivas (≈ 10 operaciones)

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='ana@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó 4kg de papel para reciclaje', 12,
  'https://evidencias/reciclaje_ana.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='bruno@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó 6kg de plástico para reciclaje', 18,
  'https://evidencias/reciclaje_bruno.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='elena@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó 10kg de cartón', 25,
  'https://evidencias/reciclaje_elena.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='fernando@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Donó componentes electrónicos para reciclaje', 20,
  'https://evidencias/reciclaje_fernando.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='gaby@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Recogió residuos en su barrio', 15,
  'https://evidencias/reciclaje_gaby.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='hugo@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Separó vidrio y plástico en su hogar', 10,
  'https://evidencias/reciclaje_hugo.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='irene@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Participó en campaña de recolección de e-waste', 22,
  'https://evidencias/reciclaje_irene.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='jorge@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó pilas usadas para disposición adecuada', 8,
  'https://evidencias/reciclaje_jorge.jpg'
);

-- 6) Regenerar reporte de impacto mensual

CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO WHERE nombre='2025-11'),
  NULL
);

-- Chequeo rápido de saldos y actividad
SELECT u.correo, b.saldo_creditos
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN (
  'ana@demo.com','luis@demo.com','carla@demo.com','diego@demo.com','marta@demo.com',
  'bruno@demo.com','elena@demo.com','fernando@demo.com','gaby@demo.com',
  'hugo@demo.com','irene@demo.com','jorge@demo.com'
)
ORDER BY u.correo;
-- 1) Usuarios extra + billeteras

USE CREDITOS_VERDES2;

-- Verificar IDs (solo para ver qué hay)
SELECT id_categoria, nombre FROM CATEGORIA;
SELECT id_um, simbolo FROM UNIDAD_MEDIDA;

-- Crear equivalencia de impacto para la categoría "Tecnología"
INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología' LIMIT 1),
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u' LIMIT 1),
  8.000000,   -- CO₂ por unidad (valor de ejemplo)
  30.000000,  -- Agua por unidad (ejemplo)
  3.500000;   -- Energía por unidad (ejemplo)

INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Carla','Mendez','carla@demo.com','70000003','/p/carla'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Diego','Salazar','diego@demo.com','70000004','/p/diego'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Marta','Lopez','marta@demo.com','70000005','/p/marta');

-- Crear billetera para esos usuarios (si no existe)
INSERT INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
SELECT u.id_usuario, 'ACTIVA', 0, 0.00, NULL
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN ('carla@demo.com','diego@demo.com','marta@demo.com')
  AND b.id_billetera IS NULL;

-- 2) Productos / servicios extra publicados
--    (para tener más categorías en reportes)

-- Producto extra 1 (vendedor: Marta)
INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici Montaña Pro',
  'Bicicleta de montaña, frenos de disco, suspensión delantera.',
  1800.00,
  15.8;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='marta@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Bicicleta montaña Pro',
  'Ideal para senderos y caminos rurales.',
  450,
  'https://img/bici2.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bicicleta montaña Pro' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO     WHERE nombre='Bici Montaña Pro' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- Servicio extra (vendedor: Marta)
INSERT INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'ACTIVO',
  'Formateo e instalación SO',
  'Instalación de sistema operativo + drivers básicos.',
  80.00,
  45;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion, titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='marta@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Formateo e instalación de Windows',
  'Incluye backup básico de documentos.',
  90,
  'https://img/serv2.jpg';

INSERT INTO PUBLICACION_SERVICIO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Formateo e instalación de Windows' LIMIT 1),
  (SELECT id_servicio   FROM SERVICIO     WHERE nombre='Formateo e instalación SO' LIMIT 1),
  'L-V 14:00-18:00';

-- 3) Compras de créditos (RECARGA) usando SP

-- Carla compra Pack 100
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-DEMO-002'
);

-- Diego compra Pack 500
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='diego@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-DEMO-003'
);

-- 4) Intercambios extra (TRANSACCIONES)

-- Carla compra el servicio "Mantenimiento y limpieza de PC" de Luis (120 créditos)
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAGO-CARLA-001'
);
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento y limpieza de PC' LIMIT 1),
  120
);

SET @id_tx_carla_pc = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION
SET estado = 'COMPLETADA'
WHERE id_transaccion = @id_tx_carla_pc;

-- Diego compra "Bicicleta montaña Pro" de Marta (450 créditos)
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='diego@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bicicleta montaña Pro' LIMIT 1),
  450
);

SET @id_tx_diego_bici = (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION
SET estado = 'COMPLETADA'
WHERE id_transaccion = @id_tx_diego_bici;

-- 5) Actividades sostenibles extra

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó 3kg de plástico para reciclaje', 10,
  'https://evidencias/reciclaje2.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='diego@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó 8kg de vidrio para reciclaje', 20,
  'https://evidencias/reciclaje3.jpg'
);

-- 6) Regenerar reporte de impacto MENSUAL

CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO WHERE nombre='2025-11'),
  NULL
);

-- Puedes verificar rápido:
SELECT u.correo, b.saldo_creditos
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN ('ana@demo.com','luis@demo.com','carla@demo.com','diego@demo.com','marta@demo.com');

USE CREDITOS_VERDES2;

-- 0) Asegurar equivalencia de impacto para Tecnología (seguro)

INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología' LIMIT 1),
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u' LIMIT 1),
  8.000000,
  30.000000,
  3.500000;
/* 1) Nuevos USUARIOS (≈ 24 compradores + 8 vendedores)*/

-- 1.1 Compradores NUEVOS
INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Camila','Rios','camila@demo.com','71000001','/p/camila'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Daniel','Torres','daniel@demo.com','71000002','/p/daniel'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Sofia','Mendez','sofia@demo.com','71000003','/p/sofia'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Pablo','Lima','pablo@demo.com','71000004','/p/pablo'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Laura','Guzman','laura@demo.com','71000005','/p/laura'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Andres','Zeballos','andres@demo.com','71000006','/p/andres'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Valeria','Nuñez','valeria@demo.com','71000007','/p/valeria'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Roberto','Aguilar','roberto@demo.com','71000008','/p/roberto'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Natalia','Cruz','natalia@demo.com','71000009','/p/natalia'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Sergio','Rojas','sergio@demo.com','71000010','/p/sergio'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Patricia','Salas','patricia@demo.com','71000011','/p/patricia'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Marcos','Quiroga','marcos@demo.com','71000012','/p/marcos'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Lucia','Delgado','lucia@demo.com','71000013','/p/lucia'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Ricardo','Vega','ricardo@demo.com','71000014','/p/ricardo'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Melissa','Campos','melissa@demo.com','71000015','/p/melissa'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Tomas','Herrera','tomas@demo.com','71000016','/p/tomas'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Cecilia','Paredes','cecilia@demo.com','71000017','/p/cecilia'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','German','Lara','german@demo.com','71000018','/p/german'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Roxana','Villaroel','roxana@demo.com','71000019','/p/roxana'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Kevin','Lopez','kevin@demo.com','71000020','/p/kevin'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Mauro','Ibañez','mauro@demo.com','71000021','/p/mauro'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Dana','Gomez','dana@demo.com','71000022','/p/dana'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Helena','Ramos','helena@demo.com','71000023','/p/helena'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Oscar','Medina','oscar@demo.com','71000024','/p/oscar');

-- 1.2 Vendedores NUEVOS
INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Green','Store','greenstore@demo.com','72000001','/p/greenstore'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Bici','Plus','biciplus@demo.com','72000002','/p/biciplus'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','EcoTech','Solutions','ecotech@demo.com','72000003','/p/ecotech'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Zero','Waste','zerowaste@demo.com','72000004','/p/zerowaste'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Repara','PC','reparapc@demo.com','72000005','/p/reparapc'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Recicla','YA','reciclaya@demo.com','72000006','/p/reciclaya'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Eco','Market3','ecomarket3@demo.com','72000007','/p/ecomarket3'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Tech','Refurb','techrefurb@demo.com','72000008','/p/techrefurb');

-- 1.3 Crear BILLETERA para todos los nuevos (si no tienen)
INSERT INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
SELECT u.id_usuario, 'ACTIVA', 0, 0.00, NULL
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN (
  'camila@demo.com','daniel@demo.com','sofia@demo.com','pablo@demo.com',
  'laura@demo.com','andres@demo.com','valeria@demo.com','roberto@demo.com',
  'natalia@demo.com','sergio@demo.com','patricia@demo.com','marcos@demo.com',
  'lucia@demo.com','ricardo@demo.com','melissa@demo.com','tomas@demo.com',
  'cecilia@demo.com','german@demo.com','roxana@demo.com','kevin@demo.com',
  'mauro@demo.com','dana@demo.com','helena@demo.com','oscar@demo.com',
  'greenstore@demo.com','biciplus@demo.com','ecotech@demo.com',
  'zerowaste@demo.com','reparapc@demo.com','reciclaya@demo.com',
  'ecomarket3@demo.com','techrefurb@demo.com'
)
AND b.id_billetera IS NULL;

/* 2) Productos / servicios extra para nuevos vendedores
   (reutilizan categorías Bicicletas y Tecnología)*/

-- 2.1 Productos de BiciPlus
INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici Urbana Basic',
  'Bicicleta urbana básica reacondicionada.',
  1100.00,
  14.0;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='biciplus@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Bici Urbana Basic',
  'Ideal para uso diario en ciudad.',
  250,
  'https://img/bici_basic.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Basic' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Bici Urbana Basic' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- 2.2 Productos de GreenStore (Tecnología)
INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'PC Oficina Reacondicionada',
  'CPU compacta para oficina, 8GB RAM, SSD 240GB.',
  1800.00,
  5.5;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='greenstore@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'PC Oficina Reacondicionada',
  'Equipo compacto, ideal para ofimática.',
  300,
  'https://img/pc_oficina.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='PC Oficina Reacondicionada' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='PC Oficina Reacondicionada' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- 2.3 Servicios de ReparaPC
INSERT INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'ACTIVO',
  'Reparación avanzada de PC',
  'Diagnóstico y reparación de fallas de hardware.',
  150.00,
  90;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='reparapc@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Santa Cruz'),
  'Reparación avanzada de PC',
  'Incluye cambio de piezas y pruebas de estabilidad.',
  140,
  'https://img/serv_reparacion_pc.jpg';

INSERT INTO PUBLICACION_SERVICIO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Reparación avanzada de PC' LIMIT 1),
  (SELECT id_servicio   FROM SERVICIO   WHERE nombre='Reparación avanzada de PC' LIMIT 1),
  'L-S 15:00-19:00';

/*    3) Compras de créditos extra (cada nuevo comprador recarga) */

-- Todos compran al menos un Pack 500
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='camila@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-CAMILA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='daniel@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-DANIEL-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='sofia@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-SOFIA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='pablo@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-PABLO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='laura@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-LAURA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='andres@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-ANDRES-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='valeria@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-VALERIA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='roberto@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-ROBERTO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='natalia@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-NATALIA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='sergio@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-SERGIO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='patricia@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-PATRICIA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='marcos@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-MARCOS-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='lucia@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-LUCIA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='ricardo@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-RICARDO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='melissa@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-MELISSA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='tomas@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-TOMAS-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='cecilia@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-CECILIA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='german@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-GERMAN-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='roxana@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-ROXANA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='kevin@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-KEVIN-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='mauro@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-MAURO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='dana@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-DANA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='helena@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-HELENA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='oscar@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-OSCAR-001'
);

/*    4) Intercambios extra
   (cada comprador hace al menos un intercambio)*/

-- Notas de créditos:
-- Bici Urbana Eco          320
-- Bici Plegable Ciudad     280
-- Bici Urbana Basic        250
-- Laptop Reacondicionada   350
-- Monitor 24 Reciclado     220
-- Mantenimiento laptop     110
-- Repr. avanzada PC        140
-- Mantenimiento y limpieza PC 120
-- Formateo e instalación Windows 90
-- PC Oficina Reacondicionada 300

-- 4.1 Algunos compran bicicletas
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='camila@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Eco' LIMIT 1),
  320
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='daniel@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Plegable Ciudad' LIMIT 1),
  280
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='sofia@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Basic' LIMIT 1),
  250
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='pablo@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bicicleta montaña Pro' LIMIT 1),
  450
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.2 Otros compran productos de tecnología
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='laura@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Laptop Reacondicionada i5' LIMIT 1),
  350
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='andres@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Monitor 24 Reciclado' LIMIT 1),
  220
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='valeria@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='PC Oficina Reacondicionada' LIMIT 1),
  300
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='roberto@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Laptop Reacondicionada i5' LIMIT 1),
  350
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.3 Otros compran servicios
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='natalia@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento laptop básico' LIMIT 1),
  110
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='sergio@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Reparación avanzada de PC' LIMIT 1),
  140
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='patricia@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento y limpieza de PC' LIMIT 1),
  120
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='marcos@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Formateo e instalación de Windows' LIMIT 1),
  90
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='lucia@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento laptop básico' LIMIT 1),
  110
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='ricardo@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Reparación avanzada de PC' LIMIT 1),
  140
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.4 Algunos hacen 2 operaciones
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='melissa@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Basic' LIMIT 1),
  250
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='melissa@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento laptop básico' LIMIT 1),
  110
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='tomas@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Laptop Reacondicionada i5' LIMIT 1),
  350
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='cecilia@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='PC Oficina Reacondicionada' LIMIT 1),
  300
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='german@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Monitor 24 Reciclado' LIMIT 1),
  220
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='roxana@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Eco' LIMIT 1),
  320
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='kevin@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento y limpieza de PC' LIMIT 1),
  120
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='mauro@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Formateo e instalación de Windows' LIMIT 1),
  90
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='dana@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento laptop básico' LIMIT 1),
  110
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='helena@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Plegable Ciudad' LIMIT 1),
  280
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='oscar@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='PC Oficina Reacondicionada' LIMIT 1),
  300
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

/* 5) Actividades sostenibles extra*/

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='camila@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Participó en jornada de reciclaje de plástico', 15,
  'https://evidencias/reciclaje_camila.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='daniel@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó 5kg de papel usado', 12,
  'https://evidencias/reciclaje_daniel.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='sofia@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Recolectó botellas PET en su barrio', 18,
  'https://evidencias/reciclaje_sofia.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='pablo@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Donó electrónicos viejos a reciclaje', 20,
  'https://evidencias/reciclaje_pablo.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='laura@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Separó residuos en su oficina por todo el mes', 25,
  'https://evidencias/reciclaje_laura.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='andres@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Apoyó campaña de recolección de vidrio', 16,
  'https://evidencias/reciclaje_andres.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='valeria@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó 3kg de latas de aluminio', 10,
  'https://evidencias/reciclaje_valeria.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='roberto@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Organizó punto de acopio de pilas', 22,
  'https://evidencias/reciclaje_roberto.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='natalia@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Participó en limpieza de río urbano', 30,
  'https://evidencias/reciclaje_natalia.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='sergio@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Apoyó campaña de recuperación de e-waste', 18,
  'https://evidencias/reciclaje_sergio.jpg'
);

/* 6) Regenerar reporte de impacto para 2025-11 */

CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO WHERE nombre='2025-11'),
  NULL
);

/*    7) Chequeo rápido de saldos de algunos usuarios */

SELECT u.correo, b.saldo_creditos
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN (
  'ana@demo.com','luis@demo.com','carla@demo.com','diego@demo.com','marta@demo.com',
  'bruno@demo.com','elena@demo.com','fernando@demo.com','gaby@demo.com',
  'camila@demo.com','daniel@demo.com','sofia@demo.com','pablo@demo.com','laura@demo.com',
  'andres@demo.com','valeria@demo.com','roberto@demo.com','natalia@demo.com',
  'sergio@demo.com','patricia@demo.com','marcos@demo.com','lucia@demo.com',
  'ricardo@demo.com','melissa@demo.com','tomas@demo.com','cecilia@demo.com',
  'german@demo.com','roxana@demo.com','kevin@demo.com','mauro@demo.com',
  'dana@demo.com','helena@demo.com','oscar@demo.com'
)
ORDER BY u.correo;

use creditos_verdes2;
INSERT IGNORE INTO SUSCRIPCION_PREMIUM (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
SELECT
  id_usuario,
  '2025-11-05 10:00:00',
  '2025-12-05 10:00:00',
  'ACTIVA',
  30.00
FROM USUARIO
WHERE correo = 'ana@demo.com';

INSERT IGNORE INTO SUSCRIPCION_PREMIUM (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
SELECT
  id_usuario,
  '2025-10-20 09:00:00',
  '2025-11-20 09:00:00',
  'VENCIDA',
  30.00
FROM USUARIO
WHERE correo = 'luis@demo.com';
