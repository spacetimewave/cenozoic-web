import { create } from 'zustand'
import {
	IFile,
	IFolder,
	IFileSystemStore,
	FileSystemHandle,
	FileSystemDirectoryHandle,
	FileSystemFileHandle,
	IFileEditorStore,
} from '../interfaces/IFileSystem'

export const useFileSystemStore = create<IFileSystemStore>((set) => ({
	projectFiles: [], // flat list of project files and directories
	setProjectFiles: (files) => set({ projectFiles: files }),
}))

export const useFileEditorStore = create<IFileEditorStore>((set) => ({
	openedFiles: [], // list of opened files (flat)
	activeFile: null, // active file (focus)
	setOpenedFiles: (files) => set({ openedFiles: files }),
	setActiveFile: (file) => set({ activeFile: file }),
}))

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

export const ReadRootDirectory = async (
	directoryHandle: FileSystemDirectoryHandle,
): Promise<(IFile | IFolder)[]> => {
	let files: (IFile | IFolder)[] = []
	const rootDirectory: IFolder = {
		name: directoryHandle.name,
		path: '/' + directoryHandle.name,
		parentPath: null, // root
		kind: 'directory',
		handle: directoryHandle,
		content: null,
		isSaved: true,
		isOpen: false,
	}
	// Read the directory and flatten the structure
	files.push(rootDirectory)
	await ReadDirectory(rootDirectory, files)
	return files
}

// Recursively read directories and flatten into a single array
const ReadDirectory = async (
	parentDirectory: IFile | IFolder,
	flatStructure: (IFile | IFolder)[],
) => {
	const childrenHandlers: FileSystemHandle[] = await (
		parentDirectory.handle as FileSystemDirectoryHandle
	).values()

	for await (const childHandler of childrenHandlers) {
		if (childHandler.kind === 'directory') {
			const directory: IFolder = {
				name: childHandler.name,
				path: parentDirectory.path + '/' + childHandler.name,
				parentPath: parentDirectory.path,
				kind: childHandler.kind,
				handle: childHandler as FileSystemDirectoryHandle,
				content: null,
				isSaved: true,
				isOpen: false,
			}
			flatStructure.push(directory)
			await ReadDirectory(directory, flatStructure) // Recursive read for directories
		} else {
			const file: IFile = {
				name: childHandler.name,
				path: parentDirectory.path + '/' + childHandler.name,
				parentPath: parentDirectory.path,
				kind: childHandler.kind,
				handle: childHandler as FileSystemFileHandle,
				content: null,
				isSaved: true,
				isOpen: false,
			}
			flatStructure.push(file)
		}
	}
}

export const openFile = async (openFile: IFile) => {
	const { openedFiles, setOpenedFiles, setActiveFile } =
		useFileEditorStore.getState()

	// Check if the file is already open
	const fileExists = openedFiles?.find(
		(file) => file.handle === openFile.handle,
	)

	if (!fileExists) {
		const file = await openFile.handle.getFile()
		const newFile = {
			name: openFile.name,
			path: openFile.path,
			parentPath: openFile.parentPath,
			kind: openFile.kind,
			handle: openFile.handle,
			content: await file.text(),
			isSaved: true,
			isOpen: true,
		}

		setOpenedFiles([...openedFiles, newFile]) // Push the new file
		setActiveFile(newFile)
	} else {
		setActiveFile(fileExists)
	}
}

export const closeFile = (fileIndex: number) => {
	const { openedFiles, setOpenedFiles } = useFileEditorStore.getState()
	setOpenedFiles(openedFiles.filter((_, index) => index !== fileIndex))
}

