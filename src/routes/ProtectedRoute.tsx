import { Navigate } from 'react-router-dom'

import { useCredentialStore } from '../services/AuthService'
import { ReactNode } from 'react'

interface Props {
	children: ReactNode
}

function ProtectedRoute({ children }: Props) {
	const { username, password } = useCredentialStore()
	if (!username && !password) {
		return <Navigate to='/' replace />
	}
	return children
}

export default ProtectedRoute
