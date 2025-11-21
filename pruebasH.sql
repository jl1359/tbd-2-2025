-- ROL
INSERT INTO ROL (nombre, descripcion) VALUES
('Admin', 'Administrador completo'),
('User', 'Usuario básico'),
('Guest', 'Invitado limitado'),
('Moderator', 'Moderador de contenido'),
('Admin', 'Duplicado para probar error'), -- Debería fallar por UNIQUE
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'Excede longitud'); -- Debería fallar por VARCHAR(50)

-- ESTADO_PUBLICACION
INSERT INTO ESTADO_PUBLICACION (nombre, descripcion) VALUES
('Activo', 'Publicación visible'),
('Inactivo', NULL), -- Prueba descripción nula
('Pendiente', 'En revisión'),
('Eliminado', 'Borrado permanentemente'),
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'Excede longitud'), -- Debería fallar por VARCHAR(50)
('Activo', 'Duplicado'); -- Debería fallar por UNIQUE

-- ESTADO_SERVICIO
INSERT INTO ESTADO_SERVICIO (nombre, descripcion) VALUES
('Disponible', 'Servicio listo'),
('Pausado', ''),
('Finalizado', 'Servicio completado'),
('Cancelado', 'Servicio anulado'),
('Disponible', 'Duplicado'), -- Debería fallar por UNIQUE
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'Excede longitud'); -- Debería fallar por VARCHAR(50)

-- ESTADO_PROMOCION
INSERT INTO ESTADO_PROMOCION (nombre, descripcion) VALUES
('Activa', 'Promoción en curso'),
('Expirada', 'Promoción terminada'),
('Planificada', 'Promoción futura'),
('Cancelada', 'Promoción cancelada'),
('Activa', 'Duplicado'), -- Debería fallar por UNIQUE
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'Excede longitud'); -- Debería fallar por VARCHAR(50)

-- ESTADO_TRANSACCION
INSERT INTO ESTADO_TRANSACCION (nombre, descripcion) VALUES
('Pendiente', 'Transacción en espera'),
('Completada', 'Transacción finalizada'),
('Rechazada', 'Transacción denegada'),
('Anulada', 'Transacción cancelada'),
('Pendiente', 'Duplicado'), -- Debería fallar por UNIQUE
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'Excede longitud'); -- Debería fallar por VARCHAR(50)

-- ESTADO_REPORTE
INSERT INTO ESTADO_REPORTE (nombre, descripcion) VALUES
('Abierto', 'Reporte recibido'),
('Cerrado', 'Reporte resuelto'),
('En Revisión', 'Reporte en análisis'),
('Descartado', 'Reporte sin mérito'),
('Abierto#', 'Con carácter especial'), -- Válido
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'Excede longitud'); -- Debería fallar por VARCHAR(50)

-- TIPO_MOVIMIENTO
INSERT INTO TIPO_MOVIMIENTO (nombre, signo, descripcion) VALUES
('Ingreso', 'IN', 'Aumento de saldo'),
('Egreso', 'OUT', 'Disminución de saldo'),
('Bloqueo', 'OUT', 'Retención temporal'),
('Liberación', 'IN', 'Liberación de retención'),
('Ingreso', 'IN', 'Duplicado'), -- Debería fallar por UNIQUE
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'IN', 'Excede longitud'); -- Debería fallar por VARCHAR(50)

-- TIPO_BITACORA
INSERT INTO TIPO_BITACORA (nombre, descripcion) VALUES
('Seguridad', 'Accesos y seguridad'),
('Negocio', 'Operaciones de negocio'),
('Sistema', 'Eventos del sistema'),
('Auditoria', 'Registros de auditoría'),
('Seguridad', 'Duplicado'), -- Debería fallar por UNIQUE
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'Excede longitud'); -- Debería fallar por VARCHAR(50)

-- UNIDAD_MEDIDA
INSERT INTO UNIDAD_MEDIDA (nombre, simbolo) VALUES
('Litro', 'L'),
('Kilómetro', 'km'),
('Minuto', 'min'),
('Pieza', 'pz'),
('Litro', 'L'), -- Debería fallar por UNIQUE (nombre y símbolo)
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'Excede'), -- Debería fallar por VARCHAR(50)
('Kilogramo', 'kg'); -- Válido

