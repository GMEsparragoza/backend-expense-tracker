const pool = require('../config/database');

// Función para crear un usuario
const createUser = async (username, email, password) => {
    try {
        const result = await pool.query(
            `INSERT INTO users (username, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, username, email`,
            [username, email, password]
        );
        return result.rows[0];  // Devuelve el usuario creado
    } catch (error) {
        throw new Error('Error al crear el usuario: ' + error.message);
    }
};

// Función para obtener un usuario por email
const getUserByEmail = async (email) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];  // Devuelve el primer usuario encontrado
    } catch (error) {
        throw new Error('Error al obtener el usuario: ' + error.message);
    }
};

module.exports = { createUser, getUserByEmail };