const pool = require('../config/database');

const createIncome = async (newIncome, user) => {
    try {
        const result = await pool.query(
            `INSERT INTO incomes (user_id, date, category, description, amount)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, date, category, description, amount`,
            [user.id, newIncome.date, newIncome.category, newIncome.description, newIncome.amount]
        );
        return result;
    }
    catch (error) {
        throw new Error('Error al añadir el Ingreso: ' + error.message);
    }
}

const getIncomesByDate = async (start, end, user) => {
    try {
        const result = await pool.query(
            `SELECT * FROM incomes
                WHERE user_id = $1
                AND date >= $2
                AND date <= $3`,
            [user.id, start, end]
        );
        return result;
    }
    catch (error) {
        throw new Error('Error al obtener los Ingresos: ' + error.message);
    }
}

const getBalanceIncomesQuery = async (start, end, user) => {
    try {
        const { rows } = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) AS totalIncome
            FROM incomes
            WHERE date BETWEEN $1 AND $2
            AND user_id = $3
        `, [start, end, user.id]);

        return rows[0]; // PostgreSQL devuelve los resultados en un array llamado rows
    } catch (error) {
        throw new Error('Error al obtener el total de Ingresos: ' + error.message);
    }
};

module.exports = { createIncome, getIncomesByDate, getBalanceIncomesQuery };