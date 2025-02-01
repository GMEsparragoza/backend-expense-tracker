const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const app = express();
const { PORT, FRONT_API_URL } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { mailer } = require('./controllers/mailController');
const rateLimit = require('express-rate-limit');

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: FRONT_API_URL, // Cambia a la URL de tu frontend
    credentials: true // Permite el envío de cookies
}));

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 Minuto
    max: 20, // Máximo de 100 peticiones por IP
    handler: (req, res) => {
        res.status(429).json({ error: "Too many requests, please try again later" });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Manejo de rutas
app.use('/api', apiLimiter, authRoutes);

app.use('/profiles', profileRoutes);

app.use('/transaction', transactionRoutes);

app.post('/api/mailer', mailer)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${PORT}`);
});