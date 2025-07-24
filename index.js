import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';

// Carga las variables de entorno del archivo .env al inicio
dotenv.config(); 

const app = express();
// Render asignará un puerto dinámicamente, por eso usamos process.env.PORT
const PORT = process.env.PORT || 3000;

console.log('Iniciando servidor Node.js...');
console.log(`Puerto configurado: ${PORT}`);
console.log(`Clave de API de Gemini cargada: ${process.env.GEMINI_API_KEY ? 'Sí' : 'No (revisar .env o Render variables)'}`);

// Configura CORS para permitir solicitudes desde tu dominio de Firebase
// ¡Es CRUCIAL que la URL 'origin' sea EXACTAMENTE la de tu Hosting de Firebase!
const allowedOrigin = 'https://chatbotproyectofinal.web.app';
console.log(`Configurando CORS para el origen: ${allowedOrigin}`);

app.use(cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Incluye OPTIONS para las solicitudes preflight
    allowedHeaders: ['Content-Type', 'Authorization'], // Permite los encabezados que tu API usa
    credentials: true // Permite el envío de cookies, encabezados de autorización, etc.
}));

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Middleware para loggear cada solicitud recibida
app.use((req, res, next) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);
    next(); // Pasa al siguiente middleware o ruta
});


// Inicializa la API de Gemini con tu clave de API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint para manejar las solicitudes de chata
app.post('/chat', async (req, res) => {
    console.log('Endpoint /chat alcanzado.');
    try {
        const { message } = req.body; // Extrae el mensaje del cuerpo de la solicitud
        console.log(`Mensaje recibido del frontend: "${message}"`);
        
        // Verifica si el mensaje está presente
        if (!message) {
            console.error('Error: Mensaje vacío en la solicitud.');
            return res.status(400).json({ error: 'Falta el mensaje en la solicitud.' });
        }

        // Obtiene el modelo de IA
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('Modelo Gemini 1.5 Flash obtenido.');
        
        // Genera contenido usando el mensaje del usuario
        const result = await model.generateContent(message);
        console.log('Contenido generado por Gemini.');
        
        // Obtiene la respuesta del modelo
        const response = await result.response;
        const text = response.text(); // Extrae el texto de la respuesta
        console.log(`Respuesta de Gemini: "${text}"`);

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
