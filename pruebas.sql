USE TruequeComercioCircular;

-- DATOS (catálogos y bases)

-- Roles y estados
INSERT INTO ROL (nombre, descripcion) VALUES
('Administrador','Gestiona el sistema'),
('Moderador','Modera contenidos'),
('Usuario','Participante estándar');

INSERT INTO ESTADO_PUBLICACION (nombre, descripcion) VALUES
('Borrador','No visible'),
('Publicada','Visible'),
('Pausada','Temporalmente inactiva'),
('Eliminada','Retirada');

INSERT INTO ESTADO_SERVICIO (nombre, descripcion) VALUES
('Activo','Se ofrece'),
('Pausado','Temporalmente inactivo'),
('Inactivo','No disponible');

INSERT INTO ESTADO_PROMOCION (nombre, descripcion) VALUES
('Programada','Aún no inicia'),
('Activa','En curso'),
('Finalizada','Terminó');

INSERT INTO ESTADO_TRANSACCION (nombre, descripcion) VALUES
('Pendiente','Creada, sin confirmar'),
('Aprobada','Aceptada'),
('Rechazada','Denegada'),
('Anulada','Cancelada'),
('Completada','Finalizada correctamente');

INSERT INTO ESTADO_REPORTE (nombre, descripcion) VALUES
('Abierto','Recibido'),
('En revisión','Analizando'),
('Resuelto','Concluido'),
('Descartado','Sin mérito');

INSERT INTO TIPO_MOVIMIENTO (nombre, signo, descripcion) VALUES
('Ingreso','IN','Aumento de saldo'),
('Egreso','OUT','Disminución de saldo'),
('Bloqueo','OUT','Retención temporal'),
('Liberación','IN','Liberación de retención');

INSERT INTO TIPO_BITACORA (nombre, descripcion) VALUES
('Seguridad','Accesos/seguridad'),
('Negocio','Operaciones de negocio'),
('Sistema','Eventos del sistema');

-- UNIDADES (solo 4) y dimensiones de impacto
INSERT INTO UNIDAD_MEDIDA (nombre, simbolo) VALUES
('Desechos (kilogramo)','kg'),
('Agua (litro)','L'),
('Energía (kilovatio-hora)','kWh'),
('Reducción de CO2 (kilogramo CO2e)','kgCO2e');

