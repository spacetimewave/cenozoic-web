import Error from '../pages/Error'
import Editor from '../pages/Editor'
import Layout from '../components/Layout'
import ProtectedRoute from './ProtectedRoute'
import Login from '../pages/Login'
import Signup from '../pages/Signup'

export const Routes = [
	{
		path: '/',
		element: <Login />,
		errorElement: <Error />,
	},
	{
		path: '/login',
		element: <Login />,
		errorElement: <Error />,
	},
	{
		path: '/signup',
		element: <Signup />,
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
		children: [
			{
				path: '/editor',
				element: <Editor />,
			},
		],
	},
]
