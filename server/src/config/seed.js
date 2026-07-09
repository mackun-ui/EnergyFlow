// seed data for simulation

const pool = require('./db');
const bcrypt = require('bcryptjs');

// safety check
if (!bcrypt || !bcrypt.hash) {
    throw new Error('bcryptjs failed to load correctly');
}

const seed = async () => {
    try {
        console.log('Seeding database...');

        // clear existing data in correct order
        await pool.query('TRUNCATE audit_logs, supply_schedules, energy_metrics, facilities, users RESTART IDENTITY CASCADE');

        // --- users ---
        const adminHash = await bcrypt.hash('admin123', 10);
        const providerHash = await bcrypt.hash('provider123', 10);
        const managerHash = await bcrypt.hash('manager123', 10);
        const residentHash = await bcrypt.hash('resident123', 10);
        
        await pool.query(
            `INSERT INTO users (username, password_hash, role) VALUES
            ($1, $2, 'admin'),
            ($3, $4, 'energy_provider'),
            ($5, $6, 'community_manager'),
            ($7, $8, 'resident')`,
            [
                'admin_kofi', adminHash,
                'provider_ama', providerHash,
                'manager_kwame', managerHash,
                'resident_abena', residentHash,
            ]
);
        console.log('Users seeded');

        // --- facilities ---
        await pool.query(`
            INSERT INTO facilities (name, priority_level, created_by) VALUES
            ('Afram Plains Health Clinic',  'high',   1),
            ('Donkorkrom Primary School',   'medium', 1),
            ('Community Centre Block A',    'normal', 1),
            ('Household Zone North',        'normal', 1),
            ('Household Zone South',        'normal', 1)
        `);
        console.log('Facilities seeded');

        // --- energy metrics (last 24 hours of simulated readings) ---
        const now = new Date();
        const metricsData = [];

        for (let i = 23; i >= 0; i--) {
            const recordedAt = new Date(now - i * 60 * 60 * 1000);
            const hour = recordedAt.getHours();

            // solar production peaks midday, drops at night
            const isSunny = hour >= 6 && hour <= 18;
            const productionValue = isSunny
                ? parseFloat((20  + Math.random() *30).toFixed(2))
                : parseFloat((Math.random() * 2).toFixed(2));
            
            const consumptionValue = parseFloat((15 + Math.random() * 20).toFixed(2));
            const batteryPercentage = parseFloat((40 + Math.random() * 55).toFixed(2));
            const outageFlag = batteryPercentage < 15;

            // one metrics row per hour per facility
            for (let facilityId = 1; facilityId <= 5; facilityId++) {
                metricsData.push(
                    `(${facilityId}, ${productionValue}, ${consumptionValue}, ${batteryPercentage}, ${outageFlag}, '${recordedAt.toISOString()}')`
                );
            }
        }

        await pool.query(`
            INSERT INTO energy_metrics (Facility_id, production_value, consumption_value, battery_percentage, outage_flag, recorded_at)
            VALUES ${metricsData.join(', ')}
        `);
        console.log('Energy metrics seeded');

        // --- supply schedules ---
        await pool.query(`
            INSERT INTO supply_schedules (Facility_id, time_slot, is_active, created_by) VALUES
            (1, '00:00 - 23:59', true, 2),
            (2, '06:00 - 18:00', true, 2),
            (3, '08:00 - 20:00', true, 2),
            (4, '17:00 - 22:00', true, 2),
            (5, '17:00 - 22:00', true, 2)
        `);
        console.log('Supply schedules seeded');

        // --- audit logs ---
        await pool.query(`
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES
            (1, 'Created facility: Afram Plains Health Clinic', 'facility', 1),
            (1, 'Created facility: Donkorkrom Primary School', 'facility', 2),
            (2, 'Created supply schedule for Health Clinic', 'supply_schedules', 1),
            (2, 'Created supply schedule for School', 'supply_schedules', 2)
        `);
        console.log('Audit logs seeded');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();