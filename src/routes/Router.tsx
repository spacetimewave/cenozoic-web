import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Routes } from './Routes.tsx'

const router = createBrowserRouter(Routes)

function Router() {
	return <RouterProvider router={router} />
}

export default Router
