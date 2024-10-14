const express = require('express');
const path = require('path');
const tmImage = require('@teachablemachine/image');
const { Image } = require('canvas'); // Para crear la imagen en Node.js

const app = express();
const port = 3000;

// Servir archivos estáticos desde el directorio raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Ruta del modelo Teachable Machine (ajústala a tu ruta)
const modelURL = 'http://localhost:3000/model/model.json';
const metadataURL = 'http://localhost:3000/model/metadata.json';

let model;

// Cargar el modelo al iniciar el servidor
tmImage.load(modelURL, metadataURL)
  .then((loadedModel) => {
    model = loadedModel;
    console.log('Modelo cargado exitosamente.');
  })
  .catch((error) => {
    console.error('Error al cargar el modelo:', error);
  });

// Ruta para analizar la imagen "prueba.jpg"
app.get('/api/predict', async (req, res) => {
  try {
    if (!model) {
      return res.status(500).json({ message: 'El modelo aún no está listo' });
    }

    // Ruta de la imagen "prueba.jpg" dentro de la carpeta uploads
    const imagePath = path.join(__dirname, 'uploads', 'prueba.jpg');
    const imgElement = new Image();

    imgElement.src = imagePath; // Cargar la imagen desde el archivo
    console.log('debugeando',imgElement)
    imgElement.onload = async () => {
      const predictions = await model.predict(imgElement);
        console.log(predictions)
      // Formatear los resultados
      const result = predictions.map((pred) => ({
        className: pred.className,
        probability: (pred.probability * 100).toFixed(2) + '%',
      }));

      res.json({ result });
    };

    imgElement.onerror = (err) => {
      console.error('Error al cargar la imagen:', err);
      res.status(500).json({ message: 'Error al cargar la imagen.' });
    };
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
