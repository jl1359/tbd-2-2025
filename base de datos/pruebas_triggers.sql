/* =========================================================
   SUITE DE VALIDACIÓN – Triggers, Procedimientos, Funciones
   BD: CreditosVerdes
   ========================================================= */

USE CreditosVerdes;

/* ---------------------------------------------------------
 0) Sanity check de tablas y datos base cargados
 --------------------------------------------------------- */
SELECT 'TABLAS_POBLADAS' AS check_name, t, c
FROM (
  SELECT 'ROL' t, COUNT(*) c FROM ROL UNION ALL
  SELECT 'UNIDAD_MEDIDA', COUNT(*) FROM UNIDAD_MEDIDA UNION ALL
  SELECT 'TIPO_MOVIMIENTO', COUNT(*) FROM TIPO_MOVIMIENTO UNION ALL
  SELECT 'USUARIO', COUNT(*) FROM USUARIO UNION ALL
  SELECT 'PUBLICACION', COUNT(*) FROM PUBLICACION UNION ALL
  SELECT 'INTERCAMBIO', COUNT(*) FROM INTERCAMBIO UNION ALL
  SELECT 'MOVIMIENTO', COUNT(*) FROM MOVIMIENTO UNION ALL
  SELECT 'DIMENSION_AMBIENTAL', COUNT(*) FROM DIMENSION_AMBIENTAL UNION ALL
  SELECT 'FACTOR_CONVERSION', COUNT(*) FROM FACTOR_CONVERSION UNION ALL
  SELECT 'EVENTO_AMBIENTAL', COUNT(*) FROM EVENTO_AMBIENTAL UNION ALL
  SELECT 'IMPACTO_MENSUAL', COUNT(*) FROM IMPACTO_MENSUAL
) z
ORDER BY t;
/* Intercambios y movimientos están definidos y poblados en tu script de pruebas;
   el saldo se calcula con signo IN/OUT desde TIPO_MOVIMIENTO. */

/* ---------------------------------------------------------
 1) Existencia de TRIGGERS esperados
    (ajusta la lista a los nombres que definiste)
 --------------------------------------------------------- */
SELECT 'TRIGGER_EXISTS' AS check_name, t.Trigger AS trigger_name,
       IF(t.Trigger IS NULL, 'FAIL','PASS') AS resultado
FROM (
  SELECT 'TRG_USUARIO_AFTER_INSERT_AUDIT' AS trg UNION ALL
  SELECT 'TRG_USUARIO_AFTER_UPDATE_ESTADO' UNION ALL
  SELECT 'TRG_ACCESO_AFTER_INSERT_LOGIN_LOG' UNION ALL
  SELECT 'TRG_CONTRASENA_AFTER_UPDATE_AUDIT' UNION ALL
  SELECT 'TRG_INTERCAMBIO_AFTER_INSERT_MOV' UNION ALL
  SELECT 'TRG_EVENTO_AMBIENTAL_AFTER_INS_UPD_IMPACTO'
) esperados
LEFT JOIN information_schema.TRIGGERS t
  ON t.TRIGGER_SCHEMA = DATABASE()
 AND t.TRIGGER_NAME = esperados.trg;

/* ---------------------------------------------------------
 2) Existencia de PROCEDIMIENTOS y FUNCIONES esperadas
    (ajusta nombres si usaste otros)
 --------------------------------------------------------- */
SELECT 'ROUTINE_EXISTS' AS check_name, ROUTINE_TYPE, ROUTINE_NAME,
       IF(ROUTINE_NAME IS NULL,'FAIL','PASS') AS resultado
FROM (
  SELECT 'PROCEDURE' tipo, 'sp_comprar_creditos' nombre UNION ALL
  SELECT 'PROCEDURE','sp_registrar_intercambio' UNION ALL
  SELECT 'PROCEDURE','sp_generar_reporte_mensual' UNION ALL
  SELECT 'FUNCTION','fn_verificar_saldo' UNION ALL
  SELECT 'FUNCTION','fn_calcular_CO2'
) req
LEFT JOIN information_schema.ROUTINES r
  ON r.ROUTINE_SCHEMA = DATABASE()
 AND r.ROUTINE_TYPE = req.tipo
 AND r.ROUTINE_NAME = req.nombre
ORDER BY ROUTINE_TYPE, ROUTINE_NAME;

/* =========================================================
 3) PRUEBAS DE TRIGGERS
 ========================================================= */