-- USUARIO
INSERT INTO USUARIO (id_rol, nombre, apellido, email, telefono, direccion) VALUES
(1, 'Juan', 'Pérez', 'juan@email.com', '70000001', 'Calle 1'),
(2, 'María', 'López', 'maria@email.com', '70000002', 'Calle 2'),
(3, 'Pedro', 'García', 'pedro@email.com', '70000003', 'Calle 3'),
(99, 'Luis', 'Martínez', 'luis@email.com', '70000004', 'Calle 4'), -- Debería fallar por FK id_rol
(1, 'Ana', 'Gómez', 'juan@email.com', '70000005', 'Calle 5'); -- Debería fallar por UNIQUE email

-- DETALLE_USUARIO
INSERT INTO DETALLE_USUARIO (id_us, cant_anuncios, ult_ingreso, likes, favoritos, denuncias, ventas) VALUES
(1, 3, '2025-10-14', 5, 2, 0, 1),
(2, 4, '2025-10-14', 7, 3, 1, 2),
(3, 2, '2025-10-14', -1, 1, 0, 0), -- Debería fallar si hay CHECK implícito para likes >= 0
(99, 5, '2025-10-14', 6, 4, 0, 3); -- Debería fallar por FK id_us

-- ACCESO
INSERT INTO ACCESO (id_us, fecha_acc, exito, ip, agente) VALUES
(1, '2025-10-14', TRUE, '192.168.1.1', 'Chrome'),
(2, '2025-10-14', FALSE, '192.168.1.2', 'Firefox'),
(3, '2025-10-14', TRUE, '192.168.1.3', 'Safari'),
(99, '2025-10-14', TRUE, '192.168.1.4', 'Edge'); -- Debería fallar por FK id_us

-- CONTRASENA
INSERT INTO CONTRASENA (id_us, hash) VALUES
(1, AES_ENCRYPT('pass1', 'key')),
(2, AES_ENCRYPT('pass2', 'key')),
(3, AES_ENCRYPT('pass3', 'key')),
(3, AES_ENCRYPT('pass4', 'key')), -- Debería fallar por UNIQUE id_us
(99, AES_ENCRYPT('pass5', 'key')); -- Debería fallar por FK id_us

-- BILLETERA
INSERT INTO BILLETERA (id_us, cuenta_bancaria) VALUES
(1, 'ACCT1'),
(2, 'ACCT2'),
(3, 'ACCT3'),
(99, 'ACCT4'); -- Debería fallar por FK id_us

-- UBICACION
INSERT INTO UBICACION (direccion, ciudad, provincia, lat, lon) VALUES
('Calle A', 'Ciudad A', 'Provincia A', 40.7128, -74.0060),
('Calle B', 'Ciudad B', 'Provincia B', 34.0522, -118.2437),
('', 'Ciudad C', 'Provincia C', 51.5074, -0.1278), -- Debería fallar por NOT NULL direccion
('Calle D', NULL, NULL, NULL, NULL); -- Válido, ciudad/provincia/lat/lon permiten NULL

-- ORGANIZACION
INSERT INTO ORGANIZACION (nombre, tipo, correo) VALUES
('Org1', 'ONG', 'org1@email.com'),
('Org2', 'Empresa', 'org2@email.com'),
('Org1', 'Cooperativa', 'org3@email.com'), -- Debería fallar por UNIQUE nombre
('OrganizaciónConNombreMuyLargoParaProbarLimiteDeDoscientosCincuentaYCincoCaracteresExcedido1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890', 'ONG', 'org4@email.com'); -- Debería fallar por VARCHAR(255)

-- EVENTO
INSERT INTO EVENTO (id_org, titulo, descripcion, fecha_ini, fecha_fin, lugar, precio, activo) VALUES
(1, 'Evento 1', 'Descripción 1', '2025-10-15', '2025-10-16', 'Lugar 1', 10.00, TRUE),
(2, 'Evento 2', 'Descripción 2', '2025-10-20', '2025-10-19', 'Lugar 2', 20.00, FALSE), -- Debería fallar por CHECK fecha_fin >= fecha_ini
(1, 'Evento 3', 'Descripción 3', '2025-10-25', '2025-10-26', 'Lugar 3', -5.00, TRUE); -- Debería fallar por CHECK precio >= 0

