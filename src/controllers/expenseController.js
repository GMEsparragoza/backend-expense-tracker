const { createExpense, getExpensesByDate } = require('../models/Expense');

const AddNewExpense = async (req, res) => {
    const user = req.user;
    try {
        const { date, category, description, amount } = req.body;
        const newExpense = {
            date,
            category,
            description,
            amount
        };
        const result = await createExpense(newExpense, user);
        if(!result) {
            return res.status(400).json({ message: 'Failed to add expense' });
        }
        res.status(201).json({ message: 'Expense added', datos: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to add expense', error: error.message });
    }
}

const getExpenses = async (req, res) => {
    const user = req.user;
    try {
        const { start, end } = req.query;
        const expenses = await getExpensesByDate(start, end, user);
        res.status(200).json(expenses.rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to get expenses', error: error.message });
    }
}

module.exports = { AddNewExpense, getExpenses };