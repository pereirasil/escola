import React from 'react';
import { Card, PageHeader } from '../../../components/ui';

export default function Financeiro() {
  return (
    <div className="page">
      <PageHeader title="Financeiro" description="Boletos, mensalidades e controle de pagamentos." />
      <Card title="Gestão Financeira">
        <div className="empty-state">O módulo financeiro está em desenvolvimento.</div>
      </Card>
    </div>
  )
}
