-- USERS TABLE
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'energy_provider', 'community_manager', 'resident')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FACILITIES TABLE
CREATE TABLE facilities (
    facility_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    priority_level VARCHAR(50) NOT NULL CHECK (priority_level IN ('high', 'medium', 'normal')),
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ENERGY METRICS TABLE
CREATE TABLE energy_metrics (
    metric_id SERIAL PRIMARY KEY,
    facility_id INT REFERENCES facilities(facility_id) ON DELETE CASCADE,
    production_value FLOAT NOT NULL,
    consumption_value FLOAT NOT NULL,
    battery_percentage FLOAT NOT NULL,
    outage_flag BOOLEAN DEFAULT false,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SUPPLY SCHEDULES TABLE
CREATE TABLE supply_schedules (
    schedule_id SERIAL PRIMARY KEY,
    facility_id INT REFERENCES facilities(facility_id) ON DELETE CASCADE,
    time_slot VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);