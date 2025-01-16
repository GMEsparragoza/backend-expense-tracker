const { JWT_SECRET_AUTH, JWT_SECRET_2FA } = require('../config/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail, getUserByUsername } = require('../models/User');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

// Generar código aleatorio de 6 dígitos
const generate2FACode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya esta registrado' });
        }

        const userUsed = await getUserByUsername(username);
        if (userUsed) {
            return res.status(401).json({ message: 'El nombre de usuario esta en uso' });
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

        // Verificar si el usuario tiene habilitada la verificación en dos pasos
        if (user.two_fa) {
            // Generar un código aleatorio de 6 dígitos
            const code = generate2FACode();

            const token = jwt.sign({ code }, JWT_SECRET_2FA, { expiresIn: '15m' });

            res.cookie('2fa_token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });

            try {
                const html = `
                    <h1>2FA code for your account:</h1>
                    <h3 style="color:rgb(181, 18, 18);"><b>${code}</b></h3>
                `;
                await sendEmail(email, 'Your 2FA Code', html);

            } catch (error) {
                console.error('Error sending email:', error);
            }

            // Responder indicando que se requiere el código de verificación
            return res.send({ message: 'Please enter the 2FA code sent to your email.', twoFARequired: true });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            username: user.username,
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET_AUTH, { expiresIn: '7d' });

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: true, // Solo en producción
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

const verify2FA = async (req, res) => {
    const { email, code } = req.body;

    // Recuperar el token de la cookie
    const token = req.cookies['2fa_token'];

    if (!token) {
        return res.status(400).send({ message: '2FA verification token is missing.' });
    }

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET_2FA);

        // Verificar si el código coincide
        if (decoded.code !== code) {
            return res.status(400).send({ message: 'Invalid 2FA code.' });
        }

        // Obtener la información del usuario
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        // Generar el token de sesión principal
        const tokenPayload = {
            id: user.id,
            email: user.email,
            username: user.username,
        };
        const sessionToken = jwt.sign(tokenPayload, JWT_SECRET_AUTH, { expiresIn: '7d' });

        // Configurar la cookie con el token de sesión
        res.cookie('access_token', sessionToken, {
            httpOnly: true,
            secure: true, // Solo en producción
            sameSite: 'None', // Configurar SameSite según tus necesidades
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        // Limpiar la cookie del token de 2FA
        res.clearCookie('2fa_token');

        res.send({ message: '2FA verification successful, session started.' });

    } catch (error) {
        return res.status(400).send({ message: 'Invalid or expired 2FA token.' });
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
            imageLink: user.profile_image,
            verified: user.verified,
            two_fa: user.two_fa
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

module.exports = { signup, signin, verify2FA, auth };