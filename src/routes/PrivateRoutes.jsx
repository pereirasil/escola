import { Navigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Dashboard from '../modules/dashboard/pages/Dashboard';
import Alunos from '../modules/alunos/pages/Alunos';
import AlunoDetalhes from '../modules/alunos/pages/AlunoDetalhes';
import Professores from '../modules/professores/pages/Professores';
import Materias from '../modules/materias/pages/Materias';
import Turmas from '../modules/turmas/pages/Turmas';
import Horarios from '../modules/horarios/pages/Horarios';
import Notas from '../modules/notas/pages/Notas';
import Presenca from '../modules/presenca/pages/Presenca';
import RelatorioPresenca from '../modules/presenca/pages/RelatorioPresenca';
import Financeiro from '../modules/financeiro/pages/Financeiro';
import Reunioes from '../modules/reunioes/pages/Reunioes';
import AprovarEscolas from '../modules/admin/pages/AprovarEscolas';

export const privateRoutes = {
  path: '/',
  element: <Layout />,
  children: [
    { index: true, element: <Navigate to="/dashboard" replace /> },
    { path: 'dashboard', element: <Dashboard /> },
    { path: 'alunos', element: <Alunos /> },
    { path: 'alunos/:id', element: <AlunoDetalhes /> },
    { path: 'professores', element: <Professores /> },
    { path: 'materias', element: <Materias /> },
    { path: 'turmas', element: <Turmas /> },
    { path: 'horarios', element: <Horarios /> },
    { path: 'notas', element: <Notas /> },
    { path: 'presenca', element: <Presenca /> },
    { path: 'relatorio-presenca', element: <RelatorioPresenca /> },
    { path: 'financeiro', element: <Financeiro /> },
    { path: 'reunioes', element: <Reunioes /> },
    { path: 'aprovar-escolas', element: <AprovarEscolas /> },
  ],
};