-- EVENTO_USUARIO
INSERT INTO EVENTO_USUARIO (cod_evento, id_us) VALUES
(1, 1),
(2, 2), -- Puede fallar si evento 2 no se insertó
(3, 3); -- Puede fallar si evento 3 no se insertó

-- CATEGORIA_PRODUCTO
INSERT INTO CATEGORIA_PRODUCTO (nombre, descripcion) VALUES
('Electrónica', 'Productos electrónicos'),
('Ropa', 'Vestimenta'),
('Electrónica', 'Duplicado'), -- Debería fallar por UNIQUE
('CategoríaConNombreMuyLargoParaProbarLimiteDeCienCaracteresExcedido1234567890123456789012345678901234', 'Excede longitud'); -- Debería fallar por VARCHAR(100)

-- PRODUCTO
INSERT INTO PRODUCTO (id_cat_prod, nombre, descripcion, precio, peso) VALUES
(1, 'Teléfono', 'Smartphone', 500.00, 0.2),
(2, 'Camisa', 'Camisa de algodón', 20.00, 0.3),
(1, 'Laptop', 'Laptop moderna', -10.00, 1.5), -- Debería fallar por CHECK precio >= 0
(1, 'Tablet', 'Tablet ligera', 300.00, -0.1); -- Debería fallar por CHECK peso >= 0

-- CATEGORIA_SERVICIO
INSERT INTO CATEGORIA_SERVICIO (nombre, descripcion) VALUES
('Reparaciones', 'Servicios de reparación'),
('Consultoría', 'Asesoramiento profesional'),
('Reparaciones', 'Duplicado'), -- Debería fallar por UNIQUE
('CategoríaConNombreMuyLargoParaProbarLimiteDeCienCaracteresExcedido1234567890123456789012345678901234', 'Excede longitud'); -- Debería fallar por VARCHAR(100)

-- SERVICIO
INSERT INTO SERVICIO (id_cat_serv, id_us, nombre, descripcion, precio, duracion_min, id_estado_serv) VALUES
(1, 1, 'Reparación de PC', 'Reparación de computadoras', 50.00, 60, 1),
(2, 2, 'Consultoría Fiscal', 'Asesoría fiscal', 100.00, 120, 1),
(1, 3, 'Reparación de Móvil', 'Reparación de smartphones', -20.00, 30, 1), -- Debería fallar por CHECK precio >= 0
(1, 1, 'Mantenimiento', 'Mantenimiento general', 40.00, -10, 1); -- Debería fallar por CHECK duracion_min >= 0

-- PUBLICACION
INSERT INTO PUBLICACION (id_us, id_ub, id_estado_pub, tipo, titulo, descripcion, valor_creditos) VALUES
(1, 1, 1, 'PRODUCTO', 'Venta Teléfono', 'Teléfono usado', 50.00),
(2, 2, 2, 'SERVICIO', 'Reparación PC', 'Reparación rápida', 30.00),
(3, 3, 3, 'PRODUCTO', 'Camisa Nueva', 'Camisa sin usar', -5.00), -- Debería fallar por CHECK valor_creditos >= 0
(1, 1, 1, 'PRODUCTO', 'Laptop Usada', 'Laptop en buen estado', 100.00);

-- PUBLICACION_PRODUCTO
INSERT INTO PUBLICACION_PRODUCTO (id_pub, id_prod, cantidad, id_um) VALUES
(1, 1, 2, 1),
(3, 2, 0, 2), -- Debería fallar por CHECK cantidad > 0
(4, 1, 1, 1);

-- PUBLICACION_SERVICIO
INSERT INTO PUBLICACION_SERVICIO (id_pub, id_serv, horario) VALUES
(2, 1, 'L-V 09:00-17:00'),
(2, 2, ''), -- Debería fallar por NOT NULL horario
(4, 1, 'S-D 10:00-18:00');

