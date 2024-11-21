import { useState } from 'react'
import { IFile, IFolder } from '../../interfaces/IFileSystem'
import {
	Container,
	getFolderChildren,
	toggleFolder,
	openFile,
	moveItem,
	createFolder,
	createFile,
	deleteFolder,
	deleteFile,
	renameItem
} from '../../services/ContainerService'

interface ContainerFilesProps {
	container: Container
	token: string | null
}

const ContainerFileExplorer = ({ container, token }: ContainerFilesProps) => {
	const [contextMenu, setContextMenu] = useState<{
		top: number
		left: number
	} | null>(null)
	const [selectedItem, setSelectedItem] = useState<IFile | IFolder | null>(null)
	const [renamingItem, setRenamingItem] = useState<IFile | IFolder | null>(null)
	const [renameInput, setRenameInput] = useState<string>('')
	const [newItemName, setNewItemName] = useState<string>('') // State for new item name
	const [newItemType, setNewItemType] = useState<'directory' | 'file' | null>(
		null,
	) // State for new item name
	const [addingToPath, setAddingToPath] = useState<string | null>(null) // State to track where to add a new item
	const [draggedItem, setDraggedItem] = useState<IFile | IFolder | null>(null) // Track the dragged item

	const handleContextMenu = (
		e: React.MouseEvent<HTMLDivElement>,
		item: IFile | IFolder,
	) => {
		e.preventDefault()
		setContextMenu({
			top: e.clientY,
			left: e.clientX,
		})
		setSelectedItem(item)
	}

	const handleMenuAction = (action: string) => {
		if (selectedItem === null) {
			return
		}
		if (action === 'add-folder') {
			setNewItemName('') // Reset new item name
			setNewItemType('directory')
			setAddingToPath(selectedItem.path) // Set the path to add the new item
		} else if (action === 'add-file') {
			setNewItemName('file.txt') // Default name for new file
			setNewItemType('file')
			setAddingToPath(selectedItem.path) // Set the path to add the new item
		} else if (action === 'delete-folder') {
			deleteFolder(container.container_id, selectedItem.path)
		} else if (action === 'delete-file') {
			deleteFile(container.container_id, selectedItem.path)
		} else if (action === 'rename') {
			setRenamingItem(selectedItem)
			setRenameInput(selectedItem.name)
		}
		setContextMenu(null)
	}

	const handleNewItemBlur = async () => {
		if (newItemName && addingToPath) {
			if (newItemType === 'file') {
				await createFile(
					container.container_id,
					`${addingToPath}/${newItemName}`,
				)
			} else if (newItemType === 'directory') {
				await createFolder(container.container_id, addingToPath, newItemName)
			}
			setNewItemName('') // Clear input after creation
			setNewItemType(null)
			setAddingToPath(null) // Reset adding path
		}
	}

	const handleRenameBlur = async () => {
		if (renamingItem) {
			await renameItem(container.container_id, renamingItem.path, renameInput)
			setRenamingItem(null)
		}
	}

	// Drag-and-drop handlers
	const handleDragStart = (
		e: React.DragEvent<HTMLDivElement>,
		item: IFile | IFolder,
	) => {
		console.log('drag start', e)
		setDraggedItem(item) // Store the dragged item
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault() // Allow dropping
	}

	const handleDrop = async (
		e: React.DragEvent<HTMLDivElement>,
		targetFolder: IFolder,
	) => {
		e.preventDefault()
		e.stopPropagation()
		if (draggedItem && draggedItem.path !== targetFolder.path) {
			await moveItem(
				container.container_id,
				draggedItem.path,
				targetFolder.path,
			) // Move the dragged item
			setDraggedItem(null) // Clear dragged item
		}
	}

	const renderTree = (parentPath: string | null = null) => {
		const items = getFolderChildren(container.container_id, parentPath)
		return (
			<div className={parentPath === null ? '' : 'pl-2'}>
				{items?.map((item, index) => {
					const isAddingNewItem = addingToPath === item.path
					if (item.kind === 'directory') {
						return (
							<div
								key={index}
								onDragOver={handleDragOver}
								onDrop={(e) => handleDrop(e, item)} // Handle drop on folder
							>
								<div
									className='cursor-pointer'
									onClick={() =>
										toggleFolder(container.container_id, item.path)
									}
									onContextMenu={(e) => handleContextMenu(e, item)}
									draggable // Make folder draggable
									onDragStart={(e) => handleDragStart(e, item)} // Handle drag start
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
							</div>
						)
					} else {
						return (
							<div
								key={index}
								onClick={async () =>
									await openFile(container.container_id, item.path)
								}
								onContextMenu={(e) => handleContextMenu(e, item)}
								className='cursor-pointer'
								draggable // Make file draggable
								onDragStart={(e) => handleDragStart(e, item)} // Handle drag start
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
							</div>
						)
					}
				})}
			</div>
		)
	}

	return (
		<>
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
		</>
	)
}

export default ContainerFileExplorer
