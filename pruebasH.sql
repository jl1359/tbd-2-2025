use truequeComercioCircular;
-- Nuevos datos para ROL
INSERT INTO ROL (nombre, descripcion) VALUES
('Admin', 'Administrador completo'),
('User', 'Usuario básico'),
('Guest', 'Invitado limitado'),
('Moderator', 'Moderador de contenido'),
('Admin', 'Duplicado para probar error'); -- Debería fallar por UNIQUE

-- Nuevos datos para ESTADO_PUBLICACION
INSERT INTO ESTADO_PUBLICACION (nombre, descripcion) VALUES
('Activo', 'Publicación visible'),
('Inactivo', NULL), -- Prueba descripción nula
('Pendiente', 'En revisión'),
('Eliminado', 'Borrado permanentemente'),
('ActivoLargoNombreParaProbarLimiteDe50', 'Descripción larga'); -- Nombre > 50, debería fallar

-- Nuevos datos para ESTADO_SERVICIO
INSERT INTO ESTADO_SERVICIO (nombre, descripcion) VALUES
('Disponible', 'Servicio listo'),
('Pausado', ''),
('Finalizado', 'Servicio completado'),
('Cancelado', 'Servicio anulado'),
('Disponible', 'Duplicado'); -- Debería fallar

-- Nuevos datos para ESTADO_PROMOCION
INSERT INTO ESTADO_PROMOCION (nombre, descripcion) VALUES
('Activa', 'Promoción en curso'),
('Expirada', 'Promoción terminada'),
('Planificada', 'Promoción futura'),
('Cancelada', 'Promoción cancelada'),
('Activa', 'Duplicado'); -- Fallo esperado

-- Nuevos datos para ESTADO_TRANSACCION
INSERT INTO ESTADO_TRANSACCION (nombre, descripcion) VALUES
('Pendiente', 'Transacción en espera'),
('Completada', 'Transacción finalizada'),
('Rechazada', 'Transacción denegada'),
('Anulada', 'Transacción cancelada'),
('Pendiente', 'Duplicado'); -- Fallo

-- Nuevos datos para ESTADO_REPORTE
INSERT INTO ESTADO_REPORTE (nombre, descripcion) VALUES
('Abierto', 'Reporte recibido'),
('Cerrado', 'Reporte resuelto'),
('En Revisión', 'Reporte en análisis'),
('Descartado', 'Reporte sin mérito'),
('Abierto#', 'Con carácter especial');

-- Nuevos datos para TIPO_MOVIMIENTO
INSERT INTO TIPO_MOVIMIENTO (nombre, descripcion) VALUES
('Ingreso', 'Aumento de saldo'),
('Egreso', 'Disminución de saldo'),
('Bloqueo', 'Retención temporal'),
('Liberación', 'Liberación de retención'),
('Ingreso', 'Duplicado'); -- Fallo

-- Nuevos datos para TIPO_BITACORA
INSERT INTO TIPO_BITACORA (nombre, descripcion) VALUES
('Seguridad', 'Accesos y seguridad'),
('Negocio', 'Operaciones de negocio'),
('Sistema', 'Eventos del sistema'),
('Auditoria', 'Registros de auditoría'),
('Seguridad', 'Duplicado'); -- Fallo

-- Nuevos datos para UNIDAD_MEDIDA
INSERT INTO UNIDAD_MEDIDA (nombre, simbolo) VALUES
('Litro', 'L'),
('Kilómetro', 'km'),
('Minuto', 'min'),
('Pieza', 'pz'),
('Litro', 'L'); -- Fallo por nombre y símbolo

-- Nuevos datos para USUARIO
INSERT INTO USUARIO (id_rol, nombre, apellido, email, telefono, direccion) VALUES
(1, 'Juan', 'Pérez', 'juan@email.com', '70000001', 'Calle 1'),
(2, 'María', 'López', 'maria@email.com', '70000002', 'Calle 2'),
(3, 'Pedro', 'García', 'pedro@email.com', '70000003', 'Calle 3'),
(99, 'Luis', 'Martínez', 'luis@email.com', '70000004', 'Calle 4'), -- Fallo por FK id_rol no existe
(1, 'Juan', 'Pérez', 'juan@email.com', '70000005', 'Calle 5'); -- Fallo por email duplicado

