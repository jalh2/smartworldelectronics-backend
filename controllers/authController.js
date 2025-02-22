const User = require('../models/User');

// Register new user (only admins can create new users)
exports.register = async (req, res) => {
    try {
        const { username, password, role, store } = req.body;

        // Validate role
        if (!['admin', 'manager'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Validate store
        if (!['store1', 'store2'].includes(store)) {
            return res.status(400).json({ message: 'Invalid store' });
        }

        // Create new user
        const user = new User({
            username,
            role,
            store
        });

        user.setPassword(password);
        
        try {
            await user.save();
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Username already exists in this store' });
            }
            throw error;
        }

        // Don't send password and salt in response
        const userResponse = {
            username: user.username,
            role: user.role,
            store: user.store,
            createdAt: user.createdAt
        };

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { username, password, store } = req.body;

        // Validate required fields
        if (!username || !password || !store) {
            return res.status(400).json({ message: 'Username, password and store are required' });
        }

        // Find user with matching username and store
        const user = await User.findOne({ username, store });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        if (!user.verifyPassword(password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            username: user.username,
            role: user.role,
            store: user.store
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create initial admin (only available if no users exist)
exports.createInitialAdmin = async (req, res) => {
    try {
        // Check if any users exist
        const userCount = await User.countDocuments();
        console.log('User count:', userCount); // Debug log
        if (userCount > 0) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const { username, password } = req.body;
        console.log('Creating admin:', { username }); // Debug log

        // Create admin user
        const admin = new User({
            username,
            role: 'admin',
            store: 'admin' // Add store to admin user
        });

        admin.setPassword(password);
        await admin.save();

        res.status(201).json({
            message: 'Admin created successfully',
            username: admin.username,
            role: admin.role
        });
    } catch (error) {
        console.error('Admin creation error:', error); // Debug log
        res.status(400).json({ message: error.message });
    }
};

// Delete user by username and store
exports.deleteUser = async (req, res) => {
    try {
        const { username, store } = req.params;
        console.log('Deleting user:', { username, store }); // Debug log
        
        const result = await User.findOneAndDelete({ username, store });
        
        console.log('Deletion result:', result); // Debug log
        
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Deletion error:', error); // Debug log
        res.status(500).json({ message: error.message });
    }
};
