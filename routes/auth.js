const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { getOne } = require('../config/database');

// 🔑 Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        config.jwt.secret,
        { expiresIn: '1d' }
    );
}

// 🔐 LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { phone, email, password, role } = req.body;

        let query;
        let value;

        if (role === 'admin') {
            query = "SELECT * FROM users WHERE email = ?";
            value = email;
        } else {
            query = "SELECT * FROM users WHERE phone = ?";
            value = phone;
        }

        const user = await getOne(query, [value]);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // ✅ Simple password check (for demo)
        if (role === 'admin' && password !== 'admin123') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                phone: user.phone,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ✅ EXPORT ROUTER (VERY IMPORTANT)
module.exports = router;