-- Nuevos datos para DETALLE_USUARIO
INSERT INTO DETALLE_USUARIO (id_us, cant_anuncios, ult_ingreso, likes, favoritos, denuncias, ventas) VALUES
(1, 3, '2025-10-14', 5, 2, 0, 1),
(2, 4, '2025-10-14', 7, 3, 1, 2),
(3, 2, '2025-10-14', -1, 1, 0, 0), -- Debería fallar si hay check en likes >= 0
(4, 5, '2025-10-14', 6, 4, 0, 3),
(5, 1, '2025-10-14', 2, 0, 0, 0);

-- Nuevos datos para ACCESO
INSERT INTO ACCESO (id_us, fecha_acc, exito, ip, agente) VALUES
(1, '2025-10-14', TRUE, '192.168.1.1', 'Chrome'),
(2, '2025-10-14', FALSE, 'invalid-ip', 'Firefox'), -- Debería funcionar
(3, '2025-10-14', TRUE, '192.168.1.3', 'Safari');

-- Nuevos datos para CONTRASENA
INSERT INTO CONTRASENA (id_us, hash) VALUES
(1, AES_ENCRYPT('pass1', 'key')),
(2, AES_ENCRYPT('pass2', 'key')),
(3, ''); -- Fallo por NOT NULL

-- Nuevos datos para BILLETERA
INSERT INTO BILLETERA (id_us, cuenta_bancaria, saldo) VALUES
(1, 'ACCT1', 100.00),
(2, 'ACCT2', -50.00); -- Fallo por check saldo >= 0

-- Nuevos datos para UBICACION
INSERT INTO UBICACION (direccion) VALUES
('Calle A'),
(''); -- Fallo por NOT NULL

-- Nuevos datos para ORGANIZACION
INSERT INTO ORGANIZACION (nombre, tipo, correo) VALUES
('Org1', 'ONG', 'org1@email.com'),
('Org1', 'Empresa', 'org2@email.com'); -- Fallo por UNIQUE nombre

-- Nuevos datos para EVENTO
INSERT INTO EVENTO (id_org, titulo, descripcion, fecha_ini, fecha_fin, lugar, precio, activo) VALUES
(1, 'Evento 1', 'Descripción 1', '2025-10-15', '2025-10-16', 'Lugar 1', 10.00, TRUE),
(2, 'Evento 2', 'Descripción 2', '2025-10-20', '2025-10-19', 'Lugar 2', 20.00, FALSE), -- Fallo por fecha_fin < fecha_ini
(3, 'Evento 3', 'Descripción 3', '2025-10-25', '2025-10-26', 'Lugar 3', -5.00, TRUE); -- Fallo por check precio >= 0

-- Nuevos datos para EVENTO_USUARIO
INSERT INTO EVENTO_USUARIO (cod_evento, id_us) VALUES
(1, 1),
(2, 2), -- Fallo si evento 2 no existe
(3, 3);

-- Nuevos datos para CATEGORIA_PRODUCTO
INSERT INTO CATEGORIA_PRODUCTO (nombre, descripcion) VALUES
('Cat1', 'Descripción 1'),
('Cat2', 'Descripción 2'),
('Cat1', 'Duplicado'); -- Fallo por UNIQUE

-- Nuevos datos para PRODUCTO
INSERT INTO PRODUCTO (id_cat_prod, id_subcat_prod, nombre, descripcion, precio, peso) VALUES
(1, 1, 'Prod1', 'Descripción 1', 50.00, 2.0),
(2, 2, 'Prod2', 'Descripción 2', -10.00, 1.0), -- Fallo por check precio >= 0
(3, 3, 'Prod3', 'Descripción 3', 30.00, -1.0); -- Fallo por check peso >= 0

-- Nuevos datos para CATEGORIA_SERVICIO
INSERT INTO CATEGORIA_SERVICIO (nombre, descripcion) VALUES
('ServCat1', 'Descripción 1'),
('ServCat2', 'Descripción 2'),
('ServCat1', 'Duplicado'); -- Fallo

-- Nuevos datos para SERVICIO
INSERT INTO SERVICIO (id_cat_serv, id_us, nombre, descripcion, precio, duracion_min, id_estado_serv) VALUES
(1, 1, 'Serv1', 'Descripción 1', 40.00, 60, 1),
(2, 2, 'Serv2', 'Descripción 2', -20.00, 30, 2), -- Fallo por check precio >= 0
(3, 3, 'Serv3', 'Descripción 3', 50.00, -10, 3); -- Fallo por check duracion_min >= 0