/* 3.1 TRG_USUARIO_AFTER_INSERT_AUDIT
   Esperado: crea BILLETERA y audita en BITACORA (tipo AUDITORIA)
*/
SET @id_us_nuevo := NULL;

START TRANSACTION;
INSERT INTO USUARIO (id_rol,nombre,apellido,email,telefono,direccion,activo)
VALUES (3,'Prueba','Trigger','prueba.trigger@cv.bo','70000000','Calle Test 123',1);

SET @id_us_nuevo := LAST_INSERT_ID();

SELECT 'TRG_USUARIO_AFTER_INSERT_AUDIT - BILLETERA' AS test,
       IF(EXISTS(SELECT 1 FROM BILLETERA WHERE id_us=@id_us_nuevo),
          'PASS','FAIL') AS resultado;

SELECT 'TRG_USUARIO_AFTER_INSERT_AUDIT - BITACORA' AS test,
       IF(EXISTS(
         SELECT 1
         FROM BITACORA b
         JOIN TIPO_BITACORA tb ON tb.id_tipo_bit=b.id_tipo_bit
         WHERE b.entidad='USUARIO' AND b.id_entidad=@id_us_nuevo
           AND tb.nombre IN ('AUDITORIA','USUARIO')
       ), 'PASS','FAIL') AS resultado;

ROLLBACK;

/* 3.2 TRG_ACCESO_AFTER_INSERT_LOGIN_LOG
   Esperado: insertar en ACCESO loguea en BITACORA (tipo ACCESO)
*/
START TRANSACTION;
INSERT INTO ACCESO (id_us, exito, ip, agente)
VALUES (1, 1, '10.10.10.10', 'Suite/Validator');

SELECT 'TRG_ACCESO_AFTER_INSERT_LOGIN_LOG - BITACORA' AS test,
       IF(EXISTS(
          SELECT 1 FROM BITACORA b
          JOIN TIPO_BITACORA tb ON tb.id_tipo_bit=b.id_tipo_bit
          WHERE b.entidad='ACCESO' AND b.id_entidad IS NOT NULL
            AND tb.nombre='ACCESO'
       ), 'PASS','FAIL') AS resultado;
ROLLBACK;

/* 3.3 TRG_USUARIO_AFTER_UPDATE_ESTADO
   Esperado: actualizar USUARIO.activo genera auditoría en BITACORA
*/
START TRANSACTION;
UPDATE USUARIO SET activo = 0 WHERE id_us = 1;
SELECT 'TRG_USUARIO_AFTER_UPDATE_ESTADO - BITACORA' AS test,
       IF(EXISTS(
          SELECT 1 FROM BITACORA
          WHERE entidad='USUARIO' AND id_entidad=1 AND accion LIKE '%ESTADO%'
       ), 'PASS','FAIL') AS resultado;
ROLLBACK;

/* 3.4 TRG_INTERCAMBIO_AFTER_INSERT_MOV
   Esperado: al insertar INTERCAMBIO, crea MOVIMIENTOS (IN para vendedor, OUT para comprador)
   Nota: tus tablas de INTERCAMBIO/MOVIMIENTO están definidas y sampleadas en pruebas.
*/
START TRANSACTION;
-- Preconteos
SELECT COUNT(*) INTO @mov_pre FROM MOVIMIENTO;

-- Inserta intercambio mínimo (usa una publicación real y usuarios existentes)
INSERT INTO INTERCAMBIO (id_us_comp,id_us_vend,id_pub,id_ub_origen,id_ub_destino,id_um,cantidad,estado)
VALUES (5,3,1,1,3,1,1,'ACEPTADO');

SELECT COUNT(*) INTO @mov_post FROM MOVIMIENTO;

SELECT 'TRG_INTERCAMBIO_AFTER_INSERT_MOV - CREA_MOVIMIENTOS' AS test,
       IF(@mov_post > @mov_pre, 'PASS','FAIL') AS resultado;

ROLLBACK;

/* =========================================================
 4) PRUEBAS DE PROCEDIMIENTOS
 ========================================================= */

/* 4.1 sp_comprar_creditos
   Esperado: agrega COMPRA_CREDITO y MOVIMIENTO tipo RECARGA (signo IN),
   afecta saldo del usuario en el agregado con TIPO_MOVIMIENTO.signo.
*/
START TRANSACTION;
SET @u := 5;
SELECT COALESCE(SUM(CASE tm.signo WHEN 'IN' THEN m.cantidad ELSE -m.cantidad END),0)
INTO @saldo_pre
FROM MOVIMIENTO m JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov=m.id_tipo_mov
WHERE m.id_us=@u;

