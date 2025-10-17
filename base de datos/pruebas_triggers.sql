USE TruequeComercioCircular;

SET FOREIGN_KEY_CHECKS = 1;

-- 1) CATÁLOGOS (INSERT IGNORE para evitar duplicados)

INSERT IGNORE INTO ROL (nombre, descripcion) VALUES
('ADMIN','Administrador del sistema'),
('COMPRADOR','Usuario comprador'),
('VENDEDOR','Usuario vendedor');

INSERT IGNORE INTO ESTADO_PUBLICACION (nombre, descripcion) VALUES
('BORRADOR','No visible'),
('ACTIVA','Visible para todos'),
('PAUSADA','Pausada temporalmente');

INSERT IGNORE INTO ESTADO_SERVICIO (nombre, descripcion) VALUES
('INACTIVO','No prestable'),
('ACTIVO','Prestación activa'),
('SUSPENDIDO','Suspendido temporalmente');

INSERT IGNORE INTO ESTADO_PROMOCION (nombre, descripcion) VALUES
('ACTIVA','Promoción vigente'),
('INACTIVA','Promoción inactiva');

INSERT IGNORE INTO ESTADO_TRANSACCION (nombre, descripcion) VALUES
('PENDIENTE','Pendiente de confirmación'),
('CONFIRMADA','Confirmada');

INSERT IGNORE INTO ESTADO_REPORTE (nombre, descripcion) VALUES
('ABIERTA','Reporte abierto'),
('CERRADA','Reporte resuelto');

INSERT IGNORE INTO ESTADO_INTERCAMBIO (id_estado_inter, nombre, descripcion) VALUES
(1,'SOLICITADO','Creado por comprador'),
(2,'ACEPTADO','Aceptado por vendedor'),
(3,'COMPLETADO','Finalizado');

INSERT IGNORE INTO UNIDAD_MEDIDA (nombre, simbolo) VALUES
('Kilogramo','kg'),('Litro','l'),('Kilowatt-hora','kWh'),('Kilogramo CO2e','kgCO2e'),('Unidad','u');

INSERT IGNORE INTO ORIGEN_IMPACTO (nombre, descripcion) VALUES
('RECOLECCION','Recojo de materiales'),
('TRANSPORTE','Traslado entre ubicaciones'),
('REUSO','Extensión de vida útil'),
('RECICLAJE','Procesamiento de desechos');

INSERT IGNORE INTO DIMENSION_IMPACTO (nombre, descripcion) VALUES
('Desechos','Manejo de desechos (kg)'),
('Agua','Consumo de agua (l)'),
('Energía','Consumo de energía (kWh)'),
('CO2eq','Emisiones (kgCO2e)');

-- Relación dimensión-unidad (si no existía)
INSERT IGNORE INTO DIMENSION_UNIDAD (id_dim, id_um)
SELECT d.id_dim, u.id_um
FROM (SELECT id_dim FROM DIMENSION_IMPACTO) d
JOIN UNIDAD_MEDIDA u
ON ( (d.id_dim=1 AND u.simbolo='kg')
  OR (d.id_dim=2 AND u.simbolo='l')
  OR (d.id_dim=3 AND u.simbolo='kWh')
  OR (d.id_dim=4 AND u.simbolo='kgCO2e'));

INSERT IGNORE INTO CATEGORIA_PRODUCTO (nombre) VALUES
('Electrodomésticos'),('Textiles'),('Herramientas'),('Muebles'),('Libros'),('Juguetes');

INSERT IGNORE INTO CATEGORIA_SERVICIO (nombre) VALUES
('Reparaciones'),('Transporte'),('Limpieza'),('Instalaciones'),('Carpintería');

-- 2) ORGANIZACIONES & UBICACIONES (+20 ubicaciones nuevas)

INSERT IGNORE INTO ORGANIZACION (nombre, tipo, correo, telefono, direccion, fecha_fundacion) VALUES
('Circular Bolivia','ONG','contacto@circular.bo','+59170000000','Calle Verde 123','2015-01-01'),
('EcoRed','Cooperativa','hola@ecored.bo','+59170000010','Av. Ambiental 55','2018-05-20');