-- Nuevos datos para PUBLICACION
INSERT INTO PUBLICACION (id_us, id_ub, id_estado_pub, titulo, descripcion, valor_creditos) VALUES
(1, 1, 1, 'Pub1', 'Descripción 1', 60.00),
(2, 2, 2, 'Pub2', 'Descripción 2', -5.00), -- Fallo por check valor_creditos >= 0
(3, 3, 3, 'Pub3', 'Descripción 3', 70.00);

-- Nuevos datos para PUBLICACION_PRODUCTO
INSERT INTO PUBLICACION_PRODUCTO (id_pub, id_prod, cantidad, id_um) VALUES
(1, 1, 2, 1),
(2, 2, 0, 2), -- Fallo por check cantidad > 0
(3, 3, 1, 3);

-- Nuevos datos para PUBLICACION_SERVICIO
INSERT INTO PUBLICACION_SERVICIO (id_pub, id_serv, horario) VALUES
(1, 1, 'L-V 09:00-17:00'),
(2, 2, ''), -- Fallo por NOT NULL
(3, 3, 'S-D 10:00-18:00');

-- Nuevos datos para POTENCIADOR
INSERT INTO POTENCIADOR (id_us, id_pub, nombre, precio, duracion_dias, fecha_inicio, fecha_fin) VALUES
(1, 1, 'Boost', 15.00, 5, '2025-10-14', '2025-10-19'),
(2, 2, 'Highlight', -10.00, 3, '2025-10-15', '2025-10-17'), -- Fallo por check precio >= 0
(3, 3, 'Top', 20.00, 0, '2025-10-16', '2025-10-20'); -- Fallo por check duracion_dias > 0

-- Nuevos datos para PROMOCION
INSERT INTO PROMOCION (titulo, descripcion, fecha_ini, fecha_fin, banner, descuento, id_estado_prom) VALUES
('Promo1', 'Descuento 1', '2025-10-15', '2025-10-20', NULL, 10.00, 1),
('Promo2', 'Descuento 2', '2025-10-25', '2025-10-20', NULL, 15.00, 2), -- Fallo por fecha_fin < fecha_ini
('Promo3', 'Descuento 3', '2025-10-30', '2025-11-05', NULL, 101.00, 3); -- Fallo por check descuento <= 100

-- Nuevos datos para PROMOCION_PRODUCTO
INSERT INTO PROMOCION_PRODUCTO (id_prom, id_prod) VALUES
(1, 1),
(2, 2), -- Fallo si promo2 no existe
(3, 3);

-- Nuevos datos para PROMOCION_SERVICIO
INSERT INTO PROMOCION_SERVICIO (id_prom, id_serv) VALUES
(1, 1),
(2, 2), -- Fallo
(3, 3);

-- Nuevos datos para PAQUETE_CREDITO
INSERT INTO PAQUETE_CREDITO (nombre, cantidad_creditos, precio) VALUES
('Basic', 100, 50.00),
('Standard', 200, -10.00), -- Fallo por check precio >= 0
('Premium', 500, 200.00);

-- Nuevos datos para COMPRA_CREDITO
INSERT INTO COMPRA_CREDITO (id_us, id_paquete, creditos, monto, proveedor, referencia) VALUES
(1, 1, 100, 50.00, 'Stripe', 'REF001'),
(2, 2, 200, -20.00, 'PayPal', 'REF002'), -- Fallo por check monto >= 0
(3, 3, 500, 200.00, 'Stripe', 'REF003');

-- Nuevos datos para INTERCAMBIO
INSERT INTO INTERCAMBIO (id_us_comp, id_us_vend, id_pub, id_ub_origen, id_ub_destino, id_um, costo_reembolso, fecha_acept) VALUES
(1, 2, 1, 1, 2, 1, 10.00, '2025-10-14'),
(2, 3, 2, 2, 3, 2, -5.00, '2025-10-14'), -- Fallo por check costo_reembolso >= 0
(3, 4, 3, 3, 4, 3, 15.00, '2025-10-14');

