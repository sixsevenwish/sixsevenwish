-- ══════════════════════════════════════════
-- 6-7 Wish — MySQL 8 Schema
-- Milkox Group LLC
-- ══════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS sixsevenwish
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sixsevenwish;

-- ── WISHES TABLE ──
CREATE TABLE IF NOT EXISTS wishes (
    id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name              VARCHAR(100)    NOT NULL,
    last_name               VARCHAR(100)    NOT NULL,
    wish_text               TEXT            NOT NULL,
    wish_level              ENUM('hope','dream','destiny') NOT NULL DEFAULT 'hope',
    amount                  DECIMAL(10,2)   NOT NULL,
    paypal_transaction_id   VARCHAR(255)    NOT NULL DEFAULT '',
    country                 VARCHAR(10)     NOT NULL DEFAULT 'US',
    ip_address              VARCHAR(45)     NOT NULL DEFAULT '',
    status                  VARCHAR(50)     NOT NULL DEFAULT 'PENDING',
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_status        (status),
    INDEX idx_wish_level    (wish_level),
    INDEX idx_created_at    (created_at),
    INDEX idx_paypal_txn    (paypal_transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ADMIN USERS TABLE ──
CREATE TABLE IF NOT EXISTS admin_users (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    username        VARCHAR(100)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login      DATETIME,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── DEFAULT ADMIN (password: wish2026! — change immediately!) ──
-- Generate with: password_hash('wish2026!', PASSWORD_BCRYPT)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2y$12$PLACEHOLDER_BCRYPT_HASH_REPLACE_ME')
ON DUPLICATE KEY UPDATE username=username;

-- ══════════════════════════════════════════
-- USEFUL QUERIES
-- ══════════════════════════════════════════

-- Total wishes & revenue
-- SELECT COUNT(*) AS total_wishes, SUM(amount) AS total_revenue
-- FROM wishes WHERE status = 'COMPLETED';

-- Revenue today
-- SELECT SUM(amount) AS today FROM wishes
-- WHERE status='COMPLETED' AND DATE(created_at) = CURDATE();

-- Revenue this month
-- SELECT SUM(amount) AS month FROM wishes
-- WHERE status='COMPLETED' AND DATE_FORMAT(created_at,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m');

-- Avg order value
-- SELECT AVG(amount) AS avg_order FROM wishes WHERE status='COMPLETED';
