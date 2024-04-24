// Importando librerías
import express from "express";
import fs from "fs/promises";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

// Crea una instancia de Express
const app = express();
// Define el puerto en el que la aplicación escuchará
const port = 3000;

// Para manejar correctamente las rutas de archivos estáticos y __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para analizar cuerpos de solicitud en formato URL-encoded
app.use(express.urlencoded({ extended: true }));

// Ruta GET para la raíz del servidor, sirve el archivo index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Acumula a través de la ruta GET /agregar en un JSON
app.get("/agregar", async (req, res) => {
  const { nombre, precio } = req.query;
  const deporte = { nombre, precio };

  const data = JSON.parse(await fs.readFile("Deportes.json", "utf8"));
  const deportes = data.deportes;
  deportes.push(deporte);

  await fs.writeFile("Deportes.json", JSON.stringify(data, null, 2));

  res.send("Deporte agregado correctamente");
});

// Ruta GET/deportes que devuelve en formato JSON todos los deportes registrados
app.get("/deportes", (req, res) => {
  res.sendFile(path.join(__dirname, "Deportes.json"));
});

app.get("/deportes", async (req, res) => {
  const data = await axios.get(
    "http://localhost:3000/deportes",
    res.setHeader("Content-Type", "application/json")
  );
  await fs.writeFile("Deportes.json", JSON.stringify(data, null, 2));
  res.send();
});

// Edita los datos en un JSON a través de la ruta GET /editar
app.get("/editar", async (req, res) => {
  const { nombre, precio } = req.query;
  const data = JSON.parse(await fs.readFile("Deportes.json", "utf8"));
  // Busca y guarda los datos del deporte a editar
  const editDeporte = data.deportes.find(deporte => deporte.nombre === nombre);
    // Si encuentra el deporte a editar
    if (editDeporte) {
      editDeporte.precio = precio;
      await fs.writeFile("Deportes.json", JSON.stringify(data, null, 2));

      // Muestra el mensaje al usuario
      res.send("Datos editados correctamente");
    } else {
      res.status(500).send("Algo salió mal...");
    }
  });

// Elimina los datos en un JSON a través de la ruta GET /eliminar
app.get("/eliminar", async (req, res) => {
  const { nombre } = req.query;
  // Lee los datos en el archivo JSON
  const data = JSON.parse(await fs.readFile("Deportes.json", "utf8"));
  // Busca y guarda los datos del deporte a eliminar
  data.deportes = data.deportes.filter((deporte) => deporte.nombre !== nombre);

  // Escribe los datos en el archivo JSON
  await fs.writeFile("Deportes.json", JSON.stringify(data, null, 2));

  // Muestra el mensaje al usuario
  res.send("Deporte eliminado con éxito");
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(
    `Servidor escuchando en http://localhost:${port}, ${process.pid}`
  );
});

// Rutas genéricas
app.get("*", (req, res) => {
  res.send(
    "<center><h1 style=color:red>Esta página no existe... 👻 </h1><br><iframe src=https://giphy.com/embed/2A75RyXVzzSI2bx4Gj width= 480 height= 480 frameBorder=0 class=giphy-embed allowFullScreen></iframe><p><a href= https://giphy.com/gifs/hallmarkecards-cute-hallmark-shoebox-2A75RyXVzzSI2bx4Gj >via GIPHY</a></p></center>"
  );
});
