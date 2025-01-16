const bcrypt = require('bcrypt');
const { getUserByEmail, getUserByUsername, updatePassword, updateInfoUser, updateImageUser, update2FAUser } = require('../models/User');
const { IMGUR_ID } = require('../config/config');
const axios = require('axios')

const changePassword = async (req, res) => {
    const { password, newPassword } = req.body;
    const user = req.user;
    try {
        const existingUser = await getUserByEmail(user.email);
        if (!existingUser) {
            return res.status(400).json({ message: 'No se encontro el usuario' });
        }

        const passwordValid = await bcrypt.compare(password, existingUser.password);
        if (!passwordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await updatePassword(existingUser.id, hashedPassword);

        res.status(201).json({
            message: 'Contraseña actualizada con exito',
            datosUser: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

const ResetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const existingUser = await getUserByEmail(email);
        if (!existingUser) {
            return res.status(400).json({ message: 'No se encontro el usuario' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await updatePassword(existingUser.id, hashedPassword);

        res.status(201).json({
            message: 'Contraseña actualizada con exito',
            datosUser: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
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
        if (user.id <= 0) {
            throw new Error('ID de usuario inválido');
        }
        const result = await update2FAUser(user.id, true);
        return res.status(200).json({
            datosUser: result,
            message: 'Verificacion en dos pasos activada',
        });
    } catch (error) {
        console.error('Error al activar 2FA:', {
            message: error.message,
            responseData: error.response?.data,
        });
        return res.status(500).json({
            message: 'Ocurrió un error al activar la 2FA.',
            error: error.response?.data || error.message,
        });
    }
}

const disable2FA = async (req, res) => {
    const user = req.user;
    try {
        if (user.id <= 0) {
            throw new Error('ID de usuario inválido');
        }
        const result = await update2FAUser(user.id, false);
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

module.exports = { changePassword, ResetPassword, updateInfo, uploadImage, enable2FA, disable2FA };