INSERT INTO UBICACION (direccion, ciudad, provincia, lat, lon) VALUES
('Av. Libertad 101','Cochabamba','Cercado',-17.3895,-66.1568),
('C. Aroma 22','Cochabamba','Cercado',-17.3910,-66.1550),
('Av. América 500','Cochabamba','Cercado',-17.3770,-66.1660),
('C. Sucre 10','La Paz','Murillo',-16.5000,-68.1500),
('Av. Busch 300','Santa Cruz','Andrés Ibáñez',-17.7833,-63.1833),
('C. Ballivián 77','Tarija','Cercado',-21.5333,-64.7333),
('C. Junín 45','Oruro','Cercado',-17.9667,-67.1167),
('Av. Potosí 890','Potosí','Tomás Frías',-19.5833,-65.7500),
('Av. Blanco Galindo 2200','Cochabamba','Cercado',-17.3890,-66.2100),
('C. Calama 99','La Paz','Murillo',-16.5030,-68.1270),
('Av. Cristo Redentor 1200','Santa Cruz','Andrés Ibáñez',-17.7500,-63.1800),
('C. Ingavi 15','Tarija','Cercado',-21.5320,-64.7350),
('C. Pagador 300','Oruro','Cercado',-17.9700,-67.1100),
('C. Linares 12','La Paz','Murillo',-16.5040,-68.1310),
('Av. Circunvalación 1500','Cochabamba','Quillacollo',-17.3920,-66.2570),
('C. Bolívar 123','Sucre','Oropeza',-19.0444,-65.2592),
('Av. Alemana 400','Santa Cruz','Andrés Ibáñez',-17.7800,-63.1900),
('C. Colón 88','Cochabamba','Cercado',-17.3922,-66.1580),
('C. La Tablada 60','Tarija','Cercado',-21.5420,-64.7390),
('Av. Zongo 70','La Paz','Murillo',-16.5100,-68.1400);

-- 3) USUARIOS (35 nuevos: mezcla de COMPRADOR/VENDEDOR)
CALL sp_seed_basicos();
-- Helpers de rol
SET @rol_comp := (SELECT id_rol FROM ROL WHERE nombre='COMPRADOR' LIMIT 1);
SET @rol_vend := (SELECT id_rol FROM ROL WHERE nombre='VENDEDOR' LIMIT 1);
SELECT @rol_comp AS id_rol_comprador;
-- 20 compradores
INSERT INTO USUARIO (id_rol, nombre, apellido, email, telefono, direccion) VALUES
(@rol_comp,'C_Adriana','Salas','c_adriana@demo.bo','70100001','Dir C-01'),
(@rol_comp,'C_Beto','Ibarra','c_beto@demo.bo','70100002','Dir C-02'),
(@rol_comp,'C_Camila','Ríos','c_camila@demo.bo','70100003','Dir C-03'),
(@rol_comp,'C_Daniel','Vera','c_daniel@demo.bo','70100004','Dir C-04'),
(@rol_comp,'C_Erika','Mena','c_erika@demo.bo','70100005','Dir C-05'),
(@rol_comp,'C_Fabian','Medina','c_fabian@demo.bo','70100006','Dir C-06'),
(@rol_comp,'C_Gema','Ortiz','c_gema@demo.bo','70100007','Dir C-07'),
(@rol_comp,'C_Hernan','Aguilar','c_hernan@demo.bo','70100008','Dir C-08'),
(@rol_comp,'C_Ivana','Vargas','c_ivana@demo.bo','70100009','Dir C-09'),
(@rol_comp,'C_Jorge','Ramos','c_jorge@demo.bo','70100010','Dir C-10'),
(@rol_comp,'C_Kevin','Reyes','c_kevin@demo.bo','70100011','Dir C-11'),
(@rol_comp,'C_Lucia','Roca','c_lucia@demo.bo','70100012','Dir C-12'),
(@rol_comp,'C_Mauro','Castro','c_mauro@demo.bo','70100013','Dir C-13'),
(@rol_comp,'C_Nadia','Pérez','c_nadia@demo.bo','70100014','Dir C-14'),
(@rol_comp,'C_Omar','Mendoza','c_omar@demo.bo','70100015','Dir C-15'),
(@rol_comp,'C_Paola','Guzmán','c_paola@demo.bo','70100016','Dir C-16'),
(@rol_comp,'C_Quimey','Zeballos','c_quimey@demo.bo','70100017','Dir C-17'),
(@rol_comp,'C_Rocio','Ruiz','c_rocio@demo.bo','70100018','Dir C-18'),
(@rol_comp,'C_Sergio','Arce','c_sergio@demo.bo','70100019','Dir C-19'),
(@rol_comp,'C_Tamara','Rivas','c_tamara@demo.bo','70100020','Dir C-20');

