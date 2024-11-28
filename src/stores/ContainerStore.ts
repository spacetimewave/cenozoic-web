import { create } from 'zustand'
import { IFile, IFolder } from '../models/IFileSystem'
import { Container } from '../models/IContainer'
import { useFileEditorStore } from '../services/FileSystemService'
import { useCredentialStore } from '../services/AuthService'
import { ContainerService } from '../services/ContainerService'

export interface IContainerStore {
	containers: Container[]
	containerTerminals: string[]
	setContainers: (containers: Container[]) => void
	setContainerTerminals: (containerTerminals: string[]) => void
	setContainerFiles: (
		containerId: string,
		containerFiles: (IFile | IFolder)[],
	) => void
}

export const useContainerStore = create<IContainerStore>((set) => ({
	containers: [],
	containerTerminals: [],
	setContainers: (newContainers: Container[]) =>
		set({ containers: newContainers }),
	setContainerTerminals: (containerTerminals: string[]) =>
		set({ containerTerminals: containerTerminals }),
	setContainerFiles: (
		containerId: string,
		containerFiles: (IFile | IFolder)[],
	) =>
		set((state) => ({
			containers: state.containers.map((container) =>
				container.container_id === containerId
					? { ...container, container_files: containerFiles }
					: container,
			),
		})),
}))

export const CreateNewContainer = async (token: string) => {
	const { containers, setContainers } = useContainerStore.getState()
	const newContainer = await ContainerService.CreateNewContainer(token ?? '')
	setContainers([...containers, newContainer])
}

export const UpdateUserContainers = async (token: string) => {
	const { setContainers } = useContainerStore.getState()
	setContainers(await ContainerService.GetUserContainers(token ?? ''))
}

export const StartContainer = async (container_id: string, token: string) => {
	// Start container HTTP request
	await ContainerService.StartContainer(container_id, token ?? '')
	// Update container store
	UpdateUserContainers(token ?? '')
}

export const StopContainer = async (container_id: string, token: string) => {
	// Stop container HTTP request
	await ContainerService.StopContainer(container_id, token ?? '')
	// Update container store
	await UpdateUserContainers(token ?? '')
}

export const DeleteContainer = async (container_id: string, token: string) => {
	const { containers, setContainers } = useContainerStore.getState()
	await ContainerService.DeleteContainer(container_id, token ?? '')
	setContainers(
		containers.filter((container) => container.container_id !== container_id),
	)
}

export const OpenTerminal = async (container_id: string) => {
	const { containerTerminals, setContainerTerminals } =
		useContainerStore.getState()
	setContainerTerminals([...containerTerminals, container_id])
}

export const GetContainerFiles = async (
	container_id: string,
	token: string,
): Promise<(IFile | IFolder)[]> => {
	return await ContainerService.GetContainerFiles(container_id, token)
}

export const getContainerByContainerId = (
	container_id: string,
): Container | undefined => {
	const { containers } = useContainerStore.getState()
	return containers.find((container) => container.container_id === container_id)
}

export const getContainerFiles = (
	container_id: string,
): (IFile | IFolder)[] => {
	const containerFiles =
		getContainerByContainerId(container_id)?.container_files

	if (!containerFiles) {
		return []
	}
	return containerFiles
}

export const getFolderChildren = (
	container_id: string,
	parentPath: string | null,
): (IFile | IFolder)[] => {
	const containerFiles = getContainerFiles(container_id)
	return containerFiles.filter((file) => file.parentPath === parentPath)
}

export const toggleFolder = (container_id: string, path: string) => {
	const { setContainerFiles } = useContainerStore.getState()
	const containerFiles = getContainerFiles(container_id)

	// Toggle the folder state
	const updatedFiles = containerFiles.map((file) => {
		if (file.path === path && file.kind === 'directory') {
			return { ...file, isOpen: !file.isOpen }
		}
		return file
	})
	setContainerFiles(container_id, updatedFiles)
}

export const openFile = async (container_id: string, path: string) => {
	const { openedFiles, setOpenedFiles, setActiveFile } =
		useFileEditorStore.getState()
	const { token } = useCredentialStore.getState()

	// Check if the file is already open
	const file = getContainerFiles(container_id).find(
		(file) => file.path === path && file.kind === 'file',
	) as IFile
	const openedFile = openedFiles?.find((file) => file.path === path)

	if (!openedFile) {
		const newFile = {
			name: file.name,
			path: file.path,
			parentPath: file.parentPath,
			kind: file.kind,
			handle: file.handle,
			content: await ContainerService.GetContainerFileContent(
				container_id,
				file.path,
				token ?? '',
			),
			isSaved: true,
			isOpen: true,
			containerId: container_id,
		}

		setOpenedFiles([...openedFiles, newFile]) // Push the new file
		setActiveFile(newFile)
	} else {
		setActiveFile(openedFile)
	}
}

