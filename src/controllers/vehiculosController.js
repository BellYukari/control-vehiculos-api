const pool = require("../config/db");
const { validarVehiculoPayload } = require("../utils/validaciones");

const obtenerVehiculos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        marca,
        modelo,
        placa,
        estado,
        estado_nombre,
        fecha_creacion
      FROM Vta_Vehiculos
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error al obtener vehículos:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener los vehículos",
    });
  }
};

const crearVehiculo = async (req, res) => {
  try {
    const { marca, modelo, placa } = req.body;
    const mensajeValidacion = validarVehiculoPayload(req.body);
    if (mensajeValidacion) {
      return res.status(400).json({
        success: false,
        message: mensajeValidacion,
      });
    }
    const [result] = await pool.query(
    "CALL spVehiculos(?, ?, ?, ?, ?, ?)",
    [
      "INSERTAR",
      null,
      marca.trim(),
      modelo.trim(),
      placa.trim().toUpperCase(),
      1,
    ]
  );

    res.status(201).json({
      success: true,
      message: "Vehículo creado correctamente",
      data: {
        id: result[0][0].id,
        marca,
        modelo,
        placa: placa.trim().toUpperCase(),
      },
    });
  } catch (error) {
    console.error("Error al crear vehículo:", error);

    res.status(400).json({
      success: false,
      message: error.sqlMessage || "Error al crear el vehículo",
    });
  }
};

const actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, modelo, placa, estado } = req.body;
    const mensajeValidacion = validarVehiculoPayload(req.body);

    if (mensajeValidacion) {
      return res.status(400).json({
        success: false,
        message: mensajeValidacion,
      });
    }

    await pool.query(
      "CALL spVehiculos(?, ?, ?, ?, ?, ?)",
      [
        "ACTUALIZAR",
        id,
        marca.trim(),
        modelo.trim(),
        placa.trim().toUpperCase(),
        estado ?? 1,
      ]
    );

    res.json({
      success: true,
      message: "Vehículo actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);

    res.status(400).json({
      success: false,
      message: error.sqlMessage || "Error al actualizar el vehículo",
    });
  }
};

const eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "CALL spVehiculos(?, ?, ?, ?, ?, ?)",
      ["ELIMINAR", id, null, null, null, null]
    );

    res.json({
      success: true,
      message: "Vehículo eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);

    res.status(400).json({
      success: false,
      message:
        error.sqlMessage ||
        "No se puede eliminar este vehículo porque tiene movimientos registrados",
    });
  }
};

module.exports = {
  obtenerVehiculos,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
};