-- 15 vendedores
INSERT INTO USUARIO (id_rol, nombre, apellido, email, telefono, direccion) VALUES
(@rol_vend,'V_Alex','López','v_alex@demo.bo','70200001','Dir V-01'),
(@rol_vend,'V_Brenda','Cano','v_brenda@demo.bo','70200002','Dir V-02'),
(@rol_vend,'V_Carlos','Montes','v_carlos@demo.bo','70200003','Dir V-03'),
(@rol_vend,'V_Dora','Quiroga','v_dora@demo.bo','70200004','Dir V-04'),
(@rol_vend,'V_Eduardo','Salvat','v_eduardo@demo.bo','70200005','Dir V-05'),
(@rol_vend,'V_Flavia','Paz','v_flavia@demo.bo','70200006','Dir V-06'),
(@rol_vend,'V_Gustavo','Aliaga','v_gustavo@demo.bo','70200007','Dir V-07'),
(@rol_vend,'V_Hilda','Siles','v_hilda@demo.bo','70200008','Dir V-08'),
(@rol_vend,'V_Ismael','Soruco','v_ismael@demo.bo','70200009','Dir V-09'),
(@rol_vend,'V_Juan','Flores','v_juan@demo.bo','70200010','Dir V-10'),
(@rol_vend,'V_Karolina','Roca','v_karolina@demo.bo','70200011','Dir V-11'),
(@rol_vend,'V_Leo','Torrez','v_leo@demo.bo','70200012','Dir V-12'),
(@rol_vend,'V_Mica','Ríos','v_mica@demo.bo','70200013','Dir V-13'),
(@rol_vend,'V_Norberto','Quena','v_norberto@demo.bo','70200014','Dir V-14'),
(@rol_vend,'V_Olivia','Márquez','v_olivia@demo.bo','70200015','Dir V-15');

-- 4) CATEGORIZACIÓN y ITEMS: PRODUCTOS (20) y SERVICIOS (15)

SET @cat_elec := (SELECT id_cat_prod FROM CATEGORIA_PRODUCTO WHERE nombre='Electrodomésticos' LIMIT 1);
SET @cat_text := (SELECT id_cat_prod FROM CATEGORIA_PRODUCTO WHERE nombre='Textiles' LIMIT 1);
SET @cat_herr := (SELECT id_cat_prod FROM CATEGORIA_PRODUCTO WHERE nombre='Herramientas' LIMIT 1);
SET @cat_mueb := (SELECT id_cat_prod FROM CATEGORIA_PRODUCTO WHERE nombre='Muebles' LIMIT 1);

INSERT INTO PRODUCTO (id_cat_prod, nombre, descripcion, precio, peso) VALUES
(@cat_elec,'Licuadora Omega','600W, vaso vidrio',220,3.2),
(@cat_elec,'Microondas Zen','20L, grill',380,11.2),
(@cat_elec,'Horno Eléctrico 45L','Convección',420,13.5),
(@cat_text,'Chaqueta polar','Talla L',95,0.6),
(@cat_text,'Pantalón cargo','Talla 34',85,0.7),
(@cat_text,'Camisa lino','Talla M',60,0.3),
(@cat_herr,'Taladro Percutor','750W',320,3.0),
(@cat_herr,'Llave Inglesa','10"',45,0.5),
(@cat_herr,'Destornillador Philips','+2',20,0.2),
(@cat_herr,'Serrucho manual','Acero templado',55,0.7),
(@cat_mueb,'Silla madera','Pino',120,5.0),
(@cat_mueb,'Mesa centro','Roble',350,12.0),
(@cat_mueb,'Estante 4 niveles','MDF',280,10.0),
(@cat_text,'Gorro lana','Talla única',25,0.2),
(@cat_text,'Bufanda tejida','Larga',30,0.25),
(@cat_elec,'Plancha vapor','1800W',150,1.1),
(@cat_elec,'Aspiradora compacta','1200W',500,6.5),
(@cat_herr,'Sierra caladora','650W',330,2.4),
(@cat_mueb,'Banqueta','Metal',90,4.2),
(@cat_text,'Guantes térmicos','Par',22,0.15);

SET @srv_rep := (SELECT id_cat_serv FROM CATEGORIA_SERVICIO WHERE nombre='Reparaciones' LIMIT 1);
SET @srv_trn := (SELECT id_cat_serv FROM CATEGORIA_SERVICIO WHERE nombre='Transporte'   LIMIT 1);
SET @srv_lmp := (SELECT id_cat_serv FROM CATEGORIA_SERVICIO WHERE nombre='Limpieza'     LIMIT 1);
SET @srv_ins := (SELECT id_cat_serv FROM CATEGORIA_SERVICIO WHERE nombre='Instalaciones' LIMIT 1);
SET @srv_crp := (SELECT id_cat_serv FROM CATEGORIA_SERVICIO WHERE nombre='Carpintería'  LIMIT 1);

-- Usaremos 10 vendedores concretos por email para asignar servicios
SET @v1 := (SELECT id_us FROM USUARIO WHERE email='v_alex@demo.bo'     LIMIT 1);
SET @v2 := (SELECT id_us FROM USUARIO WHERE email='v_brenda@demo.bo'   LIMIT 1);
SET @v3 := (SELECT id_us FROM USUARIO WHERE email='v_carlos@demo.bo'   LIMIT 1);
SET @v4 := (SELECT id_us FROM USUARIO WHERE email='v_dora@demo.bo'     LIMIT 1);
SET @v5 := (SELECT id_us FROM USUARIO WHERE email='v_eduardo@demo.bo'  LIMIT 1);
SET @v6 := (SELECT id_us FROM USUARIO WHERE email='v_flavia@demo.bo'   LIMIT 1);
SET @v7 := (SELECT id_us FROM USUARIO WHERE email='v_gustavo@demo.bo'  LIMIT 1);
SET @v8 := (SELECT id_us FROM USUARIO WHERE email='v_hilda@demo.bo'    LIMIT 1);
SET @v9 := (SELECT id_us FROM USUARIO WHERE email='v_ismael@demo.bo'   LIMIT 1);
SET @v10:= (SELECT id_us FROM USUARIO WHERE email='v_juan@demo.bo'     LIMIT 1);

