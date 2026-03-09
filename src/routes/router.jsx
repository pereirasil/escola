import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import Login from '../pages/Login'
import Cadastro from '../pages/Cadastro'
import Dashboard from '../pages/Dashboard'
import Alunos from '../pages/Alunos'
import Professores from '../pages/Professores'
import Materias from '../pages/Materias'
import Turmas from '../pages/Turmas'
import Horarios from '../pages/Horarios'
import Notas from '../pages/Notas'
import Presenca from '../pages/Presenca'
import Financeiro from '../pages/Financeiro'
import Reunioes from '../pages/Reunioes'
import AprovarEscolas from '../pages/AprovarEscolas'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/cadastro', element: <Cadastro /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'alunos', element: <Alunos /> },
      { path: 'professores', element: <Professores /> },
      { path: 'materias', element: <Materias /> },
      { path: 'turmas', element: <Turmas /> },
      { path: 'horarios', element: <Horarios /> },
      { path: 'notas', element: <Notas /> },
      { path: 'presenca', element: <Presenca /> },
      { path: 'financeiro', element: <Financeiro /> },
      { path: 'reunioes', element: <Reunioes /> },
      { path: 'aprovar-escolas', element: <AprovarEscolas /> },
    ],
  },
])
