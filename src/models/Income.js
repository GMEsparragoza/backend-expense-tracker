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
    if (!start && !end) {
        try {
            const result = await pool.query(
                `SELECT * FROM incomes
                    WHERE user_id = $1`,
                [user.id]
            );
            return result;
        }
        catch (error) {
            throw new Error('Error al obtener los Ingresos: ' + error.message);
        }
    }
    else {
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
            throw new Error('Error al obtener los Ingresos por fecha: ' + error.message);
        }
    }
}

const updateDataIncome = async (data, date, userID) => {
    try {
        const result = await pool.query(
            `UPDATE incomes
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
        throw new Error('Error al Actualizar el Ingreso: ' + error.message);
    }
}

const deleteIncomeByID = async (id, userID) => {
    try {
        await pool.query('DELETE FROM incomes WHERE id = $1 AND user_id = $2', [id, userID]);
    } catch (error) {
        throw new Error('Error al eliminar el Ingreso: ' + error.message);
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

module.exports = { createIncome, getIncomesByDate, updateDataIncome, deleteIncomeByID, getBalanceIncomesQuery };