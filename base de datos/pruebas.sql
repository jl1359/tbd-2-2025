USE CreditosVerdes;

-- 1) CATÁLOGOS (mínimos para operar)

INSERT INTO ROL (id_rol, nombre, descripcion) VALUES
(1,'ADMIN','Administrador del sistema'),
(2,'VENDEDOR','Publica y gestiona ofertas'),
(3,'COMPRADOR','Realiza intercambios'),
(4,'MODERADOR','Gestiona reportes y revisiones'),
(5,'ONG','Organización sin fines de lucro');

INSERT INTO UNIDAD_MEDIDA (id_um, nombre, simbolo) VALUES
(1,'Unidad','u'),
(2,'Kilogramo','kg'),
(3,'Gramo','g'),
(4,'Litro','L'),
(5,'Metro','m'),
(6,'Metro cuadrado','m2'),
(7,'Hora','h'),
(8,'Paquete','paq');

INSERT INTO TIPO_MOVIMIENTO (id_tipo_mov, nombre, signo, descripcion) VALUES
(1,'RECARGA','IN','Compra de créditos'),
(2,'INTERCAMBIO_IN','IN','Créditos recibidos por intercambio'),
(3,'INTERCAMBIO_OUT','OUT','Créditos pagados por intercambio'),
(4,'REEMBOLSO','IN','Devolución de créditos'),
(5,'AJUSTE','OUT','Ajuste de saldo');

INSERT INTO TIPO_BITACORA (id_tipo_bit, nombre, descripcion) VALUES
(1,'AUDITORIA','Auditoría de cambios'),
(2,'ACCESO','Registro de accesos'),
(3,'USUARIO','Eventos de usuario'),
(4,'PUBLICACION','Eventos de publicaciones'),
(5,'TRANSACCION','Eventos de transacciones');

-- 2) USUARIOS + ACCESOS + CONTRASEÑAS + BILLETERA

-- Base 1..13
INSERT INTO USUARIO (id_us,id_rol,nombre,apellido,email,telefono,direccion,activo) VALUES
(1,1,'Carla','Arze','carla.arze@cv.bo','76450001','Av. América 120, Cochabamba',1),
(2,4,'Rodrigo','Maldonado','rodrigo.m@cv.bo','76450002','Av. Blanco Galindo km 6, Cochabamba',1),
(3,2,'Maite','Vargas','maite.vargas@cv.bo','76450003','Zona Norte, Cochabamba',1),
(4,2,'Eddy','Rojas','eddy.rojas@cv.bo','76450004','Av. Santa Cruz, Santa Cruz de la Sierra',1),
(5,3,'Juan','Quispe','juan.q@cv.bo','76450005','Sopocachi, La Paz',1),
(6,3,'Erika','Chino','erika.chino@cv.bo','76450006','Queru Queru, Cochabamba',1),
(7,3,'David','Choque','david.choque@cv.bo','76450007','Equipetrol, Santa Cruz',1),
(8,2,'Carlos','La Fuente','carlos.lafuente@cv.bo','76450008','Villa Galindo, Cochabamba',1),
(9,3,'Nataly','Mamani','nataly.mamani@cv.bo','76450009','Cala Cala, Cochabamba',1),
(10,2,'Adriana','Rico','adriana.rico@cv.bo','76450010','Obrajes, La Paz',1),
(11,3,'Beto','Salazar','beto.salazar@cv.bo','76450011','Centro, Oruro',1),
(12,2,'Lucía','Gonzales','lucia.gonzales@cv.bo','76450012','Irpavi, La Paz',1),
(13,5,'Fundación','Verde','contacto@fundacionverde.bo','76450013','Centro, Cochabamba',1);

-- Más usuarios 14..40
INSERT INTO USUARIO (id_us,id_rol,nombre,apellido,email,telefono,direccion,activo) VALUES
(14,3,'Rafa','Severich','rafa.severich@cv.bo','76450014','Centro, Cochabamba',1),
(15,2,'Inés','Patiño','ines.patino@cv.bo','76450015','Colcapirhua, CBBA',1),
(16,3,'Matías','Terrazas','matias.terrazas@cv.bo','76450016','Equipetrol, SCZ',1),
(17,2,'Gina','Prudencio','gina.prudencio@cv.bo','76450017','Sopocachi, LPZ',1),
(18,3,'Felipe','Céspedes','felipe.cespedes@cv.bo','76450018','Tiquipaya, CBBA',1),
(19,2,'Noelia','Dávalos','noelia.davalos@cv.bo','76450019','Quillacollo, CBBA',1),
(20,3,'Hugo','Mercado','hugo.mercado@cv.bo','76450020','Montero, SCZ',1),
(21,2,'Paola','Guzmán','paola.guzman@cv.bo','76450021','Achumani, LPZ',1),
(22,3,'Valeria','Aramayo','valeria.aramayo@cv.bo','76450022','Sucre, CHU',1),
(23,2,'Omar','Villca','omar.villca@cv.bo','76450023','Tarija Centro, TJA',1),
(24,3,'Romina','Ledezma','romina.lez@cv.bo','76450024','Warnes, SCZ',1),
(25,2,'Bruno','Lora','bruno.lora@cv.bo','76450025','Centro, Oruro',1),
(26,3,'Dalila','Quenta','dalila.q@cv.bo','76450026','Villa Fátima, LPZ',1),
(27,2,'Iván','Soruco','ivan.soruco@cv.bo','76450027','El Alto, LPZ',1),
(28,3,'Yara','Medinaceli','yara.medinaceli@cv.bo','76450028','Sacaba, CBBA',1),
(29,2,'Esteban','Borda','esteban.borda@cv.bo','76450029','Centro, Potosí',1),
(30,3,'Nadia','Galindo','nadia.galindo@cv.bo','76450030','Camiri, SCZ',1),
(31,5,'Fundación','Bosque Vivo','contacto@bosquevivo.bo','76450031','Cala Cala, CBBA',1),
(32,3,'Mauro','Zeballos','mauro.z@cv.bo','76450032','La Guardia, SCZ',1),
(33,2,'Sofía','Rivas','sofia.r@cv.bo','76450033','Miraflores, LPZ',1),
(34,3,'Gabriel','Arteaga','gabriel.a@cv.bo','76450034','Punata, CBBA',1),
(35,2,'Tatiana','Sandóval','tatiana.s@cv.bo','76450035','Colomi, CBBA',1),
(36,3,'Jorge','Siles','jorge.s@cv.bo','76450036','Cobija, PND',1),
(37,2,'Patricia','Céspedes','patricia.c@cv.bo','76450037','Yacuiba, TJA',1),
(38,3,'Miguel','Arce','miguel.arce@cv.bo','76450038','Riberalta, BEN',1),
(39,2,'Daniela','Ramos','daniela.r@cv.bo','76450039','Viacha, LPZ',1),
(40,3,'Alex','Paravicini','alex.p@cv.bo','76450040','Quillacollo, CBBA',1);

