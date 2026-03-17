import React from 'react';

function formatarValor(val) {
  if (val == null) return '-';
  const n = typeof val === 'string' ? parseFloat(String(val).replace(',', '.')) : Number(val);
  if (Number.isNaN(n)) return '-';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(str) {
  if (!str) return '-';
  const [y, m, d] = String(str).slice(0, 10).split('-');
  if (!d || !m || !y) return str;
  return `${d}/${m}/${y}`;
}

function formatarDataEmissao() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarCpf(doc) {
  if (!doc || typeof doc !== 'string' || !doc.trim()) return '-';
  const digits = doc.replace(/\D/g, '');
  if (digits.length !== 11) return doc;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Componente reutilizável para exibir comprovantes de cobrança ou recibo de pagamento.
 * Layout profissional padronizado.
 *
 * @param {Object} props
 * @param {string} props.aluno - Nome do aluno
 * @param {number|string} props.valor - Valor da mensalidade
 * @param {string} props.vencimento - Data de vencimento (YYYY-MM-DD)
 * @param {number} props.referencia - ID/referência do pagamento
 * @param {string} props.status - 'paid' | 'pending' | 'overdue'
 * @param {string} [props.responsavel] - Nome do responsável (opcional)
 * @param {string} [props.cpfResponsavel] - CPF do responsável (opcional)
 * @param {string} [props.turma] - Turma do aluno (opcional)
 * @param {string} [props.titulo] - Título customizado (opcional)
 * @param {string} [props.subtitulo] - Subtítulo customizado (opcional)
 * @param {string} [props.observacao] - Texto de observação (opcional)
 */
export function ReceiptCard({
  aluno,
  valor,
  vencimento,
  referencia,
  status = 'pending',
  responsavel,
  cpfResponsavel,
  turma,
  titulo,
  subtitulo,
  observacao,
}) {
  const isPaid = status === 'paid';
  const tituloPadrao = isPaid ? 'RECIBO DE PAGAMENTO' : 'COMPROVANTE DE COBRANÇA';
  const subtituloPadrao = isPaid
    ? 'Comprovante de quitação de mensalidade escolar'
    : 'Mensalidade Escolar - Pagamento na secretaria ou via boleto (quando disponível)';
  const observacaoPadrao = isPaid
    ? 'Este documento comprova a quitação da mensalidade descrita acima.'
    : 'Este comprovante pode ser pago na secretaria da escola. Para boleto bancário com código de barras, utilize a opção "Gerar" (requer Mercado Pago configurado).';
  const statusLabel = isPaid ? 'PAGO' : status === 'overdue' ? 'Vencido' : 'Pendente';

  return (
    <div className="receipt-wrapper">
      <div className="receipt-card">
        <header className="receipt-header">
          <h2 className="receipt-title">{titulo || tituloPadrao}</h2>
          <p className="receipt-subtitle">{subtitulo || subtituloPadrao}</p>
          <p className="receipt-emissao">Emitido em: {formatarDataEmissao()}</p>
        </header>

        <hr className="receipt-separator" />

        <section className="receipt-info">
          <div className="receipt-info-grid">
            <div className="receipt-info-row">
              <span className="receipt-label">Aluno:</span>
              <span className="receipt-value">{aluno || '-'}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Responsável:</span>
              <span className="receipt-value">{responsavel || '-'}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">CPF do responsável:</span>
              <span className="receipt-value">{formatarCpf(cpfResponsavel)}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Turma:</span>
              <span className="receipt-value">{turma || '-'}</span>
            </div>
            <div className="receipt-info-row receipt-info-row-highlight">
              <span className="receipt-label">Valor:</span>
              <span className="receipt-value receipt-value-amount">{formatarValor(valor)}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Vencimento:</span>
              <span className="receipt-value">{formatarData(vencimento)}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Referência:</span>
              <span className="receipt-value">{referencia != null ? referencia : '-'}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Status:</span>
              <span className={`receipt-value receipt-status receipt-status-${status}`}>{statusLabel}</span>
            </div>
          </div>
        </section>

        <hr className="receipt-separator" />

        <div className="receipt-observacao">
          <p>{observacao || observacaoPadrao}</p>
        </div>

        <hr className="receipt-separator" />

        <footer className="receipt-footer">
          <p>Documento gerado eletronicamente. Válido sem assinatura.</p>
        </footer>
      </div>
    </div>
  );
}
