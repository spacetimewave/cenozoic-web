import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCredentialStore } from '../../services/AuthService'
import FileExplorer from '../FileExplorer'
import {
	StartNewContainer,
	GetUserContainers,
	useContainerStore,
} from '../../services/ContainerService'

const Sidebar = () => {
	const navigate = useNavigate()
	const { username, usermail, token, setUsermail, setToken, setUsername, setPassword } =
		useCredentialStore()

	const { containers, setContainers } = useContainerStore()

	const handleSignOut = async () => {
		setUsername(null)
		setUsermail(null)
		setToken(null)
		setPassword(null)
		navigate('/login')
	}


	useEffect(() => {
		console.log('Fetching containers...')		
		
	const fetchContainers = async () => {
		try {
			const containerData = await GetUserContainers(token??'')
			setContainers(containerData) 
		} catch (error) {
			console.error('Error fetching containers:', error)
		}
	}	
		fetchContainers()
	}, [usermail, token, setContainers])

	const handleAddNewContainer = async () => {
		try {
			const newContainer = await StartNewContainer(token??'')
			setContainers([...containers, newContainer]) // Add new container to the state
		} catch (error) {
			console.error('Error starting new container:', error)
		}
	}

	return (
		<div className='w-64 p-5 bg-zinc-800 text-white overflow-y-auto h-screen relative'>
			<div className='flex items-center mb-6'>
				<span className='w-10 h-10 rounded-full mr-3 bg-slate-500'></span>
				<div>
					<h2 className='font-semibold text-lg'>{username}</h2>
					<button
						onClick={handleSignOut}
						className='text-sm text-blue-400 hover:underline'
					>
						Sign Out
					</button>
				</div>
			</div>

			<div className='mb-4'>
				{/* Button to start a new container */}
				<button
					onClick={handleAddNewContainer}
					className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
				>
					Start New Container
				</button>
			</div>

			<div>
				<h3 className='text-lg font-semibold mb-2'>Your Containers:</h3>
				<ul>
					{containers.length > 0 ? (
						containers.map((container) => (
							<li key={container.id} className='mb-2'>
								<div className='bg-gray-700 p-3 rounded'>
									<p className='text-xs'>
										<strong>ID:</strong> {container.id}
									</p>
									<p className='text-xs'>
										<strong>Name:</strong> {container.container_name}
									</p>
									<p className='text-xs'>
										<strong>Status:</strong> {container.status}
									</p>
								</div>
							</li>
						))
					) : (
						<p>No containers available</p>
					)}
				</ul>
			</div>

			<FileExplorer></FileExplorer>
		</div>
	)
}

export default Sidebar
