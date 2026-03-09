import React from 'react';
import { Card, PageHeader } from '../../../components/ui';

export default function Reunioes() {
  return (
    <div className="page">
      <PageHeader title="Reuniões" description="Agendamento e gestão de reuniões." />
      <Card title="Agendamentos">
        <div className="empty-state">O módulo de reuniões está em desenvolvimento.</div>
      </Card>
    </div>
  )
}
