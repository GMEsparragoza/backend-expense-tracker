const nodemailer = require('nodemailer')
const { EMAIL_USER, EMAIL_PASS } = require('../config/config')

const email = EMAIL_USER  // Tu correo de usuario
const pass = EMAIL_PASS;

const mailer = async (req, res) => {
    const { to, subject, html } = await req.body; // Se recibe el correo, el asunto y el HTML del cuerpo del correo

    // Crear el transportador de correo utilizando nodemailer
    const transporter = nodemailer.createTransport({
        port: 465,
        secure: true, // upgrade later with STARTTLS
        service: 'gmail',
        auth: {
            user: email,
            pass,
        },
    });

    try {
        // Enviar el correo
        await transporter.sendMail({
            from: email, // El correo desde el cual se enviará
            to, // El correo al que se enviará
            subject, // El asunto del correo
            html, // El cuerpo del correo en formato HTML
        });

        res.status(201).json({
            message: 'Mail enviado con exito'
        });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({
            message: 'Error al enviar mail',
            error: error
        });
    }
}

module.exports = { mailer };