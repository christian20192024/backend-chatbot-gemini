import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno del archivo .env

const app = express();
// Render asignará un puerto dinámicamente, por eso usamos process.env.PORT
const PORT = process.env.PORT || 3000;

// Configura CORS para permitir solicitudes desde tu dominio de Firebase
// Es crucial que la URL 'origin' sea exactamente la de tu Hosting de Firebase.
app.use(cors({
    origin: 'https://chatbotproyectofinal.web.app', // Tu dominio de Firebase
    methods: ['POST'], // Solo permitimos el método POST para el endpoint /chat
    allowedHeaders: ['Content-Type'], // Solo permitimos el encabezado Content-Type
}));

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Inicializa la API de Gemini con tu clave de API
// La clave se obtiene de las variables de entorno de Render (o del .env local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint para manejar las solicitudes de chat
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body; // Extrae el mensaje del cuerpo de la solicitud
        
        // Verifica si el mensaje está presente
        if (!message) {
            return res.status(400).json({ error: 'Falta el mensaje en la solicitud.' });
        }

        // Obtiene el modelo de IA
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Genera contenido usando el mensaje del usuario
        const result = await model.generateContent(message);
        
        // Obtiene la respuesta del modelo
        const response = await result.response;
        const text = response.text(); // Extrae el texto de la respuesta

        // Envía la respuesta de la IA de vuelta al frontend
        res.json({ response: text });
    } catch (error) {
        // Manejo de errores en caso de problemas con la API de Gemini
        console.error('Error al comunicarse con la API de Gemini:', error);
        res.status(500).json({ error: 'Error del servidor al procesar la solicitud. Por favor, revisa los logs del backend.' });
    }
});

// Inicia el servidor y lo pone a escuchar en el puerto definido
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
