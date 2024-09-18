import { useState } from 'react'
import CodeEditor from '../../components/CodeEditor'
import Sidebar from '../../components/Sidebar'

const App = () => {
	// State for opened files (each file contains name and content)
	const [openFiles, setOpenFiles] = useState([])
	// State for the currently active tab (file index)
	const [activeTab, setActiveTab] = useState(0)

	const handleFileSelect = async (fileHandle) => {
		const file = await fileHandle.getFile()
		const fileContent = await file.text()

		const fileName = file.name

		// Check if the file is already open
		const existingFileIndex = openFiles.findIndex((f) => f.name === fileName)

		if (existingFileIndex !== -1) {
			// If file is already open, switch to that tab
			setActiveTab(existingFileIndex)
		} else {
			// Open a new file and add it to the openFiles array
			setOpenFiles((prevFiles) => [
				...prevFiles,
				{ name: fileName, content: fileContent },
			])
			setActiveTab(openFiles.length) // Switch to the new tab
		}
	}

	const handleCodeChange = (newValue) => {
		// Update the content of the active file
		const updatedFiles = [...openFiles]
		updatedFiles[activeTab].content = newValue
		setOpenFiles(updatedFiles)
	}

	const handleCloseTab = (index) => {
		// Remove the file from openFiles and update the activeTab
		const updatedFiles = openFiles.filter((_, i) => i !== index)
		setOpenFiles(updatedFiles)
		// Adjust the active tab if necessary
		if (index === activeTab && updatedFiles.length > 0) {
			setActiveTab(Math.min(activeTab, updatedFiles.length - 1))
		} else if (updatedFiles.length === 0) {
			setActiveTab(0)
		}
	}

	return (
		<div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
			<Sidebar onFileSelect={handleFileSelect} />

			<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
				{/* Render file tabs */}
				<div style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
					{openFiles.map((file, index) => (
						<div
							key={index}
							onClick={() => setActiveTab(index)}
							style={{
								padding: '10px',
								cursor: 'pointer',
								backgroundColor: activeTab === index ? '#ddd' : '#f5f5f5',
								borderBottom: activeTab === index ? '2px solid blue' : 'none',
							}}
						>
							{file.name}
							<button
								onClick={(e) => {
									e.stopPropagation()
									handleCloseTab(index)
								}}
								style={{ marginLeft: '10px', cursor: 'pointer' }}
							>
								✖
							</button>
						</div>
					))}
				</div>

				{/* Render the active CodeEditor */}
				{openFiles.length > 0 && (
					<CodeEditor
						value={openFiles[activeTab].content}
						onChange={handleCodeChange}
					/>
				)}
			</div>
		</div>
	)
}

export default App
