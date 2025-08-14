CREATE SCHEMA IF NOT EXISTS vop;

CREATE TABLE IF NOT EXISTS vop.account_holders (
  id BIGSERIAL PRIMARY KEY,
  iban VARCHAR(34) UNIQUE NOT NULL,
  account_holder_name VARCHAR(140) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('PERSONAL','BUSINESS')),
  country_code CHAR(2) NOT NULL,
  bank_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS vop.verification_logs (
  id BIGSERIAL PRIMARY KEY,
  request_id UUID UNIQUE NOT NULL,
  iban VARCHAR(34) NOT NULL,
  provided_name VARCHAR(140) NOT NULL,
  match_result VARCHAR(20) NOT NULL,
  match_score DECIMAL(5,2),
  processing_time_ms INTEGER,
  request_timestamp TIMESTAMPTZ NOT NULL,
  response_timestamp TIMESTAMPTZ NOT NULL,
  originating_psp VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_account_holders_iban ON vop.account_holders(iban);
CREATE INDEX IF NOT EXISTS idx_account_holders_bank_code ON vop.account_holders(bank_code);
CREATE INDEX IF NOT EXISTS idx_verification_logs_request_id ON vop.verification_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_timestamp ON vop.verification_logs(request_timestamp);

INSERT INTO vop.account_holders (iban, account_holder_name, account_type, country_code, bank_code)
VALUES
  ('DE89370400440532013000','John Smith','PERSONAL','DE','DEUTDEFF'),
  ('FR1420041010050500013M02606','Marie Dubois','PERSONAL','FR','BNPAFRPP'),
  ('ES9121000418450200051332','José García','BUSINESS','ES','CAIXESBB')
ON CONFLICT (iban) DO NOTHING;
