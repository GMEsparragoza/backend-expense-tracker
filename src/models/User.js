const pool = require('../config/database');

// Función para crear un usuario
const createUser = async (username, email, password) => {
    try {
        const result = await pool.query(
            `INSERT INTO users (username, email, password, name, lastname)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, username, email`,
            [username, email, password, '', '']
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
}

// Función para obtener un usuario por email
const getUserByUsername = async (username) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        return result.rows[0];  // Devuelve el primer usuario encontrado
    } catch (error) {
        throw new Error('Error al obtener el usuario: ' + error.message);
    }
};

// Funcion para actualizar la contraseña del usuario
const updatePassword = async (userId, newPassword) => {
    try {
        const result = await pool.query(
            `UPDATE users
                SET password = $1
                WHERE id = $2
                RETURNING id, username, email`,
            [newPassword, userId]
        );
        if (result.rows.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        return result.rows[0]; // Devuelve el usuario actualizado
    } catch (error) {
        throw new Error('Error al actualizar la contraseña: ' + error.message);
    }
};

//Funcion para actualizar los datos del usuario
const updateInfoUser = async (username, name, lastName, userId) => {
    try {
        // Prepara los valores y las partes de la consulta dinámicamente
        const values = [];
        const setClauses = [];
        let setIndex = 1; // Índice para los parámetros

        // Agregar username si es proporcionado
        if (username) {
            setClauses.push(`username = $${setIndex}`);
            values.push(username);
            setIndex++;
        }
        // Agregar name si es proporcionado
        if (name) {
            setClauses.push(`name = $${setIndex}`);
            values.push(name);
            setIndex++;
        }
        // Agregar lastname si es proporcionado
        if (lastName) {
            setClauses.push(`lastname = $${setIndex}`);
            values.push(lastName);
            setIndex++;
        }

        // Crear la consulta SQL con las cláusulas dinámicas
        const query = `
            UPDATE users
            SET ${setClauses.join(', ')}
            WHERE id = $${setIndex}
            RETURNING id, username, email
        `;
        // Agregar el userId a los valores
        values.push(userId);

        // Ejecutar la consulta
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        return result.rows[0]; // Devuelve el usuario actualizado
    } catch (error) {
        throw new Error('Error al actualizar los datos del usuario: ' + error.message);
    }
};

const updateImageUser = async (email, imageLink) => {
    try {
        const result = await pool.query(
            `UPDATE users
                SET profile_image = $1
                WHERE email = $2
                RETURNING id, username, email`,
            [imageLink, email]
        );
        if (result.rows.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        return result.rows[0]; // Devuelve el usuario actualizado
    } catch (error) {
        throw new Error('Error al actualizar la Imagen del usuario: ' + error.message);
    }
}

module.exports = { createUser, getUserByEmail, getUserByUsername, updatePassword, updateInfoUser, updateImageUser };