SET @est_srv_act := (SELECT id_estado_serv FROM ESTADO_SERVICIO WHERE nombre='ACTIVO' LIMIT 1);

INSERT INTO SERVICIO (id_cat_serv, id_us, nombre, descripcion, precio, duracion_min, id_estado_serv) VALUES
(@srv_rep,@v1,'Reparación de licuadoras','Cambio cuchillas y motor',45,60,@est_srv_act),
(@srv_rep,@v2,'Reparación de microondas','Fusibles/placa',85,90,@est_srv_act),
(@srv_trn,@v3,'Transporte urbano','Hasta 10km',35,45,@est_srv_act),
(@srv_lmp,@v4,'Limpieza hogar','2 horas',75,120,@est_srv_act),
(@srv_rep,@v5,'Reparación general','Varios equipos',120,120,@est_srv_act),
(@srv_lmp,@v6,'Limpieza profunda','Cocina/Baño',140,180,@est_srv_act),
(@srv_ins,@v7,'Instalación eléctrica','Puntos y tableros',180,180,@est_srv_act),
(@srv_trn,@v8,'Fletes pequeños','Hasta 300kg',90,120,@est_srv_act),
(@srv_crp,@v9,'Carpintería fina','Muebles a medida',220,240,@est_srv_act),
(@srv_ins,@v10,'Instalación de TV','Soporte mural',70,60,@est_srv_act),
(@srv_rep,@v1,'Reparación aspiradoras','Mantenimiento',95,90,@est_srv_act),
(@srv_crp,@v2,'Restauración de muebles','Acabados',260,240,@est_srv_act),
(@srv_lmp,@v3,'Limpieza oficinas','Turno noche',160,180,@est_srv_act),
(@srv_trn,@v4,'Mensajería express','Documentos',25,30,@est_srv_act),
(@srv_ins,@v5,'Instalación de luminarias','LED',110,90,@est_srv_act);

-- 5) PUBLICACIONES (30 nuevas: 15 PRODUCTO y 15 SERVICIO)

SET @est_pub_act := (SELECT id_estado_pub FROM ESTADO_PUBLICACION WHERE nombre='ACTIVA' LIMIT 1);

-- Asignamos ubicaciones alternando
SET @ub1 := (SELECT id_ub FROM UBICACION ORDER BY id_ub LIMIT 1);
SET @ub2 := (SELECT id_ub FROM UBICACION ORDER BY id_ub LIMIT 1 OFFSET 1);
SET @ub3 := (SELECT id_ub FROM UBICACION ORDER BY id_ub LIMIT 1 OFFSET 2);
SET @ub4 := (SELECT id_ub FROM UBICACION ORDER BY id_ub LIMIT 1 OFFSET 3);
SET @ub5 := (SELECT id_ub FROM UBICACION ORDER BY id_ub LIMIT 1 OFFSET 4);

-- 15 publicaciones de PRODUCTO (dueños: algunos vendedores)
INSERT INTO PUBLICACION (id_us, id_ub, id_estado_pub, tipo, titulo, descripcion, valor_creditos) VALUES
(@v1,@ub1,@est_pub_act,'PRODUCTO','P.Licuadora Omega','Casi nueva',12),
(@v2,@ub2,@est_pub_act,'PRODUCTO','P.Microondas Zen','Buen estado',18),
(@v3,@ub3,@est_pub_act,'PRODUCTO','P.Horno 45L','Convección',24),
(@v4,@ub4,@est_pub_act,'PRODUCTO','P.Chaqueta polar','Talla L',6),
(@v5,@ub5,@est_pub_act,'PRODUCTO','P.Pantalón cargo','Talla 34',5),
(@v6,@ub1,@est_pub_act,'PRODUCTO','P.Camisa lino','Talla M',4),
(@v7,@ub2,@est_pub_act,'PRODUCTO','P.Taladro Percutor','750W',16),
(@v8,@ub3,@est_pub_act,'PRODUCTO','P.Llave Inglesa 10"','Herramienta',3),
(@v9,@ub4,@est_pub_act,'PRODUCTO','P.Destornillador +2','Phillips',2),
(@v10,@ub5,@est_pub_act,'PRODUCTO','P.Serrucho manual','Acero',3),
(@v1,@ub1,@est_pub_act,'PRODUCTO','P.Silla madera','Pino',8),
(@v2,@ub2,@est_pub_act,'PRODUCTO','P.Mesa centro','Roble',22),
(@v3,@ub3,@est_pub_act,'PRODUCTO','P.Estante 4 niveles','MDF',18),
(@v4,@ub4,@est_pub_act,'PRODUCTO','P.Gorro lana','Tejido',2),
(@v5,@ub5,@est_pub_act,'PRODUCTO','P.Bufanda tejida','Larga',2);

