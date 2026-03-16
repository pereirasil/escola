-- Tabela bank_accounts (dados bancários da escola para recebimento de boletos/PIX)
CREATE TABLE IF NOT EXISTS bank_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  bank_code VARCHAR(20) NOT NULL,
  bank_name VARCHAR(100) NULL,
  agency VARCHAR(20) NOT NULL,
  agency_digit VARCHAR(5) NULL,
  account VARCHAR(20) NOT NULL,
  account_digit VARCHAR(5) NULL,
  account_type VARCHAR(20) DEFAULT 'corrente',
  beneficiary_name VARCHAR(255) NOT NULL,
  document VARCHAR(20) NOT NULL,
  pix_key VARCHAR(255) NULL,
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_bank_accounts_school_id (school_id),
  FOREIGN KEY (school_id) REFERENCES users(id) ON DELETE CASCADE
);
