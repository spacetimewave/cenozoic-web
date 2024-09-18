import { useState } from 'react'
import { selectFolder } from '../../services/fileSystemService'

const Sidebar = ({ onFileSelect }) => {
	const [files, setFiles] = useState([]) // To store folder contents
	// const [folderName, setFolderName] = useState('') // To store the selected folder name
	const [isParentOpen, setIsParentOpen] = useState(true) // To track if the parent folder is open

	const handleSelectFolder = async () => {
		const folderStructure = await selectFolder()
		if (folderStructure) {
			// setFolderName(folderStructure.projectFolder) // Store the selected folder name
			// // Set initial isOpen state for each directory
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
							style={{ cursor: 'pointer' }}
							onClick={() => toggleFolder(currentPath, index)}
						>
							{item.isOpen ? '📂' : '📁'} {item.name}
						</div>
						{item.isOpen && item.children && (
							<ul style={{ paddingLeft: '20px' }}>
								{renderTree(item.children, currentPath)}
							</ul>
						)}
					</li>
				)
			} else {
				return (
					<li
						key={index}
						onClick={() => onFileSelect(item.handle)}
						style={{ cursor: 'pointer' }}
					>
						📝 {item.name}
					</li>
				)
			}
		})
	}

	return (
		<div
			style={{
				width: '250px',
				padding: '20px',
				background: '#2d2d2d',
				color: '#fff',
				overflowY: 'auto',
				height: '100vh',
			}}
		>
			<button onClick={handleSelectFolder}>Select Folder</button>

			{/* Collapsible Parent Folder */}
			{
				<div>
					{/* Render the folder tree only if the parent is open */}
					{isParentOpen && <ul>{renderTree(files)}</ul>}
				</div>
			}
		</div>
	)
}

export default Sidebar