-- Vinculación a PRODUCTO (usando nombres únicos)
INSERT INTO PUBLICACION_PRODUCTO (id_pub, id_prod, cantidad, id_um)
SELECT p.id_pub, pr.id_prod, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u' LIMIT 1)
FROM PUBLICACION p
JOIN PRODUCTO pr
ON ( (p.titulo='P.Licuadora Omega'    AND pr.nombre='Licuadora Omega')
  OR (p.titulo='P.Microondas Zen'     AND pr.nombre='Microondas Zen')
  OR (p.titulo='P.Horno 45L'          AND pr.nombre='Horno Eléctrico 45L')
  OR (p.titulo='P.Chaqueta polar'     AND pr.nombre='Chaqueta polar')
  OR (p.titulo='P.Pantalón cargo'     AND pr.nombre='Pantalón cargo')
  OR (p.titulo='P.Camisa lino'        AND pr.nombre='Camisa lino')
  OR (p.titulo='P.Taladro Percutor'   AND pr.nombre='Taladro Percutor')
  OR (p.titulo='P.Llave Inglesa 10"'  AND pr.nombre='Llave Inglesa')
  OR (p.titulo='P.Destornillador +2'  AND pr.nombre='Destornillador Philips')
  OR (p.titulo='P.Serrucho manual'    AND pr.nombre='Serrucho manual')
  OR (p.titulo='P.Silla madera'       AND pr.nombre='Silla madera')
  OR (p.titulo='P.Mesa centro'        AND pr.nombre='Mesa centro')
  OR (p.titulo='P.Estante 4 niveles'  AND pr.nombre='Estante 4 niveles')
  OR (p.titulo='P.Gorro lana'         AND pr.nombre='Gorro lana')
  OR (p.titulo='P.Bufanda tejida'     AND pr.nombre='Bufanda tejida') );

-- 15 publicaciones de SERVICIO (dueños: vendedores con servicios)
INSERT INTO PUBLICACION (id_us, id_ub, id_estado_pub, tipo, titulo, descripcion, valor_creditos) VALUES
(@v1,@ub1,@est_pub_act,'SERVICIO','S.Rep. Licuadoras','Servicio técnico',20),
(@v2,@ub2,@est_pub_act,'SERVICIO','S.Rep. Microondas','Servicio técnico',35),
(@v3,@ub3,@est_pub_act,'SERVICIO','S.Transporte urbano','Hasta 10km',15),
(@v4,@ub4,@est_pub_act,'SERVICIO','S.Limpieza hogar','2 horas',30),
(@v5,@ub5,@est_pub_act,'SERVICIO','S.Rep. general','Varios',40),
(@v6,@ub1,@est_pub_act,'SERVICIO','S.Limpieza profunda','Cocina/Baño',50),
(@v7,@ub2,@est_pub_act,'SERVICIO','S.Instalación eléctrica','Puntos/Líneas',60),
(@v8,@ub3,@est_pub_act,'SERVICIO','S.Fletes pequeños','Hasta 300kg',25),
(@v9,@ub4,@est_pub_act,'SERVICIO','S.Carpintería fina','Muebles a medida',70),
(@v10,@ub5,@est_pub_act,'SERVICIO','S.Instalación TV','Soporte mural',20),
(@v1,@ub1,@est_pub_act,'SERVICIO','S.Rep. Aspiradoras','Mantenimiento',30),
(@v2,@ub2,@est_pub_act,'SERVICIO','S.Restauración muebles','Acabados',80),
(@v3,@ub3,@est_pub_act,'SERVICIO','S.Limpieza oficinas','Turno noche',55),
(@v4,@ub4,@est_pub_act,'SERVICIO','S.Mensajería express','Documentos',10),
(@v5,@ub5,@est_pub_act,'SERVICIO','S.Instalación luminarias','LED',35);

