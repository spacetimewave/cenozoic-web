import { create } from 'zustand'
import { IFile, IFolder } from '../interfaces/IFileSystem'
import { useFileEditorStore } from './FileSystemService'
import { useCredentialStore } from './AuthService'

export interface Container {
	id: string
	container_id: string
	container_name: string
	status: 'exited' | 'running' | 'created'
	user_mail: string
	container_files?: (IFile | IFolder)[]
}

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

// Container Service: HTTP Request to create new container
export const _CreateNewContainer = async (token: string) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/create-container`

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			const errorMessage = await response.json()
			throw new Error(errorMessage.detail || 'Error starting container')
		}

		const data = await response.json()
		return {
			id: data.id,
			container_id: data.container_id,
			container_name: data.container_name,
			user_mail: data.user_id,
			status: data.status,
		}
	} catch (error) {
		console.error('Error starting container:', error)
		throw error
	}
}

// Container Store: Create new container
export const CreateNewContainer = async (token: string) => {
	const { containers, setContainers } = useContainerStore.getState()
	const newContainer = await _CreateNewContainer(token ?? '')
	setContainers([...containers, newContainer])
}

// Container Service: HTTP Request to get container
export const _GetUserContainers = async (token: string) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/user-containers`

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			throw new Error(await response.json())
		}

		const data = await response.json()
		return data.containers
	} catch (error) {
		console.error('Error fetching user containers:', error)
		throw error
	}
}

// Container Store: Update user containers
export const UpdateUserContainers = async (token: string) => {
	const { setContainers } = useContainerStore.getState()
	setContainers(await _GetUserContainers(token ?? ''))
}

// Container Service: HTTP Request to start a container
export const _StartContainer = async (container_id: string, token: string) => {
	try {
		const url = `${
			import.meta.env.VITE_API_URL
		}/docker/start-container/${container_id}`

		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			throw new Error(await response.json())
		}

		const data = await response.json()
		return data
	} catch (error) {
		console.error('Error starting container:', error)
		throw error
	}
}

// Container Store: Start a container
export const StartContainer = async (container_id: string, token: string) => {
	// Start container HTTP request
	await _StartContainer(container_id, token ?? '')
	// Update container store
	UpdateUserContainers(token ?? '')
}

// Container Service: HTTP Request to stop a container
export const _StopContainer = async (container_id: string, token: string) => {
	try {
		const url = `${
			import.meta.env.VITE_API_URL
		}/docker/stop-container/${container_id}`

		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			throw new Error(await response.json())
		}

		const data = await response.json()
		return data.containers
	} catch (error) {
		console.error('Error fetching user containers:', error)
		throw error
	}
}

// Container Store: Stop a container
export const StopContainer = async (container_id: string, token: string) => {
	// Stop container HTTP request
	await _StopContainer(container_id, token ?? '')
	// Update container store
	await UpdateUserContainers(token ?? '')
}

// Container Service: HTTP Request to remove a container
export const _DeleteContainer = async (container_id: string, token: string) => {
	try {
		const url = `${
			import.meta.env.VITE_API_URL
		}/docker/delete-container/${container_id}`

		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			const errorMessage = await response.json()
			throw new Error(errorMessage.detail || 'Error fetching containers')
		}

		const data = await response.json()
		return data.containers
	} catch (error) {
		console.error('Error fetching user containers:', error)
		throw error
	}
}

// Container Store: Remove a container
export const DeleteContainer = async (container_id: string, token: string) => {
	const { containers, setContainers } = useContainerStore.getState()
	await _DeleteContainer(container_id, token ?? '')
	setContainers(
		containers.filter((container) => container.container_id !== container_id),
	)
}

// Container Store: Open container terminal
export const OpenTerminal = async (container_id: string) => {
	const { containerTerminals, setContainerTerminals } =
		useContainerStore.getState()
	setContainerTerminals([...containerTerminals, container_id])
}

