const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Household = require('../models/Household');
const Credit = require('../models/Credit');
const Pickup = require('../models/Pickup');
const aiClassifier = require('../services/aiClassifier');

// All citizen routes require authentication
router.use(auth);
router.use(roleCheck(['citizen']));

// GET /api/citizen/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get household
        const household = await Household.findByUserId(userId);
        if (!household) {
            return res.status(404).json({ error: 'Household not found' });
        }
        
        // Get credit balance
        const credits = await Credit.getBalance(userId);
        
        // Get today's pickups
        const today = new Date().toISOString().split('T')[0];
        const todayPickups = await Pickup.getByHousehold(household.id);
        const todayStatus = todayPickups.length > 0 && todayPickups[0].quality_rating === 'good' ? 'GREEN' : 'YELLOW';
        
        // Get monthly stats
        const monthlyPickups = await Pickup.getByHousehold(household.id, 30);
        
        res.json({
            status: todayStatus,
            credits: credits ? credits.balance : 0,
            creditValue: credits ? (credits.balance * 0.5).toFixed(2) : '0.00',
            monthlyPickups: monthlyPickups.length,
            household: {
                id: household.household_id,
                address: household.address,
                area: household.area
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// POST /api/citizen/classify-waste
router.post('/classify-waste', async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ error: 'Image data required' });
        }
        
        // Call AI classifier service
        const classification = await aiClassifier.classifyWaste(imageData);
        
        res.json(classification);
    } catch (error) {
        console.error('Classification error:', error);
        res.status(500).json({ error: 'Classification failed' });
    }
});

// GET /api/citizen/qr-code
router.get('/qr-code', async (req, res) => {
    try {
        const userId = req.user.id;
        const household = await Household.findByUserId(userId);
        
        if (!household) {
            return res.status(404).json({ error: 'Household not found' });
        }
        
        res.json({
            householdId: household.household_id,
            qrCode: household.qr_code,
            address: household.address,
            area: household.area,
            ward: household.ward
        });
    } catch (error) {
        console.error('QR code error:', error);
        res.status(500).json({ error: 'Failed to get QR code' });
    }
});

// GET /api/citizen/wallet
router.get('/wallet', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const balance = await Credit.getBalance(userId);
        const transactions = await Credit.getTransactions(userId, 20);
        
        res.json({
            balance: balance ? balance.balance : 0,
            totalEarned: balance ? balance.total_earned : 0,
            totalRedeemed: balance ? balance.total_redeemed : 0,
            rupeeValue: balance ? (balance.balance * 0.5).toFixed(2) : '0.00',
            transactions: transactions.map(t => ({
                type: t.transaction_type,
                amount: t.amount,
                description: t.description,
                date: t.transaction_date
            }))
        });
    } catch (error) {
        console.error('Wallet error:', error);
        res.status(500).json({ error: 'Failed to load wallet' });
    }
});

// POST /api/citizen/redeem-credits
router.post('/redeem-credits', async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, partnerId, description } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        await Credit.deductCredits(userId, amount, description || 'Redeemed at partner store', partnerId);
        
        res.json({
            message: 'Credits redeemed successfully',
            amountRedeemed: amount,
            rupeeValue: (amount * 0.5).toFixed(2)
        });
    } catch (error) {
        console.error('Redemption error:', error);
        res.status(400).json({ error: error.message || 'Redemption failed' });
    }
});

// GET /api/citizen/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const userId = req.user.id;
        const household = await Household.findByUserId(userId);
        
        if (!household) {
            return res.status(404).json({ error: 'Household not found' });
        }
        
        const leaderboard = await Credit.getLeaderboard(household.area, 20);
        
        // Find user's rank
        const userRank = leaderboard.findIndex(entry => entry.id === userId) + 1;
        
        res.json({
            leaderboard: leaderboard.map((entry, index) => ({
                rank: index + 1,
                name: entry.name,
                credits: entry.total_earned,
                address: entry.address
            })),
            userRank: userRank || 'Not ranked'
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

// GET /api/citizen/compost-guide
router.get('/compost-guide', async (req, res) => {
    try {
        res.json({
            quickStart: [
                'Choose your container: Use a plastic drum or terracotta pot with holes',
                'Layer the base: Start with coconut coir or dry leaves (5cm)',
                'Add kitchen waste: Vegetable peels, fruit scraps, tea bags',
                'Cover with dry materials: Sawdust, shredded paper, or dry leaves',
                'Mix weekly: Aerate the compost to speed decomposition',
                'Ready in 60-90 days: Dark, crumbly, earthy-smelling compost'
            ],
            canCompost: [
                'Fruit & vegetable scraps',
                'Coffee grounds & tea bags',
                'Eggshells (crushed)',
                'Dry leaves & grass',
                'Shredded newspaper'
            ],
            cannotCompost: [
                'Meat, bones & dairy',
                'Cooked food with oil',
                'Pet waste',
                'Diseased plants',
                'Plastic or metal'
            ],
            troubleshooting: [
                {
                    problem: 'Fruit flies or insects',
                    solution: 'Cover fresh waste with dry leaves immediately. Avoid meat/dairy.'
                },
                {
                    problem: 'Bad smell',
                    solution: 'Too wet. Add more dry materials and mix to aerate.'
                },
                {
                    problem: 'Decomposition too slow',
                    solution: 'Mix more frequently. Chop waste into smaller pieces.'
                }
            ]
        });
    } catch (error) {
        console.error('Compost guide error:', error);
        res.status(500).json({ error: 'Failed to load guide' });
    }
});

module.exports = router;