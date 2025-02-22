const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../utils/upload');

// Upload images for a product (up to 5 images)
router.post('/:productId', upload.array('images', 5), imageController.uploadImages);

// Delete an image from a product
router.delete('/:productId/:filename', imageController.deleteImage);

// Get all images for a product
router.get('/:productId', imageController.getProductImages);

module.exports = router;
