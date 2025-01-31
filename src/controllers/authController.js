const { JWT_SECRET_AUTH, JWT_SECRET_REFRESH, JWT_SECRET_2FA } = require('../config/config');
const bcrypt = require('bcrypt');
const { verifyUser2FA } = require('../middleware/2FAMiddleware'); // Asegúrate de exportar la función verify2FA desde el middleware
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail, getUserByUsername, getUserByID } = require('../models/User');

const verifyDataNewUser = async (req, res) => {
    const { username, email } = req.body;
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'The email format is incorrect' });
        }

        const existingEmail = await getUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ message: 'The email is already registered' });
        }
        const userUsed = await getUserByUsername(username);
        if (userUsed) {
            return res.status(400).json({ message: 'The username is in use' });
        }
        return res.status(202).json({ message: 'Email sent with verification code' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
}

const signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        await createUser(username, email, hashedPassword);  // null si no tiene imagen de perfil

        res.status(201).json({
            message: 'Usuario registrado con éxito'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'The email format is incorrect' });
        }
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Email is not registered' });
        }
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Verificar si el usuario tiene habilitada la verificación en dos pasos
        if (user.two_fa) {
            // Invocar el middleware de 2FA
            return verifyUser2FA(req, res, user)
                .then(() => {
                    res.send({ message: 'Please enter the 2FA code sent to your email.', twoFARequired: true });
                })
                .catch((error) => {
                    res.status(500).json({ message: 'Error al enviar el código de verificación', error });
                });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            username: user.username,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET_AUTH, { expiresIn: '15m' });
        const refreshToken = jwt.sign(tokenPayload, JWT_SECRET_REFRESH, { expiresIn: '7d' });

        // Almacenar el token en una cookie
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 15 * 60 * 1000 // 15 Minutos
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Dias
        });

        res.json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
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
        if (decoded.code != code) {
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
        const sessionToken = jwt.sign(tokenPayload, JWT_SECRET_AUTH, { expiresIn: '15m' });
        const refreshToken = jwt.sign(tokenPayload, JWT_SECRET_REFRESH, { expiresIn: '7d' });

        // Configurar la cookie con el token de sesión
        res.cookie('access_token', sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 15 * 60 * 1000 // 15 Minutos
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Dias
        });

        // Limpiar la cookie del token de 2FA
        res.clearCookie('2fa_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        res.send({ message: '2FA verification successful, session started.' });

    } catch (error) {
        return res.status(400).send({ message: 'Invalid or expired 2FA token.' });
    }
};

const auth = async (req, res) => {
    const tokenUser = req.user;
    const accessToken = req.accessToken
    const refresh_token = req.refreshToken
    try {
        if (!tokenUser) {
            return res.status(401).json({ message: 'You are not authenticated' });
        }
        if (accessToken && refresh_token) {
            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 15 * 60 * 1000 // 15 Minutos
            });
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Dias
            });
        }
        // Obtener los datos completos del usuario por su id
        const user = await getUserByID(tokenUser.id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
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
            message: 'Authenticated User',
            user: userData
        });
    } catch (err) {
        // Manejo de errores en la obtención de datos
        console.error(err);
        res.status(500).json({ message: 'Error getting user data', error: err });
    }
}

const logOut = (req, res) => {
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
}

module.exports = { signup, signin, verify2FA, auth, verifyDataNewUser, logOut };