SET @um_kg     := (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kg');
SET @um_L      := (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='L');
SET @um_kWh    := (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kWh');
SET @um_kgCO2e := (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kgCO2e');

INSERT INTO DIMENSION_IMPACTO (nombre, descripcion) VALUES
('Desechos','Generación de residuos (kg)'),
('Agua','Consumo de agua (L)'),
('Energía','Consumo eléctrico (kWh)'),
('Reducción CO2','Reducción/evitación de CO2e (kgCO2e)');

SET @dim_desechos := (SELECT id_dim FROM DIMENSION_IMPACTO WHERE nombre='Desechos');
SET @dim_agua     := (SELECT id_dim FROM DIMENSION_IMPACTO WHERE nombre='Agua');
SET @dim_energia  := (SELECT id_dim FROM DIMENSION_IMPACTO WHERE nombre='Energía');
SET @dim_co2      := (SELECT id_dim FROM DIMENSION_IMPACTO WHERE nombre='Reducción CO2');

INSERT INTO DIMENSION_UNIDAD (id_dim, id_um) VALUES
(@dim_desechos, @um_kg),
(@dim_agua,     @um_L),
(@dim_energia,  @um_kWh),
(@dim_co2,      @um_kgCO2e);

-- Ubicaciones / Organizaciones / Eventos
INSERT INTO UBICACION (direccion) VALUES
('Calle 1 #100, Centro'),('Av. Siempreviva 742'),('Zona Sur, Calle A 50'),
('Calle B #123'),('Av. Libertad 500'),('Barrio Norte 12'),
('Parque Industrial 3'),('Zona Este 25'),('Av. América 777'),
('Calle Los Pinos 456'),('Av. Blanco Galindo 1200');

INSERT INTO ORGANIZACION (nombre, tipo, correo, telefono, direccion, fecha_fundacion, sitio_web, descripcion) VALUES
('Fundación Reciclar','ONG','contacto@reciclar.org','70000001','Calle Verde 10','2015-06-01','https://reciclar.org','Promueve reciclaje'),
('EcoMercado','Empresa','hola@ecomercado.com','70000002','Av. Eco 22','2018-09-15','https://ecomercado.com','Marketplace eco'),
('Red Trueque Joven','Colectivo','info@truequejoven.bo','70000003','Zona Joven 5','2020-01-10','https://truequejoven.bo','Red de trueque'),
('UniTec','Universidad','contacto@unitec.edu','70000004','Campus Norte s/n','2000-03-10','https://unitec.edu','Vinculación tecnológica'),
('Alcaldía Verde','Gobierno','gestion@alcaldiaverde.gob','70000005','Plaza Central s/n','2010-12-12','https://alcaldiaverde.gob','Programas ambientales');

INSERT INTO EVENTO (id_org, titulo, descripcion, fecha_ini, fecha_fin, lugar, precio, activo) VALUES
(1,'Feria de Reciclaje','Feria comunitaria','2025-10-01','2025-10-03','Plaza Central',0,1),
(2,'Eco-trueque','Intercambio de bienes','2025-09-20','2025-09-20','Parque Urbano',0,1),
(3,'Taller Compostaje','Aprende compostar','2025-08-15','2025-08-15','Centro Joven',10,1),
(4,'Hackatón Circular','Soluciones digitales','2025-07-10','2025-07-12','Campus Norte',0,0),
(5,'Día del Agua','Concientización','2025-03-22','2025-03-22','Teatro Municipal',0,1);

-- Usuarios (emails únicos) + billeteras + detalle
INSERT INTO USUARIO (id_rol, nombre, apellido, email, telefono, direccion) VALUES
(1,'Ana','Admin','ana.admin@tcc.bo','70010001','Calle Admin 1'),
(2,'Mario','Mod','mario.mod@tcc.bo','70010002','Calle Mod 2'),
(3,'Laura','López','laura1@tcc.bo','70010003','Calle 1 #10'),
(3,'Carlos','Pérez','carlos1@tcc.bo','70010004','Av. 2 #20'),
(3,'Sofía','García','sofia1@tcc.bo','70010005','Calle 3 #30'),
(3,'Jorge','Rojas','jorge1@tcc.bo','70010006','Calle 4 #40'),
(3,'María','Quispe','maria1@tcc.bo','70010007','Calle 5 #50'),
(3,'Luis','Choque','luis1@tcc.bo','70010008','Calle 6 #60'),
(3,'Elena','Vargas','elena1@tcc.bo','70010009','Calle 7 #70'),
(3,'Pablo','Santos','pablo1@tcc.bo','70010010','Calle 8 #80'),
(3,'Valeria','Ríos','valeria1@tcc.bo','70010011','Calle 9 #90'),
(3,'Hugo','Mamani','hugo1@tcc.bo','70010012','Av. A 100'),
(3,'Carmen','Flores','carmen1@tcc.bo','70010013','Av. B 110'),
(3,'Diego','Medina','diego1@tcc.bo','70010014','Av. C 120'),
(3,'Natalia','Suárez','natalia1@tcc.bo','70010015','Av. D 130'),
(3,'Ricardo','Zeballos','ricardo1@tcc.bo','70010016','Av. E 140'),
(3,'Paola','Soria','paola1@tcc.bo','70010017','Av. F 150'),
(3,'Andrés','Camacho','andres1@tcc.bo','70010018','Av. G 160'),
(3,'Brenda','León','brenda1@tcc.bo','70010019','Av. H 170'),
(3,'Fabián','Aguilar','fabian1@tcc.bo','70010020','Av. I 180'),
(3,'Gabriela','Mendoza','gabriela2@tcc.bo','70010021','Av. J 190');

-- Billetera (sin columna saldo en el esquema)
INSERT INTO BILLETERA (id_us, cuenta_bancaria) VALUES
(1,'BANCO-0001'),(2,'BANCO-0002'),
(3,'BANCO-0003'),(4,'BANCO-0004'),(5,'BANCO-0005'),
(6,'BANCO-0006'),(7,'BANCO-0007'),(8,'BANCO-0008'),
(9,'BANCO-0009'),(10,'BANCO-0010'),(11,'BANCO-0011'),
(12,'BANCO-0012'),(13,'BANCO-0013'),(14,'BANCO-0014'),
(15,'BANCO-0015');

INSERT INTO DETALLE_USUARIO (id_us, cant_anuncios, ult_ingreso, likes, favoritos, denuncias, ventas) VALUES
(3,5,NOW(),10,3,0,2),(4,3,NOW(),5,2,0,1),(5,2,NOW(),3,0,0,0),
(6,1,NOW(),2,0,0,0),(7,6,NOW(),12,4,1,3),(8,4,NOW(),6,2,0,1),
(9,7,NOW(),15,5,0,4),(10,2,NOW(),2,1,0,1),(11,1,NOW(),1,0,0,0),(12,0,NOW(),0,0,0,0);

-- Catálogos y datos de productos/servicios
INSERT INTO CATEGORIA_PRODUCTO (nombre, descripcion) VALUES
('Electrodomésticos','Hogar'),('Ropa','Vestimenta'),('Libros','Lectura'),
('Herramientas','Trabajo'),('Alimentos','Consumo');

INSERT INTO CATEGORIA_SERVICIO (nombre, descripcion) VALUES
('Reparaciones','Mantenimiento'),('Educación','Clases/Tutorías'),
('Transporte','Movilidad'),('Eventos','Soporte en eventos');

INSERT INTO PRODUCTO (id_cat_prod, nombre, descripcion, precio, peso) VALUES
(1,'Licuadora','Licuadora 1.5L',150,3.2),
(1,'Microondas','800W básico',300,12.0),
(1,'Plancha','Vapor',120,1.1),
(2,'Chaqueta','Talla M',80,0.7),
(2,'Pantalón','Talla 32',60,0.5),
(2,'Zapatillas','Talla 40',120,0.9),
(3,'Libro A','Novela',30,0.4),
(3,'Libro B','Ciencia',45,0.6),
(3,'Libro C','Historia',35,0.5),
(4,'Taladro','500W',220,2.0),
(4,'Martillo','Acero',25,0.8),
(4,'Llave inglesa','Ajustable',40,0.6),
(5,'Arroz 5kg','Grano largo',20,5.0),
(5,'Aceite 2L','Girasol',15,2.0),
(5,'Café 500g','Molido',10,0.5),
(1,'Aspiradora','1200W',420,6.0),
(2,'Camisa','Talla L',50,0.3),
(3,'Libro D','Tecnología',55,0.7),
(4,'Destornillador','Philips',12,0.2),
(5,'Leche 1L','Entera',2.5,1.0),
(5,'Harina 1kg','Trigo',3.5,1.0),
(2,'Gorro','Tejido',18,0.2);

INSERT INTO SERVICIO (id_cat_serv, id_us, nombre, descripcion, precio, duracion_min, id_estado_serv) VALUES
(1,6,'Reparación de licuadoras','Cambio de cuchillas',30,60,1),
(1,6,'Arreglo de microondas','Diagnóstico básico',50,60,1),
(1,10,'Mantenimiento aspiradoras','Limpieza y filtros',35,45,1),
(2,11,'Clases de matemáticas','Nivel básico',25,60,1),
(2,11,'Clases de física','Nivel medio',30,60,1),
(2,13,'Tutoría programación','Introducción JS',40,90,1),
(3,8,'Traslados urbanos','Dentro de la ciudad',10,30,1),
(3,8,'Envíos en moto','Paquetería ligera',8,25,1),
(3,9,'Flete camioneta','Hasta 1 ton',50,90,2),
(4,15,'Montaje de eventos','Soporte básico',60,120,1),
(4,15,'Audio y microfonía','Sonido',80,120,1),
(4,7,'Decoración','Ambientación eco',45,90,1),
(2,14,'Clases de historia','Nivel colegio',20,60,1),
(1,12,'Reparación de taladros','Cambio carbones',25,40,1),
(1,12,'Ajuste de puertas','Nivelación',20,45,1),
(2,3,'Alfabetización digital','Uso básico PC',15,60,1),
(2,3,'Excel básico','Tablas y fórmulas',18,75,1),
(3,4,'Mensajería bici','Documentos',5,20,1),
(4,5,'Fotografía','Sesión 1h',50,60,1),
(4,5,'Edición de fotos','Retoque básico',30,45,1);

-- Publicaciones y vínculos
-- ESTADO_PUBLICACION: 1=Borrador, 2=Publicada, 3=Pausada, 4=Eliminada
INSERT INTO PUBLICACION (id_us, id_ub, id_estado_pub, tipo, titulo, descripcion, valor_creditos) VALUES
(3,1,2,'PRODUCTO','Vendo licuadora','Poco uso',15),
(4,2,2,'PRODUCTO','Intercambio microondas','Por taladro',20),
(5,3,2,'PRODUCTO','Chaqueta casi nueva','Talla M',8),
(6,4,2,'PRODUCTO','Pack libros ciencia','3 libros',12),
(7,5,2,'PRODUCTO','Taladro 500W','Incluye brocas',18),
(8,6,2,'PRODUCTO','Arroz 5kg','Sello dorado',3),
(9,7,2,'PRODUCTO','Aceite 2L','Nuevo',2),
(10,8,2,'PRODUCTO','Café 500g','Tostado medio',1),
(11,9,2,'PRODUCTO','Aspiradora 1200W','Funciona perfecto',25),
(12,10,2,'PRODUCTO','Camisa L','Color azul',4),
(13,1,2,'PRODUCTO','Libro D Tecnología','Edición 2023',6),
(14,2,2,'PRODUCTO','Destornillador Philips','Mango cómodo',1),
(15,3,2,'PRODUCTO','Leche 1L','Fecha vigente',1),
(16,4,2,'PRODUCTO','Harina 1kg','De trigo',1),
(17,5,2,'PRODUCTO','Gorro tejido','Artesanal',2),
(18,6,3,'SERVICIO','Reparación de licuadoras','Servicio técnico',10),
(19,7,2,'SERVICIO','Clases de matemáticas','Nivel básico',8),
(20,8,2,'SERVICIO','Traslados urbanos','Servicio rápido',5),
(21,9,2,'SERVICIO','Montaje de eventos','Equipo básico',12),
(6,10,2,'SERVICIO','Audio/microfonía','Eventos pequeños',15),
(5,1,2,'SERVICIO','Decoración eco','Eventos',10),
(4,2,2,'SERVICIO','Mensajería en bici','Documentos',3),
(3,3,1,'SERVICIO','Excel básico','Curso corto',5),
(7,4,2,'SERVICIO','Fotografía 1h','Sesión retrato',10),
(8,5,2,'SERVICIO','Edición de fotos','Retoque',7);

-- Vincular productos a publicaciones
INSERT INTO PUBLICACION_PRODUCTO (id_pub, id_prod, cantidad, id_um) VALUES
(1,1,1,@um_kg),(2,2,1,@um_kg),(3,4,1,@um_kg),(4,8,1,@um_kg),(5,10,1,@um_kg),
(6,13,1,@um_kg),(7,14,1,@um_kg),(8,15,1,@um_kg),(9,16,1,@um_kg),(10,17,1,@um_kg),
(11,18,1,@um_kg),(12,19,1,@um_kg),(13,18,1,@um_kg),(14,20,2,@um_kg),(15,21,2,@um_kg),
(16,22,1,@um_kg),(17,7,1,@um_kg);

-- Vincular servicios a publicaciones
INSERT INTO PUBLICACION_SERVICIO (id_pub, id_serv, horario) VALUES
(18,1,'L-V 9:00-17:00'),
(19,4,'S-D 8:00-12:00'),
(20,7,'L-D 9:00-21:00'),
(21,10,'Bajo agenda'),
(22,11,'L-V 14:00-19:00'),
(23,12,'Fin de semana'),
(24,17,'Noches'),
(25,19,'Sábados');

-- Créditos: paquetes, compras y movimientos por compra
INSERT INTO PAQUETE_CREDITO (nombre, cantidad_creditos, precio, activo) VALUES
('Starter 20',20,10,1),('Pro 50',50,22,1),('Max 100',100,40,1);

INSERT INTO COMPRA_CREDITO (id_us, id_paquete, creditos, monto, proveedor, referencia, aprobado_en) VALUES
(3,1,20,10,'Stripe','STR-0001',NOW()),
(4,2,50,22,'Stripe','STR-0002',NOW()),
(5,1,20,10,'PayPal','PP-0003',NOW()),
(6,3,100,40,'Stripe','STR-0004',NOW()),
(7,2,50,22,'PayPal','PP-0005',NOW()),
(8,1,20,10,'Stripe','STR-0006',NOW()),
(9,2,50,22,'Stripe','STR-0007',NOW()),
(10,3,100,40,'PayPal','PP-0008',NOW()),
(11,1,20,10,'Stripe','STR-0009',NOW()),
(12,2,50,22,'PayPal','PP-0010',NOW());

INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, descripcion, id_compra) VALUES
(3,1,20,'Compra paquete Starter',1),
(4,1,50,'Compra paquete Pro',2),
(5,1,20,'Compra paquete Starter',3),
(6,1,100,'Compra paquete Max',4),
(7,1,50,'Compra paquete Pro',5),
(8,1,20,'Compra paquete Starter',6),
(9,1,50,'Compra paquete Pro',7),
(10,1,100,'Compra paquete Max',8),
(11,1,20,'Compra paquete Starter',9),
(12,1,50,'Compra paquete Pro',10);

-- Movimientos por intercambios (netos)
INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, descripcion) VALUES
(3,2,10,'Intercambio 1 egreso'),
(4,1,10,'Intercambio 1 ingreso'),
(5,2,5,'Intercambio 2 egreso'),
(6,1,5,'Intercambio 2 ingreso'),
(7,2,7,'Intercambio 3 egreso'),
(8,1,7,'Intercambio 3 ingreso');

-- Intercambios y transacciones (estado 'Completada' = 5)
INSERT INTO INTERCAMBIO (id_us_comp, id_us_vend, id_pub, id_ub_origen, id_ub_destino, id_um, costo_reembolso, fecha_acept, fecha_comp) VALUES
(4,3,1,1,2,@um_kg,0.0,NOW(),NOW()),
(6,4,2,2,3,@um_kg,0.0,NOW(),NOW()),
(8,5,3,3,4,@um_kg,0.0,NOW(),NOW()),
(10,6,4,4,5,@um_kg,0.0,NOW(),NOW()),
(12,7,5,5,6,@um_kg,0.0,NOW(),NOW()),
(14,8,6,6,7,@um_kg,0.0,NOW(),NOW()),
(16,9,7,7,8,@um_kg,0.0,NOW(),NOW()),
(18,10,8,8,9,@um_kg,0.0,NOW(),NOW()),
(20,11,9,9,10,@um_kg,0.0,NOW(),NOW()),
(21,12,10,10,1,@um_kg,0.0,NOW(),NOW());

INSERT INTO TRANSACCION (id_us, id_us2, id_inter, fecha_trans, monto, id_estado_trans) VALUES
(4,3,1,NOW(),10,5),
(6,4,2,NOW(),10,5),
(8,5,3,NOW(),5,5),
(10,6,4,NOW(),6,5),
(12,7,5,NOW(),8,5),
(14,8,6,NOW(),3,5),
(16,9,7,NOW(),2,5),
(18,10,8,NOW(),4,5),
(20,11,9,NOW(),7,5),
(21,12,10,NOW(),5,5);

-- Impacto ambiental (eventos + mensual)
INSERT INTO ORIGEN_IMPACTO (nombre, descripcion) VALUES
('Transporte','Traslado de productos/servicios'),
('Energía','Consumo eléctrico'),
('Agua','Uso de agua'),
('Materiales','Uso de insumos');

INSERT INTO EVENTO_IMPACTO (id_us, id_origen_imp, categoria, creado_en, notas) VALUES
(3,1,'Transporte','2025-09-10 10:00:00','Entrega en bici'),
(4,2,'Energía','2025-09-12 12:00:00','Uso de taller'),
(5,3,'Agua','2025-09-15 09:00:00','Lavado'),
(6,4,'Materiales','2025-09-18 14:00:00','Embalaje'),
(7,1,'Transporte','2025-10-01 08:00:00','Moto'),
(8,2,'Energía','2025-10-02 18:00:00','Iluminación'),
(9,3,'Agua','2025-10-03 07:30:00','Higiene'),
(10,4,'Materiales','2025-10-04 16:45:00','Cajas');

INSERT INTO EVENTO_IMPACTO_DETALLE (id_impacto, id_dim, valor, id_um) VALUES
(1,@dim_co2,     0.8,@um_kgCO2e),
(1,@dim_energia, 0.2,@um_kWh),
(2,@dim_energia, 1.5,@um_kWh),
(3,@dim_agua,   10.0,@um_L),
(4,@dim_desechos,0.5,@um_kg),
(5,@dim_co2,     1.2,@um_kgCO2e),
(6,@dim_energia, 0.9,@um_kWh),
(7,@dim_agua,    6.5,@um_L),
(8,@dim_desechos,0.7,@um_kg);

INSERT INTO IMPACTO_MENSUAL (ym, id_us, id_dim, categoria, valor_total, id_um) VALUES
('2025-09-01',3,@dim_co2,     'Transporte',0.8,@um_kgCO2e),
('2025-09-01',3,@dim_energia, 'Transporte',0.2,@um_kWh),
('2025-09-01',4,@dim_energia, 'Energía',   1.5,@um_kWh),
('2025-09-01',5,@dim_agua,    'Agua',     10.0,@um_L),
('2025-09-01',6,@dim_desechos,'Materiales',0.5,@um_kg),
('2025-10-01',7,@dim_co2,     'Transporte',1.2,@um_kgCO2e),
('2025-10-01',8,@dim_energia, 'Energía',   0.9,@um_kWh),
('2025-10-01',9,@dim_agua,    'Agua',      6.5,@um_L),
('2025-10-01',10,@dim_desechos,'Materiales',0.7,@um_kg);

-- Promociones y bitácora
INSERT INTO PROMOCION (titulo, descripcion, fecha_ini, fecha_fin, banner, descuento, id_estado_prom) VALUES
('Semana Verde','Descuentos eco','2025-10-05','2025-10-12',NULL,10,2),
('Viernes Circular','Promo puntual','2025-10-17','2025-10-17',NULL,15,1);

INSERT INTO PROMOCION_PRODUCTO (id_prom, id_prod) VALUES (1,1),(1,10),(1,16);
INSERT INTO PROMOCION_SERVICIO (id_prom, id_serv) VALUES (1,1),(1,4),(1,10);

INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip) VALUES
(1,3,'PUBLICACION',1,'CREAR','Creó publicación','127.0.0.1'),
(2,4,'INTERCAMBIO',1,'COMPRA','Intercambio completado','127.0.0.1');

