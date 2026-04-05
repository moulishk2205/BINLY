const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const User = require('../models/user');
const Pickup = require('../models/Pickup');
const analytics = require('../services/analytics');

// All admin routes require authentication and admin role
router.use(auth);
router.use(roleCheck(['admin']));

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const stats = await analytics.getOverallStats();
        res.json(stats);
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
    try {
        const { ward, startDate, endDate } = req.query;
        
        const analyticsData = await analytics.getWardAnalytics(
            ward,
            startDate || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
            endDate || new Date().toISOString().split('T')[0]
        );
        
        res.json(analyticsData);
    } catch (error) {
        console.error('Analytics fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { role } = req.query;
        
        let users;
        if (role === 'citizen') {
            users = await User.getAllCitizens();
        } else if (role === 'collector') {
            users = await User.getAllCollectors();
        } else {
            const citizens = await User.getAllCitizens();
            const collectors = await User.getAllCollectors();
            users = [...citizens, ...collectors];
        }
        
        res.json(users);
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/admin/pickups
router.get('/pickups', async (req, res) => {
    try {
        const { ward, startDate, endDate } = req.query;
        
        const pickups = ward 
            ? await Pickup.getStatsByWard(
                ward,
                startDate || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
                endDate || new Date().toISOString().split('T')[0]
              )
            : await analytics.getOverallStats();
        
        res.json(pickups);
    } catch (error) {
        console.error('Pickups fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch pickups' });
    }
});

// GET /api/admin/reports/segregation
router.get('/reports/segregation', async (req, res) => {
    try {
        const report = await analytics.getSegregationReport();
        res.json(report);
    } catch (error) {
        console.error('Segregation report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// GET /api/admin/reports/collection
router.get('/reports/collection', async (req, res) => {
    try {
        const report = await analytics.getCollectionReport();
        res.json(report);
    } catch (error) {
        console.error('Collection report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

module.exports = router;