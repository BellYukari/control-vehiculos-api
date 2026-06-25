const pool = require("../config/db");
const { validarMovimientoPayload } = require("../utils/validaciones");

const obtenerMovimientos = async (req, res) => {
  try {
    const {
      fecha,
      fecha_inicio,
      fecha_fin,
      vehiculo_id,
      motorista,
      tipo_movimiento,
    } = req.query;

    let query = `
      SELECT 
        id,
        vehiculo_id,
        marca,
        modelo,
        placa,
        vehiculo,
        motorista,
        tipo_movimiento,
        fecha,
        hora,
        kilometraje,
        observaciones,
        fecha_creacion
      FROM Vta_Movimientos
      WHERE 1 = 1
    `;

    const params = [];

    // Mantiene compatibilidad con el filtro anterior por fecha exacta
    if (fecha) {
      query += " AND fecha = ?";
      params.push(fecha);
    }

    // Nuevo filtro por rango de fechas
    if (fecha_inicio && fecha_fin) {
      query += " AND fecha BETWEEN ? AND ?";
      params.push(fecha_inicio, fecha_fin);
    } else if (fecha_inicio) {
      query += " AND fecha >= ?";
      params.push(fecha_inicio);
    } else if (fecha_fin) {
      query += " AND fecha <= ?";
      params.push(fecha_fin);
    }

    if (vehiculo_id) {
      query += " AND vehiculo_id = ?";
      params.push(vehiculo_id);
    }

    if (motorista) {
      query += " AND motorista LIKE ?";
      params.push(`%${motorista}%`);
    }

    if (tipo_movimiento) {
      query += " AND tipo_movimiento = ?";
      params.push(tipo_movimiento);
    }

    query += " ORDER BY fecha DESC, hora DESC";

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error al obtener movimientos:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener los movimientos",
    });
  }
};

const validarVehiculoActivo = async (vehiculo_id) => {
  const [vehiculo] = await pool.query(
    "SELECT id, estado FROM vehiculos WHERE id = ?",
    [vehiculo_id]
  );

  if (vehiculo.length === 0) {
    return "El vehículo seleccionado no existe.";
  }

  if (Number(vehiculo[0].estado) !== 1) {
    return "No se pueden registrar movimientos para un vehículo inactivo.";
  }

  return "";
};

const validarKilometrajeNoMenorUltimo = async (
  vehiculo_id,
  kilometraje,
  movimientoIdActual = null
) => {
  let query = `
    SELECT kilometraje
    FROM movimientos
    WHERE vehiculo_id = ?
  `;

  const params = [vehiculo_id];

  if (movimientoIdActual) {
    query += " AND id <> ?";
    params.push(movimientoIdActual);
  }

  query += `
    ORDER BY fecha DESC, hora DESC, id DESC
    LIMIT 1
  `;

  const [ultimoMovimiento] = await pool.query(query, params);

  if (ultimoMovimiento.length === 0) {
    return "";
  }

  const ultimoKilometraje = Number(ultimoMovimiento[0].kilometraje);
  const nuevoKilometraje = Number(kilometraje);

  if (nuevoKilometraje < ultimoKilometraje) {
    return `El kilometraje no puede ser menor al último registrado para este vehículo: ${ultimoKilometraje}.`;
  }

  return "";
};

const crearMovimiento = async (req, res) => {
  try {
    const {
      vehiculo_id,
      motorista,
      tipo_movimiento,
      fecha,
      hora,
      kilometraje,
      observaciones,
    } = req.body;

    const mensajeValidacion = validarMovimientoPayload(req.body);
    if (mensajeValidacion) {
      return res.status(400).json({
        success: false,
        message: mensajeValidacion,
      });
    }

    const vehiculoActivo = await validarVehiculoActivo(vehiculo_id);
    if (vehiculoActivo) {
      return res.status(400).json({
        success: false,
        message: vehiculoActivo,
      });
    }

    const kilometrajeValido = await validarKilometrajeNoMenorUltimo(
      vehiculo_id,
      kilometraje
    );
    if (kilometrajeValido) {
      return res.status(400).json({
        success: false,
        message: kilometrajeValido,
      });
    }

    if (
      !vehiculo_id ||
      !motorista ||
      !tipo_movimiento ||
      !fecha ||
      !hora ||
      kilometraje === undefined ||
      kilometraje === null ||
      kilometraje === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vehículo, motorista, tipo de movimiento, fecha, hora y kilometraje son obligatorios",
      });
    }

    const [result] = await pool.query(
      "CALL spMovimientos(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "INSERTAR",
        null,
        vehiculo_id,
        motorista,
        tipo_movimiento,
        fecha,
        hora,
        kilometraje,
        observaciones || "",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Movimiento registrado correctamente",
      data: {
        id: result[0][0].id,
        vehiculo_id,
        motorista,
        tipo_movimiento,
        fecha,
        hora,
        kilometraje,
        observaciones,
      },
    });
  } catch (error) {
    console.error("Error al crear movimiento:", error);

    res.status(400).json({
      success: false,
      message: error.sqlMessage || "Error al registrar el movimiento",
    });
  }
};

const obtenerMovimientoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        vehiculo_id,
        marca,
        modelo,
        placa,
        vehiculo,
        motorista,
        tipo_movimiento,
        fecha,
        hora,
        kilometraje,
        observaciones,
        fecha_creacion
      FROM Vta_Movimientos
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Movimiento no encontrado",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error al obtener movimiento:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener el movimiento",
    });
  }
};

const actualizarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      vehiculo_id,
      motorista,
      tipo_movimiento,
      fecha,
      hora,
      kilometraje,
      observaciones,
    } = req.body;

    const mensajeValidacion = validarMovimientoPayload(req.body);
    if (mensajeValidacion) {
      return res.status(400).json({
        success: false,
        message: mensajeValidacion,
      });
    }

    const mensajeVehiculo = await validarVehiculoActivo(vehiculo_id);

    if (mensajeVehiculo) {
      return res.status(400).json({
        success: false,
        message: mensajeVehiculo,
      });
    }

    const mensajeKilometraje = await validarKilometrajeNoMenorUltimo(
      vehiculo_id,
      kilometraje,
      id
    );

    if (mensajeKilometraje) {
      return res.status(400).json({
        success: false,
        message: mensajeKilometraje,
      });
    }

    await pool.query(
      "CALL spMovimientos(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "ACTUALIZAR",
        id,
        vehiculo_id,
        motorista.trim(),
        tipo_movimiento,
        fecha,
        hora,
        kilometraje,
        observaciones || "",
      ]
    );

    res.json({
      success: true,
      message: "Movimiento actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar movimiento:", error);

    res.status(400).json({
      success: false,
      message: error.sqlMessage || "Error al actualizar el movimiento",
    });
  }
};

const eliminarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "CALL spMovimientos(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ["ELIMINAR", id, null, null, null, null, null, null, null]
    );

    res.json({
      success: true,
      message: "Movimiento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar movimiento:", error);

    res.status(400).json({
      success: false,
      message: error.sqlMessage || "Error al eliminar el movimiento",
    });
  }
};

module.exports = {
  obtenerMovimientos,
  crearMovimiento,
  obtenerMovimientoPorId,
  actualizarMovimiento,
  eliminarMovimiento,
};