export const toggleFolder = (path: string) => {
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
export const getChildren = (parentPath: string): (IFile | IFolder)[] => {
	const { projectFiles } = useFileSystemStore.getState()
	return projectFiles.filter((file) => file.parentPath === parentPath)
}

// Function to get children parent of a file or folder
export const getParent = (parentPath: string | null): IFolder | undefined => {
	const { projectFiles } = useFileSystemStore.getState()
	return projectFiles.find((file) => file.path === parentPath) as IFolder
}

// Additional helper function to open or close all children of a directory
export const toggleFolderRecursively = (path: string, isOpen: boolean) => {
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
export const deleteFile = async (filePath: string) => {
	const { projectFiles, setProjectFiles } = useFileSystemStore.getState()

	const { openedFiles, setOpenedFiles, activeFile, setActiveFile } =
		useFileEditorStore.getState()

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
const deleteFolderContents = async (
	folderHandle: FileSystemDirectoryHandle,
) => {
	const childrenHandlers: FileSystemHandle[] = await folderHandle.values()

	for await (const entry of childrenHandlers) {
		if (entry.kind === 'file') {
			// Delete file
			try {
				await entry.remove()
			} catch (error) {
				console.error('Error deleting file:', error)
			}
		} else if (entry.kind === 'directory') {
			// Recursively delete subfolder contents
			await deleteFolderContents(entry as FileSystemDirectoryHandle)
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
export const deleteFolder = async (folderPath: string) => {
	const { projectFiles, setProjectFiles } = useFileSystemStore.getState()

	// Find the folder to delete
	const folderToDelete = projectFiles.find(
		(file) => file.path === folderPath && file.kind === 'directory',
	)

	if (folderToDelete) {
		// Delete all the contents of the folder
		await deleteFolderContents(
			folderToDelete.handle as FileSystemDirectoryHandle,
		)

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
export const moveItem = async (oldPath: string, newParentPath: string) => {
	const { projectFiles } = useFileSystemStore.getState()

	const { openedFiles, setOpenedFiles, activeFile, setActiveFile } =
		useFileEditorStore.getState()

	// Find the entry to move
	const entryToMove = projectFiles.find((file) => file.path === oldPath)

	if (entryToMove) {
		const newPath = `${newParentPath}/${entryToMove.name}`

		try {
			if (entryToMove.kind === 'file') {
				const file = await entryToMove.handle.getFile()
				const newFolder = projectFiles.find((f) => f.path === newParentPath)

				if (newFolder === undefined) return

				const newFileHandle = await (newFolder as IFolder).handle.getFileHandle(
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
				await RefreshProjectFiles()

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

				if (newParent === undefined) return

				const newDirHandle = await (
					newParent as IFolder
				).handle.getDirectoryHandle(entryToMove.name, { create: true })

				// Move contents from the old directory to the new one
				await moveFolderContents(entryToMove.handle, newDirHandle)

				// Delete the old directory after moving
				await deleteFolder(entryToMove.path)

				// Refresh the project files
				await RefreshProjectFiles()
			}
		} catch (error) {
			console.error('Error moving entry:', error)
		}
	}
}

// Helper function to rename a file or folder
export const renameItem = async (oldPath: string, newName: string) => {
	const { projectFiles, setProjectFiles } = useFileSystemStore.getState()

	const { openedFiles, setOpenedFiles, activeFile, setActiveFile } =
		useFileEditorStore.getState()

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

				if (parentDirHandle === undefined) return

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

				await RefreshProjectFiles()
			}
		} catch (error) {
			console.error('Error renaming entry:', error)
		}
	}
}

// Helper function to move contents of a folder to a new folder
const moveFolderContents = async (
	oldFolderHandle: FileSystemDirectoryHandle,
	newFolderHandle: FileSystemDirectoryHandle,
) => {
	const folderChilds = await oldFolderHandle.values()
	console.log(folderChilds)
	for await (const child of folderChilds) {
		if (child.kind === 'file') {
			// Get the file and create a new file handle in the new directory
			const file = await (child as FileSystemFileHandle).getFile()
			const newFileHandle = await newFolderHandle.getFileHandle(child.name, {
				create: true,
			})

			// Write content to the new file
			const writable = await newFileHandle.createWritable()
			await writable.write(await file.text())
			await writable.close()
		} else if (child.kind === 'directory') {
			// Recursively handle subdirectories
			const newSubDirHandle = await newFolderHandle.getDirectoryHandle(
				child.name,
				{ create: true },
			)
			await moveFolderContents(
				child as FileSystemDirectoryHandle,
				newSubDirHandle,
			)
		}
	}
}

export const createFolder = async (
	parentFolderPath: string,
	newFolderName: string,
) => {
	const { projectFiles } = useFileSystemStore.getState()
	// Recursively handle subdirectories
	await (
		projectFiles.find((i) => i.path === parentFolderPath)
			?.handle as FileSystemDirectoryHandle
	).getDirectoryHandle(newFolderName, {
		create: true,
	})

	await RefreshProjectFiles()
}

export const createFile = async (
	parentFolderPath: string,
	newFileName: string,
) => {
	const { projectFiles } = useFileSystemStore.getState()
	// Recursively handle subdirectories
	await (
		projectFiles.find((i) => i.path === parentFolderPath)
			?.handle as FileSystemDirectoryHandle
	).getFileHandle(newFileName, {
		create: true,
	})
	await RefreshProjectFiles()
}

export const RefreshProjectFiles = async () => {
	const { projectFiles, setProjectFiles } = useFileSystemStore.getState()
	const rootDirectory = projectFiles.find((i) => i.parentPath === null)
	if (rootDirectory === undefined) return

	const flatFileStructure = await ReadRootDirectory(
		rootDirectory.handle as FileSystemDirectoryHandle,
	)

	// Create a map to keep track of existing file/folder states
	const existingFilesMap = new Map<
		string,
		{ isOpen: boolean; isSaved: boolean }
	>()
	projectFiles.forEach((file) => {
		existingFilesMap.set(file.path, {
			isOpen: file.isOpen,
			isSaved: file.isSaved,
		})
	})

	// Update the flat file structure while preserving isOpen and isSaved if the file exists
	const updatedFileStructure = flatFileStructure.map((newFile) => {
		const existingFileState = existingFilesMap.get(newFile.path)
		if (existingFileState) {
			// Preserve isOpen and isSaved from the old state
			return {
				...newFile,
				isOpen: existingFileState.isOpen,
				isSaved: existingFileState.isSaved,
			}
		}
		// If the file is new, return it as is
		return newFile
	})

	// Set the new file structure
	setProjectFiles(updatedFileStructure)
}
