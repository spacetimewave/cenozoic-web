import { useState } from 'react'
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
		<div className='flex justify-center items-center h-screen w-screen bg-gray-800'>
			<div className='bg-white p-6 rounded-lg shadow-lg w-80 text-center'>
				<h2 className='text-2xl mb-6'>Login</h2>
				<form onSubmit={handleSubmit}>
					<div className='mb-4'>
						<label htmlFor='username' className='block mb-2'>
							Username
						</label>
						<input
							type='text'
							id='username'
							name='username'
							value={username}
							onChange={(ev) => setUsernameState(ev.target.value)}
							className='w-full p-2 border border-gray-300 rounded'
						/>
					</div>
					<div className='mb-4'>
						<label htmlFor='password' className='block mb-2'>
							Password
						</label>
						<input
							type='password'
							id='password'
							name='password'
							value={password}
							onChange={(ev) => setPasswordState(ev.target.value)}
							className='w-full p-2 border border-gray-300 rounded'
						/>
					</div>
					<button
						className='bg-blue-800 hover:bg-blue-600 text-white py-2 rounded w-full'
						type='submit'
					>
						Login
					</button>
				</form>
				<p className='pt-4'>
					Don't have an account?{' '}
					<Link to={'/signup'} className='text-blue-800'>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	)
}

export default Login
