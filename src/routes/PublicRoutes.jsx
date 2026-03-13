import Login from '../modules/auth/pages/Login';
import Cadastro from '../modules/auth/pages/Cadastro';
import LandingPage from '../modules/public/pages/LandingPage';
import SistemaEscolar from '../modules/public/pages/SistemaEscolar';
import Funcionalidades from '../modules/public/pages/Funcionalidades';
import Precos from '../modules/public/pages/Precos';
import ControleDeAlunos from '../modules/public/pages/ControleDeAlunos';
import GestaoDeNotas from '../modules/public/pages/GestaoDeNotas';

export const publicRoutes = [
  { path: '/', element: <LandingPage /> },
  { path: '/sistema-escolar', element: <SistemaEscolar /> },
  { path: '/funcionalidades', element: <Funcionalidades /> },
  { path: '/precos', element: <Precos /> },
  { path: '/controle-de-alunos', element: <ControleDeAlunos /> },
  { path: '/gestao-de-notas', element: <GestaoDeNotas /> },
  { path: '/login', element: <Login /> },
  { path: '/cadastro', element: <Cadastro /> },
];