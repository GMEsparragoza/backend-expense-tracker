const { sendEmail } = require('../services/emailService');

const mailer = async (req, res) => {
    const { to, subject, html } = await req.body; // Se recibe el correo, el asunto y el HTML del cuerpo del correo

    try {
        await sendEmail(to, subject, html);
        res.status(201).json({
            message: 'Mail enviado con exito'
        });
    } catch (error) {
        console.error('Error interno al enviar el código:', error);
        res.status(500).json({
            message: 'Error al enviar mail',
            error: error
        });
    }
}

module.exports = { mailer };