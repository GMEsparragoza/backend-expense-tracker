const {
    FRONT_API_URL = 'http://localhost:3000',
    JWT_SECRET_AUTH = '',
    JWT_SECRET_REFRESH = '',
    JWT_SECRET_2FA = '',
    PORT = '5000',
    DATABASE_URL = '',
    IMGUR_ID = '',
    EMAIL_USER = '',
    EMAIL_PASS = '',
} = process.env

module.exports = {
    FRONT_API_URL,
    JWT_SECRET_AUTH,
    JWT_SECRET_REFRESH,
    JWT_SECRET_2FA,
    PORT,
    DATABASE_URL,
    IMGUR_ID,
    EMAIL_USER,
    EMAIL_PASS,
};