const { JWT_SECRET } = require('../config/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail } = require('../models/User');

const signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await createUser(username, email, hashedPassword);  // null si no tiene imagen de perfil

        res.status(201).json({
            message: 'Usuario registrado con éxito'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            username: user.username,
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: false, // Solo en producción
            sameSite: 'None', // Asegúrate de que SameSite está configurado correctamente
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        res.status(200).json({
            message: 'Sesión iniciada correctamente',
            data: tokenPayload,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

const auth = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'No estás autenticado' });
        }
        // Obtener los datos completos del usuario por su email
        const user = await getUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Devolver solo los datos necesarios (por ejemplo, nombre, apellido)
        const userData = {
            username: user.username,
            email: user.email,
            name: user.name,
            lastName: user.lastname,
            imageLink: user.profile_image
        };
        res.json({
            message: 'Usuario Autenticado',
            user: userData
        });
    } catch (err) {
        // Manejo de errores en la obtención de datos
        console.error(err);
        res.status(500).json({ message: 'Error al obtener los datos del usuario', error: err });
    }
}

module.exports = { signup, signin, auth };