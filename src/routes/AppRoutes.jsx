import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../layouts/Layout';
import AlunoLayout from '../layouts/AlunoLayout';
import ProfessorLayout from '../layouts/ProfessorLayout';
import { useAuthStore } from '../store/useAuthStore';
import { publicRoutes } from './PublicRoutes';
import { privateRoutes } from './PrivateRoutes';
import AlunoDashboard from '../modules/aluno/pages/AlunoDashboard';
import MeusDados from '../modules/aluno/pages/MeusDados';
import HistoricoEscolar from '../modules/aluno/pages/HistoricoEscolar';
import Comunicacao from '../modules/aluno/pages/Comunicacao';
import AlterarSenha from '../modules/aluno/pages/AlterarSenha';
import DatasImportantes from '../modules/aluno/pages/DatasImportantes';
import MeusHorarios from '../modules/aluno/pages/MeusHorarios';
import MinhasReunioes from '../modules/aluno/pages/MinhasReunioes';
import FinanceiroAluno from '../modules/aluno/pages/FinanceiroAluno';
import ProfessorDashboard from '../modules/professor/pages/ProfessorDashboard';
import MinhasTurmas from '../modules/professor/pages/MinhasTurmas';
import Presenca from '../modules/presenca/pages/Presenca';
import Notas from '../modules/notas/pages/Notas';
import RelatorioPresenca from '../modules/presenca/pages/RelatorioPresenca';
import AlterarSenhaProfessor from '../modules/professor/pages/AlterarSenhaProfessor';
import ComunicacaoProfessor from '../modules/professor/pages/Comunicacao';

export const router = createBrowserRouter([
  ...publicRoutes,

  {
    path: '/aluno',
    element: <ProtectedRoute allowedRoles={['responsible']} />,
    children: [
      {
        element: <AlunoLayout />,
        children: [
          { index: true, element: <AlunoDashboard /> },
          { path: 'dados', element: <MeusDados /> },
          { path: 'historico', element: <HistoricoEscolar /> },
          { path: 'horarios', element: <MeusHorarios /> },
          { path: 'financeiro', element: <FinanceiroAluno /> },
          { path: 'comunicacao', element: <Comunicacao /> },
          { path: 'notificacoes', element: <Navigate to="/aluno/comunicacao" replace /> },
          { path: 'datas', element: <DatasImportantes /> },
          { path: 'reunioes', element: <MinhasReunioes /> },
          { path: 'alterar-senha', element: <AlterarSenha /> },
        ],
      },
    ],
  },

  {
    path: '/professor',
    element: <ProtectedRoute allowedRoles={['teacher']} />,
    children: [
      {
        element: <ProfessorLayout />,
        children: [
          { index: true, element: <ProfessorDashboard /> },
          { path: 'turmas', element: <MinhasTurmas /> },
          { path: 'faltas', element: <Presenca /> },
          { path: 'notas', element: <Notas /> },
          { path: 'comunicacao', element: <ComunicacaoProfessor /> },
          { path: 'historico', element: <RelatorioPresenca /> },
          { path: 'alterar-senha', element: <AlterarSenhaProfessor /> },
        ],
      },
    ],
  },

  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <LayoutWithGuard />,
        children: privateRoutes.children.filter(r => !r.index),
      },
    ],
  },
]);

function LayoutWithGuard() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'responsible') return <Navigate to="/aluno" replace />;
  if (user?.role === 'teacher') return <Navigate to="/professor" replace />;
  return <Layout />;
}