// Container Service: HTTP Request to get user containers
export const _GetContainerFiles = async (
	container_id: string,
	token: string,
): Promise<(IFile | IFolder)[]> => {
	const url = new URL(
		`${import.meta.env.VITE_API_URL}/docker/filesystem/${container_id}`,
	)

	try {
		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			const errorMessage = await response.json()
			throw new Error(errorMessage.detail || 'Error fetching container files')
		}

		const data = await response.json()
		return data.map((item: IFile | IFolder) => item)
	} catch (error) {
		console.error('Error fetching container files:', error)
		throw error
	}
}

// Container Service: HTTP Request to get user containers
export const _GetContainerFolderContent = async (
	container_id: string,
	folder_path: string,
	token: string,
): Promise<(IFile | IFolder)[]> => {
	const url = new URL(
		`${import.meta.env.VITE_API_URL}/docker/filesystem/${container_id}/${btoa(
			folder_path,
		)}`,
	)

	try {
		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			const errorMessage = await response.json()
			throw new Error(errorMessage.detail || 'Error fetching container files')
		}

		const data = await response.json()
		return data.map((item: IFile | IFolder) => item)
	} catch (error) {
		console.error('Error fetching container files:', error)
		throw error
	}
}

// Container Store: Get container by container id
export const getContainerByContainerId = (
	container_id: string,
): Container | undefined => {
	const { containers } = useContainerStore.getState()
	return containers.find((container) => container.container_id === container_id)
}

// Container Store: Get container files by container id
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

// Container Store: Get container files by container id and container folder
export const getFolderChildren = (
	container_id: string,
	parentPath: string | null,
): (IFile | IFolder)[] => {
	const containerFiles = getContainerFiles(container_id)
	return containerFiles.filter((file) => file.parentPath === parentPath)
}

// Container Store: Toggle container folder
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

// Container Store: Open container file
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
			content: await _GetContainerFileContent(
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

// Container Service: HTTP Request to get container file content
export const _GetContainerFileContent = async (
	container_id: string,
	file_path: string,
	token: string,
): Promise<string> => {
	const url = new URL(
		`${
			import.meta.env.VITE_API_URL
		}/docker/file-content/${container_id}?file_path=${file_path}`,
	)

	try {
		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			const errorMessage = await response.json()
			throw new Error(errorMessage.detail || 'Error fetching container files')
		}

		const data = await response.json()
		return data
	} catch (error) {
		console.error('Error fetching container files:', error)
		throw error
	}
}

// Container Service: HTTP Request to save container file content
export const _SaveContainerFile = async (
	container_id: string,
	name: string,
	parent_path: string,
	content: string,
	token: string,
) => {
	const url = `${import.meta.env.VITE_API_URL}/docker/save-file-content`
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				container_id: container_id,
				name: name,
				parent_path: parent_path,
				content: content,
			}),
		})

		if (!response.ok) {
			const errorMessage = await response.json()
			throw new Error(errorMessage.detail || 'Error starting container')
		}

		const data = await response.json()
		return data
	} catch (error) {
		console.error('Error starting container:', error)
		throw error
	}
}

// Container Store: Open container file
export const SaveContainerFile = async (
	container_id: string,
	name: string,
	parent_path: string,
	content: string,
) => {
	const { token } = useCredentialStore.getState()
	_SaveContainerFile(container_id, name, parent_path, content, token ?? '')
}

