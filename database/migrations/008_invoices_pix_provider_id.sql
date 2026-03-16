-- Adiciona coluna pix_provider_id para vincular pagamentos PIX ao Mercado Pago
-- Executar: mysql -u root -p escola < database/migrations/008_invoices_pix_provider_id.sql

ALTER TABLE invoices ADD COLUMN pix_provider_id VARCHAR(255) NULL;
