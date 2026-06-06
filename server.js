const express = require('express');
const fs = require('fs');
const path = require('path');

// Inicializar la aplicación de Express
const app = express();

// Middleware para parsear JSON en el body de las requests (para el POST)
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public' (frontend)
app.use(express.static('public'));

// Cargar variables de entorno de forma segura
try {
  process.loadEnvFile();
} catch (error) {
  // Ignorar error si el archivo .env no existe, ya que puede estar cargado por la terminal
}

// Obtener el puerto desde las variables de entorno. Usar 3000 como fallback si no está definido.
const PORT = process.env.PORT || 3000;

// Ruta absoluta al archivo de datos
const dataFilePath = path.join(__dirname, 'data', 'frutas.json');

/**
 * Endpoint GET /frutas
 * Lee el archivo data/frutas.json y retorna el arreglo de frutas con status 200.
 */
app.get('/frutas', (req, res) => {
  const contenido = fs.readFileSync(dataFilePath, 'utf-8');
  const frutas = JSON.parse(contenido);
  res.status(200).json(frutas);
});

/**
 * Endpoint GET /frutas/buscar
 * Filtra las frutas por el query param 'nombre' (case-insensitive).
 * IMPORTANTE: esta ruta va ANTES que GET /frutas/:id
 */
app.get('/frutas/buscar', (req, res) => {
  const nombre = req.query.nombre || '';
  const contenido = fs.readFileSync(dataFilePath, 'utf-8');
  const frutas = JSON.parse(contenido);
  const resultado = frutas.filter(f =>
    f.nombre.toLowerCase().includes(nombre.toLowerCase())
  );
  res.status(200).json(resultado);
});

/**
 * Endpoint GET /frutas/:id
 * Busca una fruta por su id. Retorna 200 si la encuentra, 404 si no.
 */
app.get('/frutas/:id', (req, res) => {
  const id = Number(req.params.id);
  const contenido = fs.readFileSync(dataFilePath, 'utf-8');
  const frutas = JSON.parse(contenido);
  const fruta = frutas.find(f => f.id === id);

  if (fruta) {
    res.status(200).json(fruta);
  } else {
    res.status(404).json({ error: 'Fruta no encontrada' });
  }
});

/**
 * Endpoint POST /frutas
 * Crea una nueva fruta con un ID autogenerado y la guarda en el archivo JSON.
 * Retorna la fruta creada con status 201.
 */
app.post('/frutas', (req, res) => {
  const { imagen, nombre, importe, stock } = req.body;
  const contenido = fs.readFileSync(dataFilePath, 'utf-8');
  const frutas = JSON.parse(contenido);

  const maxId = frutas.reduce((max, f) => (f.id > max ? f.id : max), 0);
  const nuevaFruta = { id: maxId + 1, imagen, nombre, importe, stock };

  frutas.push(nuevaFruta);
  fs.writeFileSync(dataFilePath, JSON.stringify(frutas, null, 2), 'utf-8');

  res.status(201).json(nuevaFruta);
});

// Iniciar el servidor
// IMPORTANTE: Exportamos el app para poder hacer los tests. No quitar esta condición.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Abre tu navegador en http://localhost:${PORT} para ver la interfaz web.`);
  });
}

module.exports = app;