-- Llama al SP (ajusta firma si difiere)
CALL sp_comprar_creditos(@u, 300.00, 'Tarjeta', 'TEST-001');

SELECT COALESCE(SUM(CASE tm.signo WHEN 'IN' THEN m.cantidad ELSE -m.cantidad END),0)
INTO @saldo_post
FROM MOVIMIENTO m JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov=m.id_tipo_mov
WHERE m.id_us=@u;

SELECT 'sp_comprar_creditos - SALDO_AUMENTA' AS test,
       IF(@saldo_post > @saldo_pre, 'PASS','FAIL') AS resultado;

-- Verifica enlace con COMPRA_CREDITO
SELECT 'sp_comprar_creditos - COMPRA_Y_MOVIMIENTO' AS test,
       IF(EXISTS(
         SELECT 1
         FROM COMPRA_CREDITO cc
         JOIN MOVIMIENTO m ON m.id_compra = cc.id_compra AND m.id_us=@u
       ), 'PASS','FAIL') AS resultado;
ROLLBACK;

/* 4.2 sp_registrar_intercambio
   Esperado: crea TRANSACCION, MOVIMIENTOS pareados IN/OUT y actualiza estado.
*/
START TRANSACTION;
CALL sp_registrar_intercambio(5, 3, 1, 1 /*cantidad*/);

SELECT 'sp_registrar_intercambio - TRANSACCION' AS test,
       IF(EXISTS(SELECT 1 FROM TRANSACCION ORDER BY id_trans DESC LIMIT 1),
          'PASS','FAIL') AS resultado;

SELECT 'sp_registrar_intercambio - MOV_IN_OUT' AS test,
       IF(EXISTS(
          SELECT 1
          FROM MOVIMIENTO mi
          JOIN MOVIMIENTO mo ON mi.id_inter=mo.id_inter
          JOIN TIPO_MOVIMIENTO tmi ON tmi.id_tipo_mov=mi.id_tipo_mov AND tmi.signo='IN'
          JOIN TIPO_MOVIMIENTO tmo ON tmo.id_tipo_mov=mo.id_tipo_mov AND tmo.signo='OUT'
          WHERE mi.id_us=3 AND mo.id_us=5
          ORDER BY mi.id_mov DESC LIMIT 1
       ), 'PASS','FAIL') AS resultado;
ROLLBACK;

/* 4.3 sp_generar_reporte_mensual
   Esperado: llena/actualiza IMPACTO_MENSUAL con sumas de EVENTO_AMBIENTAL.
*/
START TRANSACTION;
CALL sp_generar_reporte_mensual();

-- Sumar desde EVENTO_AMBIENTAL del mes actual y comparar con IMPACTO_MENSUAL
WITH ev AS (
  SELECT YEAR(creado_en) anio, MONTH(creado_en) mes, id_us, id_dim,
         ROUND(SUM(valor),6) AS valor_mes,
         ROUND(SUM(COALESCE(contaminacion_reducida,0)),6) AS cr_mes
  FROM EVENTO_AMBIENTAL
  WHERE creado_en >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
  GROUP BY YEAR(creado_en), MONTH(creado_en), id_us, id_dim
)
SELECT 'sp_generar_reporte_mensual - CONSISTENCIA' AS test,
       IF(COUNT(*)=0,'PASS','FAIL') AS resultado,
       SUM(ABS(im.valor_total-ev.valor_mes)) AS diff_valor_total,
       SUM(ABS(COALESCE(im.contaminacion_reducida_total,0)-COALESCE(ev.cr_mes,0))) AS diff_cr_total
FROM IMPACTO_MENSUAL im
JOIN ev ON ev.anio=im.anio AND ev.mes=im.mes
       AND ev.id_us=im.id_us AND ev.id_dim=im.id_dim;
ROLLBACK;

/* =========================================================
 5) PRUEBAS DE FUNCIONES
 ========================================================= */

/* 5.1 fn_verificar_saldo(usuario, monto) => 1/0 */
SELECT 'fn_verificar_saldo - TRUE'  AS test, fn_verificar_saldo(3, 50.00)  AS resultado;
SELECT 'fn_verificar_saldo - FALSE' AS test, fn_verificar_saldo(3, 99999) AS resultado;

/* 5.2 fn_calcular_CO2(categoria, cantidad)
   Si devuelve el equivalente en kg CO₂e, probar valores conocidos.
   (Ajusta la categoría/um si tu firma usa IDs o considera FACTOR_CONVERSION.)
*/
SELECT 'fn_calcular_CO2 - BASE' AS test, fn_calcular_CO2('PRODUCTO_REUTILIZADO', 2.0) AS kg_co2e_estimado;