export const SaveContainerFile = async (
	container_id: string,
	name: string,
	parent_path: string,
	content: string,
) => {
	const { token } = useCredentialStore.getState()
	ContainerService.SaveContainerFile(
		container_id,
		name,
		parent_path,
		content,
		token ?? '',
	)
}

export const moveItem = async (
	container_id: string,
	source_path: string,
	dest_path: string,
) => {
	try {
		const { token } = useCredentialStore.getState()
		const { setContainerFiles } = useContainerStore.getState()

		await ContainerService.moveItem(
			container_id,
			source_path,
			dest_path,
			token ?? '',
		)
		const container_files = getContainerFiles(container_id)
		container_files.map((file) => {
			if (file.path === source_path) {
				file.path = dest_path + '/' + file.name
				file.parentPath = dest_path
			}
		})

		setContainerFiles(container_id, container_files)
	} catch (error) {
		console.error('Error moving item:', error)
	}
}

export const renameItem = async (
	container_id: string,
	item_path: string,
	new_name: string,
) => {
	try {
		let container_files = getContainerFiles(container_id)
		const item = container_files.find((file) => file.path === item_path)
		if (!item) {
			throw new Error('Item not found')
		}

		// Rename item container
		const { token } = useCredentialStore.getState()
		const result = await ContainerService.renameItem(
			container_id,
			item,
			new_name,
			token ?? '',
		)
		if (!result) {
			throw new Error('Rename item failed')
		}

		// Rename item locally
		container_files.map((file) => {
			if (file.path === item_path) {
				file.name = new_name
				file.path = item.parentPath + '/' + new_name
			}
		})

		// Remove outdated children elements
		if (item.kind === 'directory') {
			container_files = container_files.filter(
				(file) => !file.parentPath?.startsWith(item_path),
			)
		}

		// Add updated children elements
		container_files = container_files.concat(
			await ContainerService.GetContainerFolderContent(
				container_id,
				item.path,
				token ?? '',
			),
		)

		// Update container files store
		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)
	} catch (error) {
		console.error('Error | Rename Item Error: ', error)
	}
}

export const createFolder = async (
	container_id: string,
	parent_path: string,
	folder_name: string,
) => {
	try {
		const { token } = useCredentialStore.getState()
		await ContainerService.createFolder(
			container_id,
			parent_path,
			folder_name,
			token ?? '',
		)

		const container_files = getContainerFiles(container_id)
		container_files.push({
			name: folder_name,
			path: parent_path + '/' + folder_name,
			parentPath: parent_path,
			kind: 'directory',
			handle: null,
			content: null,
			isSaved: true,
			isOpen: false,
			containerId: container_id,
		})

		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)
	} catch (error) {
		console.error('Error creating folder:', error)
	}
}

export const createFile = async (container_id: string, file_path: string) => {
	try {
		const { token } = useCredentialStore.getState()
		const response = await ContainerService.createFile(
			container_id,
			file_path,
			token ?? '',
		)

		const container_files = getContainerFiles(container_id)
		container_files.push({
			name: file_path.substring(file_path.lastIndexOf('/') + 1),
			path: file_path,
			parentPath: file_path.substring(0, file_path.lastIndexOf('/')),
			kind: 'file',
			handle: null,
			content: null,
			isSaved: true,
			isOpen: false,
			containerId: container_id,
		})

		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)

		return response
	} catch (error) {
		console.error('Error creating file:', error)
	}
}

export const deleteFile = async (container_id: string, path: string) => {
	try {
		const { token } = useCredentialStore.getState()
		const response = await ContainerService.deleteFile(
			container_id,
			path,
			token ?? '',
		)

		let container_files = getContainerFiles(container_id)
		container_files = container_files.filter((file) => file.path !== path)
		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)

		return response
	} catch (error) {
		console.error('Error deleting file:', error)
	}
}

// Container Store: Delete a file in a container
export const deleteFolder = async (container_id: string, path: string) => {
	try {
		const { token } = useCredentialStore.getState()

		const response = await ContainerService.deleteFolder(
			container_id,
			path,
			token ?? '',
		)

		let container_files = getContainerFiles(container_id)
		container_files = container_files.filter((file) => file.path !== path)
		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)

		return response
	} catch (error) {
		console.error('Error deleting file:', error)
	}
}
