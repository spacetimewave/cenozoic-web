import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCredentialStore } from '../../services/AuthService'

const Login = () => {
	const navigate = useNavigate()
	const { setUsername, setUsermail, setPassword, setToken } =
		useCredentialStore() // Add setToken

	const [mail, setMailState] = useState<string>('')
	const [password, setPasswordState] = useState<string>('')
	const [error, setError] = useState<string>('') // Added error state

	const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault()
		login(mail, password)
	}

	const login = async (usermail: string, password: string) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					username: usermail,
					password,
				}).toString(),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to log in')
			}

			// If login is successful
			const data = await response.json()
			setUsermail(usermail)
			setUsername(data.user_name)
			setPassword(password)
			setToken(data.access_token)
			navigate('/editor')
		} catch (error) {
			setError((error as Error).message)
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
