import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRedirect from './RoleBasedRedirect';
import Layout from '../layouts/Layout';
import AlunoLayout from '../layouts/AlunoLayout';
import ProfessorLayout from '../layouts/ProfessorLayout';
import { useAuthStore } from '../store/useAuthStore';
import { publicRoutes } from './PublicRoutes';
import { privateRoutes } from './PrivateRoutes';
import MeusDados from '../modules/aluno/pages/MeusDados';
import HistoricoEscolar from '../modules/aluno/pages/HistoricoEscolar';
import Notificacoes from '../modules/aluno/pages/Notificacoes';
import AlterarSenha from '../modules/aluno/pages/AlterarSenha';
import MinhasTurmas from '../modules/professor/pages/MinhasTurmas';
import Presenca from '../modules/presenca/pages/Presenca';
import Notas from '../modules/notas/pages/Notas';
import RelatorioPresenca from '../modules/presenca/pages/RelatorioPresenca';
import AlterarSenhaProfessor from '../modules/professor/pages/AlterarSenhaProfessor';

export const router = createBrowserRouter([
  ...publicRoutes,
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <RoleBasedRedirect /> },
      {
        path: 'aluno',
        element: <ProtectedRoute allowedRoles={['student']} />,
        children: [
          {
            element: <AlunoLayout />,
            children: [
              { index: true, element: <Navigate to="/aluno/dados" replace /> },
              { path: 'dados', element: <MeusDados /> },
              { path: 'historico', element: <HistoricoEscolar /> },
              { path: 'notificacoes', element: <Notificacoes /> },
              { path: 'alterar-senha', element: <AlterarSenha /> },
            ],
          },
        ],
      },
      {
        path: 'professor',
        element: <ProtectedRoute allowedRoles={['teacher']} />,
        children: [
          {
            element: <ProfessorLayout />,
            children: [
              { index: true, element: <Navigate to="/professor/turmas" replace /> },
              { path: 'turmas', element: <MinhasTurmas /> },
              { path: 'faltas', element: <Presenca /> },
              { path: 'notas', element: <Notas /> },
              { path: 'historico', element: <RelatorioPresenca /> },
              { path: 'alterar-senha', element: <AlterarSenhaProfessor /> },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <LayoutWithGuard />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          ...privateRoutes.children,
        ],
      },
    ],
  },
]);

function LayoutWithGuard() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'student') return <Navigate to="/aluno" replace />;
  if (user?.role === 'teacher') return <Navigate to="/professor" replace />;
  return <Layout />;
}