const soloTextoSeguro = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.-]+$/;
const soloNombrePersona = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s.]+$/;
const placaValida = /^[A-Za-z0-9-]+$/;

const validarTexto = (valor) => {
  return typeof valor === "string" ? valor.trim() : "";
};

const validarVehiculoPayload = ({ marca, modelo, placa }) => {
  const marcaLimpia = validarTexto(marca);
  const modeloLimpio = validarTexto(modelo);
  const placaLimpia = validarTexto(placa).toUpperCase();

  if (!marcaLimpia) {
    return "La marca es obligatoria.";
  }

  if (marcaLimpia.length < 2) {
    return "La marca debe tener al menos 2 caracteres.";
  }

  if (marcaLimpia.length > 50) {
    return "La marca no puede tener más de 50 caracteres.";
  }

  if (!soloTextoSeguro.test(marcaLimpia)) {
    return "La marca solo puede contener letras, números, espacios, puntos o guiones.";
  }

  if (!modeloLimpio) {
    return "El modelo es obligatorio.";
  }

  if (modeloLimpio.length < 2) {
    return "El modelo debe tener al menos 2 caracteres.";
  }

  if (modeloLimpio.length > 50) {
    return "El modelo no puede tener más de 50 caracteres.";
  }

  if (!soloTextoSeguro.test(modeloLimpio)) {
    return "El modelo solo puede contener letras, números, espacios, puntos o guiones.";
  }

  if (!placaLimpia) {
    return "La placa es obligatoria.";
  }

  if (placaLimpia.includes(" ")) {
    return "La placa no debe contener espacios.";
  }

  if (placaLimpia.length < 5) {
    return "La placa debe tener al menos 5 caracteres.";
  }

  if (placaLimpia.length > 10) {
    return "La placa no puede tener más de 10 caracteres.";
  }

  if (!placaValida.test(placaLimpia)) {
    return "La placa solo puede contener letras, números y guiones.";
  }

  return "";
};

const validarMovimientoPayload = ({
  vehiculo_id,
  motorista,
  tipo_movimiento,
  fecha,
  hora,
  kilometraje,
  observaciones,
}) => {
  const motoristaLimpio = validarTexto(motorista);
  const observacionesLimpias = validarTexto(observaciones);

  const fechaActual = new Date().toISOString().split("T")[0];
  const horaActual = new Date().toTimeString().slice(0, 5);

  if (!vehiculo_id) {
    return "Debe seleccionar un vehículo.";
  }

  if (Number.isNaN(Number(vehiculo_id))) {
    return "El vehículo seleccionado no es válido.";
  }

  if (!motoristaLimpio) {
    return "El motorista es obligatorio.";
  }

  if (motoristaLimpio.length < 3) {
    return "El motorista debe tener al menos 3 caracteres.";
  }

  if (motoristaLimpio.length > 100) {
    return "El motorista no puede tener más de 100 caracteres.";
  }

  if (!soloNombrePersona.test(motoristaLimpio)) {
    return "El motorista solo puede contener letras, espacios, tildes, ñ y puntos.";
  }

  if (!tipo_movimiento) {
    return "Debe seleccionar el tipo de movimiento.";
  }

  if (!["Entrada", "Salida"].includes(tipo_movimiento)) {
    return "El tipo de movimiento debe ser Entrada o Salida.";
  }

  if (!fecha) {
    return "La fecha es obligatoria.";
  }

  if (fecha < fechaActual) {
  return "La fecha no puede ser pasada.";
}

if (!hora) {
  return "La hora es obligatoria.";
}

  if (kilometraje === "" || kilometraje === null || kilometraje === undefined) {
    return "El kilometraje es obligatorio.";
  }

  if (Number.isNaN(Number(kilometraje))) {
    return "El kilometraje debe ser un número válido.";
  }

  if (Number(kilometraje) < 0) {
    return "El kilometraje no puede ser negativo.";
  }

  if (Number(kilometraje) > 9999999) {
    return "El kilometraje no puede ser mayor a 9,999,999.";
  }

  if (observacionesLimpias.length > 255) {
    return "Las observaciones no pueden tener más de 255 caracteres.";
  }

  return "";
};

module.exports = {
  validarVehiculoPayload,
  validarMovimientoPayload,
};