-- Vinculación a SERVICIO asegurando dueños consistentes
INSERT INTO PUBLICACION_SERVICIO (id_pub, id_serv, horario)
SELECT p.id_pub, s.id_serv, 'L-V 09:00-18:00'
FROM PUBLICACION p
JOIN SERVICIO s
ON (
   (p.titulo='S.Rep. Licuadoras'      AND s.nombre='Reparación de licuadoras'      AND p.id_us=s.id_us)
OR (p.titulo='S.Rep. Microondas'      AND s.nombre='Reparación de microondas'      AND p.id_us=s.id_us)
OR (p.titulo='S.Transporte urbano'    AND s.nombre='Transporte urbano'              AND p.id_us=s.id_us)
OR (p.titulo='S.Limpieza hogar'       AND s.nombre='Limpieza hogar'                 AND p.id_us=s.id_us)
OR (p.titulo='S.Rep. general'         AND s.nombre='Reparación general'             AND p.id_us=s.id_us)
OR (p.titulo='S.Limpieza profunda'    AND s.nombre='Limpieza profunda'              AND p.id_us=s.id_us)
OR (p.titulo='S.Instalación eléctrica'AND s.nombre='Instalación eléctrica'          AND p.id_us=s.id_us)
OR (p.titulo='S.Fletes pequeños'      AND s.nombre='Fletes pequeños'                AND p.id_us=s.id_us)
OR (p.titulo='S.Carpintería fina'     AND s.nombre='Carpintería fina'               AND p.id_us=s.id_us)
OR (p.titulo='S.Instalación TV'       AND s.nombre='Instalación de TV'              AND p.id_us=s.id_us)
OR (p.titulo='S.Rep. Aspiradoras'     AND s.nombre='Reparación aspiradoras'         AND p.id_us=s.id_us)
OR (p.titulo='S.Restauración muebles' AND s.nombre='Restauración de muebles'        AND p.id_us=s.id_us)
OR (p.titulo='S.Limpieza oficinas'    AND s.nombre='Limpieza oficinas'              AND p.id_us=s.id_us)
OR (p.titulo='S.Mensajería express'   AND s.nombre='Mensajería express'             AND p.id_us=s.id_us)
OR (p.titulo='S.Instalación luminarias' AND s.nombre='Instalación de luminarias'    AND p.id_us=s.id_us)
);

-- 6) PAQUETES Y COMPRAS DE CRÉDITO (datos adicionales, sin procedimientos)

INSERT IGNORE INTO PAQUETE_CREDITO (nombre, cantidad_creditos, precio, activo) VALUES
('Pack 20',20,12,1),('Pack 50',50,25,1),('Pack 100',100,45,1),('Pack 200',200,80,1);

-- 8 compras distribuidas
INSERT INTO COMPRA_CREDITO (id_us, id_paquete, creditos, monto, proveedor, referencia) VALUES
(@v1 , (SELECT id_paquete FROM PAQUETE_CREDITO WHERE nombre='Pack 50'  LIMIT 1),  50,25,'TigoMoney','M-901'),
(@v2 , (SELECT id_paquete FROM PAQUETE_CREDITO WHERE nombre='Pack 100' LIMIT 1), 100,45,'QrSimple', 'M-902'),
(@v3 , (SELECT id_paquete FROM PAQUETE_CREDITO WHERE nombre='Pack 20'  LIMIT 1),  20,12,'TigoMoney','M-903'),
(@v4 , (SELECT id_paquete FROM PAQUETE_CREDITO WHERE nombre='Pack 200' LIMIT 1), 200,80,'QrSimple', 'M-904'),
(@v5 , (SELECT id_paquete FROM PAQUETE_CREDITO WHERE nombre='Pack 50'  LIMIT 1),  50,25,'TigoMoney','M-905'),
(@v6 , (SELECT id_paquete FROM PAQUETE_CREDITO WHERE nombre='Pack 100' LIMIT 1), 100,45,'QrSimple', 'M-906'),
(@v7 , (SELECT id_paquete FROM PAQUETE_CREDITO WHERE nombre='Pack 50'  LIMIT 1),  50,25,'TigoMoney','M-907'),
(@v10, (SELECT id_paquete FROM PAQUETE_CREDITO WHERE nombre='Pack 20'  LIMIT 1),  20,12,'QrSimple', 'M-908');

-- 7) REPORTES (datos extra)

INSERT INTO REPORTE (id_reportante, id_usuario_reportado, id_pub_reportada, motivo, id_estado_rep)
SELECT (SELECT id_us FROM USUARIO WHERE email='c_adriana@demo.bo'),
       (SELECT id_us FROM USUARIO WHERE email='v_juan@demo.bo'),
       (SELECT id_pub FROM PUBLICACION WHERE titulo='P.Serrucho manual' LIMIT 1),
       'Información insuficiente', (SELECT id_estado_rep FROM ESTADO_REPORTE WHERE nombre='ABIERTA' LIMIT 1);

INSERT INTO REPORTE (id_reportante, id_usuario_reportado, id_pub_reportada, motivo, id_estado_rep)
SELECT (SELECT id_us FROM USUARIO WHERE email='c_kevin@demo.bo'),
       (SELECT id_us FROM USUARIO WHERE email='v_dora@demo.bo'),
       (SELECT id_pub FROM PUBLICACION WHERE titulo='S.Limpieza hogar' LIMIT 1),
       'Precio no claro', (SELECT id_estado_rep FROM ESTADO_REPORTE WHERE nombre='ABIERTA' LIMIT 1);

