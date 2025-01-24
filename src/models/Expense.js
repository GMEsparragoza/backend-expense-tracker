const pool = require('../config/database');

const createExpense = async (newExpense, user) => {
    try {
        const result = await pool.query(
            `INSERT INTO expenses (user_id, date, category, description, amount)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, date, category, description, amount`,
            [user.id, newExpense.date, newExpense.category, newExpense.description, newExpense.amount]
        );
        return result;
    }
    catch (error) {
        throw new Error('Error al añadir el Gasto: ' + error.message);
    }
}

const getExpensesByDate = async (start, end, user) => {
    try {
        const result = await pool.query(
            `SELECT * FROM expenses
                WHERE user_id = $1
                AND date >= $2
                AND date <= $3`,
            [user.id, start, end]
        );
        return result;
    }
    catch (error) {
        throw new Error('Error al obtener los Gastos: ' + error.message);
    }
}

const getBalanceExpensesQuery = async (start, end, user) => {
    try {
        const { rows } = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) AS totalExpenses
            FROM expenses
            WHERE date BETWEEN $1 AND $2
            AND user_id = $3
        `, [start, end, user.id]);

        return rows[0]; // PostgreSQL devuelve los resultados en un array llamado rows
    } catch (error) {
        throw new Error('Error al obtener el total de Gastos: ' + error.message);
    }
};

module.exports = { createExpense, getExpensesByDate, getBalanceExpensesQuery };