const { Sequelize } = require('sequelize');

// Conexión a la base de datos
const sequelize = new Sequelize('expense_tracker', 'root', '', {
    host: 'localhost',  // o la IP del servidor de la base de datos
    dialect: 'mysql',
});

module.exports = sequelize;