-- 8) IMPACTOS (datos extra para alimentar IMPACTO_MENSUAL si tienes triggers)

-- Si tu esquema tiene EVENTO_IMPACTO y EVENTO_IMPACTO_DETALLE:
INSERT INTO EVENTO_IMPACTO (id_us, id_origen_imp, categoria, creado_en) VALUES
(@v1 , (SELECT id_origen_imp FROM ORIGEN_IMPACTO WHERE nombre='RECICLAJE'), 'Reciclaje', NOW()),
(@v2 , (SELECT id_origen_imp FROM ORIGEN_IMPACTO WHERE nombre='TRANSPORTE'), 'Transporte', NOW()),
(@v3 , (SELECT id_origen_imp FROM ORIGEN_IMPACTO WHERE nombre='REUSO'), 'Reuso', NOW());

-- Detalles (usar la unidad natural por dimensión)
INSERT INTO EVENTO_IMPACTO_DETALLE (id_impacto, id_dim, valor, id_um) VALUES
((SELECT MIN(id_impacto) FROM EVENTO_IMPACTO WHERE id_us=@v1), 1, 7.5, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kg')),
((SELECT MIN(id_impacto) FROM EVENTO_IMPACTO WHERE id_us=@v1), 2, 12,  (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='l')),
((SELECT MIN(id_impacto) FROM EVENTO_IMPACTO WHERE id_us=@v2), 4, 2.1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kgCO2e')),
((SELECT MIN(id_impacto) FROM EVENTO_IMPACTO WHERE id_us=@v3), 3, 4.0, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='kWh'));

-- 9) EXTRA: más publicaciones rápidas (para robustez, +10)


INSERT INTO PUBLICACION (id_us, id_ub, id_estado_pub, tipo, titulo, descripcion, valor_creditos) VALUES
(@v6,@ub2,@est_pub_act,'PRODUCTO','P.Plancha vapor','1800W',5),
(@v7,@ub3,@est_pub_act,'PRODUCTO','P.Aspiradora compacta','1200W',20),
(@v8,@ub4,@est_pub_act,'PRODUCTO','P.Sierra caladora','650W',14),
(@v9,@ub5,@est_pub_act,'PRODUCTO','P.Banqueta metal','Resistente',6),
(@v10,@ub1,@est_pub_act,'PRODUCTO','P.Guantes térmicos','Par',1),
(@v6,@ub2,@est_pub_act,'SERVICIO','S.Limpieza vidrios','Fachadas',25),
(@v7,@ub3,@est_pub_act,'SERVICIO','S.Instalación tomas','Eléctricas',30),
(@v8,@ub4,@est_pub_act,'SERVICIO','S.Fletes interprovinciales','Carga liviana',60),
(@v9,@ub5,@est_pub_act,'SERVICIO','S.Carpintería básica','Reparaciones',35),
(@v10,@ub1,@est_pub_act,'SERVICIO','S.Montaje muebles','En casa',28);

-- Vincular estos productos a PRODUCTO por nombre
INSERT INTO PUBLICACION_PRODUCTO (id_pub, id_prod, cantidad, id_um)
SELECT p.id_pub, pr.id_prod, 1, (SELECT id_um FROM UNIDAD_MEDIDA WHERE simbolo='u' LIMIT 1)
FROM PUBLICACION p
JOIN PRODUCTO pr
ON ( (p.titulo='P.Plancha vapor'       AND pr.nombre='Plancha vapor')
  OR (p.titulo='P.Aspiradora compacta' AND pr.nombre='Aspiradora compacta')
  OR (p.titulo='P.Sierra caladora'     AND pr.nombre='Sierra caladora')
  OR (p.titulo='P.Banqueta metal'      AND pr.nombre='Banqueta')
  OR (p.titulo='P.Guantes térmicos'    AND pr.nombre='Guantes térmicos') );

-- Vincular estos servicios con consistencia de dueño
INSERT INTO PUBLICACION_SERVICIO (id_pub, id_serv, horario)
SELECT p.id_pub, s.id_serv, 'L-S 10:00-17:00'
FROM PUBLICACION p
JOIN SERVICIO s ON p.id_us = s.id_us
AND (
   (p.titulo='S.Limpieza vidrios'         AND s.nombre='Limpieza oficinas')
OR (p.titulo='S.Instalación tomas'        AND s.nombre='Instalación eléctrica')
OR (p.titulo='S.Fletes interprovinciales' AND s.nombre='Fletes pequeños')
OR (p.titulo='S.Carpintería básica'       AND s.nombre='Carpintería fina')
OR (p.titulo='S.Montaje muebles'          AND s.nombre='Instalación de TV')
);

USE TruequeComercioCircular;

-- 🔍 VERIFICACIÓN GENERAL

