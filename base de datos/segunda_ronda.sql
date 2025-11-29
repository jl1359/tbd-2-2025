USE CREDITOS_VERDES2;

-- 0) Asegurar equivalencia de impacto para Tecnología (por si acaso)

INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología' LIMIT 1),
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u' LIMIT 1),
  8.000000,
  30.000000,
  3.500000;

/*    1) Nuevos USUARIOS (12 compradores + 6 vendedores)*/

-- 1.1 Compradores NUEVOS (12)
INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Brenda','Molina','brenda@demo.com','73000001','/p/brenda03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Ignacio','Perez','ignacio@demo.com','73000002','/p/ignacio03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Julieta','Suarez','julieta@demo.com','73000003','/p/julieta03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Hugo','Montes','huugo@demo.com','73000004','/p/hugo03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Olivia','Arce','oliviaa@demo.com','73000005','/p/olivia03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Mateo','Flores','mateoo@demo.com','73000006','/p/mateo03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Carolina','Salvatierra','caroliina@demo.com','73000007','/p/carolina03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Esteban','Villarroel','estebann@demo.com','73000008','/p/esteban03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Paola','Mendez','paoula@demo.com','73000009','/p/paola03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Javier','Loayza','javieri@demo.com','73000010','/p/javier03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Noelia','Ruiz','noelial@demo.com','73000011','/p/noelia03'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Franco','Gutierrez','francos@demo.com','73000012','/p/franco03');


-- 1.2 Vendedores NUEVOS (6)
INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','EcoRuedas','SRL','ecoruedas@demo.com','74000001','/p/ecoruedas'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Smart','Tech','smarttech@demo.com','74000002','/p/smarttech'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Cleta','City','cletacity@demo.com','74000003','/p/cletacity'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Green','Office','greenoffice@demo.com','74000004','/p/greenoffice'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Compu','Fix','compufix@demo.com','74000005','/p/compufix'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','ReUse','Hub','reusehub@demo.com','74000006','/p/reusehub');

-- 1.3 Crear BILLETERA para todos los nuevos (si no tienen)
INSERT INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
SELECT u.id_usuario, 'ACTIVA', 0, 0.00, NULL
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN (
  'brenda@demo.com','ignacio@demo.com','julieta@demo.com','hugo@demo.com',
  'olivia@demo.com','mateo@demo.com','carolina@demo.com','esteban@demo.com',
  'paola@demo.com','javier@demo.com','noelia@demo.com','franco@demo.com',
  'ecoruedas@demo.com','smarttech@demo.com','cletacity@demo.com',
  'greenoffice@demo.com','compufix@demo.com','reusehub@demo.com'
)
AND b.id_billetera IS NULL;

/*    2) Nuevos PRODUCTOS / SERVICIOS + PUBLICACIONES*/

-- 2.1 Bicicletas de EcoRuedas y CletaCity
INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici Híbrida Urbana',
  'Bicicleta híbrida para ciudad, reacondicionada.',
  1450.00,
  13.8;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici MTB Junior',
  'Bicicleta de montaña para jóvenes, reacondicionada.',
  980.00,
  12.5;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici Paseo Vintage',
  'Bicicleta de paseo estilo vintage reutilizada.',
  1300.00,
  14.2;

-- Publicaciones de Bicicletas
INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='ecoruedas@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Bici Híbrida Urbana',
  'Ideal para uso diario y rutas ligeras, reacondicionada con componentes revisados.',
  340,
  'https://img/bici_hibrida_urbana.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Híbrida Urbana' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Bici Híbrida Urbana' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='cletacity@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Bici MTB Junior',
  'Bici de montaña reacondicionada para jóvenes, perfecta para parques y ciclovías.',
  260,
  'https://img/bici_mtb_junior.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici MTB Junior' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Bici MTB Junior' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='cletacity@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Bici Paseo Vintage',
  'Bicicleta de paseo con canastillo y estilo retro, recuperada y ajustada.',
  280,
  'https://img/bici_paseo_vintage.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Paseo Vintage' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Bici Paseo Vintage' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- 2.2 Tecnología: productos de SmartTech y GreenOffice
INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'Mini PC Eco Oficina',
  'Mini PC de bajo consumo, reacondicionada para tareas de oficina.',
  1900.00,
  4.2;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'Monitor 27 Reciclado',
  'Monitor de 27 pulgadas reacondicionado, ideal para multitarea.',
  1350.00,
  5.8;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'Kit Oficina Reacondicionada',
  'Combo de PC y monitor reacondicionados para oficina sostenible.',
  2600.00,
  10.5;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='smarttech@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Mini PC Eco Oficina',
  'Equipo compacto y eficiente, ideal para reducir consumo energético.',
  320,
  'https://img/mini_pc_eco.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mini PC Eco Oficina' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Mini PC Eco Oficina' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='greenoffice@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Monitor 27 Reciclado',
  'Pantalla de 27" reacondicionada, excelente para trabajo y estudio.',
  240,
  'https://img/monitor_27_reciclado.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Monitor 27 Reciclado' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Monitor 27 Reciclado' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='greenoffice@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Kit Oficina Reacondicionada',
  'Combo eco-friendly de PC + monitor reacondicionados.',
  280,
  'https://img/kit_oficina_reacondicionada.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Kit Oficina Reacondicionada' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Kit Oficina Reacondicionada' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- 2.3 Servicio de tecnología (CompuFix)
INSERT INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'ACTIVO',
  'Upgrade SSD + limpieza',
  'Servicio de instalación de SSD y limpieza interna completa.',
  130.00,
  75;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='compufix@demo.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Upgrade SSD + limpieza',
  'Mejora el rendimiento de tu PC y alarga su vida útil.',
  130,
  'https://img/upgrade_ssd_limpieza.jpg';

INSERT INTO PUBLICACION_SERVICIO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Upgrade SSD + limpieza' LIMIT 1),
  (SELECT id_servicio   FROM SERVICIO   WHERE nombre='Upgrade SSD + limpieza' LIMIT 1),
  'L-S 10:00-18:00';

/*    3) Compras de créditos extra (Pack 500 para cada comprador nuevo)*/

CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='brenda@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-BRENDA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='ignacio@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-IGNACIO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='julieta@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-JULIETA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='huugo@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-HUGO-002'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='oliviaa@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-OLIVIA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='mateoo@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-MATEO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='caroliina@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-CAROLINA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='estebann@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-ESTEBAN-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='paoula@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-PAOLA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='javieri@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-JAVIER-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='noelial@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-NOELIA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='francos@demo.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-FRANCO-001'
);

/*    4) Intercambios extra
   - Cada nuevo comprador hace al menos 1 intercambio
   - Todos los montos <= 500 créditos (saldo disponible)*/

-- 4.1 Bicicletas
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='brenda@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Híbrida Urbana' LIMIT 1),
  340
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='ignacio@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici MTB Junior' LIMIT 1),
  260
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='julieta@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Paseo Vintage' LIMIT 1),
  280
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.2 Productos de tecnología
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='hugo@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mini PC Eco Oficina' LIMIT 1),
  320
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='oliviaa@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Monitor 27 Reciclado' LIMIT 1),
  240
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='mateoo@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Kit Oficina Reacondicionada' LIMIT 1),
  100
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.3 Servicios de tecnología
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='caroliina@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Upgrade SSD + limpieza' LIMIT 1),
  130
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='estebann@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Upgrade SSD + limpieza' LIMIT 1),
  130
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='paoula@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici MTB Junior' LIMIT 1),
  260
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='javieri@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Híbrida Urbana' LIMIT 1),
  340
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='noelial@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mini PC Eco Oficina' LIMIT 1),
  320
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='francos@demo.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Paseo Vintage' LIMIT 1),
  280
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

/*    5) Actividades sostenibles extra*/

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='brenda@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Clasificó residuos en su condominio durante una semana.',
  18,
  'https://evidencias/reciclaje_brenda.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='ignacio@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Llevó 4kg de plástico a un punto de acopio.',
  14,
  'https://evidencias/reciclaje_ignacio.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='julieta@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Organizó una mini campaña de reciclaje en su curso.',
  20,
  'https://evidencias/reciclaje_julieta.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='hugo@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Recolectó y entregó chatarra electrónica.',
  22,
  'https://evidencias/reciclaje_hugo.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='oliviaa@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Promovió el uso de botellas reutilizables en su oficina.',
  16,
  'https://evidencias/reciclaje_olivia.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='mateoo@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Separó residuos orgánicos y los convirtió en compost.',
  24,
  'https://evidencias/reciclaje_mateo.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='caroliina@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Participó en limpieza de una plaza céntrica.',
  15,
  'https://evidencias/reciclaje_carolina.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='estebann@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Recolectó cartón y lo entregó a recicladores de base.',
  17,
  'https://evidencias/reciclaje_esteban.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='paoula@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Redució el uso de bolsas plásticas en su negocio.',
  12,
  'https://evidencias/reciclaje_paola.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='javieri@demo.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Coordinó un punto móvil de reciclaje en su barrio.',
  21,
  'https://evidencias/reciclaje_javier.jpg'
);

