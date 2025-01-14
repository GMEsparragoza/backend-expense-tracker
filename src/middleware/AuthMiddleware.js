const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/config')

const verifyToken = (req, res, next) => {
    const token = req.cookies ? req.cookies.access_token : null; // Acceder al token desde la cookie

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("No hay usuario Autenticado");
            return res.status(402).json({ message: 'Token no válido' });
        } 

        req.user = decoded; // Agregar la información del usuario al objeto de la solicitud
        next(); // Continúa a la siguiente función o ruta
    });
};

module.exports = verifyToken;