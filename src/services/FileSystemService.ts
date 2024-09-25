import { create } from 'zustand'
import { IFileSystem } from '../interfaces/IFileSystem'
import { IFile } from '../interfaces/IFile'

export const useFileSystemStore = create<IFileSystem>((set) => ({
	openedFiles: [], // list of opened files (flat)
	activeFile: null, // active file (focus)
	projectFiles: [], // flat list of project files and directories
	setOpenedFiles: (files) => set({ openedFiles: files }),
	setActiveFile: (file) => set({ activeFile: file }),
	setProjectFiles: (files) => set({ projectFiles: files }),
}))

export const openFile = async (openFile: IFile) => {
	const { openedFiles, setOpenedFiles, setActiveFile } =
		useFileSystemStore.getState()

	// Check if the file is already open
	const fileExists = openedFiles?.find(
		(file) => file.handle === openFile.handle,
	)

	if (!fileExists) {
		const file = await openFile.handle.getFile()
		const newFile = {
			handle: openFile.handle,
			name: openFile.name,
			path: openFile.path,
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

// Function to get children of a directory (since it's now flat)
export const getParent = (parentPath) => {
	const { projectFiles } = useFileSystemStore.getState()
	return projectFiles.find((file) => file.path === parentPath)
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

// Delete a single file
export const deleteFile = async (filePath) => {
	const {
		projectFiles,
		setProjectFiles,
		openedFiles,
		setOpenedFiles,
		activeFile,
		setActiveFile,
	} = useFileSystemStore.getState()

	// Find the file to delete
	const fileToDelete = projectFiles.find(
		(file) => file.path === filePath && file.kind === 'file',
	)
	if (fileToDelete) {
		// Attempt to delete the file from the actual file system
		try {
			await fileToDelete.handle.remove() // This deletes the file on the user's file system
		} catch (error) {
			console.error('Error deleting file:', error)
			return
		}

		// Update project files state to remove the file
		const updatedFiles = projectFiles.filter((file) => file.path !== filePath)
		setProjectFiles(updatedFiles)

		// Close the file if it's currently opened
		const updatedOpenedFiles = openedFiles.filter(
			(file) => file.handle !== fileToDelete.handle,
		)
		setOpenedFiles(updatedOpenedFiles)

		// If the active file is the one being deleted, clear activeFile
		if (activeFile?.handle === fileToDelete.handle) {
			setActiveFile(null)
		}
	}
}

// Helper function to recursively delete all contents inside a folder
const deleteFolderContents = async (folderHandle) => {
	for await (const entry of folderHandle.values()) {
		if (entry.kind === 'file') {
			// Delete file
			try {
				await entry.remove()
			} catch (error) {
				console.error('Error deleting file:', error)
			}
		} else if (entry.kind === 'directory') {
			// Recursively delete subfolder contents
			await deleteFolderContents(entry)
			// Delete the now empty subfolder
			try {
				await entry.remove()
			} catch (error) {
				console.error('Error deleting folder:', error)
			}
		}
	}
}

// Delete a folder and its contents recursively
export const deleteFolder = async (folderPath) => {
	const { projectFiles, setProjectFiles } = useFileSystemStore.getState()

	// Find the folder to delete
	const folderToDelete = projectFiles.find(
		(file) => file.path === folderPath && file.kind === 'directory',
	)

	if (folderToDelete) {
		// Delete all the contents of the folder
		await deleteFolderContents(folderToDelete.handle)

		// Finally delete the folder itself
		try {
			await folderToDelete.handle.remove() // Delete the now-empty folder
		} catch (error) {
			console.error('Error deleting folder:', error)
			return
		}

		// Remove the folder and its contents from projectFiles
		const updatedFiles = projectFiles.filter(
			(file) => !file.path.startsWith(folderPath),
		)
		setProjectFiles(updatedFiles)
	}
}

// Helper function to move a file or folder
export const moveItem = async (oldPath, newParentPath) => {
	const {
		projectFiles,
		activeFile,
		setActiveFile,
		openedFiles,
		setOpenedFiles,
	} = useFileSystemStore.getState()

	// Find the entry to move
	const entryToMove = projectFiles.find((file) => file.path === oldPath)

	if (entryToMove) {
		const newPath = `${newParentPath}/${entryToMove.name}`

		try {
			if (entryToMove.kind === 'file') {
				const file = await entryToMove.handle.getFile()
				const newFolder = projectFiles.find((f) => f.path === newParentPath)
				const newFileHandle = await newFolder.handle.getFileHandle(
					entryToMove.name,
					{
						create: true,
					},
				)

				// Write content to the new file
				const writable = await newFileHandle.createWritable()
				await writable.write(await file.text())
				await writable.close()

				await deleteFile(entryToMove.path)

				// Update projectFiles state
				await RefressProjectFiles()

				// Update openedFiles
				const updatedOpenedFiles = openedFiles.map((file) => {
					if (file.path === oldPath) {
						return { ...file, path: newPath }
					}
					return file
				})
				setOpenedFiles(updatedOpenedFiles)

				// Update active file if it's the one being moved
				if (activeFile?.path === oldPath) {
					setActiveFile({ ...activeFile, path: newPath })
				}
			} else if (entryToMove.kind === 'directory') {
				// Get the handles for the new directory
				const newParent = await getParent(newParentPath)

				const newDirHandle = await newParent.handle.getDirectoryHandle(
					entryToMove.name,
					{ create: true },
				)

				// Move contents from the old directory to the new one
				await moveFolderContents(entryToMove.handle, newDirHandle)

				// Delete the old directory after moving
				await deleteFolder(entryToMove.path)

				// Refresh the project files
				await RefressProjectFiles()
			}
		} catch (error) {
			console.error('Error moving entry:', error)
		}
	}
}

// Helper function to rename a file or folder
export const renameItem = async (oldPath, newName) => {
	const {
		projectFiles,
		setProjectFiles,
		activeFile,
		setActiveFile,
		openedFiles,
		setOpenedFiles,
	} = useFileSystemStore.getState()

	// Find the entry to rename
	const entryToRename = projectFiles.find((file) => file.path === oldPath)

	if (entryToRename) {
		const parentPath = entryToRename.parentPath
		const newPath = parentPath ? `${parentPath}/${newName}` : `/${newName}`

		try {
			if (entryToRename.kind === 'file') {
				// For files, rename the file
				await entryToRename.handle.move(newName)

				// Update projectFiles state
				const updatedFiles = projectFiles.map((file) => {
					if (file.path === oldPath) {
						return { ...file, path: newPath, name: newName }
					}
					return file
				})
				setProjectFiles(updatedFiles)

				// Update openedFiles
				const updatedOpenedFiles = openedFiles.map((file) => {
					if (file.path === oldPath) {
						return { ...file, path: newPath, name: newName }
					}
					return file
				})
				setOpenedFiles(updatedOpenedFiles)

				// Update active file if it's the one being renamed
				if (activeFile?.path === oldPath) {
					setActiveFile({ ...activeFile, path: newPath, name: newName })
				}
			} else if (entryToRename.kind === 'directory') {
				// For directories, create a new directory with the new name
				const parentDirHandle = getParent(entryToRename.parentPath)

				const newDirHandle = await parentDirHandle.handle.getDirectoryHandle(
					newName,
					{
						create: true,
					},
				)

				// Move contents from the old directory to the new one
				await moveFolderContents(entryToRename.handle, newDirHandle)

				// // Delete the old directory
				await deleteFolder(entryToRename.path)

				await RefressProjectFiles()
			}
		} catch (error) {
			console.error('Error renaming entry:', error)
		}
	}
}

// Helper function to move contents of a folder to a new folder
const moveFolderContents = async (oldFolderHandle, newFolderHandle) => {
	for await (const entry of oldFolderHandle.values()) {
		if (entry.kind === 'file') {
			// Get the file and create a new file handle in the new directory
			const file = await entry.getFile()
			const newFileHandle = await newFolderHandle.getFileHandle(entry.name, {
				create: true,
			})

			// Write content to the new file
			const writable = await newFileHandle.createWritable()
			await writable.write(await file.text())
			await writable.close()
		} else if (entry.kind === 'directory') {
			// Recursively handle subdirectories
			const newSubDirHandle = await newFolderHandle.getDirectoryHandle(
				entry.name,
				{ create: true },
			)
			await moveFolderContents(entry, newSubDirHandle)
		}
	}
}

export const createFolder = async (parentFolderPath, newFolderName) => {
	const { projectFiles } = useFileSystemStore.getState()
	// Recursively handle subdirectories
	await projectFiles
		.find((i) => i.path === parentFolderPath)
		.handle.getDirectoryHandle(newFolderName, {
			create: true,
		})

	await RefressProjectFiles()
}

export const createFile = async (parentFolderPath, newFileName) => {
	const { projectFiles } = useFileSystemStore.getState()
	// Recursively handle subdirectories
	await projectFiles
		.find((i) => i.path === parentFolderPath)
		.handle.getFileHandle(newFileName, {
			create: true,
		})
	await RefressProjectFiles()
}

export const RefressProjectFiles = async () => {
	const { projectFiles, setProjectFiles } = useFileSystemStore.getState()
	const rootDirectory = projectFiles.find((i) => i.parentPath === null)
	const flatFileStructure = await ReadRootDirectory(rootDirectory.handle)
	setProjectFiles(flatFileStructure)
}
