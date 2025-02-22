const express = require('express');
const router = express.Router();
const {
    addProduct,
    getProducts,
    updateQuantity,
    updatePrices,
    getProductDetails
} = require('../controllers/productController');

// Add a new product
router.post('/', addProduct);

// Get product details
router.get('/details/:id', getProductDetails);

// Get all products for a specific store
router.get('/:store', getProducts);

// Update product quantity
router.patch('/:id/quantity', updateQuantity);

// Update product prices
router.patch('/:id/prices', updatePrices);

module.exports = router;