-- POTENCIADOR
INSERT INTO POTENCIADOR (id_us, id_pub, nombre, precio, duracion_dias, fecha_inicio, fecha_fin) VALUES
(1, 1, 'Boost', 15.00, 5, '2025-10-14', '2025-10-19'),
(2, 2, 'Highlight', -10.00, 3, '2025-10-15', '2025-10-17'), -- Debería fallar por CHECK precio >= 0
(3, 4, 'Top', 20.00, 0, '2025-10-16', '2025-10-20'); -- Debería fallar por CHECK duracion_dias > 0

-- PROMOCION
INSERT INTO PROMOCION (titulo, descripcion, fecha_ini, fecha_fin, banner, descuento, id_estado_prom) VALUES
('Promo1', 'Descuento 1', '2025-10-15', '2025-10-20', NULL, 10.00, 1),
('Promo2', 'Descuento 2', '2025-10-25', '2025-10-20', NULL, 15.00, 2), -- Debería fallar por CHECK fecha_fin >= fecha_ini
('Promo3', 'Descuento 3', '2025-10-30', '2025-11-05', NULL, 101.00, 3); -- Debería fallar por CHECK descuento <= 100

-- PROMOCION_PRODUCTO
INSERT INTO PROMOCION_PRODUCTO (id_prom, id_prod) VALUES
(1, 1),
(2, 2), -- Puede fallar si promo2 no se insertó
(3, 1); -- Puede fallar si promo3 no se insertó

-- PROMOCION_SERVICIO
INSERT INTO PROMOCION_SERVICIO (id_prom, id_serv) VALUES
(1, 1),
(2, 2), -- Puede fallar si promo2 no se insertó
(3, 1); -- Puede fallar si promo3 no se insertó

-- PAQUETE_CREDITO
INSERT INTO PAQUETE_CREDITO (nombre, cantidad_creditos, precio) VALUES
('Basic', 100, 50.00),
('Standard', 200, -10.00), -- Debería fallar por CHECK precio >= 0
('Premium', 500, 200.00);

-- COMPRA_CREDITO
INSERT INTO COMPRA_CREDITO (id_us, id_paquete, creditos, monto, proveedor, referencia) VALUES
(1, 1, 100, 50.00, 'Stripe', 'REF001'),
(2, 3, 200, -20.00, 'PayPal', 'REF002'), -- Debería fallar por CHECK monto >= 0
(3, 3, 500, 200.00, 'Stripe', 'REF003');

-- ESTADO_INTERCAMBIO
INSERT INTO ESTADO_INTERCAMBIO (nombre, descripcion) VALUES
('Solicitado', 'Intercambio solicitado'),
('Aceptado', 'Intercambio aceptado'),
('Completado', 'Intercambio completado'),
('Cancelado', 'Intercambio cancelado'),
('Solicitado', 'Duplicado'), -- Debería fallar por UNIQUE
('NombreMuyLargoParaProbarLimiteDeCincuentaCaracteresExcedido', 'Excede longitud'); -- Debería fallar por VARCHAR(50)

-- INTERCAMBIO
INSERT INTO INTERCAMBIO (id_us_comp, id_us_vend, id_pub, id_ub_origen, id_ub_destino, id_um, cantidad, costo_reembolso, fecha_sol, fecha_acept, fecha_comp, id_estado_inter) VALUES
(1, 2, 1, 1, 2, 1, 10.0000, 5.00, '2025-10-14', '2025-10-15', '2025-10-16', 1),
(2, 3, 2, 2, 3, 2, 0.0000, 10.00, '2025-10-14', '2025-10-14', '2025-10-13', 2), -- Debería fallar por CHECK fechas
(3, 1, 4, 3, 1, 1, -5.0000, 15.00, '2025-10-14', NULL, NULL, 3); -- Debería fallar por CHECK cantidad > 0

-- TRANSACCION
INSERT INTO TRANSACCION (id_us, id_us2, id_inter, cod_evento, fecha_trans, monto, id_estado_trans) VALUES
(1, 2, 1, NULL, '2025-10-14', 60.00, 1),
(2, 3, 2, NULL, '2025-10-14', -10.00, 2), -- Debería fallar por CHECK monto >= 0
(3, 1, 1, 1, '2025-10-14', 70.00, 3);

-- MOVIMIENTO
INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, descripcion, id_inter, id_compra) VALUES
(1, 1, 60.00, 'Movimiento 1', 1, NULL),
(2, 2, 0.00, 'Movimiento 2', 2, NULL), -- Debería fallar por CHECK cantidad > 0
(3, 3, 70.00, 'Movimiento 3', 1, 1);

