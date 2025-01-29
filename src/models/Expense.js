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

const getExpensesByDate = async (user, start, end) => {
    if (!start && !end) {
        try {
            const result = await pool.query(
                `SELECT * FROM expenses
                    WHERE user_id = $1`,
                [user.id]
            );
            return result;
        }
        catch (error) {
            throw new Error('Error al obtener los Gastos: ' + error.message);
        }
    }
    else {
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
            throw new Error('Error al obtener los Gastos por fecha: ' + error.message);
        }
    }
}

const updateDataExpense = async (data, date, userID) => {
    try {
        const result = await pool.query(
            `UPDATE expenses
                SET amount = $1,
                    category = $2,
                    date = $3,
                    description = $4
                WHERE id = $5 AND user_id = $6 
                RETURNING id, date`,
            [data.amount, data.category, date, data.description, data.id, userID]
        );
        return result;
    }
    catch (error) {
        throw new Error('Error al Actualizar el Gasto: ' + error.message);
    }
}

const deleteExpenseByID = async (id, userID) => {
    try {
        await pool.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, userID]);
    } catch (error) {
        throw new Error('Error al eliminar el Gasto: ' + error.message);
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

module.exports = { createExpense, getExpensesByDate, updateDataExpense, deleteExpenseByID, getBalanceExpensesQuery };