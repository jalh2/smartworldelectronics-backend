const Product = require('../models/Product');
const fs = require('fs').promises;
const path = require('path');

// Upload images for a product
exports.uploadImages = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            // Delete uploaded files if product not found
            await Promise.all(req.files.map(file => 
                fs.unlink(file.path)
            ));
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add new images to product
        const newImages = req.files.map(file => ({
            filename: file.filename,
            path: `/uploads/${file.filename}` // Use relative path for storage
        }));

        product.images = [...product.images, ...newImages];
        await product.save();

        res.json({
            message: 'Images uploaded successfully',
            images: newImages
        });
    } catch (error) {
        // Clean up uploaded files in case of error
        if (req.files) {
            await Promise.all(req.files.map(file => 
                fs.unlink(file.path).catch(() => {})
            ));
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete an image from a product
exports.deleteImage = async (req, res) => {
    try {
        const { productId, filename } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const imageIndex = product.images.findIndex(img => img.filename === filename);
        if (imageIndex === -1) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Remove file from filesystem
        const filePath = path.join(__dirname, '../uploads', filename);
        await fs.unlink(filePath);

        // Remove image from product
        product.images.splice(imageIndex, 1);
        await product.save();

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all images for a product
exports.getProductImages = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product.images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
