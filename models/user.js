const { runQuery, getOne, getAll } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create({ phone, email, password, name, role }) {
        const passwordHash = password ? await bcrypt.hash(password, 10) : null;
        
        const query = `
            INSERT INTO users (phone, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await runQuery(query, [phone, email, passwordHash, name, role]);
        return result.id;
    }
    
    static async findByPhone(phone) {
        const query = 'SELECT * FROM users WHERE phone = ?';
        return await getOne(query, [phone]);
    }
    
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        return await getOne(query, [email]);
    }
    
    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';
        return await getOne(query, [id]);
    }
    
    static async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    
    static async updateLastLogin(userId) {
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
        await runQuery(query, [userId]);
    }
    
    static async getAllCollectors() {
        const query = 'SELECT id, name, phone, created_at FROM users WHERE role = "collector" AND is_active = 1';
        return await getAll(query);
    }
    
    static async getAllCitizens() {
        const query = 'SELECT id, name, phone, created_at FROM users WHERE role = "citizen" AND is_active = 1';
        return await getAll(query);
    }
}

module.exports = User;