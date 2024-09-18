import { useState } from 'react'
import { selectFolder } from '../../services/fileSystemService'

const Sidebar = ({ onFileSelect }) => {
	const [files, setFiles] = useState([]) // To store folder contents
	const [isParentOpen, setIsParentOpen] = useState(true) // To track if the parent folder is open

	const handleSelectFolder = async () => {
		const folderStructure = await selectFolder()
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

	const renderTree = (items, path = []) => {
		return items.map((item, index) => {
			const currentPath = [...path, index] // Create a unique path for each item

			if (item.kind === 'directory') {
				return (
					<li key={index}>
						<div
							className='cursor-pointer'
							onClick={() => toggleFolder(currentPath, index)}
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
						onClick={() => onFileSelect(item.handle)}
						className='cursor-pointer'
					>
						📝 {item.name}
					</li>
				)
			}
		})
	}

	return (
		<div className='w-64 p-5 bg-zinc-800 text-white overflow-y-auto h-screen'>
			<button
				onClick={handleSelectFolder}
				className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mb-4'
			>
				Select Folder
			</button>

			{/* Collapsible Parent Folder */}
			<div>
				{/* Render the folder tree only if the parent is open */}
				{isParentOpen && <ul>{renderTree(files)}</ul>}
			</div>
		</div>
	)
}

export default Sidebar