/*    6) Más SUSCRIPCION_PREMIUM para alimentar sp_rep_usuarios_premium */

-- Algunas suscripciones nuevas ACTIVA en noviembre
INSERT IGNORE INTO SUSCRIPCION_PREMIUM (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
SELECT
  id_usuario,
  '2025-11-10 08:00:00',
  '2025-12-10 08:00:00',
  'ACTIVA',
  35.00
FROM USUARIO
WHERE correo IN ('brenda@demo.com','ignacio@demo.com','julieta@demo.com');

INSERT IGNORE INTO SUSCRIPCION_PREMIUM (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
SELECT
  id_usuario,
  '2025-11-15 09:30:00',
  '2025-12-15 09:30:00',
  'ACTIVA',
  35.00
FROM USUARIO
WHERE correo IN ('hugo@demo.com','olivia@demo.com');

-- Una suscripción ya VENCIDA (octubre-noviembre)
INSERT IGNORE INTO SUSCRIPCION_PREMIUM (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
SELECT
  id_usuario,
  '2025-10-05 10:00:00',
  '2025-11-05 10:00:00',
  'VENCIDA',
  30.00
FROM USUARIO
WHERE correo = 'mateo@demo.com';

/*    7) Regenerar reporte de impacto para 2025-11 (global) */

CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO WHERE nombre='2025-11'),
  NULL
);

/*    8) Chequeo rápido de saldos y premium*/

-- Créditos actuales de los nuevos compradores
SELECT u.correo, b.saldo_creditos
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN (
  'brenda@demo.com','ignacio@demo.com','julieta@demo.com','hugo@demo.com',
  'oliviaa@demo.com','mateoo@demo.com','caroliina@demo.com','estebann@demo.com',
  'paoula@demo.com','javieri@demo.com','noelial@demo.com','francos@demo.com'
)
ORDER BY u.correo;

-- Suscripciones premium recientes
SELECT u.correo, s.fecha_inicio, s.fecha_fin, s.estado, s.monto_bs
FROM SUSCRIPCION_PREMIUM s
JOIN USUARIO u ON u.id_usuario = s.id_usuario
WHERE u.correo IN (
  'ana@demo.com','luis@demo.com',
  'brenda@demo.com','ignacio@demo.com','julieta@demo.com',
  'hugo@demo.com','oliviaa@demo.com','mateoo@demo.com'
)
ORDER BY s.fecha_inicio;

USE CREDITOS_VERDES2;

-- 0) Asegurar equivalencia de impacto para Tecnología (por si acaso)

INSERT IGNORE INTO EQUIVALENCIA_IMPACTO (id_categoria, id_um, co2_por_unidad, agua_por_unidad, energia_por_unidad)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Tecnología' LIMIT 1),
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo = 'u' LIMIT 1),
  8.000000,
  30.000000,
  3.500000;

/*   1) Nuevos USUARIOS (10 compradores + 5 vendedores)*/

-- 1.1 Compradores NUEVOS (10) - dominio @batch3.com y urls /p3/...
INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Ariana','Campos','ariana@batch3.com','75000001','/p3/ariana'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Bruno','Rios','bruno@batch3.com','75000002','/p3/bruno'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Carla','Duarte','carla_b3@batch3.com','75000003','/p3/carla'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Diego','Navarro','diego_b3@batch3.com','75000004','/p3/diego'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Eva','Sanchez','eva@batch3.com','75000005','/p3/eva'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Gabriel','Mendoza','gabriel@batch3.com','75000006','/p3/gabriel'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Irina','Flores','irina@batch3.com','75000007','/p3/irina'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Luis','Ortega','luis_b3@batch3.com','75000008','/p3/luis'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Mariana','Guzman','mariana@batch3.com','75000009','/p3/mariana'),
  ((SELECT id_rol FROM ROL WHERE nombre='COMPRADOR'),'ACTIVO','Nicolas','Vera','nicolas@batch3.com','75000010','/p3/nicolas');

