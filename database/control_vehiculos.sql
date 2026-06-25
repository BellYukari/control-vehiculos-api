-- =========================================================
-- BASE DE DATOS: control_vehiculos
-- Proyecto: Prueba Técnica Desarrollador Web
-- Backend: Node.js + Express
-- Base de datos: MySQL
-- =========================================================

CREATE DATABASE IF NOT EXISTS control_vehiculos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE control_vehiculos;

-- =========================================================
-- LIMPIEZA DE OBJETOS
-- =========================================================

DROP VIEW IF EXISTS Vta_Movimientos;
DROP VIEW IF EXISTS Vta_Vehiculos;

DROP PROCEDURE IF EXISTS spMovimientos;
DROP PROCEDURE IF EXISTS spVehiculos;

DROP TABLE IF EXISTS movimientos;
DROP TABLE IF EXISTS vehiculos;

-- =========================================================
-- TABLA: vehiculos
-- =========================================================

CREATE TABLE vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    placa VARCHAR(20) NOT NULL UNIQUE,
    estado TINYINT NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLA: movimientos
-- =========================================================

CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    motorista VARCHAR(150) NOT NULL,
    tipo_movimiento ENUM('Entrada', 'Salida') NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    kilometraje DECIMAL(10,2) NOT NULL,
    observaciones VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimientos_vehiculos
        FOREIGN KEY (vehiculo_id)
        REFERENCES vehiculos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================================================
-- VISTA: Vta_Vehiculos
-- =========================================================

CREATE OR REPLACE VIEW Vta_Vehiculos AS
SELECT
    id,
    marca,
    modelo,
    placa,
    estado,
    CASE 
        WHEN estado = 1 THEN 'Activo'
        ELSE 'Inactivo'
    END AS estado_nombre,
    fecha_creacion,
    fecha_actualizacion
FROM vehiculos;

-- =========================================================
-- VISTA: Vta_Movimientos
-- =========================================================

CREATE OR REPLACE VIEW Vta_Movimientos AS
SELECT
    m.id,
    m.vehiculo_id,
    v.marca,
    v.modelo,
    v.placa,
    CONCAT(v.marca, ' ', v.modelo, ' - ', v.placa) AS vehiculo,
    m.motorista,
    m.tipo_movimiento,
    m.fecha,
    m.hora,
    m.kilometraje,
    m.observaciones,
    m.fecha_creacion,
    m.fecha_actualizacion
FROM movimientos m
INNER JOIN vehiculos v ON v.id = m.vehiculo_id;

-- =========================================================
-- PROCEDIMIENTO: spVehiculos
-- Opciones:
-- INSERTAR
-- ACTUALIZAR
-- ELIMINAR
-- =========================================================

DELIMITER $$

CREATE PROCEDURE spVehiculos(
    IN p_option VARCHAR(20),
    IN p_id INT,
    IN p_marca VARCHAR(100),
    IN p_modelo VARCHAR(100),
    IN p_placa VARCHAR(20),
    IN p_estado TINYINT
)
BEGIN
    IF p_option = 'INSERTAR' THEN

        IF p_marca IS NULL OR TRIM(p_marca) = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La marca es obligatoria.';
        END IF;

        IF p_modelo IS NULL OR TRIM(p_modelo) = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El modelo es obligatorio.';
        END IF;

        IF p_placa IS NULL OR TRIM(p_placa) = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La placa es obligatoria.';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM vehiculos
            WHERE placa = UPPER(TRIM(p_placa))
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ya existe un vehículo con esa placa.';
        END IF;

        INSERT INTO vehiculos (
            marca,
            modelo,
            placa,
            estado
        )
        VALUES (
            TRIM(p_marca),
            TRIM(p_modelo),
            UPPER(TRIM(p_placa)),
            IFNULL(p_estado, 1)
        );

        SELECT 
            LAST_INSERT_ID() AS id,
            'Vehículo registrado correctamente.' AS message;

    ELSEIF p_option = 'ACTUALIZAR' THEN

        IF p_id IS NULL OR p_id <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El ID del vehículo es obligatorio.';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM vehiculos
            WHERE id = p_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El vehículo no existe.';
        END IF;

        IF p_marca IS NULL OR TRIM(p_marca) = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La marca es obligatoria.';
        END IF;

        IF p_modelo IS NULL OR TRIM(p_modelo) = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El modelo es obligatorio.';
        END IF;

        IF p_placa IS NULL OR TRIM(p_placa) = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La placa es obligatoria.';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM vehiculos
            WHERE placa = UPPER(TRIM(p_placa))
            AND id <> p_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ya existe otro vehículo con esa placa.';
        END IF;

        UPDATE vehiculos
        SET
            marca = TRIM(p_marca),
            modelo = TRIM(p_modelo),
            placa = UPPER(TRIM(p_placa)),
            estado = IFNULL(p_estado, 1)
        WHERE id = p_id;

        SELECT 
            p_id AS id,
            'Vehículo actualizado correctamente.' AS message;

    ELSEIF p_option = 'ELIMINAR' THEN

        IF p_id IS NULL OR p_id <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El ID del vehículo es obligatorio.';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM vehiculos
            WHERE id = p_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El vehículo no existe.';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM movimientos
            WHERE vehiculo_id = p_id
        ) THEN
            UPDATE vehiculos
            SET estado = 0
            WHERE id = p_id;

            SELECT 
                p_id AS id,
                'El vehículo tiene movimientos registrados, por eso fue marcado como inactivo.' AS message;
        ELSE
            DELETE FROM vehiculos
            WHERE id = p_id;

            SELECT 
                p_id AS id,
                'Vehículo eliminado correctamente.' AS message;
        END IF;

    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Opción no válida para spVehiculos.';
    END IF;
