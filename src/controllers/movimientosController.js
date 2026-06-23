const pool = require("../config/db");

const obtenerMovimientos = async (req, res) => {
  try {
    const { fecha, vehiculo_id, motorista } = req.query;

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

    if (fecha) {
      query += " AND fecha = ?";
      params.push(fecha);
    }

    if (vehiculo_id) {
      query += " AND vehiculo_id = ?";
      params.push(vehiculo_id);
    }

    if (motorista) {
      query += " AND motorista LIKE ?";
      params.push(`%${motorista}%`);
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

    await pool.query(
      "CALL spMovimientos(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "ACTUALIZAR",
        id,
        vehiculo_id,
        motorista,
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