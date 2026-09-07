-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE satellite_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id VARCHAR(255) UNIQUE NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    bbox GEOMETRY(POLYGON, 4326) NOT NULL,
    image_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE spills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID REFERENCES investigations(id),
    satellite_observation_id UUID REFERENCES satellite_observations(id),
    prediction_id VARCHAR(255),
    confidence DOUBLE PRECISION,
    area_km2 DOUBLE PRECISION,
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- detect, drift, attribution
    status VARCHAR(50) NOT NULL, -- pending, running, completed, failed
    target_id UUID, -- refers to spill, investigation etc.
    progress INT DEFAULT 0,
    result_data JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE origin_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spill_id UUID REFERENCES spills(id),
    mode VARCHAR(50) NOT NULL,
    center GEOMETRY(POINT, 4326) NOT NULL,
    radius_km DOUBLE PRECISION NOT NULL,
    polygon GEOMETRY(POLYGON, 4326) NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    uncertainty_km DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vessels (
    mmsi VARCHAR(50) PRIMARY KEY,
    imo VARCHAR(50),
    vessel_name VARCHAR(255),
    vessel_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ais_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mmsi VARCHAR(50) REFERENCES vessels(mmsi),
    timestamp TIMESTAMPTZ NOT NULL,
    position GEOMETRY(POINT, 4326) NOT NULL,
    speed_knots DOUBLE PRECISION,
    course_deg DOUBLE PRECISION,
    heading_deg DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Spatial & Temporal queries
CREATE INDEX idx_ais_positions_timestamp ON ais_positions(timestamp);
CREATE INDEX idx_ais_positions_mmsi ON ais_positions(mmsi);
CREATE INDEX idx_ais_positions_geom ON ais_positions USING GIST (position);

CREATE TABLE candidate_vessels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spill_id UUID REFERENCES spills(id),
    mmsi VARCHAR(50) REFERENCES vessels(mmsi),
    rank INT NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    evidence JSONB NOT NULL,
    features JSONB NOT NULL,
    positions_used INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