-- Accesos de muestra
INSERT INTO ACCESO (id_acc,id_us,exito,ip,agente) VALUES
(1,1,1,'179.0.12.10','Chrome 141 / Win10'),
(2,3,1,'179.0.12.11','Chrome 141 / Win10'),
(3,5,0,'179.0.12.12','Firefox 128 / Linux'),
(4,14,1,'179.0.12.40','Chrome 141 / Win10'),
(5,17,1,'179.0.12.41','Edge 122 / Win11'),
(6,21,0,'179.0.12.42','Firefox 128 / Linux');

-- Contraseñas y billeteras (para todos; idempotente)
INSERT INTO CONTRASENA (id_cmb,id_us,algoritmo,hash,fecha_cambio)
SELECT u.id_us, u.id_us, 'BCRYPT',
       '$2b$12$J6k0oaoA4uQ9aM6yEdoYwe5bq2i4Nf0bD1G0bTz3aY0fR0eQ4gN6e', NOW()
FROM USUARIO u
LEFT JOIN CONTRASENA c ON c.id_us=u.id_us
WHERE c.id_us IS NULL;

INSERT INTO BILLETERA (id_us, cuenta_bancaria)
SELECT u.id_us, CONCAT('01123456-',LPAD(u.id_us,2,'0'))
FROM USUARIO u
LEFT JOIN BILLETERA b ON b.id_us=u.id_us
WHERE b.id_us IS NULL;

-- 3) UBICACIÓN

INSERT INTO UBICACION (id_ub,direccion,ciudad,provincia,lat,lon) VALUES
(1,'Av. Libertador 450','Cochabamba','Cercado',-17.3895,-66.1568),
(2,'Plaza 24 de Septiembre','Santa Cruz','Andrés Ibáñez',-17.7833,-63.1821),
(3,'Calle Jaén 123','La Paz','Murillo',-16.4956,-68.1336),
(4,'Av. América 700','Cochabamba','Cercado',-17.3762,-66.1653),
(5,'Av. Banzer km 8','Santa Cruz','Andrés Ibáñez',-17.7212,-63.1502),
(6,'Av. Melchor Pérez 1500','Cochabamba','Cercado',-17.3850,-66.2050),
(7,'Calle 21 de Calacoto','La Paz','Murillo',-16.5415,-68.0783),
(8,'Av. San Martín 120','Santa Cruz','Andrés Ibáñez',-17.7760,-63.1825),
(9,'Calle España 35','Cochabamba','Cercado',-17.3890,-66.1610),
(10,'Av. Heroínas 900','Cochabamba','Cercado',-17.3930,-66.1570),
(11,'Av. Simón López 2100','Cochabamba','Cercado',-17.373,-66.189),
(12,'Av. Beni 4to anillo','Santa Cruz','Andrés Ibáñez',-17.754,-63.179),
(13,'Av. Busch 3er anillo','Santa Cruz','Andrés Ibáñez',-17.776,-63.182),
(14,'Calle México 450','La Paz','Murillo',-16.5,-68.14),
(15,'Circunvalación s/n','Sucre','CHU',-19.034,-65.262);

-- 4) CATEGORÍAS, PRODUCTOS Y SERVICIOS

INSERT INTO CATEGORIA (id_cat,tipo,nombre,descripcion,creado_por,actualizado_por) VALUES
(1,'PRODUCTO','Bicicletas','Bicis urbanas y MTB',1,1),
(2,'PRODUCTO','Electrodomésticos','Línea blanca y pequeños',1,1),
(3,'PRODUCTO','Jardinería','Herramientas y plantas',1,1),
(4,'PRODUCTO','Ropa','Vestimenta casual',1,1),
(5,'SERVICIO','Reparación','Reparaciones de hogar/electrónica',1,1),
(6,'SERVICIO','Transporte','Mudanzas y fletes',1,1),
(7,'SERVICIO','Clases','Tutorías y cursos',1,1);

-- Productos 1..25 (base) + 26..35 (nuevos)
INSERT INTO PRODUCTO (id_prod,id_cat,nombre,descripcion,precio,peso,creado_por,actualizado_por) VALUES
(1,1,'Bicicleta Urbana Aro 26','Bici urbana en buen estado',950,14.5,3,3),
(2,1,'Bicicleta MTB Aro 29','MTB semiprofesional',1550,13.8,3,8),
(3,2,'Licuadora 700W','Jarra de vidrio 1.5L',280,3.2,8,8),
(4,2,'Refrigerador 240L','Eficiencia A+',2890,55,8,8),
(5,3,'Pala de Jardín','Acero templado',85,2.1,3,3),
(6,3,'Tierra abonada 20kg','Mezcla orgánica',120,20,3,3),
(7,4,'Campera rompeviento','Talla M',160,0.5,12,12),
(8,4,'Polera algodón','Talla L (nueva)',60,0.2,12,12),
(9,2,'Microondas 20L','Función grill',520,12,8,8),
(10,1,'Bici Plegable','Ideal ciudad',1100,12.5,3,3),
(11,1,'Bicicleta Urbana Aro 24','Ideal adolescentes',800,12.0,15,15),
(12,1,'Bici Gravel','Versátil ciudad-ruta',2100,11.2,3,3),
(13,2,'Licuadora 900W','Vaso tritán 2L',350,3.5,8,8),
(14,2,'Lavadora 8kg','Eficiencia A++',3200,60,23,23),
(15,3,'Regadera metálica','8 litros',90,1.4,18,18),
(16,3,'Compostera 60L','Plástico reciclado',240,7.0,31,31),
(17,4,'Pantalón jean','Talla 32',110,0.6,12,12),
(18,4,'Chamarra polar','Talla L',130,0.7,12,12),
(19,2,'Horno eléctrico 35L','Convección',680,10.5,8,8),
(20,1,'Kit luces bici','LED delantero/trasero',70,0.2,3,3),
(21,1,'Portabicicletas auto','2 unidades',460,6.0,3,3),
(22,3,'Tierra abonada 10kg','Mejora sustrato',70,10,3,3),
(23,2,'Plancha a vapor','Cerámica',220,1.3,8,8),
(24,4,'Polera técnica','Secado rápido (M)',95,0.25,12,12),
(25,3,'Podadora manual','Acero',210,2.3,18,18),
(26,1,'Bicicleta Ruta Aluminio','Grupo Claris',2600,10.6,3,3),
(27,1,'Bicicleta Híbrida','Con parrilla',1700,12.2,3,3),
(28,2,'Aspiradora 1400W','Filtro HEPA',620,7.5,8,8),
(29,3,'Manguera extensible 20m','Con boquilla',120,2.2,18,18),
(30,4,'Zapatillas running','Talla 41',180,0.6,12,12),
(31,4,'Camisa formal','Talla M',130,0.35,12,12),
(32,2,'Cafetera 1.2L','Programable',410,3.1,8,8),
(33,2,'Batidora 300W','5 velocidades',210,2.8,8,8),
(34,3,'Semillas mixtas','Huerto pack',60,0.2,18,18),
(35,1,'Monopatín urbano','Plegable',450,7.0,3,3);

