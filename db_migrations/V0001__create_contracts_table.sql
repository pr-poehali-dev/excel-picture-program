CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    contract_number VARCHAR(100),
    contract_date VARCHAR(50),
    expiration_date VARCHAR(50) NOT NULL,
    amount VARCHAR(100),
    sbis VARCHAR(100),
    eis VARCHAR(100),
    work_act VARCHAR(100),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contracts_expiration ON contracts(expiration_date);
CREATE INDEX IF NOT EXISTS idx_contracts_organization ON contracts(organization_name);
