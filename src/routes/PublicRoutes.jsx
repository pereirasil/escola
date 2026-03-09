import Login from '../modules/auth/pages/Login';
import Cadastro from '../modules/auth/pages/Cadastro';

export const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/cadastro', element: <Cadastro /> },
];