-- Servicios 1..14 (existentes) + 15..20 (nuevos)
INSERT INTO SERVICIO (id_serv,id_cat,id_us,nombre,descripcion,precio,duracion_min,estado,creado_por,actualizado_por) VALUES
(1,5,8,'Reparación de licuadoras','Cambio de cuchillas y motor',70,60,'ACTIVO',8,8),
(2,5,3,'Mantenimiento de bicis','Ajuste frenos, cambios y limpieza',120,90,'ACTIVO',3,3),
(3,6,4,'Flete zona urbana','Flete en camioneta dentro la ciudad',180,120,'ACTIVO',4,4),
(4,6,7,'Mudanza interprovincial','Mudanzas CBBA-LPZ/SCZ',450,300,'ACTIVO',7,7),
(5,7,10,'Clases de matemáticas','Álgebra y cálculo universitario',60,60,'ACTIVO',10,10),
(6,7,6,'Inglés conversacional','Sesiones personalizadas',55,60,'ACTIVO',6,6),
(7,5,15,'Reparación de hornos','Resistencia/termostato',95,75,'ACTIVO',15,15),
(8,6,17,'Flete express','Entrega en 24h',220,120,'ACTIVO',17,17),
(9,7,21,'Clases de física','Pre-uni',70,60,'ACTIVO',21,21),
(10,7,22,'Tutoría inglés B2','Conversación',65,60,'ACTIVO',22,22),
(11,5,23,'Servicio técnico línea blanca','Diagnóstico + reparación',140,90,'ACTIVO',23,23),
(12,6,24,'Mudanza local','2 ayudantes',380,240,'ACTIVO',24,24),
(13,7,25,'Matemáticas discretas','Universitario',80,60,'ACTIVO',25,25),
(14,5,31,'Reparación ecológica','Reuso y piezas recuperadas',85,90,'ACTIVO',31,31),
(15,7,33,'Clases de programación','JS/React',90,90,'ACTIVO',33,33),
(16,6,32,'Delivery eco','En bici eléctrica',30,45,'ACTIVO',32,32),
(17,5,35,'Reparación de lavadoras','A domicilio',110,80,'ACTIVO',35,35),
(18,7,34,'Tutoría Bases de Datos','SQL/Modelado',85,90,'ACTIVO',34,34),
(19,6,36,'Mensajería urbana','Paquetería',45,60,'ACTIVO',36,36),
(20,7,39,'Clases de estadística','Inferencia/Regresión',95,90,'ACTIVO',39,39);

-- 5) PUBLICACIONES + ENLACES + PROMOCIONES

