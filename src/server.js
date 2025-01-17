const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const app = express();
const { PORT, FRONT_API_URL } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: FRONT_API_URL, // Cambia a la URL de tu frontend
    credentials: true // Permite el envío de cookies
}));

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Usar rutas de autenticación
app.use('/api', authRoutes);

// Ruta para cerrar sesion del usuario
app.post('/api/logout', (req, res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }); // Eliminar la cookie del token de la Sesion
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

// Usar rutas de Informacion
app.use('/profiles', profileRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${PORT}`);
});