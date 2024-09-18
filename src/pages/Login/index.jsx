import { useState } from 'react'
import './index.css'
import { Link, useNavigate } from 'react-router-dom'
import useCredentialStore from '../../state'

const Login = () => {
	const navigate = useNavigate()
	const { setUsername, setPassword } = useCredentialStore()

	const [username, setUsernameState] = useState('')
	const [password, setPasswordState] = useState('')

	const handleSubmit = (ev) => {
		ev.preventDefault()
		login(username, password)
	}

	const login = (username, password) => {
		setUsername(username)
		setPassword(password)
		navigate('/editor')
	}

	return (
		<div className='app-container'>
			<div className='login-card'>
				<h2>Login</h2>
				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<label htmlFor='username'>Username</label>
						<input
							type='text'
							id='username'
							name='username'
							value={username}
							onChange={(ev) => setUsernameState(ev.target.value)}
						/>
					</div>
					<div className='form-group'>
						<label htmlFor='password'>Password</label>
						<input
							type='password'
							id='password'
							name='password'
							value={password}
							onChange={(ev) => setPasswordState(ev.target.value)}
						/>
					</div>
					<button type='submit'>Login</button>
				</form>
				<p>
					Don't have an account? <Link to={'/signup'}>Sign up</Link>
				</p>
			</div>
		</div>
	)
}

export default Login
