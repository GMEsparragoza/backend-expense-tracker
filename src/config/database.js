const {DATABASE_URL} = require('./config');

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: DATABASE_URL,  // Asegúrate de tener esta variable en .env
    ssl: { rejectUnauthorized: false },
});

// Verifica la conexión
pool.connect()
    .then(() => console.log('Conexión a la base de datos PostgreSQL exitosa'))
    .catch(err => console.error('Error al conectar a la base de datos: ', err.stack));

module.exports = pool;