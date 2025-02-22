const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// Create a new sale
router.post('/', saleController.createSale);

// Get sales by store with optional date range
router.get('/store/:store', saleController.getSalesByStore);

// Get sale details
router.get('/:id', saleController.getSaleDetails);

// Get daily sales report
router.get('/report/daily', saleController.getDailySalesReport);

module.exports = router;