-- Publicaciones 1..36 (existentes) + 37..60 (nuevas)
INSERT INTO PUBLICACION (id_pub,id_us,id_ub,tipo,titulo,descripcion,valor_creditos,estado,creado_por,actualizado_por) VALUES
-- (base de productos y servicios abreviada por brevedad)
(1,3,1,'PRODUCTO','Bici urbana aro 26','Lista para rodar',900,'PUBLICADA',3,3),
(2,8,4,'PRODUCTO','Licuadora 700W vidrio','Casi nueva',260,'PUBLICADA',8,8),
(3,12,7,'PRODUCTO','Campera rompeviento M','Sin uso',140,'PUBLICADA',12,12),
(4,3,9,'PRODUCTO','Bici plegable ciudad','Compacta y ligera',1050,'PUBLICADA',3,3),
(5,8,5,'PRODUCTO','Refrigerador 240L A+','Excelente consumo',2700,'PUBLICADA',8,8),
(6,3,6,'PRODUCTO','MTB aro 29','Semipro, bien cuidada',1500,'PAUSADA',3,3),
(7,8,1,'PRODUCTO','Microondas 20L grill','Funciona perfecto',480,'PUBLICADA',8,8),
(8,3,10,'PRODUCTO','Tierra abonada 20kg','Para macetas/huerto',110,'PUBLICADA',3,3),
(9,8,2,'SERVICIO','Reparación de licuadoras','Trabajo garantizado',70,'PUBLICADA',8,8),
(10,3,1,'SERVICIO','Mantención de bicis','Deja tu bici fina',120,'PUBLICADA',3,3),
(11,4,8,'SERVICIO','Flete urbano','Dentro de la ciudad',180,'PUBLICADA',4,4),
(12,10,3,'SERVICIO','Clases de matemáticas','Nivelación y cálculo',60,'PUBLICADA',10,10),
(13,15,4,'PRODUCTO','Bici urbana aro 24','Cuidado, lista para usar',780,'PUBLICADA',15,15),
(14,3,1,'PRODUCTO','Bici gravel 700c','Ligera y rápida',2050,'PUBLICADA',3,3),
(15,8,5,'PRODUCTO','Lavadora 8kg A++','Eficiente',3100,'PUBLICADA',8,8),
(16,18,6,'PRODUCTO','Compostera 60L','Fomenta reciclaje orgánico',230,'PUBLICADA',18,18),
(17,12,7,'PRODUCTO','Pantalón jean 32','Poco uso',95,'PUBLICADA',12,12),
(18,12,7,'PRODUCTO','Chamarra polar L','Abriga bien',120,'PUBLICADA',12,12),
(19,8,5,'PRODUCTO','Horno eléctrico 35L','Con convección',650,'PUBLICADA',8,8),
(20,3,9,'PRODUCTO','Kit luces LED bici','Del+Tras',65,'PUBLICADA',3,3),
(21,3,9,'PRODUCTO','Portabicicletas','2 bicis',430,'PUBLICADA',3,3),
(22,3,10,'PRODUCTO','Tierra abonada 10kg','Sustrato',65,'PUBLICADA',3,3),
(23,8,4,'PRODUCTO','Plancha a vapor','Cerámica',200,'PUBLICADA',8,8),
(24,12,7,'PRODUCTO','Polera técnica M','Secado rápido',85,'PUBLICADA',12,12),
(25,18,6,'PRODUCTO','Podadora manual','Filo perfecto',195,'PUBLICADA',18,18),
(26,15,4,'SERVICIO','Reparación de hornos','Rápido y garantizado',90,'PUBLICADA',15,15),
(27,17,2,'SERVICIO','Flete express 24h','En ciudad',210,'PUBLICADA',17,17),
(28,21,7,'SERVICIO','Clases de física','Refuerzo',65,'PUBLICADA',21,21),
(29,22,9,'SERVICIO','Inglés conversación B2','Pronunciación',60,'PUBLICADA',22,22),
(30,23,5,'SERVICIO','Técnico línea blanca','A domicilio',130,'PUBLICADA',23,23),
(31,24,8,'SERVICIO','Mudanza local','Equipo y cuidado',370,'PUBLICADA',24,24),
(32,25,3,'SERVICIO','Matemáticas discretas','Teoría y práctica',75,'PUBLICADA',25,25),
(33,31,1,'SERVICIO','Reparación ecológica','Piezas recuperadas',80,'PUBLICADA',31,31),
(34,10,3,'SERVICIO','Clases de matemáticas II','Cálculo avanzado',70,'PUBLICADA',10,10),
(35,6,6,'SERVICIO','Inglés conversacional II','Práctica guiada',60,'PUBLICADA',6,6),
(36,8,2,'SERVICIO','Reparación de licuadoras PRO','Motor y cuchillas',80,'PUBLICADA',8,8),
-- nuevas 37..60
(37,3,11,'PRODUCTO','Bici ruta aluminio','Grupo Claris',2400,'PUBLICADA',3,3),
(38,3,11,'PRODUCTO','Bici híbrida con parrilla','Urbana',1650,'PUBLICADA',3,3),
(39,8,12,'PRODUCTO','Aspiradora 1400W','Filtro HEPA',600,'PUBLICADA',8,8),
(40,18,6,'PRODUCTO','Manguera extensible 20m','Con boquilla',115,'PUBLICADA',18,18),
(41,12,7,'PRODUCTO','Zapatillas running 41','Buen estado',170,'PUBLICADA',12,12),
(42,12,7,'PRODUCTO','Camisa formal M','Como nueva',120,'PUBLICADA',12,12),
(43,8,4,'PRODUCTO','Cafetera 1.2L','Programable',395,'PUBLICADA',8,8),
(44,8,4,'PRODUCTO','Batidora 300W','5 velocidades',199,'PUBLICADA',8,8),
(45,18,6,'PRODUCTO','Semillas mixtas huerto','Pack',55,'PUBLICADA',18,18),
(46,3,1,'PRODUCTO','Monopatín urbano','Plegable',430,'PUBLICADA',3,3),
(47,33,14,'SERVICIO','Clases de programación','JS/React',85,'PUBLICADA',33,33),
(48,32,11,'SERVICIO','Delivery eco','En bici eléctrica',28,'PUBLICADA',32,32),
(49,35,3,'SERVICIO','Reparación de lavadoras','A domicilio',105,'PUBLICADA',35,35),
(50,34,15,'SERVICIO','Tutoría BD (SQL)','Modelado/Consultas',80,'PUBLICADA',34,34),
(51,36,12,'SERVICIO','Mensajería urbana','Paquetería',40,'PUBLICADA',36,36),
(52,39,14,'SERVICIO','Clases de estadística','Inferencia',90,'PUBLICADA',39,39),
(53,3,1,'PRODUCTO','Bici ruta carbono usada','Ultegra',5200,'PUBLICADA',3,3),
(54,12,7,'PRODUCTO','Abrigo de invierno L','Poco uso',220,'PUBLICADA',12,12),
(55,8,4,'PRODUCTO','Hervidor eléctrico 1.7L','Acero',170,'PUBLICADA',8,8),
(56,18,6,'PRODUCTO','Kit jardinería 5pzs','Acero',140,'PUBLICADA',18,18),
(57,3,9,'PRODUCTO','Luces bici recargables','USB',90,'PUBLICADA',3,3),
(58,8,5,'PRODUCTO','Purificador de aire','HEPA',950,'PUBLICADA',8,8),
(59,24,8,'SERVICIO','Mudanza premium','Embalaje incluido',520,'PUBLICADA',24,24),
(60,17,2,'SERVICIO','Flete interprovincial','24-48h',460,'PUBLICADA',17,17);

-- Enlaces producto
INSERT INTO PUBLICACION_PRODUCTO (id_pub,id_prod,cantidad,id_um) VALUES
(1,1,1,1),(2,3,1,1),(3,7,1,1),(4,10,1,1),
(5,4,1,1),(6,2,1,1),(7,9,1,1),(8,6,1,8),
(13,11,1,1),(14,12,1,1),(15,14,1,1),(16,16,1,1),(17,17,1,1),
(18,18,1,1),(19,19,1,1),(20,20,1,1),(21,21,1,1),(22,22,1,8),
(23,23,1,1),(24,24,1,1),(25,25,1,1),
(37,26,1,1),(38,27,1,1),(39,28,1,1),(40,29,1,1),(41,30,1,1),
(42,31,1,1),(43,32,1,1),(44,33,1,1),(45,34,1,8),(46,35,1,1),
(53,26,1,1),(54,18,1,1),(55,32,1,1),(56,25,1,1),(57,20,1,1),
(58,28,1,1);

