const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Create initial admin (only available if no users exist)
router.post('/create-initial-admin', authController.createInitialAdmin);

// Login user
router.post('/login', authController.login);

// Register new user
router.post('/register', authController.register);

// Delete user by username and store
router.delete('/user/:username/:store', authController.deleteUser);

module.exports = router;
