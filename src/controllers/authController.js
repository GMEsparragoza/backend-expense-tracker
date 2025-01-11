const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear el nuevo usuario
        await User.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

const signin = async (req, res) => {
    console.log('Iniciando proceso de inicio de sesión');  // Verifica que la ruta esté siendo alcanzada
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (!existingUser) {
            return res.status(400).json({ message: 'No se encontró un usuario con ese email' });
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Contraseña Incorrecta' });
        }

        const tokenPayLoad = {
            userId: existingUser.id,
            email: existingUser.email,
            username: existingUser.username,
        };

        const token = jwt.sign(tokenPayLoad, 'access_token', { expiresIn: '7d' });

        // Mostrar mensaje antes de guardar la cookie
        console.log('Token generado:', token);

        res.cookie('access_token', token, {
            httpOnly: true,       // Impide el acceso a la cookie desde JavaScript
            secure: false,        // Establecer en 'false' durante el desarrollo en local (sin HTTPS)
            sameSite: 'Lax',      // Protección contra CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // Expiración de 7 días
        });
        console.log("Cookie Creada");
        res.status(200).json({ message: 'Sesión iniciada correctamente', data: tokenPayLoad });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

module.exports = { signup, signin };