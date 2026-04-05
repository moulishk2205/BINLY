const { runQuery, getOne, getAll } = require('../config/database');

class Pickup {
    static async create(pickupData) {
        const {
            householdId,
            collectorId,
            wetWasteKg,
            dryWasteKg,
            recyclablesKg,
            ewasteKg,
            qualityRating,
            contaminationDetected,
            creditsEarned,
            collectorEarnings,
            bonusAmount,
            photoUrl
        } = pickupData;
        
        const query = `
            INSERT INTO waste_pickups (
                household_id, collector_id, wet_waste_kg, dry_waste_kg,
                recyclables_kg, ewaste_kg, quality_rating, contamination_detected,
                credits_earned, collector_earnings, bonus_amount, photo_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await runQuery(query, [
            householdId, collectorId, wetWasteKg, dryWasteKg,
            recyclablesKg, ewasteKg, qualityRating, contaminationDetected ? 1 : 0,
            creditsEarned, collectorEarnings, bonusAmount, photoUrl
        ]);
        
        return result.id;
    }
    
    static async findById(id) {
        const query = 'SELECT * FROM waste_pickups WHERE id = ?';
        return await getOne(query, [id]);
    }
    
    static async getByHousehold(householdId, limit = 10) {
        const query = `
            SELECT * FROM waste_pickups 
            WHERE household_id = ? 
            ORDER BY pickup_date DESC 
            LIMIT ?
        `;
        return await getAll(query, [householdId, limit]);
    }
    
    static async getByCollector(collectorId, date = null) {
        let query = 'SELECT * FROM waste_pickups WHERE collector_id = ?';
        const params = [collectorId];
        
        if (date) {
            query += ' AND DATE(pickup_date) = DATE(?)';
            params.push(date);
        }
        
        query += ' ORDER BY pickup_date DESC';
        return await getAll(query, params);
    }
    
    static async getTodayPickups(collectorId) {
        const query = `
            SELECT wp.*, h.household_id, h.address, h.area
            FROM waste_pickups wp
            JOIN households h ON wp.household_id = h.id
            WHERE wp.collector_id = ? AND DATE(wp.pickup_date) = DATE('now')
            ORDER BY wp.pickup_date DESC
        `;
        return await getAll(query, [collectorId]);
    }
    
    static async getStatsByWard(ward, startDate, endDate) {
        const query = `
            SELECT 
                COUNT(*) as total_pickups,
                SUM(wet_waste_kg) as total_wet,
                SUM(dry_waste_kg) as total_dry,
                SUM(recyclables_kg) as total_recyclables,
                AVG(CASE WHEN quality_rating = 'good' THEN 1.0 ELSE 0.0 END) * 100 as segregation_rate,
                AVG(CASE WHEN contamination_detected = 1 THEN 1.0 ELSE 0.0 END) * 100 as contamination_rate
            FROM waste_pickups wp
            JOIN households h ON wp.household_id = h.id
            WHERE h.ward = ? AND DATE(wp.pickup_date) BETWEEN DATE(?) AND DATE(?)
        `;
        return await getOne(query, [ward, startDate, endDate]);
    }
}

module.exports = Pickup;