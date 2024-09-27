import { useState, useEffect } from 'react'
import CodeEditor from '../CodeEditor'
import SaveModal from '../Modal'
import { useFileEditorStore } from '../../services/FileSystemService'

const FileManager = ({ selectedFile }: any | null) => {
	const { openedFiles, setOpenedFiles, activeFile, setActiveFile } =
		useFileEditorStore()
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

		const existingFileIndex = openedFiles.findIndex((f) => f.name === fileName)

		if (existingFileIndex !== -1) {
			setActiveFile(openedFiles[existingFileIndex])
		} else {
			const newFile = {
				name: fileName,
				content: fileContent,
				isSaved: true,
				handle: fileHandle,
			}
			setOpenedFiles((prevFiles) => [...prevFiles, newFile])
			setActiveFile(newFile) // Set the newly added file as active
		}
	}

	const handleCodeChange = (newValue) => {
		const updatedActiveFile = {
			...activeFile,
			content: newValue,
			isSaved: false,
		}
		setActiveFile(updatedActiveFile)

		const updatedFiles = openedFiles.map((file) =>
			file.name === activeFile.name ? updatedActiveFile : file,
		)
		setOpenedFiles(updatedFiles)
	}

	const handleSave = async () => {
		if (!activeFile) return

		const writable = await activeFile.handle.createWritable()
		await writable.write(activeFile.content)
		await writable.close()

		const updatedActiveFile = { ...activeFile, isSaved: true }
		setActiveFile(updatedActiveFile)

		const updatedFiles = openedFiles.map((file) =>
			file.name === activeFile.name ? updatedActiveFile : file,
		)
		setOpenedFiles(updatedFiles)
	}

	const confirmCloseTab = (index) => {
		if (!openedFiles[index].isSaved) {
			setClosingTabIndex(index)
			setIsSaveModalOpen(true)
		} else {
			handleCloseTab(index)
		}
	}

	const handleCloseTab = (index) => {
		const updatedFiles = openedFiles.filter((_, i) => i !== index)
		setOpenedFiles(updatedFiles)

		if (openedFiles[index] === activeFile && updatedFiles.length > 0) {
			setActiveFile(updatedFiles[Math.min(index, updatedFiles.length - 1)])
		} else if (updatedFiles.length === 0) {
			setActiveFile(null)
		}
		setIsSaveModalOpen(false)
	}

	const handleModalSave = async () => {
		await handleSave() // Wait for the save to complete
		handleCloseTab(closingTabIndex) // Close the tab without reopening
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
	}, [openedFiles, activeFile])

	return (
		<div className='flex flex-1 flex-col'>
			<div className='flex border-b border-gray-300'>
				{openedFiles.map((file, index) => (
					<div
						key={index}
						onClick={() => setActiveFile(file)}
						className={`p-2 cursor-pointer ${
							activeFile === file
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
			{openedFiles.length > 0 && activeFile && (
				<CodeEditor
					value={activeFile?.content ?? ''}
					onChange={handleCodeChange}
				/>
			)}

			{isSaveModalOpen && (
				<SaveModal
					fileName={openedFiles[closingTabIndex]?.name}
					onSave={handleModalSave}
					onDiscard={handleModalDiscard}
					onCancel={handleModalCancel}
				/>
			)}
		</div>
	)
}

export default FileManager
