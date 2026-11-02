-- ================= PASSWORD RESET OTP TABLE =================

CREATE TABLE IF NOT EXISTS password_reset_otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Secure password reset token
    reset_token_hash VARCHAR(255),
    reset_expires_at TIMESTAMP
);

-- ================= UPDATE EXISTING TABLE =================

ALTER TABLE password_reset_otps
ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR(255);

ALTER TABLE password_reset_otps
ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMP;