const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const app = express();
const { PORT, FRONT_API_URL } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middleware/AuthMiddleware');

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: FRONT_API_URL, // Cambia a la URL de tu frontend
    credentials: true // Permite el envío de cookies
}));

// Usar rutas de autenticación
app.use('/api', authRoutes);

// Ruta protegida para obtener los datos del perfil del usuario
app.use('/api/auth', verifyToken); // Aplicamos el middleware solo aquí
app.get('/api/auth', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'No estás autenticado' });
    }
    res.json({ message: 'Usuario Autenticado', user: req.user });
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('access_token'); // Eliminar la cookie del token
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});