import Error from '../pages/Error'
import Home from '../pages/Home'
import Layout from '../components/Layout'
import ProtectedRoute from './ProtectedRoute'

export const Routes = [
	{
		path: '/',
		element: <Home />,
		errorElement: <Error />,
	},
	{
		path: '/',
		element: (
			<ProtectedRoute>
				<Layout />
			</ProtectedRoute>
		),
		errorElement: <Error />,
		children: [],
	},
]
