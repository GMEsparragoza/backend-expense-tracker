const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const verifyToken = require('../middleware/AuthMiddleware'); 

router.post('/addNewTransaction', verifyToken, TransactionController.AddNewTransaction);
router.get('/getIncomes', verifyToken, TransactionController.getIncomes);
router.get('/getExpenses', verifyToken, TransactionController.getExpenses);
router.get('/sumary-data', verifyToken, TransactionController.getSumaryData);
router.post('/updateIncome', verifyToken, TransactionController.updateIncome);
router.post('/deleteIncome', verifyToken, TransactionController.deleteIncome);
router.post('/updateExpense', verifyToken, TransactionController.updateExpense);
router.post('/deleteExpense', verifyToken, TransactionController.deleteExpense);

module.exports = router;