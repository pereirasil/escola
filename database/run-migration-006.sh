#!/bin/bash
# Executa a migration 006 para adicionar colunas de multa e vencimento
# Uso: ./database/run-migration-006.sh
# Ou: mysql -u root -p escola < database/migrations/006_payment_due_day_late_fee.sql

DB_NAME="${DB_NAME:-escola}"
DB_USER="${DB_USER:-root}"

echo "Executando migration 006 em $DB_NAME..."
mysql -u "$DB_USER" -p "$DB_NAME" < "$(dirname "$0")/migrations/006_payment_due_day_late_fee.sql" && echo "Migration concluida." || echo "Erro. Verifique se o MySQL esta rodando e as credenciais."
