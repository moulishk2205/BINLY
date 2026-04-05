const { runQuery, getOne, getAll } = require('../config/database');
const QRCode = require('qrcode');

class Household {
    static async create({ householdId, userId, address, area, ward, latitude, longitude }) {
        // Generate QR code
        const qrData = JSON.stringify({
            household_id: householdId,
            user_id: userId,
            address: address
        });
        
        const qrCode = await QRCode.toDataURL(qrData);
        
        const query = `
            INSERT INTO households (household_id, user_id, address, area, ward, qr_code, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await runQuery(query, [householdId, userId, address, area, ward, qrCode, latitude, longitude]);
        return result.id;
    }
    
    static async findByHouseholdId(householdId) {
        const query = 'SELECT * FROM households WHERE household_id = ?';
        return await getOne(query, [householdId]);
    }
    
    static async findByUserId(userId) {
        const query = 'SELECT * FROM households WHERE user_id = ?';
        return await getOne(query, [userId]);
    }
    
    static async findById(id) {
        const query = 'SELECT * FROM households WHERE id = ?';
        return await getOne(query, [id]);
    }
    
    static async getByWard(ward) {
        const query = 'SELECT * FROM households WHERE ward = ?';
        return await getAll(query, [ward]);
    }
    
    static async getByArea(area) {
        const query = 'SELECT * FROM households WHERE area = ?';
        return await getAll(query, [area]);
    }
    
    static async generateHouseholdId(area) {
        const prefix = 'CHN';
        const areaCode = area.substring(0, 3).toUpperCase();
        const random = Math.floor(10000 + Math.random() * 90000);
        return `${prefix}-${areaCode}-${random}`;
    }
}

module.exports = Household;