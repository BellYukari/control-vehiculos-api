const express = require("express");

const {
  obtenerVehiculos,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
} = require("../controllers/vehiculosController");

const router = express.Router();

router.get("/", obtenerVehiculos);
router.post("/", crearVehiculo);
router.put("/:id", actualizarVehiculo);
router.delete("/:id", eliminarVehiculo);

module.exports = router;