-- ============================
-- PRUEBAS / CONSULTAS
-- ============================

-- Conteos básicos
SELECT 'usuarios' AS tabla, COUNT(*) AS total FROM USUARIO
UNION ALL SELECT 'productos', COUNT(*) FROM PRODUCTO
UNION ALL SELECT 'servicios', COUNT(*) FROM SERVICIO
UNION ALL SELECT 'publicaciones', COUNT(*) FROM PUBLICACION
UNION ALL SELECT 'intercambios', COUNT(*) FROM INTERCAMBIO
UNION ALL SELECT 'transacciones', COUNT(*) FROM TRANSACCION;

-- UMs finales
SELECT id_um, nombre, simbolo FROM UNIDAD_MEDIDA ORDER BY id_um;

-- Dimensión → UM
SELECT d.nombre AS dimension, u.simbolo AS um
FROM DIMENSION_UNIDAD du
JOIN DIMENSION_IMPACTO d ON d.id_dim=du.id_dim
JOIN UNIDAD_MEDIDA u ON u.id_um=du.id_um
ORDER BY d.nombre;

-- Publicaciones activas por usuario (TOP 10)
SELECT u.id_us, u.nombre, u.apellido, COUNT(*) AS pubs_activas
FROM PUBLICACION p
JOIN USUARIO u ON u.id_us = p.id_us
JOIN ESTADO_PUBLICACION e ON e.id_estado_pub = p.id_estado_pub
WHERE e.nombre='Publicada'
GROUP BY u.id_us
ORDER BY pubs_activas DESC, u.id_us
LIMIT 10;