-- Enlaces servicio
INSERT INTO PUBLICACION_SERVICIO (id_pub,id_serv,horario) VALUES
(9,1,'L-V 14:00-18:00'),(10,2,'L-S 09:00-17:00'),(11,3,'L-D 08:00-20:00'),(12,5,'L-V 16:00-20:00'),
(26,7,'L-V 15:00-18:00'),(27,8,'L-S 08:00-18:00'),(28,9,'L-V 17:00-20:00'),(29,10,'L-V 19:00-21:00'),
(30,11,'L-S 09:00-17:00'),(31,12,'L-D 08:00-20:00'),(32,13,'L-V 18:00-21:00'),(33,14,'L-V 14:00-18:00'),
(34,5,'L-V 16:00-20:00'),(35,6,'L-V 16:00-20:00'),(36,1,'L-V 14:00-18:00'),
(47,15,'L-V 18:00-20:00'),(48,16,'L-D 10:00-20:00'),(49,17,'L-S 09:00-18:00'),
(50,18,'L-V 19:00-21:00'),(51,19,'L-D 08:00-20:00'),(52,20,'L-V 18:00-21:00'),
(59,12,'L-D 08:00-20:00'),(60,8,'L-D 08:00-20:00');

-- PROMOCIONES
INSERT INTO PROMOCION (id_prom,titulo,descripcion,fecha_ini,fecha_fin,descuento,estado,creado_por,actualizado_por) VALUES
(1,'Semana Verde','Descuentos eco',DATE_SUB(CURDATE(),INTERVAL 3 DAY),DATE_ADD(CURDATE(),INTERVAL 4 DAY),10,'ACTIVA',1,1),
(2,'Vuelta a Clases','Promos en clases y bicis',DATE_ADD(CURDATE(),INTERVAL 10 DAY),DATE_ADD(CURDATE(),INTERVAL 20 DAY),15,'PROGRAMADA',1,1),
(3,'Ciclismo Urbano','Accesorios y bicis',DATE_SUB(CURDATE(),INTERVAL 5 DAY),DATE_ADD(CURDATE(),INTERVAL 2 DAY),12,'ACTIVA',1,1);

INSERT INTO PROMOCION_APLICA (id_prom,entidad,id_entidad) VALUES
(1,'PRODUCTO',1),(1,'SERVICIO',2),(1,'PRODUCTO',7),
(2,'SERVICIO',5),(1,'PRODUCTO',19),(1,'PRODUCTO',20),(1,'SERVICIO',31),
(2,'SERVICIO',29),(2,'PRODUCTO',14),
(3,'PRODUCTO',20),(3,'PRODUCTO',21),(3,'PRODUCTO',37),(3,'PRODUCTO',46);

-- 6) INTERCAMBIOS + TRANSACCIONES + MOVIMIENTOS

INSERT INTO INTERCAMBIO
(id_inter,id_us_comp,id_us_vend,id_pub,id_ub_origen,id_ub_destino,id_um,cantidad,costo_reembolso,fecha_acept,fecha_comp,estado) VALUES
(1,5,3,1,1,3,1,1,0,DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY),'COMPLETADO'),
(2,14,15,13,4,1,1,1,0,DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY),'COMPLETADO'),
(3,9,3,20,9,10,1,1,0,DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY),'COMPLETADO'),
(4,22,23,30,5,9,1,1,0,NULL,NULL,'SOLICITADO'),
(5,25,24,31,8,6,1,1,0,DATE_SUB(NOW(),INTERVAL 1 DAY),NULL,'ACEPTADO'),
(6,16,18,16,6,6,1,1,0,NULL,NULL,'CANCELADO'),
(7,21,12,18,7,7,1,1,0,DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 12 HOUR),'COMPLETADO'),
(8,28,17,27,2,6,1,1,0,NULL,NULL,'SOLICITADO'),
(9,30,31,33,1,1,1,1,0,DATE_SUB(NOW(),INTERVAL 4 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY),'COMPLETADO'),
(10,33,3,10,1,1,7,2,0,DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 6 HOUR),'COMPLETADO'),
(11,32,8,36,2,2,1,1,0,DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY),'COMPLETADO'),
(12,39,39,52,14,14,7,1,0,DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 2 HOUR),'COMPLETADO'),
(13,40,24,59,8,6,7,1,0,NULL,NULL,'SOLICITADO'),
(14,34,33,47,14,1,7,1,0,DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY),'COMPLETADO'),
(15,36,17,60,2,2,7,1,0,NULL,NULL,'ACEPTADO'),
(16,35,23,30,5,5,7,1,0,NULL,NULL,'SOLICITADO'),
(17,9,8,23,4,4,1,1,0,DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY),'COMPLETADO'),
(18,12,10,34,3,3,7,1,0,DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 3 HOUR),'COMPLETADO');

-- TRANSACCIONES asociadas
INSERT INTO TRANSACCION (id_trans,id_us,id_us2,id_inter,monto,estado,fecha_trans) VALUES
(1,5,3,1,900,'CONFIRMADA',NOW()),
(2,14,15,2,780,'CONFIRMADA',NOW()),
(3,9,3,3,65,'CONFIRMADA',NOW()),
(4,25,24,5,370,'PENDIENTE',NOW()),
(5,21,12,7,120,'CONFIRMADA',NOW()),
(6,30,31,9,80,'CONFIRMADA',NOW()),
(7,33,3,10,120,'CONFIRMADA',NOW()),
(8,32,8,11,80,'CONFIRMADA',NOW()),
(9,39,39,12,90,'CONFIRMADA',NOW()),
(10,34,33,14,85,'CONFIRMADA',NOW()),
(11,12,10,18,70,'CONFIRMADA',NOW());

