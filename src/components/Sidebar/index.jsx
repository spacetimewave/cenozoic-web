import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCredentialStore from '../../state'
import {
	SelectProjectFolder,
	useFileSystemStore,
	toggleFolder,
	openFile,
	getChildren,
	deleteFolder,
	deleteFile,
	renameItem,
	createFolder,
	createFile,
} from '../../services/FileSystemService'

const Sidebar = () => {
	const navigate = useNavigate()
	const { username, setUsername, setPassword } = useCredentialStore()
	const { projectFiles } = useFileSystemStore()

	const [contextMenu, setContextMenu] = useState(null)
	const [selectedItem, setSelectedItem] = useState(null)
	const [renamingItem, setRenamingItem] = useState(null)
	const [renameInput, setRenameInput] = useState('')
	const [newItemName, setNewItemName] = useState('') // State for new item name
	const [addingToPath, setAddingToPath] = useState(null) // State to track where to add a new item

	useState(() => {}, projectFiles)

	const handleSelectFolder = async () => {
		await SelectProjectFolder()
	}

	const handleSignOut = async () => {
		setUsername(null)
		setPassword(null)
		navigate('/login')
	}

	const handleContextMenu = (e, item) => {
		e.preventDefault()
		setContextMenu({
			top: e.clientY,
			left: e.clientX,
		})
		setSelectedItem(item)
	}

	const handleMenuAction = (action) => {
		if (action === 'add-folder') {
			setNewItemName('') // Reset new item name
			setAddingToPath(selectedItem.path) // Set the path to add the new item
		} else if (action === 'add-file') {
			setNewItemName('new.txt') // Default name for new file
			setAddingToPath(selectedItem.path) // Set the path to add the new item
		} else if (action === 'delete-folder') {
			deleteFolder(selectedItem.path)
		} else if (action === 'delete-file') {
			deleteFile(selectedItem.path)
		} else if (action === 'rename') {
			setRenamingItem(selectedItem)
			setRenameInput(selectedItem.name)
		}
		setContextMenu(null)
	}

	const handleNewItemBlur = async () => {
		if (newItemName && addingToPath) {
			console.log(addingToPath)
			if (newItemName.endsWith('.txt')) {
				await createFile(addingToPath, newItemName)
			} else {
				await createFolder(addingToPath, newItemName)
			}
			setNewItemName('') // Clear input after creation
			setAddingToPath(null) // Reset adding path
		}
	}

	const handleRenameBlur = async () => {
		if (renamingItem) {
			await renameItem(renamingItem.path, renameInput)
			setRenamingItem(null)
		}
	}

	const renderTree = (parentPath = null) => {
		const items = getChildren(parentPath)
		return (
			<ul className={parentPath === null ? '' : 'pl-2'}>
				{items?.map((item, index) => {
					const isAddingNewItem = addingToPath === item.path
					if (item.kind === 'directory') {
						return (
							<li key={index}>
								<div
									className='cursor-pointer'
									onClick={() => toggleFolder(item.path)}
									onContextMenu={(e) => handleContextMenu(e, item)}
								>
									{renamingItem?.path === item.path ? (
										<input
											type='text'
											value={renameInput}
											onChange={(e) => setRenameInput(e.target.value)}
											onBlur={handleRenameBlur}
											autoFocus
											className='w-full px-2 py-1 border text-black'
										/>
									) : (
										<>
											{item.isOpen ? '📂' : '📁'} {item.name}
										</>
									)}
								</div>
								{item.isOpen && renderTree(item.path)}
								{/* Input for new item in the specific folder */}
								{isAddingNewItem && (
									<input
										type='text'
										value={newItemName}
										onChange={(e) => setNewItemName(e.target.value)}
										onBlur={handleNewItemBlur} // Save the new name on blur
										placeholder='Enter name...'
										className='w-full text-black px-2 py-1 border'
										autoFocus
									/>
								)}
							</li>
						)
					} else {
						return (
							<li
								key={index}
								onClick={() => openFile(item)}
								onContextMenu={(e) => handleContextMenu(e, item)}
								className='cursor-pointer'
							>
								{renamingItem?.path === item.path ? (
									<input
										type='text'
										value={renameInput}
										onChange={(e) => setRenameInput(e.target.value)}
										onBlur={handleRenameBlur}
										autoFocus
										className='w-full text-black px-2 py-1 border'
									/>
								) : (
									<>📝 {item.name}</>
								)}
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
						{selectedItem?.kind === 'directory' ? (
							<li>
								<button
									onClick={() => handleMenuAction('delete-folder')}
									className='w-full text-left px-4 py-2 hover:bg-gray-100'
								>
									Delete Folder
								</button>
							</li>
						) : (
							<li>
								<button
									onClick={() => handleMenuAction('delete-file')}
									className='w-full text-left px-4 py-2 hover:bg-gray-100'
								>
									Delete File
								</button>
							</li>
						)}
						<li>
							<button
								onClick={() => handleMenuAction('rename')}
								className='w-full text-left px-4 py-2 hover:bg-gray-100'
							>
								Rename
							</button>
						</li>
					</ul>
				</div>
			)}
		</div>
	)
}

export default Sidebar
