import { useState, useEffect } from 'react'
import { usersService } from '../../../services/users.service'
import { Card, PageHeader, DataTable, Spinner } from '../../../components/ui'
import toast from 'react-hot-toast'

export default function EscolasAprovadas() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usersService
      .listApproved()
      .then((res) => setList(res.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Erro ao carregar escolas.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <PageHeader title="Escolas Aprovadas" description="Lista de todas as escolas com acesso liberado" />

      <Card>
        {loading ? (
          <Spinner />
        ) : (
          <DataTable
            columns={['Escola', 'Responsavel', 'Celular', 'CNPJ', 'E-mail', 'Data cadastro']}
            data={list}
            emptyMessage="Nenhuma escola aprovada no momento."
            renderRow={(u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.responsible_name || '-'}</td>
                <td>{u.phone || '-'}</td>
                <td>{u.cnpj || '-'}</td>
                <td>{u.email}</td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}</td>
              </tr>
            )}
          />
        )}
      </Card>
    </div>
  )
}
