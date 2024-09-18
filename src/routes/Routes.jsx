import Error from '../pages/Error'
import Editor from '../pages/Editor'
import Layout from '../components/Layout'
import ProtectedRoute from './ProtectedRoute'

export const Routes = [
	{
		path: '/',
		element: <Editor />,
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
