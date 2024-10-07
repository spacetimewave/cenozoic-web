import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/AuthService'

const Login = () => {
	const navigate = useNavigate()

	const [mail, setMailState] = useState<string>('')
	const [password, setPasswordState] = useState<string>('')
	const [error, setError] = useState<string>('') // Added error state

	const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const success = await login(mail, password)
		if (success) {
			navigate('/editor')
		} else {
			setError('Failed to log in')
		}
	}

	return (
		<div className='flex justify-center items-center h-screen w-screen bg-gray-800'>
			<div className='bg-white p-6 rounded-lg shadow-lg w-80 text-center'>
				<h2 className='text-2xl mb-6'>Login</h2>
				{error && <p className='text-red-600 text-sm mb-4'>{error}</p>}{' '}
				{/* Display error message */}
				<form onSubmit={handleSubmit}>
					<div className='mb-4 text-left'>
						<label htmlFor='username' className='block mb-1'>
							Username or email
						</label>
						<input
							type='text'
							id='username'
							name='username'
							value={mail}
							onChange={(ev) => setMailState(ev.target.value)}
							className='w-full p-2 border border-gray-300 rounded'
						/>
					</div>
					<div className='mb-4 text-left'>
						<label htmlFor='password' className='block mb-1'>
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
