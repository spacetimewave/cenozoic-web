import { useState, useEffect } from 'react'
import CodeEditor from '../../components/CodeEditor'
import SaveModal from '../../components/Modal'

const FileManager = ({ selectedFile }) => {
	const [openFiles, setOpenFiles] = useState([])
	const [activeTab, setActiveTab] = useState(0)
	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
	const [closingTabIndex, setClosingTabIndex] = useState(null)

	useEffect(() => {
		if (selectedFile) {
			handleFileSelect(selectedFile)
		}
	}, [selectedFile])

	const handleFileSelect = async (fileHandle) => {
		const file = await fileHandle.getFile()
		const fileContent = await file.text()
		const fileName = file.name

		const existingFileIndex = openFiles.findIndex((f) => f.name === fileName)

		if (existingFileIndex !== -1) {
			setActiveTab(existingFileIndex)
		} else {
			setOpenFiles((prevFiles) => [
				...prevFiles,
				{
					name: fileName,
					content: fileContent,
					isSaved: true,
					handle: fileHandle,
				},
			])
			setActiveTab(openFiles.length)
		}
	}

	const handleCodeChange = (newValue) => {
		const updatedFiles = [...openFiles]
		updatedFiles[activeTab].content = newValue
		updatedFiles[activeTab].isSaved = false
		setOpenFiles(updatedFiles)
	}

	const handleSave = async () => {
		const file = openFiles[activeTab]
		const writable = await file.handle.createWritable()
		await writable.write(file.content)
		await writable.close()

		const updatedFiles = [...openFiles]
		updatedFiles[activeTab].isSaved = true
		setOpenFiles(updatedFiles)
	}

	const confirmCloseTab = (index) => {
		if (!openFiles[index].isSaved) {
			setClosingTabIndex(index)
			setIsSaveModalOpen(true)
		} else {
			handleCloseTab(index)
		}
	}

	const handleCloseTab = (index) => {
		const updatedFiles = openFiles.filter((_, i) => i !== index)
		setOpenFiles(updatedFiles)
		if (index === activeTab && updatedFiles.length > 0) {
			setActiveTab(Math.min(activeTab, updatedFiles.length - 1))
		} else if (updatedFiles.length === 0) {
			setActiveTab(0)
		}
		setIsSaveModalOpen(false)
	}

	const handleModalSave = () => {
		handleSave()
		handleCloseTab(closingTabIndex)
	}

	const handleModalDiscard = () => {
		handleCloseTab(closingTabIndex)
	}

	const handleModalCancel = () => {
		setIsSaveModalOpen(false)
	}

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.ctrlKey && e.key === 's') {
				e.preventDefault()
				handleSave()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [openFiles, activeTab])

	return (
		<div className='flex flex-1 flex-col'>
			<div className='flex border-b border-gray-300'>
				{openFiles.map((file, index) => (
					<div
						key={index}
						onClick={() => setActiveTab(index)}
						className={`p-2 cursor-pointer ${
							activeTab === index
								? 'bg-gray-100 border-b-4 border-blue-600'
								: 'bg-gray-300'
						} relative`}
					>
						{!file.isSaved ? (
							<span className='inline-block w-2 h-2 rounded-full bg-blue-500 mr-1' />
						) : (
							<span className='inline-block min-w-[12px]' />
						)}
						<span>{file.name}</span>

						<button
							onClick={(e) => {
								e.stopPropagation()
								confirmCloseTab(index)
							}}
							className='ml-2 cursor-pointer'
						>
							✖
						</button>
					</div>
				))}
			</div>
			{openFiles.length > 0 && (
				<CodeEditor
					value={openFiles[activeTab].content ?? ''}
					onChange={handleCodeChange}
				/>
			)}

			{isSaveModalOpen && (
				<SaveModal
					fileName={openFiles[closingTabIndex].name}
					onSave={handleModalSave}
					onDiscard={handleModalDiscard}
					onCancel={handleModalCancel}
				/>
			)}
		</div>
	)
}

export default FileManager