END$$

DELIMITER ;

-- =========================================================
-- PROCEDIMIENTO: spMovimientos
-- Opciones:
-- INSERTAR
-- ACTUALIZAR
-- ELIMINAR
-- =========================================================

DELIMITER $$

CREATE PROCEDURE spMovimientos(
    IN p_option VARCHAR(20),
    IN p_id INT,
    IN p_vehiculo_id INT,
    IN p_motorista VARCHAR(150),
    IN p_tipo_movimiento VARCHAR(20),
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_kilometraje DECIMAL(10,2),
    IN p_observaciones VARCHAR(255)
)
BEGIN
    DECLARE v_estado_vehiculo TINYINT DEFAULT 0;
    DECLARE v_ultimo_kilometraje DECIMAL(10,2) DEFAULT NULL;

    IF p_option = 'INSERTAR' THEN

        IF p_vehiculo_id IS NULL OR p_vehiculo_id <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Debe seleccionar un vehículo.';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM vehiculos
            WHERE id = p_vehiculo_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El vehículo seleccionado no existe.';
        END IF;

        SELECT estado
        INTO v_estado_vehiculo
        FROM vehiculos
        WHERE id = p_vehiculo_id;

        IF v_estado_vehiculo <> 1 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se pueden registrar movimientos para un vehículo inactivo.';
        END IF;

        IF p_motorista IS NULL OR TRIM(p_motorista) = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El motorista es obligatorio.';
        END IF;

        IF p_tipo_movimiento NOT IN ('Entrada', 'Salida') THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El tipo de movimiento debe ser Entrada o Salida.';
        END IF;

        IF p_fecha IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La fecha es obligatoria.';
        END IF;

        IF p_fecha < CURDATE() THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La fecha no puede ser pasada.';
        END IF;

        IF p_hora IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La hora es obligatoria.';
        END IF;

        IF p_kilometraje IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El kilometraje es obligatorio.';
        END IF;

        IF p_kilometraje < 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El kilometraje no puede ser negativo.';
        END IF;

        SELECT kilometraje
        INTO v_ultimo_kilometraje
        FROM movimientos
        WHERE vehiculo_id = p_vehiculo_id
        ORDER BY fecha DESC, hora DESC, id DESC
        LIMIT 1;

        IF v_ultimo_kilometraje IS NOT NULL 
           AND p_kilometraje < v_ultimo_kilometraje THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El kilometraje no puede ser menor al último registrado para este vehículo.';
        END IF;

        INSERT INTO movimientos (
            vehiculo_id,
            motorista,
            tipo_movimiento,
            fecha,
            hora,
            kilometraje,
            observaciones
        )
        VALUES (
            p_vehiculo_id,
            TRIM(p_motorista),
            p_tipo_movimiento,
            p_fecha,
            p_hora,
            p_kilometraje,
            TRIM(IFNULL(p_observaciones, ''))
        );

        SELECT 
            LAST_INSERT_ID() AS id,
            'Movimiento registrado correctamente.' AS message;

    ELSEIF p_option = 'ACTUALIZAR' THEN

        IF p_id IS NULL OR p_id <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El ID del movimiento es obligatorio.';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM movimientos
            WHERE id = p_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El movimiento no existe.';
        END IF;

        IF p_vehiculo_id IS NULL OR p_vehiculo_id <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Debe seleccionar un vehículo.';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM vehiculos
            WHERE id = p_vehiculo_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El vehículo seleccionado no existe.';
        END IF;

        SELECT estado
        INTO v_estado_vehiculo
        FROM vehiculos
        WHERE id = p_vehiculo_id;

        IF v_estado_vehiculo <> 1 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se pueden registrar movimientos para un vehículo inactivo.';
        END IF;

        IF p_motorista IS NULL OR TRIM(p_motorista) = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El motorista es obligatorio.';
        END IF;

        IF p_tipo_movimiento NOT IN ('Entrada', 'Salida') THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El tipo de movimiento debe ser Entrada o Salida.';
        END IF;

        IF p_fecha IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La fecha es obligatoria.';
        END IF;

        IF p_fecha < CURDATE() THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La fecha no puede ser pasada.';
        END IF;

        IF p_hora IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La hora es obligatoria.';
        END IF;

        IF p_kilometraje IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El kilometraje es obligatorio.';
        END IF;

        IF p_kilometraje < 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El kilometraje no puede ser negativo.';
        END IF;

        SELECT kilometraje
        INTO v_ultimo_kilometraje
        FROM movimientos
        WHERE vehiculo_id = p_vehiculo_id
        AND id <> p_id
        ORDER BY fecha DESC, hora DESC, id DESC
        LIMIT 1;

        IF v_ultimo_kilometraje IS NOT NULL 
           AND p_kilometraje < v_ultimo_kilometraje THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El kilometraje no puede ser menor al último registrado para este vehículo.';
        END IF;

        UPDATE movimientos
        SET
            vehiculo_id = p_vehiculo_id,
            motorista = TRIM(p_motorista),
            tipo_movimiento = p_tipo_movimiento,
            fecha = p_fecha,
            hora = p_hora,
            kilometraje = p_kilometraje,
            observaciones = TRIM(IFNULL(p_observaciones, ''))
        WHERE id = p_id;

        SELECT 
            p_id AS id,
            'Movimiento actualizado correctamente.' AS message;

    ELSEIF p_option = 'ELIMINAR' THEN

        IF p_id IS NULL OR p_id <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El ID del movimiento es obligatorio.';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM movimientos
            WHERE id = p_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El movimiento no existe.';
        END IF;

        DELETE FROM movimientos
        WHERE id = p_id;

        SELECT 
            p_id AS id,
            'Movimiento eliminado correctamente.' AS message;

    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Opción no válida para spMovimientos.';
    END IF;
