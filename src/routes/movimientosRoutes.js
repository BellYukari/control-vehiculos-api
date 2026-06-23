const express = require("express");

const {
  obtenerMovimientos,
  crearMovimiento,
  obtenerMovimientoPorId,
  actualizarMovimiento,
  eliminarMovimiento,
} = require("../controllers/movimientosController");

const router = express.Router();

router.get("/", obtenerMovimientos);
router.get("/:id", obtenerMovimientoPorId);
router.post("/", crearMovimiento);
router.put("/:id", actualizarMovimiento);
router.delete("/:id", eliminarMovimiento);

module.exports = router;