# Control de Vehículos - API

API REST desarrollada con **Node.js**, **Express** y **MySQL** para la gestión de vehículos y movimientos de entrada/salida.

Este backend forma parte de una prueba técnica para desarrollador web. Permite registrar vehículos, administrar movimientos, consultar información filtrada y conectar la aplicación web desarrollada en React.

---

## Tecnologías utilizadas

* Node.js
* Express.js
* MySQL
* mysql2
* dotenv
* cors
* nodemon

---

## Requisitos previos

Antes de ejecutar el proyecto se necesita tener instalado:

* Node.js
* npm
* MySQL o XAMPP
* Git

---

## Instalación del proyecto

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO_API
```

Entrar a la carpeta del proyecto:

```bash
cd control-vehiculos-api
```

Instalar dependencias:

```bash
npm install
```

---

## Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como base el archivo `.env.example`.

Ejemplo:

```env
PORT=3001

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=control_vehiculos
DB_PORT=3306
```

---

## Configuración de la base de datos

El proyecto incluye un script SQL para crear la base de datos, tablas, vistas, procedimientos almacenados y datos de prueba.

Archivo:

```txt
database/control_vehiculos.sql
```

Para ejecutarlo:

1. Abrir phpMyAdmin o un cliente MySQL.
2. Ir a la sección SQL.
3. Ejecutar el contenido del archivo `control_vehiculos.sql`.
4. Confirmar que se cree la base de datos `control_vehiculos`.

---

## Ejecutar el servidor

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Por defecto la API se ejecuta en:

```txt
http://localhost:3001
```

---

## Endpoint principal

```http
GET /
```

Respuesta esperada:

```json
{
  "message": "API de Control de Vehículos funcionando correctamente"
}
```

---

# Endpoints de vehículos

## Obtener vehículos

```http
GET /api/vehiculos
```

Devuelve el listado de vehículos registrados.

---

## Crear vehículo

```http
POST /api/vehiculos
```

Body:

```json
{
  "marca": "Toyota",
  "modelo": "Hilux",
  "placa": "HAA1234"
}
```

---

## Actualizar vehículo

```http
PUT /api/vehiculos/:id
```

Body:

```json
{
  "marca": "Toyota",
  "modelo": "Hilux 2026",
  "placa": "HAA1234",
  "estado": 1
}
```

---

## Eliminar vehículo

```http
DELETE /api/vehiculos/:id
```

Si el vehículo no tiene movimientos, se elimina.
Si el vehículo ya tiene movimientos registrados, se marca como inactivo.

---

# Endpoints de movimientos

## Obtener movimientos

```http
GET /api/movimientos
```

Devuelve todos los movimientos registrados.

También permite filtros por query params:

```http
GET /api/movimientos?fecha_inicio=2026-06-01&fecha_fin=2026-06-30
```

```http
GET /api/movimientos?vehiculo_id=1
```

```http
GET /api/movimientos?motorista=Juan
```

```http
GET /api/movimientos?tipo_movimiento=Entrada
```

Los filtros se pueden combinar:

```http
GET /api/movimientos?fecha_inicio=2026-06-01&fecha_fin=2026-06-30&vehiculo_id=1&tipo_movimiento=Salida
```

---

## Obtener movimiento por ID

```http
GET /api/movimientos/:id
```

---

## Crear movimiento

```http
POST /api/movimientos
```

Body:

```json
{
  "vehiculo_id": 1,
  "motorista": "Juan Perez",
  "tipo_movimiento": "Entrada",
  "fecha": "2026-06-24",
  "hora": "08:30",
  "kilometraje": 15000,
  "observaciones": "Ingreso inicial del vehículo"
}
```

---

## Actualizar movimiento

```http
PUT /api/movimientos/:id
```

Body:

```json
{
  "vehiculo_id": 1,
  "motorista": "Juan Perez",
  "tipo_movimiento": "Salida",
  "fecha": "2026-06-25",
  "hora": "10:00",
  "kilometraje": 15200,
  "observaciones": "Salida para ruta asignada"
}
```

---

## Eliminar movimiento

```http
DELETE /api/movimientos/:id
```

---

# Validaciones principales

La API valida:

* Campos obligatorios.
* Longitud de marca, modelo, placa y motorista.
* Formato de placa.
* Formato de nombre del motorista.
* Tipo de movimiento permitido: `Entrada` o `Salida`.
* Fecha no pasada.
* Kilometraje numérico y no negativo.
* Kilometraje no menor al último registrado.
* Vehículo existente.
* Vehículo activo para registrar movimientos.
* Placa única.

---

# Estructura principal del proyecto

```txt
control-vehiculos-api/
├── database/
│   └── control_vehiculos.sql
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── vehiculosController.js
│   │   └── movimientosController.js
│   ├── routes/
│   │   ├── vehiculosRoutes.js
│   │   └── movimientosRoutes.js
│   ├── utils/
│   │   └── validaciones.js
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

---

# Autor

Desarrollado como parte de una prueba técnica para desarrollador web.