-- MOVIMIENTOS (IN/OUT)
INSERT INTO MOVIMIENTO (id_mov,id_us,id_tipo_mov,cantidad,descripcion,id_inter) VALUES
(1,3,2,900,'Venta bici urbana (Pub 1)',1),
(2,5,3,900,'Compra bici urbana (Pub 1)',1),
(3,15,2,780,'Venta bici aro24 (Pub 13)',2),
(4,14,3,780,'Compra bici aro24 (Pub 13)',2),
(5,3,2,65,'Venta kit luces (Pub 20)',3),
(6,9,3,65,'Compra kit luces (Pub 20)',3),
(7,24,2,370,'Venta mudanza local (Pub 31)',5),
(8,25,3,370,'Compra mudanza local (Pub 31)',5),
(9,12,2,120,'Venta chamarra polar (Pub 18)',7),
(10,21,3,120,'Compra chamarra polar (Pub 18)',7),
(11,31,2,80,'Venta reparación ecológica (Pub 33)',9),
(12,30,3,80,'Compra reparación ecológica (Pub 33)',9),
(13,3,2,120,'Servicio mantención bici (Pub 10)',10),
(14,33,3,120,'Pago servicio mantención bici (Pub 10)',10),
(15,8,2,80,'Reparación licuadoras PRO (Pub 36)',11),
(16,32,3,80,'Pago reparación licuadoras PRO (Pub 36)',11),
(17,39,2,90,'Clases estadística (Pub 52)',12),
(18,39,3,90,'Pago clases estadística (Pub 52)',12),
(19,33,2,85,'Clases programación (Pub 47)',14),
(20,34,3,85,'Pago clases programación (Pub 47)',14),
(21,10,2,70,'Clases matemáticas II (Pub 34)',18),
(22,12,3,70,'Pago clases matemáticas II (Pub 34)',18);

-- 7) MÓDULO AMBIENTAL

INSERT INTO DIMENSION_AMBIENTAL (id_dim,codigo,nombre,unidad_base,descripcion) VALUES
(1,'CO2_EQ','Contaminación reducida (CO₂e)','kg','Reducción equivalente en kg CO₂e'),
(2,'DESECHOS','Desechos sólidos','kg','Residuos generados o evitados'),
(3,'AGUA','Consumo de agua','L','Uso o ahorro de agua'),
(4,'ENERGIA','Consumo energético','kWh','Consumo o ahorro estimado');

-- Catálogo de conversión simple (para reportes Dimensión→UM)
INSERT INTO FACTOR_CONVERSION (id_factor,id_dim,id_um_origen,id_um_dest,factor,descripcion) VALUES
(1,1,2,2,1.00000000,'kg a kg CO₂e'),
(2,2,2,2,1.00000000,'kg desechos'),
(3,3,4,4,1.00000000,'litros de agua'),
(4,4,7,7,1.00000000,'horas a kWh (ejemplo)'),
(5,1,1,2,0.50000000,'1 unidad reusada ≈ 0.5 kg CO₂e'),
(6,2,1,2,0.20000000,'1 unidad reusada ≈ 0.2 kg desechos'),
(7,3,1,4,5.00000000,'1 unidad reusada ≈ 5 L agua'),
(8,4,7,7,0.10000000,'1 hora servicio ≈ 0.1 kWh');

-- EVENTOS (solo PUBLICACION o INTERCAMBIO en fuente)
INSERT INTO EVENTO_AMBIENTAL
(id_evento,id_us,id_dim,fuente,id_fuente,categoria,valor,id_um,contaminacion_reducida,descripcion,creado_en) VALUES
(1,3,1,'PUBLICACION',1,'Movilidad sostenible',1,1,0.5,'Venta bicicleta evita transporte motorizado',NOW()),
(2,8,2,'PUBLICACION',7,'Electrodomésticos',2,2,0.0,'Reuso de microondas evita RAEE',NOW()),
(3,12,3,'PUBLICACION',3,'Textil',10,4,0.0,'Reuso de campera evita gasto de agua',NOW()),
(4,4,4,'PUBLICACION',11,'Transporte',4,7,0.0,'Flete eficiente con optimización de rutas',NOW());

-- Más eventos (CO2e > 0 solo en id_dim=1)
INSERT INTO EVENTO_AMBIENTAL
(id_us,id_dim,fuente,id_fuente,categoria,valor,id_um,contaminacion_reducida,descripcion,creado_en) VALUES
(3, 1,'PUBLICACION',14,'Movilidad',1,1,0.55,'Bici gravel sustituye viajes motorizados',NOW()),
(3, 1,'PUBLICACION',20,'Accesorios',1,1,0.05,'Luces fomentan uso de bici nocturno',NOW()),
(3, 1,'PUBLICACION',21,'Accesorios',1,1,0.12,'Portabici habilita trayectos compartidos',NOW()),
(8, 2,'PUBLICACION',15,'Línea blanca',1,2,0.00,'Reuso lavadora evita RAEE',NOW()),
(8, 2,'PUBLICACION',19,'Línea blanca',1,2,0.00,'Reuso horno evita RAEE',NOW()),
(8, 2,'PUBLICACION',23,'Pequeños',1,2,0.00,'Plancha reusada',NOW()),
(12,3,'PUBLICACION',17,'Textil',5,4,0.00,'Reuso jean evita agua de producción',NOW()),
(12,3,'PUBLICACION',24,'Textil',4,4,0.00,'Polera técnica reusada',NOW()),
(24,4,'PUBLICACION',31,'Transporte',3,7,0.00,'Mudanza optimizada por rutas',NOW()),
(17,4,'PUBLICACION',27,'Transporte',2,7,0.00,'Flete express optimiza viajes',NOW()),
(31,1,'PUBLICACION',33,'Reparación ecológica',1,1,0.08,'Piezas recuperadas evitan producción nueva',NOW()),
(33,1,'PUBLICACION',47,'Educación tecnológica',1,1,0.02,'Capacitación reduce desplazamientos',NOW()),
(32,1,'PUBLICACION',48,'Logística eco',1,1,0.03,'Delivery en e-bike evita CO₂e',NOW()),
(36,1,'PUBLICACION',51,'Mensajería eco',1,1,0.05,'Paquetería en rutas optimizadas',NOW()),
(39,1,'PUBLICACION',52,'Educación',1,1,0.02,'Clases remotas reducen traslados',NOW()),
(24,4,'PUBLICACION',59,'Transporte',4,7,0.00,'Mudanza premium planificada',NOW()),
(17,4,'PUBLICACION',60,'Transporte',3,7,0.00,'Flete interprovincial optimizado',NOW()),
(3, 1,'PUBLICACION',53,'Movilidad avanzada',1,1,0.90,'Bici carbono sustituye auto',NOW()),
(3, 3,'PUBLICACION',22,'Riego eficiente',10,4,0.00,'Sustrato retiene humedad',NOW());