-- 1.2 Vendedores NUEVOS (5)
INSERT INTO USUARIO (id_rol, estado, nombre, apellido, correo, telefono, url_perfil)
VALUES
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Bike','Planet','bikeplanet@batch3.com','76000001','/p3/bikeplanet'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Refurb','Center','refurbcenter@batch3.com','76000002','/p3/refurbcenter'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Eco','Devices','ecodevices@batch3.com','76000003','/p3/ecodevices'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','Office','Green','officegreen@batch3.com','76000004','/p3/officegreen'),
  ((SELECT id_rol FROM ROL WHERE nombre='VENDEDOR'),'ACTIVO','PC','Clinic','pcclinic@batch3.com','76000005','/p3/pcclinic');

-- 1.3 Crear BILLETERA para todos los nuevos (compradores + vendedores)
INSERT INTO BILLETERA (id_usuario, estado, saldo_creditos, saldo_bs, cuenta_bancaria)
SELECT u.id_usuario, 'ACTIVA', 0, 0.00, NULL
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN (
  'ariana@batch3.com','bruno@batch3.com','carla_b3@batch3.com','diego_b3@batch3.com',
  'eva@batch3.com','gabriel@batch3.com','irina@batch3.com','luis_b3@batch3.com',
  'mariana@batch3.com','nicolas@batch3.com',
  'bikeplanet@batch3.com','refurbcenter@batch3.com','ecodevices@batch3.com',
  'officegreen@batch3.com','pcclinic@batch3.com'
)
AND b.id_billetera IS NULL;

/*    2) Nuevos PRODUCTOS / SERVICIOS + PUBLICACIONES    */

-- 2.1 Bicicletas (BikePlanet)
INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici Urbana Light B3',
  'Bicicleta urbana liviana reacondicionada.',
  1200.00,
  13.0;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici Montaña Pro B3',
  'Bicicleta de montaña avanzada reacondicionada.',
  1800.00,
  14.5;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  'Bici Niño B3',
  'Bicicleta para niños reacondicionada.',
  900.00,
  11.0;

-- Publicaciones Bicicletas
INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='bikeplanet@batch3.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Bici Urbana Light B3',
  'Bicicleta urbana liviana ideal para ciudad, reacondicionada.',
  230,
  'https://img/b3_bici_urbana_light.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Light B3' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Bici Urbana Light B3' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='bikeplanet@batch3.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Bici Montaña Pro B3',
  'Bici de montaña reacondicionada para rutas exigentes.',
  360,
  'https://img/b3_bici_montana_pro.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Montaña Pro B3' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Bici Montaña Pro B3' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='bikeplanet@batch3.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Bicicletas'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Bici Niño B3',
  'Bici para niños reacondicionada, ideal para parques.',
  180,
  'https://img/b3_bici_nino.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Niño B3' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Bici Niño B3' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- 2.2 Tecnología (RefurbCenter, EcoDevices, OfficeGreen)
INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'Laptop Eco B3',
  'Laptop reacondicionada de bajo consumo energético.',
  2200.00,
  4.0;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'Smartphone Reacondicionado B3',
  'Smartphone reacondicionado en excelente estado.',
  1400.00,
  0.4;

INSERT INTO PRODUCTO (id_categoria, nombre, descripcion, precio, peso)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'Set Oficina Verde B3',
  'Combo PC + monitor reacondicionados para oficina.',
  2600.00,
  9.8;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='refurbcenter@batch3.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Laptop Eco B3',
  'Laptop eficiente y reacondicionada, ideal para trabajo y estudio.',
  340,
  'https://img/b3_laptop_eco.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Laptop Eco B3' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Laptop Eco B3' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='ecodevices@batch3.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Smartphone Reacondicionado B3',
  'Smartphone reacondicionado, reduciendo residuos electrónicos.',
  210,
  'https://img/b3_smartphone_reacondicionado.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Smartphone Reacondicionado B3' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Smartphone Reacondicionado B3' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='officegreen@batch3.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='PRODUCTO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='La Paz'),
  'Set Oficina Verde B3',
  'Combo eco-friendly de PC y monitor reacondicionados.',
  280,
  'https://img/b3_set_oficina_verde.jpg';

INSERT INTO PUBLICACION_PRODUCTO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Set Oficina Verde B3' LIMIT 1),
  (SELECT id_producto   FROM PRODUCTO   WHERE nombre='Set Oficina Verde B3' LIMIT 1),
  1.0000,
  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u');

-- 2.3 Servicio de tecnología (PCClinic)
INSERT INTO SERVICIO (id_categoria, estado, nombre, descripcion, precio, duracion_min)
SELECT
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  'ACTIVO',
  'Mantenimiento completo B3',
  'Servicio de mantenimiento y limpieza profunda de PC.',
  120.00,
  80;

INSERT INTO PUBLICACION
  (id_usuario, id_categoria, id_tipo_publicacion, estado, id_ubicacion,
   titulo, descripcion, valor_creditos, imagen_url)
SELECT
  (SELECT id_usuario FROM USUARIO WHERE correo='pcclinic@batch3.com'),
  (SELECT id_categoria FROM CATEGORIA WHERE nombre='Tecnología'),
  (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre='SERVICIO'),
  'PUBLICADA',
  (SELECT id_ubicacion FROM UBICACION WHERE ciudad='Cochabamba'),
  'Mantenimiento completo B3',
  'Servicio para alargar la vida útil de tu equipo.',
  120,
  'https://img/b3_mantenimiento_completo.jpg';

INSERT INTO PUBLICACION_SERVICIO
SELECT
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento completo B3' LIMIT 1),
  (SELECT id_servicio   FROM SERVICIO   WHERE nombre='Mantenimiento completo B3' LIMIT 1),
  'L-S 09:00-18:00';

/*    3) Compras de créditos extra (Pack 500 para cada comprador nuevo)    */

CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='ariana@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-ARIANA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='bruno@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-BRUNO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla_b3@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-CARLA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='diego_b3@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-DIEGO-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='eva@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-EVA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='gabriel@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-GABRIEL-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='irina@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-IRINA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='luis_b3@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-LUIS-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='mariana@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-MARIANA-001'
);
CALL sp_compra_creditos_aprobar(
  (SELECT id_usuario FROM USUARIO WHERE correo='nicolas@batch3.com'),
  (SELECT id_paquete FROM PAQUETE_CREDITOS WHERE nombre='Pack 500'),
  'PAY-B3-NICOLAS-001'
);

/*   4) Intercambios extra
   - Cada comprador hace al menos 1 intercambio
   - Todos los montos <= 500 créditos*/

-- 4.1 Bicicletas
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='ariana@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Light B3' LIMIT 1),
  230
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='bruno@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Montaña Pro B3' LIMIT 1),
  360
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla_b3@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Niño B3' LIMIT 1),
  180
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.2 Productos de tecnología
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='diego_b3@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Laptop Eco B3' LIMIT 1),
  340
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='eva@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Smartphone Reacondicionado B3' LIMIT 1),
  210
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='gabriel@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Set Oficina Verde B3' LIMIT 1),
  280
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.3 Servicios de tecnología
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla_b3@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento completo B3' LIMIT 1),
  120
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='irina@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento completo B3' LIMIT 1),
  120
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

-- 4.4 Más operaciones para otros compradores
CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='luis_b3@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Laptop Eco B3' LIMIT 1),
  340
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='mariana@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Bici Urbana Light B3' LIMIT 1),
  230
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='nicolas@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Smartphone Reacondicionado B3' LIMIT 1),
  210
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

CALL sp_realizar_intercambio(
  (SELECT id_usuario FROM USUARIO WHERE correo='nicolas@batch3.com'),
  (SELECT id_publicacion FROM PUBLICACION WHERE titulo='Mantenimiento completo B3' LIMIT 1),
  120
); SET @id_tx := (SELECT MAX(id_transaccion) FROM TRANSACCION);
UPDATE TRANSACCION SET estado='COMPLETADA' WHERE id_transaccion=@id_tx;

