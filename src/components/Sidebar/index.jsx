import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCredentialStore from '../../state'
import {
	SelectProjectFolder,
	useFileSystemStore,
	toggleFolder,
	openFile,
	getChildren,
} from '../../services/FileSystemService'

const Sidebar = () => {
	const navigate = useNavigate()
	const { username, setUsername, setPassword } = useCredentialStore()
	const { projectFiles } = useFileSystemStore()

	const [contextMenu, setContextMenu] = useState(null) // Context menu state (Add file, delete folder, add folder menu)
	const [selectedFolder, setSelectedFolder] = useState(null) // To store the selected folder

	useState(() => {}, projectFiles)

	const handleSelectFolder = async () => {
		await SelectProjectFolder()
	}

	const handleSignOut = async () => {
		setUsername(null)
		setPassword(null)
		navigate('/login')
	}

	const handleContextMenu = (e, folder) => {
		e.preventDefault()
		setContextMenu({
			top: e.clientY,
			left: e.clientX,
		})
		setSelectedFolder(folder)
	}

	const handleMenuAction = (action) => {
		if (action === 'add-folder') {
			console.log('Add folder to', selectedFolder)
		} else if (action === 'add-file') {
			console.log('Add file to', selectedFolder)
		} else if (action === 'delete') {
			console.log('Delete', selectedFolder)
		}
		setContextMenu(null)
	}

	const renderTree = (parentPath = null) => {
		// Get the files and directories that are children of the given parentPath

		const items = getChildren(parentPath)
		return (
			<ul className={parentPath === null ? '' : 'pl-2'}>
				{items?.map((item, index) => {
					if (item.kind === 'directory') {
						return (
							<li key={index}>
								<div
									className='cursor-pointer'
									onClick={() => toggleFolder(item.path)}
									onContextMenu={(e) => handleContextMenu(e, item)}
								>
									{item.isOpen ? '📂' : '📁'} {item.name}
								</div>
								{item.isOpen && renderTree(item.path)}
							</li>
						)
					} else {
						return (
							<li
								key={index}
								onClick={() => openFile(item.handle)}
								className='cursor-pointer'
							>
								📝 {item.name}
							</li>
						)
					}
				})}
			</ul>
		)
	}

	return (
		<div className='w-64 p-5 bg-zinc-800 text-white overflow-y-auto h-screen relative'>
			<div className='flex items-center mb-6'>
				<span
					className='w-10 h-10 rounded-full mr-3 bg-slate-500'
					alt='profile'
				></span>
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

			<button
				onClick={handleSelectFolder}
				className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mb-4'
			>
				Select Folder
			</button>

			<div>{renderTree()}</div>

			{contextMenu && (
				<div
					className='absolute bg-white text-black border border-gray-300 rounded shadow-lg z-50'
					style={{
						top: contextMenu.top,
						left: contextMenu.left,
						width: '150px',
					}}
				>
					<ul className='list-none m-0 p-0'>
						<li>
							<button
								onClick={() => handleMenuAction('add-folder')}
								className='w-full text-left px-4 py-2 hover:bg-gray-100'
							>
								Add Folder
							</button>
						</li>
						<li>
							<button
								onClick={() => handleMenuAction('add-file')}
								className='w-full text-left px-4 py-2 hover:bg-gray-100'
							>
								Add File
							</button>
						</li>
						<li>
							<button
								onClick={() => handleMenuAction('delete')}
								className='w-full text-left px-4 py-2 hover:bg-gray-100'
							>
								Delete
							</button>
						</li>
					</ul>
				</div>
			)}
		</div>
	)
}

export default Sidebar