-- IMPACTO MENSUAL
INSERT INTO IMPACTO_MENSUAL (anio,mes,id_us,id_dim,valor_total,contaminacion_reducida_total) VALUES
(YEAR(CURDATE()),MONTH(CURDATE()),3, 1, 4.5,1.62),
(YEAR(CURDATE()),MONTH(CURDATE()),8, 2, 3.0,0.00),
(YEAR(CURDATE()),MONTH(CURDATE()),12,3, 19.0,0.00),
(YEAR(CURDATE()),MONTH(CURDATE()),24,4, 7.0,0.00),
(YEAR(CURDATE()),MONTH(CURDATE()),31,1, 1.0,0.08),
(YEAR(CURDATE()),MONTH(CURDATE()),33,1, 1.0,0.02),
(YEAR(CURDATE()),MONTH(CURDATE()),32,1, 1.0,0.03),
(YEAR(CURDATE()),MONTH(CURDATE()),36,1, 1.0,0.05),
(YEAR(CURDATE()),MONTH(CURDATE()),39,1, 1.0,0.02);

-- 8) CONSULTAS DE VERIFICACIÓN, REPORTES Y KPIs

-- Conteos rápidos
SELECT 'ROL' t, COUNT(*) n FROM ROL UNION ALL
SELECT 'USUARIO', COUNT(*) FROM USUARIO UNION ALL
SELECT 'PRODUCTO', COUNT(*) FROM PRODUCTO UNION ALL
SELECT 'SERVICIO', COUNT(*) FROM SERVICIO UNION ALL
SELECT 'PUBLICACION', COUNT(*) FROM PUBLICACION UNION ALL
SELECT 'INTERCAMBIO', COUNT(*) FROM INTERCAMBIO UNION ALL
SELECT 'TRANSACCION', COUNT(*) FROM TRANSACCION;

SELECT 'usuarios' AS tabla, COUNT(*) AS total FROM USUARIO
UNION ALL SELECT 'productos', COUNT(*) FROM PRODUCTO
UNION ALL SELECT 'servicios', COUNT(*) FROM SERVICIO
UNION ALL SELECT 'publicaciones', COUNT(*) FROM PUBLICACION
UNION ALL SELECT 'intercambios', COUNT(*) FROM INTERCAMBIO
UNION ALL SELECT 'transacciones', COUNT(*) FROM TRANSACCION;

-- UMs y Dimensión→UM
SELECT id_um, nombre, simbolo FROM UNIDAD_MEDIDA ORDER BY id_um;
SELECT d.nombre AS dimension, u.simbolo AS um
FROM FACTOR_CONVERSION fc
JOIN DIMENSION_AMBIENTAL d ON d.id_dim=fc.id_dim
JOIN UNIDAD_MEDIDA u ON u.id_um=fc.id_um_dest
ORDER BY d.nombre, u.simbolo;

-- Publicaciones activas por usuario (TOP 10)
SELECT u.id_us, u.nombre, u.apellido, COUNT(*) AS pubs_activas
FROM PUBLICACION p
JOIN USUARIO u ON u.id_us = p.id_us
WHERE p.estado='PUBLICADA'
GROUP BY u.id_us, u.nombre, u.apellido
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
SELECT s.id_serv, s.nombre AS servicio, s.estado AS estado_serv,
       COUNT(ps.id_pub) AS veces_publicado
FROM SERVICIO s
LEFT JOIN PUBLICACION_SERVICIO ps ON ps.id_serv = s.id_serv
GROUP BY s.id_serv, s.nombre, s.estado
ORDER BY veces_publicado DESC, s.id_serv;

-- Publicaciones por categoría (productos vs servicios)
SELECT tipo, categoria, COUNT(*) AS total
FROM (
  SELECT 'Producto' AS tipo, c.nombre AS categoria
  FROM PUBLICACION p
  JOIN PUBLICACION_PRODUCTO pp ON pp.id_pub = p.id_pub
  JOIN PRODUCTO pr ON pr.id_prod = pp.id_prod
  JOIN CATEGORIA c ON c.id_cat = pr.id_cat
  UNION ALL
  SELECT 'Servicio' AS tipo, c.nombre AS categoria
  FROM PUBLICACION p
  JOIN PUBLICACION_SERVICIO ps ON ps.id_pub = p.id_pub
  JOIN SERVICIO s ON s.id_serv = ps.id_serv
  JOIN CATEGORIA c ON c.id_cat = s.id_cat
) x
GROUP BY tipo, categoria
ORDER BY tipo, total DESC, categoria;

-- Intercambios COMPLETADOS con datos
SELECT i.id_inter, c.nombre AS comprador, v.nombre AS vendedor,
       p.titulo, i.fecha_comp
FROM INTERCAMBIO i
JOIN USUARIO c ON c.id_us = i.id_us_comp
JOIN USUARIO v ON v.id_us = i.id_us_vend
JOIN PUBLICACION p ON p.id_pub = i.id_pub
WHERE i.estado = 'COMPLETADO'
ORDER BY i.id_inter DESC;

-- Usuarios con más intercambios (comprador/vendedor)
SELECT 'Comprador' rol, u.id_us, u.nombre, COUNT(*) total
FROM INTERCAMBIO i JOIN USUARIO u ON u.id_us=i.id_us_comp
GROUP BY u.id_us
UNION ALL
SELECT 'Vendedor', u.id_us, u.nombre, COUNT(*) total
FROM INTERCAMBIO i JOIN USUARIO u ON u.id_us=i.id_us_vend
GROUP BY u.id_us
ORDER BY rol, total DESC, id_us;

-- Flujo de créditos por usuario
SELECT u.id_us, u.nombre, 
SUM(CASE WHEN tm.signo='IN'  THEN m.cantidad ELSE 0 END) AS creditos_ingreso,
SUM(CASE WHEN tm.signo='OUT' THEN m.cantidad ELSE 0 END) AS creditos_egreso,
SUM(CASE WHEN tm.signo='IN'  THEN m.cantidad ELSE -m.cantidad END) AS neto
FROM USUARIO u
LEFT JOIN MOVIMIENTO m ON m.id_us = u.id_us
LEFT JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov = m.id_tipo_mov
GROUP BY u.id_us, u.nombre
ORDER BY neto DESC;

-- Transacciones por estado
SELECT estado, COUNT(*) AS total, SUM(monto) AS suma_creditos
FROM TRANSACCION
GROUP BY estado
ORDER BY total DESC;

