const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const app = express();
const { PORT, FRONT_API_URL } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

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

app.use('/expense', expenseRoutes);

// Ruta para cerrar sesion del usuario
app.post('/api/logout', (req, res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    });
    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }); // Eliminar las cookies de los tokens de la Sesion
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${PORT}`);
});