import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { publicRoutes } from './PublicRoutes';
import { privateRoutes } from './PrivateRoutes';

export const router = createBrowserRouter([
  ...publicRoutes,
  {
    path: '/',
    element: <ProtectedRoute>{privateRoutes.element}</ProtectedRoute>,
    children: privateRoutes.children,
  },
]);