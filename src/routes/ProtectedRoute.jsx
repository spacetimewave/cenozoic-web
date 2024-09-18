import { Navigate } from 'react-router-dom'
import { useSignals } from '@preact/signals-react/runtime'

import useCredentialStore from '../state'

function ProtectedRoute({ children }) {
	useSignals()
	const { username, password } = useCredentialStore()
	if (!username && !password) {
		return <Navigate to='/' replace />
	}
	return children
}

export default ProtectedRoute
