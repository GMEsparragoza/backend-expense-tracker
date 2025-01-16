const nodemailer = require('nodemailer')
const { EMAIL_USER, EMAIL_PASS } = require('../config/config')

const email = EMAIL_USER  // Tu correo de usuario
const pass = EMAIL_PASS;

const sendEmail = async (to, subject, html) => {
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

    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
}

module.exports = { sendEmail };