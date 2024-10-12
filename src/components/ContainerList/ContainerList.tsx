import { useEffect, useState } from 'react'
import FileExplorer from '../FileExplorer'
import {
	CreateNewContainer,
	StartContainer,
	GetUserContainers,
	DeleteContainer,
	useContainerStore,
	StopContainer,
	OpenTerminal,
} from '../../services/ContainerService'

interface ContainerManagerProps {
	token: string | null
}

const ContainerList = ({ token }: ContainerManagerProps) => {
	const { containers, setContainers } = useContainerStore()
	const [openContainerId, setOpenContainerId] = useState<string | null>(null) // Track open containers

	useEffect(() => {
		const fetchContainers = async () => {
			try {
				setContainers(await GetUserContainers(token ?? ''))
			} catch (error) {
				console.error('Error fetching containers:', error)
			}
		}

		fetchContainers()
	}, [token, setContainers])

	const handleAddNewContainer = async () => {
		try {
			const newContainer = await CreateNewContainer(token ?? '')
			console.log(newContainer)
			setContainers([...containers, newContainer])
		} catch (error) {
			console.error('Error starting new container:', error)
		}
	}

	const handleStopContainer = async (containerId: string) => {
		try {
			await StopContainer(containerId, token ?? '')
			setContainers(await GetUserContainers(token ?? ''))
		} catch (error) {
			console.error('Error starting new container:', error)
		}
	}

	const handleStartContainer = async (containerId: string) => {
		try {
			await StartContainer(containerId, token ?? '')
			setContainers(await GetUserContainers(token ?? ''))
		} catch (error) {
			console.error('Error starting new container:', error)
		}
	}

	const handleDeleteContainer = async (containerId: string) => {
		try {
			await DeleteContainer(containerId, token ?? '')
			setContainers(
				containers.filter(
					(container) => container.container_id !== containerId,
				),
			)
		} catch (error) {
			console.error('Error deleting container:', error)
		}
	}

	const toggleContainer = (containerId: string) => {
		setOpenContainerId(openContainerId === containerId ? null : containerId)
	}

	return (
		<div>
			<div className='mb-4'>
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
									<div className='flex items-center space-x-2 mt-2'>
										<button
											onClick={() =>
												handleStartContainer(container.container_id)
											}
											className='bg-blue-600 hover:bg-blue-400 text-white py-2 px-2 h-6 rounded text-xs flex items-center justify-center'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
												className='w-3 h-3'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M5 3l14 9-14 9V3z'
												/>
											</svg>
										</button>

										<button
											onClick={() =>
												handleStopContainer(container.container_id)
											}
											className='bg-orange-600 hover:bg-orange-400 text-white py-2 px-2 h-6 rounded text-xs flex items-center justify-center'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
												className='w-4 h-4'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M6 6h12v12H6z'
												/>
											</svg>
										</button>

										<button
											onClick={() =>
												handleDeleteContainer(container.container_id)
											}
											className='bg-red-500 hover:bg-red-700 text-white py-2 px-2 h-6 rounded text-xs flex items-center justify-center'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
												className='w-4 h-4'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M6 18L18 6M6 6l12 12'
												/>
											</svg>
										</button>

										<button
											onClick={() =>
												OpenTerminal(container.container_id, token ?? '')
											}
											className='bg-gray-900 hover:bg-gray-800 text-white py-2 px-2 h-6 rounded text-xs flex items-center justify-center'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
												className='w-4 h-4'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M4 17l6-6-6-6m8 14h8'
												/>
											</svg>
										</button>
									</div>

									<div className='flex justify-center mt-4'>
										<button
											onClick={() => toggleContainer(container.id)}
											className='bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white py-1 px-3 rounded-full shadow-sm duration-300 ease-in-out transform text-xs'
										>
											{openContainerId === container.id
												? 'Hide Options'
												: 'Show Options'}
										</button>
									</div>
									{openContainerId === container.id && (
										<div className='mt-3'>
											<FileExplorer />
										</div>
									)}
								</div>
							</li>
						))
					) : (
						<p>No containers available</p>
					)}
				</ul>
			</div>
		</div>
	)
}

export default ContainerList
