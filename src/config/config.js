const {
    FRONT_API_URL = 'http://localhost:3000',
    JWT_SECRET = 'access_token',
    PORT = '5000',
    DATABASE_URL = 'postgresql://postgres.rkegjceuqiskoneismhs:Zeyn.expense-tracker@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    IMGUR_ID = '',
    EMAIL_USER = '',
    EMAIL_PASS = '',
} = process.env

module.exports = {
    FRONT_API_URL,
    JWT_SECRET,
    PORT,
    DATABASE_URL,
    IMGUR_ID,
    EMAIL_USER,
    EMAIL_PASS,
};