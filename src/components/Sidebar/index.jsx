import { useState } from 'react'
import { selectProjectFolder } from '../../services/fileSystemService'
import { useNavigate } from 'react-router-dom'
import useCredentialStore from '../../state'

const Sidebar = ({ onFileSelected }) => {
	const [files, setFiles] = useState([]) // To store folder contents
	const [isParentOpen, setIsParentOpen] = useState(true) // To track if the parent folder is open
	const [contextMenu, setContextMenu] = useState(null) // Context menu state
	const [selectedFolder, setSelectedFolder] = useState(null) // To store the selected folder
	const navigate = useNavigate()
	const { username, setUsername, setPassword } = useCredentialStore()

	const handleSelectFolder = async () => {
		const folderStructure = await selectProjectFolder()
		if (folderStructure) {
			setFiles(
				folderStructure.map((file) => ({
					...file,
					isOpen: false, // Add isOpen flag to each directory
				})),
			)
			setIsParentOpen(true) // When selecting a new folder, make it open by default
		}
	}

	const handleSignOut = async () => {
		setUsername(null)
		setPassword(null)
		navigate('/login')
	}

	const toggleFolder = (path, index) => {
		// Recursively toggle the folder's isOpen state in a new structure
		const updatedFiles = [...files]

		const toggle = (items, path, depth) => {
			if (depth === path.length - 1) {
				items[path[depth]].isOpen = !items[path[depth]].isOpen
				return items
			}
			if (items[path[depth]].children) {
				items[path[depth]].children = toggle(
					items[path[depth]].children,
					path,
					depth + 1,
				)
			}
			return items
		}

		setFiles(toggle(updatedFiles, path, 0))
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
			// Implement add folder logic here
			console.log('Add folder to', selectedFolder)
		} else if (action === 'add-file') {
			// Implement add file logic here
			console.log('Add file to', selectedFolder)
		} else if (action === 'delete') {
			// Implement delete logic here
			console.log('Delete', selectedFolder)
		}
		setContextMenu(null)
	}

	const renderTree = (items, path = []) => {
		return items.map((item, index) => {
			const currentPath = [...path, index] // Create a unique path for each item

			if (item.kind === 'directory') {
				return (
					<li key={index}>
						<div
							className='cursor-pointer'
							onClick={() => toggleFolder(currentPath, index)}
							onContextMenu={(e) => handleContextMenu(e, item)}
						>
							{item.isOpen ? '📂' : '📁'} {item.name}
						</div>
						{item.isOpen && item.children && (
							<ul className='pl-5'>{renderTree(item.children, currentPath)}</ul>
						)}
					</li>
				)
			} else {
				return (
					<li
						key={index}
						onClick={() => onFileSelected(item.handle)}
						className='cursor-pointer'
					>
						📝 {item.name}
					</li>
				)
			}
		})
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

			<div>{isParentOpen && <ul>{renderTree(files)}</ul>}</div>

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
