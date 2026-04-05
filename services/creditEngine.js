const config = require('../config/config');

class CreditEngine {
    calculateCredits(pickupData) {
        const {
            wetWasteKg,
            dryWasteKg,
            recyclablesKg,
            ewasteKg,
            qualityRating,
            contaminationDetected
        } = pickupData;
        
        // Base credits calculation
        let baseCredits = 0;
        baseCredits += wetWasteKg * config.creditRules.wetWasteRate;
        baseCredits += dryWasteKg * config.creditRules.dryWasteRate;
        baseCredits += recyclablesKg * config.creditRules.recyclablesRate;
        baseCredits += ewasteKg * config.creditRules.ewasteRate;
        
        // Apply quality multiplier
        const qualityMultiplier = config.qualityMultipliers[qualityRating] || 1.0;
        let finalCredits = Math.round(baseCredits * qualityMultiplier);
        
        // Apply contamination penalty
        if (contaminationDetected) {
            finalCredits = Math.round(finalCredits * config.qualityMultipliers.contaminationPenalty);
        }
        
        // Calculate collector earnings (base rate: ₹1 per kg)
        const totalWaste = wetWasteKg + dryWasteKg + recyclablesKg + ewasteKg;
        let collectorEarnings = totalWaste * 10; // ₹10 per kg base rate
        
        // Quality bonus for collector
        let bonus = 0;
        if (qualityRating === 'good' && !contaminationDetected) {
            bonus = collectorEarnings * 0.2; // 20% bonus for good quality
        } else if (qualityRating === 'medium') {
            bonus = collectorEarnings * 0.1; // 10% bonus for medium quality
        }
        
        // Calculate rupee value for citizen
        const rupeeValue = finalCredits * config.creditRules.toRupeeRate;
        
        return {
            credits: finalCredits,
            baseCredits: Math.round(baseCredits),
            qualityMultiplier,
            contaminationPenalty: contaminationDetected,
            rupeeValue,
            collectorEarnings,
            bonus,
            totalCollectorPayout: collectorEarnings + bonus,
            breakdown: {
                wetWaste: wetWasteKg * config.creditRules.wetWasteRate,
                dryWaste: dryWasteKg * config.creditRules.dryWasteRate,
                recyclables: recyclablesKg * config.creditRules.recyclablesRate,
                ewaste: ewasteKg * config.creditRules.ewasteRate
            }
        };
    }
    
    calculateStreakBonus(consecutiveDays) {
        if (consecutiveDays >= config.bonusCredits.streakDays) {
            const bonusPercentage = config.bonusCredits.streakPercentage / 100;
            return {
                eligible: true,
                bonus: bonusPercentage,
                message: `${consecutiveDays}-day streak! ${config.bonusCredits.streakPercentage}% bonus applied`
            };
        }
        return { eligible: false, bonus: 0 };
    }
    
    calculateMonthlyChampionBonus(rank) {
        if (rank === 1) {
            return {
                eligible: true,
                credits: config.bonusCredits.monthlyChampion,
                message: 'Monthly Champion Bonus!'
            };
        }
        return { eligible: false, credits: 0 };
    }
    
    calculateCompostingBonus(verified) {
        if (verified) {
            return {
                eligible: true,
                credits: config.bonusCredits.composting,
                message: 'Composting verified!'
            };
        }
        return { eligible: false, credits: 0 };
    }
    
    calculateReferralBonus() {
        return {
            credits: config.bonusCredits.referral,
            message: 'Referral bonus!'
        };
    }
}

module.exports = new CreditEngine();