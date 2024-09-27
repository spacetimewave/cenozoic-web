import { Navigate } from 'react-router-dom'

import { useCredentialStore } from '../services/AuthService'

function ProtectedRoute({ children }: any) {
	const { username, password } = useCredentialStore()
	if (!username && !password) {
		return <Navigate to='/' replace />
	}
	return children
}

export default ProtectedRoute