// Container Service: HTTP Request to move an item (folder or file) in a container
export const _moveItem = async (
	container_id: string,
	source_path: string,
	dest_path: string,
	token: string,
) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/move-item`
		const data = {
			container_id: container_id,
			source_path: source_path,
			destination_path: dest_path,
		}
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(errorData.detail)
		}

		const container_files = getContainerFiles(container_id)
		container_files.map((file) => {
			if (file.path === source_path) {
				file.path = dest_path + '/' + file.name
				file.parentPath = dest_path
			}
		})

		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)
	} catch {
		throw new Error('Move Item Error')
	}
}

// Container Store: Move item (folder or file) in a container
export const moveItem = async (
	container_id: string,
	source_path: string,
	dest_path: string,
) => {
	try {
		const { token } = useCredentialStore.getState()
		const { setContainerFiles } = useContainerStore.getState()

		await _moveItem(container_id, source_path, dest_path, token ?? '')
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

// Container Service: HTTP Request to rename an item (folder or file) in a container
export const _renameItem = async (
	container_id: string,
	item: IFile | IFolder,
	new_name: string,
	token: string,
) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/move-item`
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				container_id: container_id,
				source_path: item.path,
				destination_path: item.parentPath + '/' + new_name,
			}),
		})

		if (!response.ok) {
			throw new Error(await response.json())
		}

		return true
	} catch {
		throw new Error('Create file error')
	}
}

// Container Store: Rename an item (folder or file) in a container
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
		const result = await _renameItem(container_id, item, new_name, token ?? '')
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
			await _GetContainerFolderContent(container_id, item.path, token ?? ''),
		)

		// Update container files store
		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)
	} catch (error) {
		console.error('Error | Rename Item Error: ', error)
	}
}

// Container Service: HTTP Request to create a folder in a container
export const _createFolder = async (
	container_id: string,
	parent_path: string,
	folder_name: string,
	token: string,
) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/create-folder`
		const data = {
			container_id: container_id,
			folder_path: parent_path + '/' + folder_name,
		}
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(errorData.detail)
		}

		await response.json()
	} catch {
		throw new Error('Create Folder Error')
	}
}

// Container Store: Create a folder in a container
export const createFolder = async (
	container_id: string,
	parent_path: string,
	folder_name: string,
) => {
	try {
		const { token } = useCredentialStore.getState()
		await _createFolder(container_id, parent_path, folder_name, token ?? '')

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

// Container Service: HTTP Request to rename an item (folder or file) in a container
export const _createFile = async (
	container_id: string,
	file_path: string,
	token: string,
) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/create-file`
		const data = {
			container_id: container_id,
			file_path: file_path,
		}
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const json = await response.json()
		return json
	} catch {
		throw new Error('Create file error')
	}
}

// Container Store: Create a file in a container
export const createFile = async (container_id: string, file_path: string) => {
	try {
		const { token } = useCredentialStore.getState()
		const response = await _createFile(container_id, file_path, token ?? '')

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

// Container Service: HTTP Request to delete a file in a container
export const _deleteFile = async (
	container_id: string,
	path: string,
	token: string,
) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/remove-path`
		const data = {
			container_id: container_id,
			path: path,
		}
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const json = await response.json()

		return json
	} catch {
		throw new Error('Delete file error')
	}
}

// Container Store: Delete a folder in a container
export const deleteFile = async (container_id: string, path: string) => {
	try {
		const { token } = useCredentialStore.getState()
		const response = await _deleteFile(container_id, path, token ?? '')

		let container_files = getContainerFiles(container_id)
		container_files = container_files.filter((file) => file.path !== path)
		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)

		return response
	} catch (error) {
		console.error('Error deleting file:', error)
	}
}

// Container Service: HTTP Request to delete a folder in a container
export const _deleteFolder = async (
	container_id: string,
	path: string,
	token: string,
) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/remove-path`
		const data = {
			container_id: container_id,
			path: path,
		}

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const json = await response.json()

		return json
	} catch {
		throw new Error('Delete folder error')
	}
}

// Container Store: Delete a file in a container
export const deleteFolder = async (container_id: string, path: string) => {
	try {
		const { token } = useCredentialStore.getState()

		const response = await _deleteFolder(container_id, path, token ?? '')

		let container_files = getContainerFiles(container_id)
		container_files = container_files.filter((file) => file.path !== path)
		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)

		return response
	} catch (error) {
		console.error('Error deleting file:', error)
	}
}
