import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCredentialStore } from '../../services/AuthService'

const Signup = () => {
	const navigate = useNavigate()
	const { setUsername, setPassword, setUsermail, setToken } =
		useCredentialStore()

	const [username, setUsernameState] = useState<string>('')
	const [email, setEmailState] = useState<string>('') // Added email state
	const [password, setPasswordState] = useState<string>('')
	const [error, setError] = useState<string>('') // Added error state

	const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
		ev.preventDefault()
		signup(username, email, password)
	}

	const signup = async (username: string, email: string, password: string) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username,
					email,
					password,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to sign up')
			}

			// If signup is successful
			const data = await response.json()
			setUsername(username)
			setUsermail(email)
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
				<h2 className='text-2xl mb-6'>Sign Up</h2>
				<form onSubmit={handleSubmit}>
					<div className='mb-4 text-left'>
						<label htmlFor='username' className='block mb-1'>
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
					<div className='mb-4 text-left'>
						<label htmlFor='email' className='block mb-1'>
							Email
						</label>
						<input
							type='email'
							id='email'
							name='email'
							value={email}
							onChange={(ev) => setEmailState(ev.target.value)}
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
					{error && <p className='text-red-600 text-sm mb-4'>{error}</p>}{' '}
					{/* Display error message */}
					<button
						className='bg-blue-800 hover:bg-blue-600 text-white py-2 rounded w-full'
						type='submit'
					>
						Sign Up
					</button>
				</form>
				<p className='pt-4'>
					Already have an account?{' '}
					<Link to={'/login'} className='text-blue-800'>
						Log in
					</Link>
				</p>
			</div>
		</div>
	)
}

export default Signup
