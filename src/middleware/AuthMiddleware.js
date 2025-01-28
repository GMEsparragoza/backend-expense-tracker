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
                console.log("Access Token:", newAccessToken);
                console.log("Refresh Token:", newRefreshToken);
                // Send new tokens in response or set them in cookies
                res.setHeader('Set-Cookie', [
                    `access_token=${newAccessToken}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=900`,
                    `refresh_token=${newRefreshToken}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`,
                ]);
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