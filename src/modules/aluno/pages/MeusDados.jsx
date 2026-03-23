import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, FormInput, Spinner } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function MeusDados() {
  const [saving, setSaving] = useState(false)
  const studentId = useAuthStore((state) => state.studentId)
  const queryClient = useQueryClient()

  const { data: dados, isLoading, isError } = useQuery({
    queryKey: ['aluno', 'me', studentId],
    queryFn: () => alunosService.me(),
    enabled: !!studentId,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!studentId || !dados) return
    setSaving(true)
    try {
      await alunosService.atualizar(studentId, {
        name: dados.name,
        email: dados.email,
        birth_date: dados.birth_date,
        guardian_name: dados.guardian_name,
        guardian_phone: dados.guardian_phone,
        state: dados.state,
        city: dados.city,
        neighborhood: dados.neighborhood,
        street: dados.street,
        number: dados.number,
        complement: dados.complement,
      })
      toast.success('Dados atualizados.')
      queryClient.invalidateQueries({ queryKey: ['aluno', 'me', studentId] })
    } catch {
      toast.error('Erro ao atualizar.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <div className="page"><Spinner /></div>
  if (isError || !dados) return <div className="page">Não foi possível carregar seus dados.</div>

  return (
    <div className="page">
      <Card title="Meus dados">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput label="Nome" id="name" value={dados.name} onChange={(e) => setDados({ ...dados, name: e.target.value })} required />
            <FormInput label="CPF (usuário)" id="document" value={dados.document ?? ''} readOnly disabled />
            <FormInput label="E-mail" id="email" type="email" value={dados.email ?? ''} onChange={(e) => setDados({ ...dados, email: e.target.value })} />
            <FormInput label="Data de nascimento" id="birth_date" type="date" value={dados.birth_date ?? ''} onChange={(e) => setDados({ ...dados, birth_date: e.target.value })} />
            <FormInput label="Nome do responsável" id="guardian_name" value={dados.guardian_name ?? ''} onChange={(e) => setDados({ ...dados, guardian_name: e.target.value })} />
            <FormInput label="Telefone do responsável" id="guardian_phone" value={dados.guardian_phone ?? ''} onChange={(e) => setDados({ ...dados, guardian_phone: e.target.value })} />
            <FormInput label="Estado" id="state" value={dados.state ?? ''} onChange={(e) => setDados({ ...dados, state: e.target.value })} />
            <FormInput label="Cidade" id="city" value={dados.city ?? ''} onChange={(e) => setDados({ ...dados, city: e.target.value })} />
            <FormInput label="Bairro" id="neighborhood" value={dados.neighborhood ?? ''} onChange={(e) => setDados({ ...dados, neighborhood: e.target.value })} />
            <FormInput label="Rua" id="street" value={dados.street ?? ''} onChange={(e) => setDados({ ...dados, street: e.target.value })} />
            <FormInput label="Número" id="number" value={dados.number ?? ''} onChange={(e) => setDados({ ...dados, number: e.target.value })} />
            <FormInput label="Complemento" id="complement" value={dados.complement ?? ''} onChange={(e) => setDados({ ...dados, complement: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Card>
    </div>
  )
}
