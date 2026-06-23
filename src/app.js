const express = require("express");
const cors = require("cors");

const vehiculosRoutes = require("./routes/vehiculosRoutes");
const movimientosRoutes = require("./routes/movimientosRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API de Control de Vehículos funcionando correctamente",
  });
});

app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/movimientos", movimientosRoutes);
module.exports = app;