-- Productos más ofrecidos
SELECT pr.id_prod, pr.nombre, SUM(pp.cantidad) AS total_ofrecido, um.simbolo
FROM PUBLICACION_PRODUCTO pp
JOIN PRODUCTO pr ON pr.id_prod = pp.id_prod
JOIN UNIDAD_MEDIDA um ON um.id_um = pp.id_um
GROUP BY pr.id_prod, pr.nombre, um.simbolo
ORDER BY total_ofrecido DESC, pr.id_prod;

-- Servicios publicados y su estado
SELECT s.id_serv, s.nombre AS servicio, es.nombre AS estado_serv,
       COUNT(ps.id_pub) AS veces_publicado
FROM SERVICIO s
JOIN ESTADO_SERVICIO es ON es.id_estado_serv = s.id_estado_serv
LEFT JOIN PUBLICACION_SERVICIO ps ON ps.id_serv = s.id_serv
GROUP BY s.id_serv, s.nombre, es.nombre
ORDER BY veces_publicado DESC;

-- Intercambios completados con datos
SELECT i.id_inter, c.nombre AS comprador, v.nombre AS vendedor,
       p.titulo, i.fecha_comp
FROM INTERCAMBIO i
JOIN USUARIO c ON c.id_us = i.id_us_comp
JOIN USUARIO v ON v.id_us = i.id_us_vend
JOIN PUBLICACION p ON p.id_pub = i.id_pub
ORDER BY i.id_inter DESC;

