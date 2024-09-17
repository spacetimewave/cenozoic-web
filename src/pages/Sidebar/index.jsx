import { useState } from 'react'
import { selectFolder } from '../../services/fileSystemService'

const Sidebar = ({ onFileSelect }) => {
	const [files, setFiles] = useState([])

	const handleSelectFolder = async () => {
		const selectedFiles = await selectFolder()
		setFiles(selectedFiles)
	}

	return (
		<div
			style={{
				width: '250px',
				padding: '20px',
				background: '#2d2d2d',
				color: '#fff',
			}}
		>
			<button onClick={handleSelectFolder}>Select Folder</button>
			<ul>
				{files.map((file, index) => (
					<li
						key={index}
						onClick={() => onFileSelect(file)}
						style={{ cursor: 'pointer', padding: '5px' }}
					>
						{file.name}
					</li>
				))}
			</ul>
		</div>
	)
}

export default Sidebar