-- Promociones activas/programadas y sus ítems
SELECT pr.titulo, pr.descuento, 'Producto' AS tipo, p.nombre AS item
FROM PROMOCION pr
JOIN PROMOCION_APLICA pa ON pa.id_prom = pr.id_prom AND pa.entidad='PRODUCTO'
JOIN PRODUCTO p ON p.id_prod = pa.id_entidad
WHERE pr.estado IN ('ACTIVA','PROGRAMADA')
UNION ALL
SELECT pr.titulo, pr.descuento, 'Servicio', s.nombre
FROM PROMOCION pr
JOIN PROMOCION_APLICA pa ON pa.id_prom = pr.id_prom AND pa.entidad='SERVICIO'
JOIN SERVICIO s ON s.id_serv = pa.id_entidad
WHERE pr.estado IN ('ACTIVA','PROGRAMADA')
ORDER BY titulo, tipo, item;

-- Publicaciones recientes (30 días)
SELECT p.id_pub, p.titulo, u.nombre AS autor, p.estado, p.fecha_pub
FROM PUBLICACION p
JOIN USUARIO u ON u.id_us=p.id_us
WHERE p.fecha_pub >= (NOW() - INTERVAL 30 DAY)
ORDER BY p.fecha_pub DESC;

-- Servicios activos: precio medio por categoría
SELECT c.nombre AS categoria, AVG(s.precio) AS precio_promedio, COUNT(*) AS total_servicios
FROM SERVICIO s
JOIN CATEGORIA c ON c.id_cat=s.id_cat
WHERE s.estado='ACTIVO'
GROUP BY c.nombre
ORDER BY precio_promedio DESC;

-- KPI: tasa de conversión publicación→intercambio
SELECT
    (SELECT COUNT(*) FROM PUBLICACION WHERE estado='PUBLICADA') AS publicaciones_activas,
    (SELECT COUNT(DISTINCT id_pub) FROM INTERCAMBIO) AS publicaciones_con_intercambio,
    ROUND(
        (SELECT COUNT(DISTINCT id_pub) FROM INTERCAMBIO) * 100.0 /
        NULLIF((SELECT COUNT(*) FROM PUBLICACION WHERE estado='PUBLICADA'),0),2
    ) AS tasa_conversion_pct;

-- Impacto mensual por dimensión
SELECT CONCAT(im.anio,'-',LPAD(im.mes,2,'0')) AS periodo, d.nombre AS dimension,
       SUM(im.valor_total) AS total, d.unidad_base
FROM IMPACTO_MENSUAL im
JOIN DIMENSION_AMBIENTAL d ON d.id_dim = im.id_dim
GROUP BY periodo, d.nombre, d.unidad_base
ORDER BY periodo DESC, d.nombre;

-- Suma por usuario y dimensión
SELECT ea.id_us, u.nombre, d.codigo AS dimension,
       ROUND(SUM(ea.valor),3) AS total_valor,
       ROUND(SUM(COALESCE(ea.contaminacion_reducida,0)),3) AS total_cont_reducida
FROM EVENTO_AMBIENTAL ea
JOIN USUARIO u ON u.id_us=ea.id_us
JOIN DIMENSION_AMBIENTAL d ON d.id_dim=ea.id_dim
GROUP BY ea.id_us, u.nombre, d.codigo
ORDER BY ea.id_us, d.codigo;

-- KPI eco por usuario (mes actual)
SELECT ea.id_us, u.nombre, d.codigo AS dimension,
       ROUND(SUM(ea.valor),3) AS valor_dim,
       ROUND(SUM(COALESCE(ea.contaminacion_reducida,0)),3) AS co2e_eq
FROM EVENTO_AMBIENTAL ea
JOIN USUARIO u ON u.id_us=ea.id_us
JOIN DIMENSION_AMBIENTAL d ON d.id_dim=ea.id_dim
WHERE DATE_FORMAT(ea.creado_en,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m')
GROUP BY ea.id_us, u.nombre, d.codigo
ORDER BY ea.id_us, d.codigo;

-- TOP por contaminación reducida (publicaciones)
SELECT ea.id_fuente AS id_pub, pub.titulo, u.nombre, u.apellido,
       ROUND(SUM(COALESCE(ea.contaminacion_reducida,0)),6) AS cont_reducida_total
FROM EVENTO_AMBIENTAL ea
JOIN PUBLICACION pub ON pub.id_pub=ea.id_fuente AND ea.fuente='PUBLICACION'
JOIN USUARIO u ON u.id_us=pub.id_us
GROUP BY ea.id_fuente, pub.titulo, u.nombre, u.apellido
ORDER BY cont_reducida_total DESC
LIMIT 20;

-- Integridad básica
SELECT p.* FROM PRODUCTO p
LEFT JOIN CATEGORIA c ON c.id_cat=p.id_cat
WHERE c.id_cat IS NULL;

SELECT s.* FROM SERVICIO s
LEFT JOIN CATEGORIA c ON c.id_cat=s.id_cat
LEFT JOIN USUARIO u ON u.id_us=s.id_us
WHERE c.id_cat IS NULL OR u.id_us IS NULL;

SELECT pub.* FROM PUBLICACION pub
LEFT JOIN USUARIO u ON u.id_us=pub.id_us
LEFT JOIN UBICACION ub ON ub.id_ub=pub.id_ub
WHERE u.id_us IS NULL OR ub.id_ub IS NULL;

SELECT pp.* FROM PUBLICACION_PRODUCTO pp
LEFT JOIN PUBLICACION pub ON pub.id_pub=pp.id_pub
LEFT JOIN PRODUCTO p ON p.id_prod=pp.id_prod
WHERE pub.id_pub IS NULL OR p.id_prod IS NULL;

SELECT ps.* FROM PUBLICACION_SERVICIO ps
LEFT JOIN PUBLICACION pub ON pub.id_pub=ps.id_pub
LEFT JOIN SERVICIO s ON s.id_serv=ps.id_serv
WHERE pub.id_pub IS NULL OR s.id_serv IS NULL;

SELECT m.* FROM MOVIMIENTO m
LEFT JOIN USUARIO u ON u.id_us=m.id_us
LEFT JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov=m.id_tipo_mov
LEFT JOIN INTERCAMBIO i ON i.id_inter=m.id_inter
WHERE u.id_us IS NULL OR tm.id_tipo_mov IS NULL
   OR (m.id_inter IS NOT NULL AND i.id_inter IS NULL);