-- Flujo de créditos por usuario
SELECT u.id_us, u.nombre, 
SUM(CASE WHEN tm.nombre='Ingreso' THEN m.cantidad ELSE 0 END) AS creditos_ingreso,
SUM(CASE WHEN tm.nombre='Egreso'  THEN m.cantidad ELSE 0 END) AS creditos_egreso,
SUM(CASE WHEN tm.nombre='Ingreso' THEN m.cantidad ELSE 0 END)
- SUM(CASE WHEN tm.nombre='Egreso'  THEN m.cantidad ELSE 0 END) AS neto
FROM USUARIO u
LEFT JOIN MOVIMIENTO m ON m.id_us = u.id_us
LEFT JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov = m.id_tipo_mov
GROUP BY u.id_us, u.nombre
ORDER BY neto DESC;

-- Transacciones por estado
SELECT e.nombre AS estado, COUNT(*) AS total, SUM(t.monto) AS suma_creditos
FROM TRANSACCION t
JOIN ESTADO_TRANSACCION e ON e.id_estado_trans = t.id_estado_trans
GROUP BY e.nombre;

-- Publicaciones por categoría (productos vs servicios)
SELECT tipo, categoria, COUNT(*) AS total
FROM (
    SELECT 'Producto' AS tipo, cp.nombre AS categoria
    FROM PUBLICACION p
    JOIN PUBLICACION_PRODUCTO pp ON pp.id_pub = p.id_pub
    JOIN PRODUCTO pr ON pr.id_prod = pp.id_prod
    JOIN CATEGORIA_PRODUCTO cp ON cp.id_cat_prod = pr.id_cat_prod
    UNION ALL
    SELECT 'Servicio' AS tipo, cs.nombre AS categoria
    FROM PUBLICACION p
    JOIN PUBLICACION_SERVICIO ps ON ps.id_pub = p.id_pub
    JOIN SERVICIO s ON s.id_serv = ps.id_serv
    JOIN CATEGORIA_SERVICIO cs ON cs.id_cat_serv = s.id_cat_serv
) x
GROUP BY tipo, categoria
ORDER BY tipo, total DESC;

