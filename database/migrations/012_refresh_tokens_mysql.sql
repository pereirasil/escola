-- Sessões de refresh token (pares com JWT de acesso de curta duração)
-- Executar: mysql -u USER -p DB < database/migrations/012_refresh_tokens_mysql.sql

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_hash VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  payload_json JSON NOT NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_expires (expires_at)
);