/*    5) Actividades sostenibles extra */

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='ariana@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Participó en jornada de recolección de plástico en su barrio.',
  18,
  'https://evidencias/b3_reciclaje_ariana.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='bruno@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó 6kg de papel y cartón a un punto de acopio.',
  16,
  'https://evidencias/b3_reciclaje_bruno.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='carla_b3@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Organizó una campaña de reciclaje en su facultad.',
  22,
  'https://evidencias/b3_reciclaje_carla.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='diego_b3@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Recolectó chatarra electrónica y la llevó a un centro autorizado.',
  20,
  'https://evidencias/b3_reciclaje_diego.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='eva@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Promovió el uso de bolsas reutilizables en su hogar.',
  12,
  'https://evidencias/b3_reciclaje_eva.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='gabriel@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Apoyó una limpieza de río urbano.',
  24,
  'https://evidencias/b3_reciclaje_gabriel.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='irina@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Implementó separación de residuos en su oficina.',
  17,
  'https://evidencias/b3_reciclaje_irina.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='luis_b3@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Entregó botellas PET en un punto verde.',
  14,
  'https://evidencias/b3_reciclaje_luis.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='mariana@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Redució el uso de envases desechables en su emprendimiento.',
  15,
  'https://evidencias/b3_reciclaje_mariana.jpg'
);

CALL sp_registrar_actividad_sostenible(
  (SELECT id_usuario FROM USUARIO WHERE correo='nicolas@batch3.com'),
  (SELECT id_tipo_actividad FROM TIPO_ACTIVIDAD WHERE nombre='RECICLAJE'),
  'Apoyó una campaña escolar de reciclaje de papel.',
  19,
  'https://evidencias/b3_reciclaje_nicolas.jpg'
);

/*    6) SUSCRIPCION_PREMIUM extra */

-- Suscripciones ACTIVA en noviembre
INSERT IGNORE INTO SUSCRIPCION_PREMIUM (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
SELECT
  id_usuario,
  '2025-11-18 08:00:00',
  '2025-12-18 08:00:00',
  'ACTIVA',
  40.00
FROM USUARIO
WHERE correo IN ('ariana@batch3.com','bruno@batch3.com','carla_b3@batch3.com');

INSERT IGNORE INTO SUSCRIPCION_PREMIUM (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
SELECT
  id_usuario,
  '2025-11-20 09:30:00',
  '2025-12-20 09:30:00',
  'ACTIVA',
  40.00
FROM USUARIO
WHERE correo IN ('diego_b3@batch3.com','eva@batch3.com');

-- Una suscripción VENCIDA (octubre-noviembre)
INSERT IGNORE INTO SUSCRIPCION_PREMIUM (id_usuario, fecha_inicio, fecha_fin, estado, monto_bs)
SELECT
  id_usuario,
  '2025-10-10 10:00:00',
  '2025-11-10 10:00:00',
  'VENCIDA',
  30.00
FROM USUARIO
WHERE correo = 'gabriel@batch3.com';

/*    7) Regenerar reporte de impacto para 2025-11    */

CALL sp_generar_reporte_impacto(
  (SELECT id_tipo_reporte FROM TIPO_REPORTE WHERE nombre='MENSUAL'),
  (SELECT id_periodo FROM PERIODO WHERE nombre='2025-11'),
  NULL
);

/*    8) Chequeos rápidos (opcional)    */

-- Créditos actuales de los nuevos compradores
SELECT u.correo, b.saldo_creditos
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_usuario = u.id_usuario
WHERE u.correo IN (
  'ariana@batch3.com','bruno@batch3.com','carla_b3@batch3.com','diego_b3@batch3.com',
  'eva@batch3.com','gabriel@batch3.com','irina@batch3.com','luis_b3@batch3.com',
  'mariana@batch3.com','nicolas@batch3.com'
)
ORDER BY u.correo;

-- Suscripciones premium recientes BATCH 3
SELECT u.correo, s.fecha_inicio, s.fecha_fin, s.estado, s.monto_bs
FROM SUSCRIPCION_PREMIUM s
JOIN USUARIO u ON u.id_usuario = s.id_usuario
WHERE u.correo IN (
  'ariana@batch3.com','bruno@batch3.com','carla_b3@batch3.com',
  'diego_b3@batch3.com','eva@batch3.com','gabriel@batch3.com'
)
ORDER BY s.fecha_inicio;
