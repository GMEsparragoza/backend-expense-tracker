const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');
const verifyToken = require('../middleware/AuthMiddleware'); 

router.post('/addNewExpense', verifyToken, ExpenseController.AddNewExpense);
router.get('/getExpenses', verifyToken, ExpenseController.getExpenses);

module.exports = router;