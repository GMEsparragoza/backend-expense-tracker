const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definición del modelo de Usuario
const User = sequelize.define('User', {
    // Definición de los campos del usuario
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profileImage: {
        type: DataTypes.STRING,  // O el tipo adecuado para el campo de la imagen
        allowNull: true,  // Permite que sea null al principio
    }
}, {
    // Opciones adicionales
    timestamps: true, // Agrega createdAt y updatedAt
    tableName: 'users', // Nombre de la tabla en la base de datos
});

// Exportar el modelo
module.exports = User;