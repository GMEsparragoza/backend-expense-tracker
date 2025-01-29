const {
    FRONT_API_URL = 'http://localhost:3000',
    JWT_SECRET_AUTH = 'access_token',
    JWT_SECRET_REFRESH = 'refresh_token',
    JWT_SECRET_2FA = 'JWT_SECRET_2FA',
    PORT = '5000',
    DATABASE_URL = 'postgresql://postgres.rkegjceuqiskoneismhs:Zeyn.expense-tracker@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    IMGUR_ID = 'a55a94cfef7bd4f',
    EMAIL_USER = 'gianm2405@gmail.com',
    EMAIL_PASS = 'qkgk jioo ivsf wlzp',
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