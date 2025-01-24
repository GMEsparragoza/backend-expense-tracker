const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
const { JWT_SECRET_2FA } = require('../config/config');
const jwt = require('jsonwebtoken');

// Generar código aleatorio de 6 dígitos
const generate2FACode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const verifyUser2FA = (req, res, user) => {
    return new Promise((resolve, reject) => {
        if (user.two_fa) {
            // Generar un código aleatorio de 6 dígitos
            const code = generate2FACode();

            const token = jwt.sign({ code }, JWT_SECRET_2FA, { expiresIn: '15m' });

            res.cookie('2fa_token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 15 * 60 * 1000 // 15 Minutos
            });

            try {
                const html = `
                    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
                        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                            <h1 style="color: #333;">Código de Verificación de Dos Pasos</h1>
                            <p style="font-size: 16px; color: #555;">Hola,</p>
                            <p style="font-size: 16px; color: #555;">Se ha detectado un intento de inicio de sesión en tu cuenta. Por seguridad, hemos habilitado la verificación en dos pasos (2FA). Por favor, introduce el siguiente código para continuar con el inicio de sesión:</p>
                            <div style="margin: 20px 0; padding: 15px; background-color: #f8d7da; border-radius: 8px; color: #721c24; font-size: 24px; font-weight: bold;">
                                ${code}
                            </div>
                            <p style="font-size: 14px; color: #555;">Este código es válido por los próximos 15 minutos. Si no has intentado iniciar sesión, por favor ignora este correo.</p>
                            <p style="margin-top: 20px; font-size: 12px; color: #aaa;">Gracias por confiar en nosotros, <br>El equipo de Expense Tracker</p>
                        </div>
                    </div>
                `;

                // Usar la función sendEmail
                sendEmail(user.email, 'Código de Verificación de Dos Pasos', html)
                    .then(info => resolve(info))
                    .catch(error => reject(error));
            } catch (error) {
                reject(error);
            }
        } else {
            resolve();
        }
    });
};

module.exports = {
    verifyUser2FA,
};