import { RouterProvider } from 'react-router-dom'
import { router } from './routes/AppRoutes'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  )
}
