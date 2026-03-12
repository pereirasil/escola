import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, ConfirmModal, FormModal } from '../../../components/ui';
import { materiasService } from '../../../services/materias.service';
import MateriaForm from '../components/MateriaForm';
import toast from 'react-hot-toast';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    try {
      const res = await materiasService.listar();
      setMaterias(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar materias.');
    }
  };

  useEffect(() => { load() }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await materiasService.excluir(deleteTarget);
      toast.success('Materia excluida com sucesso!');
      load();
    } catch (error) {
      toast.error('Erro ao excluir materia.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Materias" description="Cadastro das disciplinas escolares">
        <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
          + Adicionar Disciplina
        </button>
      </PageHeader>

      <Card title="Lista de Materias">
        <DataTable
          columns={['Nome', 'Duracao (minutos)', 'Acoes']}
          data={materias}
          renderRow={(m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.duration_minutes || '-'}</td>
              <td>
                <button className="btn-danger" onClick={() => setDeleteTarget(m.id)}>Excluir</button>
              </td>
            </tr>
          )}
        />
      </Card>

      <FormModal open={modalOpen} title="Cadastrar Nova Disciplina" onClose={() => setModalOpen(false)}>
        <MateriaForm onSuccess={handleFormSuccess} />
      </FormModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir materia"
        message="Tem certeza que deseja excluir esta materia? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