/* =========================================================
 6) CONSULTAS DE CONSISTENCIA (cruces con tus datos de prueba)
 ========================================================= */

/* 6.1 Saldos por usuario con signo IN/OUT (debería cuadrar con tus inserts) */
SELECT u.id_us, u.nombre, u.apellido,
       SUM(CASE tm.signo WHEN 'IN' THEN m.cantidad ELSE -m.cantidad END) AS saldo
FROM USUARIO u
LEFT JOIN MOVIMIENTO m ON m.id_us = u.id_us
LEFT JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov = m.id_tipo_mov
GROUP BY u.id_us, u.nombre, u.apellido
ORDER BY saldo DESC;
/* Tus inserts muestran tipos y signos para calcular saldos:contentReference[oaicite:11]{index=11}. */

/* 6.2 Impacto ambiental corregido a nombres reales de columnas
      (contaminacion_reducida / contaminacion_reducida_total) */
-- Suma por usuario y dimensión desde EVENTO_AMBIENTAL
SELECT ea.id_us, u.nombre, u.apellido,
       d.codigo AS dimension, d.unidad_base,
       ROUND(SUM(ea.valor), 6) AS total_valor,
       ROUND(SUM(COALESCE(ea.contaminacion_reducida,0)), 6) AS total_cr_equiv
FROM EVENTO_AMBIENTAL ea
JOIN USUARIO u ON u.id_us = ea.id_us
JOIN DIMENSION_AMBIENTAL d ON d.id_dim = ea.id_dim
GROUP BY ea.id_us, u.nombre, u.apellido, d.codigo, d.unidad_base
ORDER BY ea.id_us, d.codigo;

-- Comparar mes actual (EV vs IMPACTO_MENSUAL)
WITH ev AS (
  SELECT YEAR(ea.creado_en) anio, MONTH(ea.creado_en) mes, ea.id_us, ea.id_dim,
         ROUND(SUM(ea.valor),6) AS valor_mes,
         ROUND(SUM(COALESCE(ea.contaminacion_reducida,0)),6) AS cr_mes
  FROM EVENTO_AMBIENTAL ea
  WHERE ea.creado_en >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
  GROUP BY YEAR(ea.creado_en), MONTH(ea.creado_en), ea.id_us, ea.id_dim
)
SELECT im.anio, im.mes, im.id_us, d.codigo AS dimension,
       im.valor_total, im.contaminacion_reducida_total,
       ev.valor_mes, ev.cr_mes,
       ROUND(im.valor_total-ev.valor_mes,6) AS diff_valor,
       ROUND(COALESCE(im.contaminacion_reducida_total,0)-COALESCE(ev.cr_mes,0),6) AS diff_cr
FROM IMPACTO_MENSUAL im
JOIN DIMENSION_AMBIENTAL d ON d.id_dim = im.id_dim
LEFT JOIN ev ON ev.anio=im.anio AND ev.mes=im.mes
           AND ev.id_us=im.id_us AND ev.id_dim=im.id_dim
ORDER BY im.id_us, dimension;
/* En schema: columnas con “contaminación reducida”. */

/* 6.3 Integridad de INTERCAMBIO/TRANSACCION/MOVIMIENTO */
-- Transacciones por intercambio (estructura definida en schema)
SELECT t.id_trans, t.id_inter, t.estado, t.monto,
       u1.email AS de_usuario, u2.email AS a_usuario, t.fecha_trans
FROM TRANSACCION t
JOIN USUARIO u1 ON u1.id_us = t.id_us
JOIN USUARIO u2 ON u2.id_us = t.id_us2
ORDER BY t.id_trans;

-- Movimientos enlazados a compras/intercambios válidos (no huérfanos)
SELECT m.*
FROM MOVIMIENTO m
LEFT JOIN USUARIO u ON u.id_us = m.id_us
LEFT JOIN TIPO_MOVIMIENTO tm ON tm.id_tipo_mov = m.id_tipo_mov
LEFT JOIN INTERCAMBIO i ON i.id_inter = m.id_inter
LEFT JOIN COMPRA_CREDITO cc ON cc.id_compra = m.id_compra
WHERE u.id_us IS NULL OR tm.id_tipo_mov IS NULL
   OR (m.id_inter IS NOT NULL AND i.id_inter IS NULL)
   OR (m.id_compra IS NOT NULL AND cc.id_compra IS NULL);
