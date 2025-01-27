const { createExpense, getExpensesByDate, updateDataExpense, deleteExpenseByID, getBalanceExpensesQuery } = require('../models/Expense');
const { createIncome, getIncomesByDate, updateDataIncome, deleteIncomeByID, getBalanceIncomesQuery } = require('../models/Income');

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

const updateIncome = async (req, res) => {
    const user = req.user;
    try {
        const { updateIncomeData } = req.body;
        const date = new Date(updateIncomeData.date).toISOString();
        const result = await updateDataIncome(updateIncomeData, date, user.id)
        return res.status(201).json({ message: 'Income updated', datos: result.rows[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update income' });
    }
}

const deleteIncome = async (req, res) => {
    const user = req.user;
    try {
        const { id } = req.body;
        await deleteIncomeByID(id, user.id)
        return res.status(201).json({ message: 'Income Deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete income' });
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

const updateExpense = async (req, res) => {
    const user = req.user;
    try {
        const { updateExpenseData } = req.body;
        const date = new Date(updateExpenseData.date).toISOString();
        const result = await updateDataExpense(updateExpenseData, date, user.id)
        return res.status(201).json({ message: 'Expense updated', datos: result.rows[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update expnse' });
    }
}

const deleteExpense = async (req, res) => {
    const user = req.user;
    try {
        const { id } = req.body;
        await deleteExpenseByID(id, user.id)
        return res.status(201).json({ message: 'Expense Deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete expense' });
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

module.exports = { AddNewTransaction, getIncomes, updateIncome, deleteIncome, getExpenses, updateExpense, deleteExpense, getSumaryData };