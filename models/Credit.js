const { runQuery, getOne, getAll } = require('../config/database');

class Credit {
    static async createWallet(userId) {
        const query = `
            INSERT INTO credits (user_id, balance, total_earned, total_redeemed)
            VALUES (?, 0, 0, 0)
        `;
        await runQuery(query, [userId]);
    }
    
    static async getBalance(userId) {
        const query = 'SELECT * FROM credits WHERE user_id = ?';
        return await getOne(query, [userId]);
    }
    
    static async addCredits(userId, amount, description, referenceId = null) {
        // Get current balance
        const wallet = await this.getBalance(userId);
        
        if (!wallet) {
            await this.createWallet(userId);
        }
        
        // Update balance
        const updateQuery = `
            UPDATE credits 
            SET balance = balance + ?,
                total_earned = total_earned + ?,
                last_updated = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `;
        await runQuery(updateQuery, [amount, amount, userId]);
        
        // Record transaction
        await this.recordTransaction(userId, 'earned', amount, description, referenceId);
        
        return amount;
    }
    
    static async deductCredits(userId, amount, description, referenceId = null) {
        const wallet = await this.getBalance(userId);
        
        if (!wallet || wallet.balance < amount) {
            throw new Error('Insufficient credits');
        }
        
        const updateQuery = `
            UPDATE credits 
            SET balance = balance - ?,
                total_redeemed = total_redeemed + ?,
                last_updated = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `;
        await runQuery(updateQuery, [amount, amount, userId]);
        
        await this.recordTransaction(userId, 'redeemed', amount, description, referenceId);
        
        return amount;
    }
    
    static async recordTransaction(userId, type, amount, description, referenceId) {
        const query = `
            INSERT INTO credit_transactions (user_id, transaction_type, amount, description, reference_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        await runQuery(query, [userId, type, amount, description, referenceId]);
    }
    
    static async getTransactions(userId, limit = 20) {
        const query = `
            SELECT * FROM credit_transactions 
            WHERE user_id = ? 
            ORDER BY transaction_date DESC 
            LIMIT ?
        `;
        return await getAll(query, [userId, limit]);
    }
    
    static async getLeaderboard(area, limit = 10) {
        const query = `
            SELECT u.name, u.id, c.total_earned, h.area, h.address
            FROM credits c
            JOIN users u ON c.user_id = u.id
            JOIN households h ON u.id = h.user_id
            WHERE h.area = ?
            ORDER BY c.total_earned DESC
            LIMIT ?
        `;
        return await getAll(query, [area, limit]);
    }
}

module.exports = Credit;