-- Nuevos datos para TRANSACCION
INSERT INTO TRANSACCION (id_us, id_us2, id_inter, monto, id_estado_trans) VALUES
(1, 2, 1, 60.00, 1),
(2, 3, 2, -10.00, 2), -- Fallo por check monto >= 0
(3, 4, 3, 70.00, 3);

-- Nuevos datos para MOVIMIENTO
INSERT INTO MOVIMIENTO (id_us, id_tipo_mov, cantidad, descripcion, id_inter) VALUES
(1, 1, 60.00, 'Movimiento 1', 1),
(2, 2, 0.00, 'Movimiento 2', 2), -- Fallo por check cantidad > 0
(3, 3, 70.00, 'Movimiento 3', 3);

-- Nuevos datos para ORIGEN_IMPACTO
INSERT INTO ORIGEN_IMPACTO (nombre, descripcion) VALUES
('Origen1', 'Descripción 1'),
('Origen2', 'Descripción 2'),
('Origen1', 'Duplicado'); -- Fallo

-- Nuevos datos para DIMENSION_IMPACTO
INSERT INTO DIMENSION_IMPACTO (nombre, descripcion) VALUES
('Dim1', 'Descripción 1'),
('Dim2', 'Descripción 2'),
('Dim1', 'Duplicado'); -- Fallo

-- Nuevos datos para DIMENSION_UNIDAD
INSERT INTO DIMENSION_UNIDAD (id_dim, id_um) VALUES
(1, 1),
(2, 2),
(1, 2); -- Debería funcionar si no hay UNIQUE

-- Nuevos datos para FACTOR_CONVERSION
INSERT INTO FACTOR_CONVERSION (id_dim, id_um_origen, id_um_dest, factor) VALUES
(1, 1, 1, 1.0),
(2, 2, 2, 0.0), -- Fallo por check factor > 0
(1, 1, 2, 2.0);

-- Nuevos datos para EVENTO_IMPACTO
INSERT INTO EVENTO_IMPACTO (id_us, id_origen_imp, categoria, creado_en, notas) VALUES
(1, 1, 'Cat1', '2025-10-14', 'Nota 1'),
(2, 2, 'Cat2', '2025-10-14', NULL),
(3, 1, 'Cat3', '2025-10-14', 'Nota 3');

-- Nuevos datos para EVENTO_IMPACTO_DETALLE
INSERT INTO EVENTO_IMPACTO_DETALLE (id_impacto, id_dim, valor, id_um) VALUES
(1, 1, 10.0, 1),
(2, 2, -5.0, 2), -- Fallo por check valor >= 0
(3, 1, 15.0, 1);

-- Nuevos datos para IMPACTO_MENSUAL
INSERT INTO IMPACTO_MENSUAL (ym, id_us, id_dim, categoria, valor_total, id_um) VALUES
('2025-10-01', 1, 1, 'Cat1', 10.0, 1),
('2025-10-01', 2, 2, 'Cat2', -5.0, 2), -- Fallo
('2025-10-01', 3, 1, 'Cat3', 15.0, 1);

-- Nuevos datos para RECOMPENSA
INSERT INTO RECOMPENSA (tipo, nombre, monto) VALUES
('Tipo1', 'Recomp1', 100.00),
('Tipo2', 'Recomp2', -50.00), -- Fallo
('Tipo3', 'Recomp3', 200.00);

-- Nuevos datos para USUARIO_LOGRO
INSERT INTO USUARIO_LOGRO (id_us, id_rec, fecha_obtencion) VALUES
(1, 1, '2025-10-14'),
(2, 2, '2025-10-14'), -- Fallo si recomp2 no existe
(3, 3, '2025-10-14');

-- Nuevos datos para REPORTE
INSERT INTO REPORTE (id_reportante, id_usuario_reportado, id_pub_reportada, motivo, id_estado_rep) VALUES
(1, 2, 1, 'Motivo 1', 1),
(2, 3, 2, 'Motivo 2', 2),
(3, 4, 3, 'Motivo 3', 3);

-- Nuevos datos para BITACORA
INSERT INTO BITACORA (id_type_bit, id_us, entidad, id_entidad, accion, descripcion, ip) VALUES
(1, 1, 'Ent1', 1, 'Acc1', 'Desc1', '192.168.1.1'),
(2, 2, 'Ent2', 2, 'Acc2', 'Desc2', '192.168.1.2');