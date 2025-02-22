const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');

// Create a new sale
exports.createSale = async (req, res) => {
    try {
        const { items, store, paymentMethod, amountPaid, userId } = req.body;

        // Verify user exists and has access to the store
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'manager' && user.store !== store) {
            return res.status(403).json({ message: 'No access to this store' });
        }

        // Calculate totals and verify stock
        let totalUSD = 0;
        let totalLRD = 0;
        const saleItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }

            // Check if enough quantity is available
            if (product.currentQuantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient quantity for ${product.name}. Available: ${product.currentQuantity}`
                });
            }

            // Calculate item totals
            const itemTotalUSD = product.currentUsdPrice * item.quantity;
            const itemTotalLRD = product.currentLrdPrice * item.quantity;

            totalUSD += itemTotalUSD;
            totalLRD += itemTotalLRD;

            saleItems.push({
                product: product._id,
                quantity: item.quantity,
                pricePerUnit: {
                    usd: product.currentUsdPrice,
                    lrd: product.currentLrdPrice
                },
                totalAmount: {
                    usd: itemTotalUSD,
                    lrd: itemTotalLRD
                }
            });

            // Update product quantity and add to history
            product.currentQuantity -= item.quantity;
            product.quantityHistory.push({
                quantity: item.quantity,
                type: 'sale',
                date: new Date()
            });

            await product.save();
        }

        // Create the sale record
        const sale = new Sale({
            items: saleItems,
            store,
            totalAmount: {
                usd: totalUSD,
                lrd: totalLRD
            },
            paymentMethod,
            amountPaid,
            soldBy: userId
        });

        await sale.save();

        res.status(201).json(sale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get sales by store
exports.getSalesByStore = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const store = req.params.store;

        // Get all products for this store
        const products = await Product.find({ store });
        
        let salesData = [];
        let totalUsd = 0;
        let totalLrd = 0;

        // Process each product's price history
        for (const product of products) {
            const filteredHistory = product.priceHistory.filter(history => {
                const historyDate = new Date(history.date);
                if (startDate && endDate) {
                    return historyDate >= new Date(startDate) && historyDate <= new Date(endDate);
                }
                return true; // If no date range specified, include all history
            });

            // If there's history in the date range
            if (filteredHistory.length > 0) {
                const productSales = filteredHistory.map(history => ({
                    _id: history._id,
                    product: {
                        _id: product._id,
                        name: product.name,
                        images: product.images
                    },
                    saleDate: history.date,
                    totalAmount: {
                        usd: history.usdPrice,
                        lrd: history.lrdPrice
                    },
                    quantity: history.quantity || 1,
                    type: history.type || 'price_change'
                }));

                salesData = [...salesData, ...productSales];
                
                // Add to totals
                filteredHistory.forEach(history => {
                    totalUsd += history.usdPrice;
                    totalLrd += history.lrdPrice;
                });
            }
        }

        // Sort by date descending
        salesData.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));

        res.json({
            sales: salesData,
            totals: {
                usd: totalUsd,
                lrd: totalLrd
            },
            count: salesData.length
        });
    } catch (error) {
        console.error('Error in getSalesByStore:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get sale details
exports.getSaleDetails = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('items.product', 'name')
            .populate('soldBy', 'username');

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get daily sales report
exports.getDailySalesReport = async (req, res) => {
    try {
        const { store, date } = req.query;
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const sales = await Sale.find({
            store,
            saleDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate('items.product', 'name');

        // Calculate daily totals
        const dailyTotals = {
            usd: {
                total: 0,
                count: 0
            },
            lrd: {
                total: 0,
                count: 0
            }
        };

        sales.forEach(sale => {
            if (sale.paymentMethod === 'usd') {
                dailyTotals.usd.total += sale.amountPaid;
                dailyTotals.usd.count++;
            } else {
                dailyTotals.lrd.total += sale.amountPaid;
                dailyTotals.lrd.count++;
            }
        });

        res.json({
            date: startOfDay,
            salesCount: sales.length,
            dailyTotals,
            sales
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
