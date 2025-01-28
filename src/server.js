const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const app = express();
const { PORT, FRONT_API_URL } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { mailer } = require('./controllers/mailController');

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: FRONT_API_URL, // Cambia a la URL de tu frontend
    credentials: true // Permite el envío de cookies
}));

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Manejo de rutas
app.use('/api', authRoutes);

app.use('/profiles', profileRoutes);

app.use('/transaction', transactionRoutes);

app.post('/api/mailer', mailer)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${PORT}`);
});