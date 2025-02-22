const Product = require('../models/Product');

// Add a new product
const addProduct = async (req, res) => {
    try {
        const { name, quantity, store, usdPrice = 0, lrdPrice = 0 } = req.body;

        const product = new Product({
            name,
            currentQuantity: quantity,
            store,
            currentUsdPrice: usdPrice,
            currentLrdPrice: lrdPrice,
            quantityHistory: [{
                quantity,
                type: 'initial'
            }],
            priceHistory: usdPrice || lrdPrice ? [{
                usdPrice,
                lrdPrice
            }] : []
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all products for a specific store
const getProducts = async (req, res) => {
    try {
        const { store } = req.params;
        const products = await Product.find({ store });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update product quantity
const updateQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, type, usdPrice, lrdPrice } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update current quantity based on type
        if (type === 'addition') {
            product.currentQuantity += Number(quantity);
        } else if (type === 'sale' || type === 'subtraction') { // Handle both sale and subtraction
            if (product.currentQuantity < quantity) {
                return res.status(400).json({ error: 'Insufficient quantity' });
            }
            product.currentQuantity -= Number(quantity);

            // Update prices if this is a sale and prices are provided
            if (type === 'sale' && (usdPrice !== null || lrdPrice !== null)) {
                if (usdPrice !== null) {
                    product.currentUsdPrice = Number(usdPrice);
                }
                if (lrdPrice !== null) {
                    product.currentLrdPrice = Number(lrdPrice);
                }
                // Only add to price history if at least one price is provided
                product.priceHistory.push({
                    usdPrice: usdPrice !== null ? Number(usdPrice) : product.currentUsdPrice,
                    lrdPrice: lrdPrice !== null ? Number(lrdPrice) : product.currentLrdPrice,
                    date: new Date()
                });
            }
        }

        // Add to quantity history
        const historyEntry = {
            quantity: Number(quantity),
            type,
            date: new Date()
        };

        // Only add prices for sale type
        if (type === 'sale') {
            historyEntry.usdPrice = usdPrice !== null ? Number(usdPrice) : 0;
            historyEntry.lrdPrice = lrdPrice !== null ? Number(lrdPrice) : 0;
        }

        product.quantityHistory.push(historyEntry);

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(400).json({ error: error.message });
    }
};

// Update product prices
const updatePrices = async (req, res) => {
    try {
        const { id } = req.params;
        const { usdPrice, lrdPrice } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.currentUsdPrice = Number(usdPrice) || product.currentUsdPrice;
        product.currentLrdPrice = Number(lrdPrice) || product.currentLrdPrice;
        product.priceHistory.push({
            usdPrice: Number(usdPrice) || 0,
            lrdPrice: Number(lrdPrice) || 0,
            date: new Date()
        });

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get details for a specific product
const getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addProduct,
    getProducts,
    updateQuantity,
    updatePrices,
    getProductDetails
};
