import { useState, useEffect } from 'react'
import { usersService } from '../../../services/users.service'
import { Card, PageHeader, DataTable, Spinner } from '../../../components/ui'
import toast from 'react-hot-toast'

export default function AprovarEscolas() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    usersService
      .listPending()
      .then((res) => setList(res.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Erro ao carregar.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleApprove = (id) => {
    usersService
      .approve(id)
      .then(() => {
        toast.success('Escola aprovada com sucesso!')
        load()
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Erro ao aprovar.'))
  }

  return (
    <div className="page">
      <PageHeader title="Aprovar Escolas" description="Escolas aguardando aprovação para liberação de acesso" />
      
      <Card>
        {loading ? (
          <Spinner />
        ) : (
          <DataTable
            columns={['Nome', 'E-mail', 'Data cadastro', 'Ações']}
            data={list}
            emptyMessage="Nenhuma escola pendente no momento."
            renderRow={(u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                <td>
                  <button type="button" className="btn-primary" onClick={() => handleApprove(u.id)}>
                    Permitir Acesso
                  </button>
                </td>
              </tr>
            )}
          />
        )}
      </Card>
    </div>
  )
}