END$$

DELIMITER ;

-- =========================================================
-- DATOS DE PRUEBA
-- =========================================================

CALL spVehiculos('INSERTAR', NULL, 'Toyota', 'Hilux', 'HAA1234', 1);
CALL spVehiculos('INSERTAR', NULL, 'Honda', 'Civic', 'PBC4567', 1);
CALL spVehiculos('INSERTAR', NULL, 'Nissan', 'Frontier', 'NIS2026', 1);

CALL spMovimientos(
    'INSERTAR',
    NULL,
    1,
    'Juan Perez',
    'Entrada',
    CURDATE(),
    CURTIME(),
    15000,
    'Ingreso inicial del vehículo'
);

CALL spMovimientos(
    'INSERTAR',
    NULL,
    2,
    'Carlos Lopez',
    'Salida',
    CURDATE(),
    CURTIME(),
    22000,
    'Salida para ruta asignada'
);

CALL spMovimientos(
    'INSERTAR',
    NULL,
    3,
    'Maria Hernandez',
    'Entrada',
    DATE_ADD(CURDATE(), INTERVAL 1 DAY),
    '08:30:00',
    30000,
    'Movimiento programado'
);

-- =========================================================
-- CONSULTAS DE VERIFICACIÓN
-- =========================================================

SELECT * FROM Vta_Vehiculos;
SELECT * FROM Vta_Movimientos;