-- Contar registros de cada tabla principal
SELECT 'ROL' AS tabla, COUNT(*) AS cantidad FROM ROL
UNION ALL SELECT 'USUARIO', COUNT(*) FROM USUARIO
UNION ALL SELECT 'PRODUCTO', COUNT(*) FROM PRODUCTO
UNION ALL SELECT 'SERVICIO', COUNT(*) FROM SERVICIO
UNION ALL SELECT 'PUBLICACION', COUNT(*) FROM PUBLICACION
UNION ALL SELECT 'PUBLICACION_PRODUCTO', COUNT(*) FROM PUBLICACION_PRODUCTO
UNION ALL SELECT 'PUBLICACION_SERVICIO', COUNT(*) FROM PUBLICACION_SERVICIO
UNION ALL SELECT 'CATEGORIA_PRODUCTO', COUNT(*) FROM CATEGORIA_PRODUCTO
UNION ALL SELECT 'CATEGORIA_SERVICIO', COUNT(*) FROM CATEGORIA_SERVICIO
UNION ALL SELECT 'UBICACION', COUNT(*) FROM UBICACION
UNION ALL SELECT 'PAQUETE_CREDITO', COUNT(*) FROM PAQUETE_CREDITO
UNION ALL SELECT 'COMPRA_CREDITO', COUNT(*) FROM COMPRA_CREDITO
UNION ALL SELECT 'REPORTE', COUNT(*) FROM REPORTE
UNION ALL SELECT 'EVENTO_IMPACTO', COUNT(*) FROM EVENTO_IMPACTO
UNION ALL SELECT 'EVENTO_IMPACTO_DETALLE', COUNT(*) FROM EVENTO_IMPACTO_DETALLE
UNION ALL SELECT 'DIMENSION_IMPACTO', COUNT(*) FROM DIMENSION_IMPACTO
UNION ALL SELECT 'IMPACTO_MENSUAL', COUNT(*) FROM IMPACTO_MENSUAL
UNION ALL SELECT 'BITACORA', COUNT(*) FROM BITACORA;


-- 🧾 DETALLE DE USUARIOS

SELECT id_us, nombre, apellido, email, id_rol
FROM USUARIO
ORDER BY id_us
LIMIT 20;

-- Verificar creación automática de detalle y billetera por trigger
SELECT id_us, cant_anuncios
FROM DETALLE_USUARIO
ORDER BY cant_anuncios DESC
LIMIT 10;

SELECT * FROM BILLETERA LIMIT 10;

-- 🧱 PUBLICACIONES Y RELACIONES

-- Contar publicaciones por tipo
SELECT tipo, COUNT(*) AS total
FROM PUBLICACION
GROUP BY tipo;

-- Publicaciones con productos
SELECT p.id_pub, p.titulo, pr.nombre AS producto
FROM PUBLICACION_PRODUCTO pp
JOIN PUBLICACION p ON p.id_pub = pp.id_pub
JOIN PRODUCTO pr ON pr.id_prod = pp.id_prod
LIMIT 10;

-- Publicaciones con servicios
SELECT p.id_pub, p.titulo, s.nombre AS servicio
FROM PUBLICACION_SERVICIO ps
JOIN PUBLICACION p ON p.id_pub = ps.id_pub
JOIN SERVICIO s ON s.id_serv = ps.id_serv
LIMIT 10;

-- 💳 CRÉDITOS Y MOVIMIENTOS

SELECT * FROM PAQUETE_CREDITO;
SELECT * FROM COMPRA_CREDITO ORDER BY id_compra DESC LIMIT 10;
SELECT * FROM MOVIMIENTO ORDER BY fecha_mov DESC LIMIT 10;

-- 🔄 TRIGGERS DE BITÁCORA

SELECT id_bitacora, fecha, entidad, accion, descripcion, id_us
FROM BITACORA
ORDER BY fecha DESC
LIMIT 30;

-- 🌱 IMPACTOS AMBIENTALES

SELECT * FROM EVENTO_IMPACTO ORDER BY id_impacto DESC LIMIT 5;
SELECT * FROM EVENTO_IMPACTO_DETALLE ORDER BY id_impacto DESC LIMIT 5;

-- Impacto mensual acumulado (trigger automático)
SELECT * FROM IMPACTO_MENSUAL ORDER BY ym DESC, id_us LIMIT 10;

--  LOGROS (si tienes esa tabla)

SELECT * FROM USUARIO_LOGRO LIMIT 10;

SELECT 
  (SELECT COUNT(*) FROM USUARIO) AS total_usuarios,
  (SELECT COUNT(*) FROM PRODUCTO) AS total_productos,
  (SELECT COUNT(*) FROM SERVICIO) AS total_servicios,
  (SELECT COUNT(*) FROM PUBLICACION) AS total_publicaciones,
  (SELECT COUNT(*) FROM BITACORA) AS total_eventos_bitacora;