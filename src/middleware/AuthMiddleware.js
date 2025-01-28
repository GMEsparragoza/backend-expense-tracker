const jwt = require('jsonwebtoken');
const { JWT_SECRET_AUTH, JWT_SECRET_REFRESH } = require('../config/config')

const verifyToken = (req, res, next) => {
    const token = req.cookies ? req.cookies.access_token : null;

    jwt.verify(token, JWT_SECRET_AUTH, (err, decoded) => {
        if (err) {
            const refreshToken = req.cookies ? req.cookies.refresh_token : null;
            console.log("No se encontro el access token")
            if (!refreshToken) {
                console.log("No se encontro el token de refresco")
                return res.status(401).json({ message: 'Debe autenticarse nuevamente' });
            }

            jwt.verify(refreshToken, JWT_SECRET_REFRESH, (err, decodedRefresh) => {
                if (err) {
                    return res.status(403).json({ message: 'Refresh Token no válido' });
                }
                console.log("Existe el token de refresco")
                const tokenPayload = {
                    id: decodedRefresh.id,
                    email: decodedRefresh.email,
                    username: decodedRefresh.username,
                };

                // Generate new Access Token
                const newAccessToken = jwt.sign(tokenPayload, JWT_SECRET_AUTH, { expiresIn: '15m' });
                // Optional: Refresh the Refresh Token
                const newRefreshToken = jwt.sign(tokenPayload, JWT_SECRET_REFRESH, { expiresIn: '7d' });
                console.log("Nuevos tokens creados")
                // Send new tokens in response or set them in cookies
                res.cookie('access_token', newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    maxAge: 15 * 60 * 1000 // 15 Minutos
                });
                res.cookie('refresh_token', newRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Dias
                });
                console.log("Nuevos tokens enviados a las cookies")

                req.user = decodedRefresh; // Optional: Use the refreshed token data
                next();
            });
        } else {
            console.log("El usuario esta correctamente autenticado");
            req.user = decoded;
            next();
        }
    });
};

module.exports = verifyToken;