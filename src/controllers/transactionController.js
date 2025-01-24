const { createExpense, getExpensesByDate, getBalanceExpensesQuery } = require('../models/Expense');
const { createIncome, getIncomesByDate, getBalanceIncomesQuery } = require('../models/Income');

const AddNewTransaction = async (req, res) => {
    const user = req.user;
    try {
        const { type, date, category, description, amount } = req.body;
        const newTransactionData = {
            date,
            category,
            description,
            amount
        };
        if (type === 'income') {
            const result = await createIncome(newTransactionData, user);
            if(!result) {
                return res.status(400).json({ message: 'Failed to add income' });
            }
            return res.status(201).json({ message: 'Income added', datos: result.rows[0] });
        }
        if (type === 'expense') {
            const result = await createExpense(newTransactionData, user);
            if(!result) {
                return res.status(400).json({ message: 'Failed to add expense' });
            }
            return res.status(201).json({ message: 'Expense added', datos: result.rows[0] });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to add Transaction', error: error.message });
    }
}

const getIncomes = async (req, res) => {
    const user = req.user;
    try {
        const { start, end } = req.query;
        const incomes = await getIncomesByDate(start, end, user);
        res.status(200).json(incomes.rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to get incomes', error: error.message });
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

const getSumaryData = async (req, res) => {
    const { start, end } = req.query;
    const user = req.user;
    if (!start || !end) {
        return res.status(400).json({ error: 'Se requiere un rango de fechas válido.' });
    }
    try {
        const incomeResult = await getBalanceIncomesQuery(start, end, user);
        const expensesResult = await getBalanceExpensesQuery(start, end, user);
        const balance = incomeResult.totalincome - expensesResult.totalexpenses;
        res.json({
            balance,
            totalIncome: incomeResult.totalincome,
            totalExpenses: expensesResult.totalexpenses,
        });
    } catch (err) {
        console.error('Error al obtener los datos del dashboard:', err);
        res.status(500).json({ error: 'Error al obtener los datos del dashboard.' });
    }
}

module.exports = { AddNewTransaction, getIncomes, getExpenses, getSumaryData };