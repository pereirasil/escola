import Login from '../modules/auth/pages/Login';
import Cadastro from '../modules/auth/pages/Cadastro';
import LandingPage from '../modules/public/pages/LandingPage';
import SistemaEscolar from '../modules/public/pages/SistemaEscolar';
import Funcionalidades from '../modules/public/pages/Funcionalidades';
import Precos from '../modules/public/pages/Precos';

export const publicRoutes = [
  { path: '/', element: <LandingPage /> },
  { path: '/sistema-escolar', element: <SistemaEscolar /> },
  { path: '/funcionalidades', element: <Funcionalidades /> },
  { path: '/precos', element: <Precos /> },
  { path: '/login', element: <Login /> },
  { path: '/cadastro', element: <Cadastro /> },
];