-- Usuarios con más intercambios (comprador/vendedor)
SELECT 'Comprador' rol, u.id_us, u.nombre, COUNT(*) total
FROM INTERCAMBIO i JOIN USUARIO u ON u.id_us=i.id_us_comp
GROUP BY u.id_us
UNION ALL
SELECT 'Vendedor', u.id_us, u.nombre, COUNT(*) total
FROM INTERCAMBIO i JOIN USUARIO u ON u.id_us=i.id_us_vend
GROUP BY u.id_us
ORDER BY rol, total DESC;

-- Impacto mensual por dimensión
SELECT DATE_FORMAT(ym,'%Y-%m') AS periodo, d.nombre AS dimension,
       SUM(valor_total) AS total, u.simbolo
FROM IMPACTO_MENSUAL im
JOIN DIMENSION_IMPACTO d ON d.id_dim = im.id_dim
JOIN UNIDAD_MEDIDA u ON u.id_um = im.id_um
GROUP BY ym, d.nombre, u.simbolo
ORDER BY ym DESC, d.nombre;

-- Promociones activas/programadas y sus ítems
SELECT pr.titulo, pr.descuento, 'Producto' AS tipo, p.nombre AS item
FROM PROMOCION pr
JOIN PROMOCION_PRODUCTO pp ON pp.id_prom = pr.id_prom
JOIN PRODUCTO p ON p.id_prod = pp.id_prod
WHERE pr.id_estado_prom IN (SELECT id_estado_prom FROM ESTADO_PROMOCION WHERE nombre IN ('Activa','Programada'))
UNION ALL
SELECT pr.titulo, pr.descuento, 'Servicio', s.nombre
FROM PROMOCION pr
JOIN PROMOCION_SERVICIO ps ON ps.id_prom = pr.id_prom
JOIN SERVICIO s ON s.id_serv = ps.id_serv
WHERE pr.id_estado_prom IN (SELECT id_estado_prom FROM ESTADO_PROMOCION WHERE nombre IN ('Activa','Programada'))
ORDER BY titulo, tipo, item;

