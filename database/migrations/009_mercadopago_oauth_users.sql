-- Mercado Pago OAuth (Marketplace): cada escola conecta sua própria conta
-- Adiciona campos em users (escola = user com role 'school')
-- Executar: mysql -u root -p escola < database/migrations/009_mercadopago_oauth_users.sql

ALTER TABLE users ADD COLUMN mercadopago_access_token TEXT NULL;
ALTER TABLE users ADD COLUMN mercadopago_user_id VARCHAR(255) NULL;
