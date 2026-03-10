import { useState, useEffect } from 'react'
import { usersService } from '../../../services/users.service'
import { Card, PageHeader, DataTable, Spinner } from '../../../components/ui'
import toast from 'react-hot-toast'

export default function EscolasAprovadas() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [orphans, setOrphans] = useState(null)
  const [migrating, setMigrating] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState('')

  function loadData() {
    setLoading(true)
    Promise.all([
      usersService.listApproved(),
      usersService.countOrphans(),
    ])
      .then(([resSchools, resOrphans]) => {
        setList(resSchools.data || [])
        setOrphans(resOrphans.data || null)
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Erro ao carregar escolas.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  function handleMigrate() {
    if (!selectedSchool) {
      toast.error('Selecione uma escola.')
      return
    }
    setMigrating(true)
    usersService
      .assignOrphans(selectedSchool)
      .then((res) => {
        toast.success('Registros migrados com sucesso.')
        loadData()
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Erro ao migrar registros.'))
      .finally(() => setMigrating(false))
  }

  const hasOrphans = orphans && orphans.total > 0

  return (
    <div className="page">
      <PageHeader title="Escolas Aprovadas" description="Lista de todas as escolas com acesso liberado" />

      {hasOrphans && (
        <Card>
          <div style={{ padding: '0.5rem 0' }}>
            <strong style={{ color: '#f59e0b' }}>Registros sem escola vinculada</strong>
            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
              Existem {orphans.total} registros criados antes do sistema multi-tenant que nao estao vinculados a nenhuma escola.
              Selecione uma escola para vincular todos esses registros.
            </p>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: '#aaa' }}>
              {orphans.students > 0 && <span>Alunos: {orphans.students} | </span>}
              {orphans.teachers > 0 && <span>Professores: {orphans.teachers} | </span>}
              {orphans.classes > 0 && <span>Turmas: {orphans.classes} | </span>}
              {orphans.subjects > 0 && <span>Materias: {orphans.subjects} | </span>}
              {orphans.attendance > 0 && <span>Presencas: {orphans.attendance} | </span>}
              {orphans.meetings > 0 && <span>Reunioes: {orphans.meetings} | </span>}
              {orphans.schedules > 0 && <span>Horarios: {orphans.schedules} | </span>}
              {orphans.notifications > 0 && <span>Notificacoes: {orphans.notifications}</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
              >
                <option value="">Selecione a escola...</option>
                {list.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={handleMigrate}
                disabled={migrating || !selectedSchool}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem' }}
              >
                {migrating ? 'Migrando...' : 'Vincular registros'}
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <Spinner />
        ) : (
          <DataTable
            columns={['Escola', 'Responsavel', 'Celular', 'CNPJ', 'E-mail', 'Alunos', 'Professores', 'Data cadastro']}
            data={list}
            emptyMessage="Nenhuma escola aprovada no momento."
            renderRow={(u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.responsible_name || '-'}</td>
                <td>{u.phone || '-'}</td>
                <td>{u.cnpj || '-'}</td>
                <td>{u.email}</td>
                <td>{u.students_count ?? 0}</td>
                <td>{u.teachers_count ?? 0}</td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}</td>
              </tr>
            )}
          />
        )}
      </Card>
    </div>
  )
}
