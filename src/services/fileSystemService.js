import { create } from 'zustand'

export const useFileSystemStore = create((set) => ({
	openedFiles: [], // list of opened files (flat)
	activeFile: null, // active file (focus)
	projectFiles: [], // flat list of project files and directories
	setOpenedFiles: (files) => set({ openedFiles: files }),
	setActiveFile: (file) => set({ activeFile: file }),
	setProjectFiles: (files) => set({ projectFiles: files }),
}))

export const openFile = async (fileHandle) => {
	const { openedFiles, setOpenedFiles, setActiveFile } =
		useFileSystemStore.getState()

	// Check if the file is already open
	const fileExists = openedFiles?.find((file) => file.handle === fileHandle)

	console.log(fileExists)
	console.log(fileHandle)
	if (!fileExists) {
		const file = await fileHandle.getFile()
		const newFile = {
			handle: fileHandle,
			name: file.name,
			content: await file.text(),
			isSaved: true,
		}

		setOpenedFiles([...openedFiles, newFile]) // Push the new file
		setActiveFile(newFile)
	} else {
		setActiveFile(fileExists)
	}
}

export const closeFile = (fileIndex) => {
	const { openedFiles, setOpenedFiles } = useFileSystemStore.getState()
	setOpenedFiles(openedFiles.filter((_, index) => index !== fileIndex))
}

export const SelectProjectFolder = async () => {
	const { setProjectFiles } = useFileSystemStore.getState()

	if ('showDirectoryPicker' in window) {
		try {
			const rootDirectoryHandle = await window.showDirectoryPicker()
			const flatFileStructure = await ReadRootDirectory(rootDirectoryHandle)
			setProjectFiles(flatFileStructure)
		} catch (error) {
			console.error('Error selecting folder:', error)
		}
	} else {
		alert('Your browser does not support the File System Access API.')
	}

	return []
}

export const ReadRootDirectory = async (directoryHandle) => {
	const rootDirectory = {
		path: '/' + directoryHandle.name,
		name: directoryHandle.name,
		kind: 'directory',
		handle: directoryHandle,
		isOpen: false,
		parentPath: null, // Root has no parent
	}

	// Read the directory and flatten the structure
	const flatStructure = [rootDirectory]
	await ReadDirectory(rootDirectory, flatStructure)
	return flatStructure
}

// Recursively read directories and flatten into a single array
const ReadDirectory = async (parentDirectory, flatStructure) => {
	for await (const entry of parentDirectory.handle.values()) {
		const fullPath = parentDirectory.path + '/' + entry.name
		if (entry.kind === 'directory') {
			const directory = {
				path: fullPath,
				name: entry.name,
				kind: entry.kind,
				handle: entry,
				isOpen: false,
				parentPath: parentDirectory.path,
			}
			flatStructure.push(directory)
			await ReadDirectory(directory, flatStructure) // Recursive read for directories
		} else {
			const file = {
				path: fullPath,
				name: entry.name,
				kind: entry.kind,
				handle: entry,
				parentPath: parentDirectory.path, // Reference to parent
			}
			flatStructure.push(file)
		}
	}
}

export const toggleFolder = (path) => {
	const { projectFiles, setProjectFiles } = useFileSystemStore.getState()
	// Toggle the folder state
	const updatedFiles = projectFiles.map((file) => {
		if (file.path === path && file.kind === 'directory') {
			return { ...file, isOpen: !file.isOpen }
		}
		return file
	})
	setProjectFiles(updatedFiles)
}

// Function to get children of a directory (since it's now flat)
export const getChildren = (parentPath) => {
	const { projectFiles } = useFileSystemStore.getState()
	return projectFiles.filter((file) => file.parentPath === parentPath)
}

// Additional helper function to open or close all children of a directory
export const toggleFolderRecursively = (path, isOpen) => {
	const { projectFiles, setProjectFiles } = useFileSystemStore.getState()
	// Find the target folder and its children
	const updatedFiles = projectFiles.map((file) => {
		if (file.path.startsWith(path)) {
			return { ...file, isOpen }
		}
		return file
	})
	setProjectFiles(updatedFiles)
}
