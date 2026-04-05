const { initDatabase, runQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        console.log('Initializing database...');
        await initDatabase();
        console.log('✓ Database tables created');
        
        // Create demo admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await runQuery(`
            INSERT OR IGNORE INTO users (email, password_hash, name, role)
            VALUES ('admin@binly.in', ?, 'Admin User', 'admin')
        `, [adminPassword]);
        console.log('✓ Admin user created (email: admin@binly.in, password: admin123)');
        
        // Create demo citizen
        await runQuery(`
            INSERT OR IGNORE INTO users (phone, name, role)
            VALUES ('9876543210', 'Rajesh Kumar', 'citizen')
        `);
        const citizenId = 1; // Assuming first user
        
        // Create household for citizen
        const QRCode = require('qrcode');
        const householdId = 'CHN-TNG-45892';
        const qrData = JSON.stringify({ household_id: householdId, user_id: citizenId });
        const qrCode = await QRCode.toDataURL(qrData);
        
        await runQuery(`
            INSERT OR IGNORE INTO households (household_id, user_id, address, area, ward, qr_code)
            VALUES (?, ?, '12, Anna Street', 'T. Nagar', 'Ward 1', ?)
        `, [householdId, citizenId, qrCode]);
        console.log('✓ Demo household created');
        
        // Create credit wallet
        await runQuery(`
            INSERT OR IGNORE INTO credits (user_id, balance, total_earned)
            VALUES (?, 1247, 3890)
        `, [citizenId]);
        console.log('✓ Credit wallet created');
        
        // Create demo collector
        await runQuery(`
            INSERT OR IGNORE INTO users (phone, name, role)
            VALUES ('9876543211', 'Murugan', 'collector')
        `);
        console.log('✓ Demo collector created');
        
        // Create demo route
        await runQuery(`
            INSERT OR IGNORE INTO routes (route_id, route_name, collector_id, area, household_count, distance_km, estimated_time_minutes, status)
            VALUES ('TNG-W-04', 'T. Nagar West Route', 2, 'T. Nagar', 45, 8.2, 180, 'active')
        `);
        console.log('✓ Demo route created');
        
        // Create sample pickup records
        await runQuery(`
            INSERT OR IGNORE INTO waste_pickups (
                household_id, collector_id, wet_waste_kg, dry_waste_kg, 
                recyclables_kg, ewaste_kg, quality_rating, contamination_detected,
                credits_earned, collector_earnings, bonus_amount
            )
            VALUES (1, 2, 2.5, 1.2, 0.8, 0, 'good', 0, 45, 45, 10)
        `);
        console.log('✓ Sample pickup records created');
        
        console.log('\n=================================');
        console.log('✓ Database initialization complete!');
        console.log('=================================\n');
        console.log('Demo Accounts:');
        console.log('Admin: admin@binly.in / admin123');
        console.log('Citizen: 9876543210 (OTP: any 6 digits)');
        console.log('Collector: 9876543211 (OTP: any 6 digits)');
        console.log('\nYou can now start the server with: npm run dev');
        
        process.exit(0);
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

seedDatabase();