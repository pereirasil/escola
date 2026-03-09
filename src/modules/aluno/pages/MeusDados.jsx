import { useState, useEffect } from 'react'
import { Card, FormInput } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function MeusDados() {
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    alunosService.me().then(setDados).catch(() => toast.error('Erro ao carregar dados.')).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.id || !dados) return
    setSaving(true)
    try {
      await alunosService.atualizar(user.id, {
        name: dados.name,
        email: dados.email,
        birth_date: dados.birth_date,
        guardian_name: dados.guardian_name,
        guardian_phone: dados.guardian_phone,
        address: dados.address,
      })
      toast.success('Dados atualizados.')
    } catch {
      toast.error('Erro ao atualizar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page">Carregando...</div>
  if (!dados) return <div className="page">Não foi possível carregar seus dados.</div>

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
            <FormInput label="Endereço" id="address" value={dados.address ?? ''} onChange={(e) => setDados({ ...dados, address: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Card>
    </div>
  )
}
