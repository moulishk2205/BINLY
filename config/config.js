require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    jwt: {
        // ✅ FIX: add fallback secret
        secret: process.env.JWT_SECRET || "binly_secret_key",
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    
    database: {
        path: process.env.DATABASE_PATH || './database/binly.db'
    },
    
    mlService: {
        url: process.env.ML_SERVICE_URL || 'http://localhost:5001'
    },
    
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || "",
        keySecret: process.env.RAZORPAY_KEY_SECRET || ""
    },
    
    frontend: {
        // ✅ FIX: your frontend now runs on 3000
        url: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    
    creditRules: {
        toRupeeRate: parseFloat(process.env.CREDIT_TO_RUPEE_RATE) || 0.50,
        wetWasteRate: parseInt(process.env.WET_WASTE_CREDIT_RATE) || 10,
        dryWasteRate: parseInt(process.env.DRY_WASTE_CREDIT_RATE) || 8,
        recyclablesRate: parseInt(process.env.RECYCLABLES_CREDIT_RATE) || 15,
        ewasteRate: parseInt(process.env.EWASTE_CREDIT_RATE) || 25
    },
    
    qualityMultipliers: {
        good: parseFloat(process.env.GOOD_QUALITY_MULTIPLIER) || 1.0,
        medium: parseFloat(process.env.MEDIUM_QUALITY_MULTIPLIER) || 0.7,
        poor: parseFloat(process.env.POOR_QUALITY_MULTIPLIER) || 0.4,
        contaminationPenalty: parseFloat(process.env.CONTAMINATION_PENALTY) || 0.5
    },
    
    bonusCredits: {
        streakDays: parseInt(process.env.STREAK_BONUS_DAYS) || 7,
        streakPercentage: parseInt(process.env.STREAK_BONUS_PERCENTAGE) || 20,
        monthlyChampion: parseInt(process.env.MONTHLY_CHAMPION_BONUS) || 100,
        composting: parseInt(process.env.COMPOSTING_BONUS) || 50,
        referral: parseInt(process.env.REFERRAL_BONUS) || 200
    }
};