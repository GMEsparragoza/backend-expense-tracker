const bcrypt = require('bcrypt');
const {
    getUserByEmail,
    getUserByUsername,
    getUserByID,
    updatePassword,
    updateInfoUser,
    updateImageUser,
    Enable2FAUser,
    Disable2FAUser
} = require('../models/User');
const { IMGUR_ID } = require('../config/config');
const axios = require('axios')
const { verifyUser2FA } = require('../middleware/2FAMiddleware');
const { JWT_SECRET_2FA } = require('../config/config');
const jwt = require('jsonwebtoken');

const changePassword = async (req, res) => {
    const { password, newPassword } = req.body;
    const tokenUser = req.user;
    try {
        const user = await getUserByID(tokenUser.id);
        if (!user) {
            return res.status(400).json({ message: 'No se encontro el usuario' });
        }

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Verificar si el usuario tiene habilitada la verificación en dos pasos
        if (user.two_fa) {
            // Invocar el middleware de 2FA
            return verifyUser2FA(req, res, user)
                .then(() => {
                    res.status(202).json({ message: 'Please enter the 2FA code sent to your email.', twoFARequired: true });
                })
                .catch((error) => {
                    res.status(500).json({ message: 'Error sending verification code', error });
                });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await updatePassword(user.id, hashedPassword);

        res.status(200).json({
            message: 'Password updated successfully',
            datosUser: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const confirmChangePassword2FA = async (req, res) => {
    const { newPassword, code } = req.body;
    const user = req.user;

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
            return res.status(401).send({ message: 'Incorrect code' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await updatePassword(user.id, hashedPassword);

        res.clearCookie('2fa_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        res.status(201).json({
            message: 'Password updated successfully',
            datosUser: result
        });
    } catch (error) {
        // Manejar errores específicos del token
        if (error.name === 'TokenExpiredError') {
            return res.status(402).json({ message: 'The 2FA token has expired. Please restart the process.' });
        }

        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const ResetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const existingUser = await getUserByEmail(email);
        if (!existingUser) {
            return res.status(400).json({ message: 'Email is not registered' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await updatePassword(existingUser.id, hashedPassword);

        res.status(201).json({
            message: 'Password updated successfully',
            datosUser: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const updateInfo = async (req, res) => {
    const { username, name, lastName } = req.body;
    const user = req.user;
    try {
        if (username) {
            const existsUser = await getUserByUsername(username);
            if (existsUser) {
                return res.status(402).json({ message: 'Este nombre de usuario esta en uso' });
            }
        }
        const userDataBase = await getUserByEmail(user.email);
        if (!userDataBase) {
            return res.status(400).json({ message: 'No se encontro el usuario' });
        }

        const result = await updateInfoUser(username, name, lastName, userDataBase.id);

        res.status(201).json({
            message: 'Datos del usuario actualizados con exito',
            datosUser: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
}

const uploadImage = async (req, res) => {
    const IMGUR_CLIENT_ID = IMGUR_ID;
    const user = req.user;
    try {
        if (!req.file) {
            console.error('No se recibió un archivo:', req.body);
            return res.status(400).json({ message: 'No se envió ninguna imagen.' });
        }

        const base64Image = req.file.buffer.toString('base64');
        const formData = new FormData();
        formData.append("image", base64Image);

        const response = await axios.post(
            'https://api.imgur.com/3/image', formData,
            {
                headers: {
                    Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
                }
            }
        );
        const linkImage = response.data.data.link;

        const result = await updateImageUser(user.email, linkImage)

        return res.status(200).json({
            link: linkImage,
            datosUser: result,
            message: 'Imagen subida exitosamente.',
        });

    } catch (error) {
        console.error('Error al subir la imagen:', error.response?.data || error.message);
        console.error('Error al subir la imagen:', {
            message: error.message,
            responseData: error.response?.data,
        });
        return res.status(500).json({
            message: 'Ocurrió un error al subir la imagen.',
            error: error.response?.data || error.message,
        });
    }
}

const enable2FA = async (req, res) => {
    const user = req.user;
    try {
        const result = await Enable2FAUser(user.id);
        return res.status(200).json({
            datosUser: result,
            message: 'Verificacion en dos pasos activada',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'An error occurred while activating 2FA.',
            error: error.response?.data?.message || error.response?.data || error.message,
        });
    }
}

const disable2FA = async (req, res) => {
    const user = req.user;
    try {
        if (user.id <= 0) {
            throw new Error('ID de usuario inválido');
        }
        const result = await Disable2FAUser(user.id);
        return res.status(200).json({
            datosUser: result,
            message: 'Verificacion en dos pasos desactivada',
        });
    } catch (error) {
        console.error('Error al desactivar 2FA:', {
            message: error.message,
            responseData: error.response?.data,
        });
        return res.status(500).json({
            message: 'Ocurrió un error al desactivar la 2FA.',
            error: error.response?.data || error.message,
        });
    }
}

const deleteAccount = async (req, res) => {
    const tokenUser = req.user;
    try {
        if (!tokenUser) {
            return res.status(401).json({ message: 'No estás autenticado' });
        }
        // Obtener los datos completos del usuario por su email
        const user = await getUserByEmail(req.user.email);
        if (!user) {
            return res.status(403).json({ message: 'Usuario no encontrado' });
        }
        if (user.two_fa) {
            return res.send({ message: 'Please enter the 2FA code sent to your email.', twoFARequired: true });
        }

        // Eliminar la cuenta del usuario
        await deleteUser(user.id);

        res.clearCookie('access_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        res.json({
            message: 'Cuenta eliminada con éxito'
        });
    } catch (err) {
        // Manejo de errores en la obtención de datos
        res.status(500).json({ message: 'Error deleting account', error: err });
    }
}

const confirmDeleteAccount = async (req, res) => {
    try {
        // Obtener los datos completos del usuario por su email
        const user = await getUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Eliminar la cuenta del usuario
        await deleteUser(user.id);

        res.clearCookie('access_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        res.status(200).json({
            message: 'The account was deleted successfully'
        });
    } catch (err) {
        // Manejo de errores en la obtención de datos
        console.error(err);
        res.status(500).json({ message: 'Error deleting account', error: err });
    }
}

module.exports = { changePassword, confirmChangePassword2FA, ResetPassword, updateInfo, uploadImage, enable2FA, disable2FA, deleteAccount, confirmDeleteAccount };