-- Publicaciones recientes (30 días)
SELECT p.id_pub, p.titulo, u.nombre AS autor, e.nombre AS estado, p.fecha_pub
FROM PUBLICACION p
JOIN USUARIO u ON u.id_us=p.id_us
JOIN ESTADO_PUBLICACION e ON e.id_estado_pub=p.id_estado_pub
WHERE p.fecha_pub >= (NOW() - INTERVAL 30 DAY)
ORDER BY p.fecha_pub DESC;

-- Servicios activos: precio medio por categoría
SELECT cs.nombre AS categoria, AVG(s.precio) AS precio_promedio, COUNT(*) AS total_servicios
FROM SERVICIO s
JOIN CATEGORIA_SERVICIO cs ON cs.id_cat_serv=s.id_cat_serv
JOIN ESTADO_SERVICIO es ON es.id_estado_serv=s.id_estado_serv
WHERE es.nombre='Activo'
GROUP BY cs.nombre
ORDER BY precio_promedio DESC;

-- KPI: tasa de conversión publicación→intercambio
SELECT
    (SELECT COUNT(*) FROM PUBLICACION WHERE id_estado_pub=(SELECT id_estado_pub FROM ESTADO_PUBLICACION WHERE nombre='Publicada')) AS publicaciones_activas,
    (SELECT COUNT(DISTINCT id_pub) FROM INTERCAMBIO) AS publicaciones_con_intercambio,
    ROUND(
        (SELECT COUNT(DISTINCT id_pub) FROM INTERCAMBIO) * 100.0 /
        NULLIF((SELECT COUNT(*) FROM PUBLICACION WHERE id_estado_pub=(SELECT id_estado_pub FROM ESTADO_PUBLICACION WHERE nombre='Publicada')),0),2
    ) AS tasa_conversion_pct;