-- ORIGEN_IMPACTO
INSERT INTO ORIGEN_IMPACTO (nombre, descripcion) VALUES
('Reciclaje', 'Impacto por reciclaje'),
('Energía', 'Uso de energía renovable'),
('Reciclaje', 'Duplicado'), -- Debería fallar por UNIQUE
('OrigenConNombreMuyLargoParaProbarLimiteDeCienCaracteresExcedido1234567890123456789012345678901234', 'Excede longitud'); -- Debería fallar por VARCHAR(100)

-- DIMENSION_IMPACTO
INSERT INTO DIMENSION_IMPACTO (nombre, descripcion) VALUES
('CO2', 'Emisiones de carbono'),
('Agua', 'Consumo de agua'),
('CO2', 'Duplicado'), -- Debería fallar por UNIQUE
('DimensiónConNombreMuyLargoParaProbarLimiteDeCienCaracteresExcedido1234567890123456789012345678901234', 'Excede longitud'); -- Debería fallar por VARCHAR(100)

-- DIMENSION_UNIDAD
INSERT INTO DIMENSION_UNIDAD (id_dim, id_um) VALUES
(1, 1),
(2, 2),
(1, 3); -- Válido

-- FACTOR_CONVERSION
INSERT INTO FACTOR_CONVERSION (id_dim, id_um_origen, id_um_dest, factor) VALUES
(1, 1, 2, 1.000000),
(2, 2, 3, 0.000000), -- Debería fallar por CHECK factor > 0
(1, 3, 1, 2.000000);

-- EVENTO_IMPACTO
INSERT INTO EVENTO_IMPACTO (id_us, id_origen_imp, categoria, creado_en, notas) VALUES
(1, 1, 'Reducción', '2025-10-14', 'Nota 1'),
(2, 2, 'Conservación', '2025-10-14', NULL),
(3, 1, 'Reciclaje', '2025-10-14', 'Nota 3');

-- EVENTO_IMPACTO_DETALLE
INSERT INTO EVENTO_IMPACTO_DETALLE (id_impacto, id_dim, valor, id_um) VALUES
(1, 1, 10.0000, 1),
(2, 2, -5.0000, 2), -- Debería fallar por CHECK valor >= 0
(3, 1, 15.0000, 3);

-- IMPACTO_MENSUAL
INSERT INTO IMPACTO_MENSUAL (ym, id_us, id_dim, categoria, valor_total, id_um) VALUES
('2025-10-01', 1, 1, 'Reducción', 10.0000, 1),
('2025-10-01', 2, 2, 'Conservación', -5.0000, 2), -- Debería fallar por CHECK valor_total >= 0
('2025-10-01', 3, 1, 'Reciclaje', 15.0000, 3);

-- RECOMPENSA
INSERT INTO RECOMPENSA (tipo, nombre, monto) VALUES
('Medalla', 'EcoLíder', 100.00),
('Insignia', 'EcoAmigo', -50.00), -- Debería fallar por CHECK monto >= 0
('Puntos', 'EcoPuntos', 200.00);

-- USUARIO_LOGRO
INSERT INTO USUARIO_LOGRO (id_us, id_rec, fecha_obtencion) VALUES
(1, 1, '2025-10-14'),
(2, 3, '2025-10-14'),
(3, 3, '2025-10-14');

-- REPORTE
INSERT INTO REPORTE (id_reportante, id_usuario_reportado, id_pub_reportada, motivo, id_estado_rep) VALUES
(1, 2, 1, 'Contenido inapropiado', 1),
(2, 3, 2, 'Fraude', 2),
(3, NULL, 4, 'Spam', 3);

-- BITACORA
INSERT INTO BITACORA (id_tipo_bit, id_us, entidad, id_entidad, accion, descripcion, ip) VALUES
(1, 1, 'Publicación', 1, 'Creación', 'Creó publicación', '192.168.1.1'),
(2, 2, 'Intercambio', 2, 'Aceptación', 'Aceptó intercambio', '192.168.1.2'),
(3, NULL, 'Sistema', NULL, 'Error', 'Error de sistema', '192.168.1.3');
