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

export const CreateNewContainer = async (token: string) => {
	const url = `${import.meta.env.VITE_API_URL}/docker/create-container`

	try {
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

export const GetUserContainers = async (token: string) => {
	const url = new URL(`${import.meta.env.VITE_API_URL}/docker/user-containers`)

	try {
		const response = await fetch(url.toString(), {
			method: 'GET', // This should be a POST request since you're sending data
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

export const StartContainer = async (container_id: string, token: string) => {
	const url = `${
		import.meta.env.VITE_API_URL
	}/docker/start-container/${container_id}`

	try {
		const response = await fetch(url, {
			method: 'PUT',
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
		return data
	} catch (error) {
		console.error('Error starting container:', error)
		throw error
	}
}

export const StopContainer = async (container_id: string, token: string) => {
	const url = new URL(
		`${import.meta.env.VITE_API_URL}/docker/stop-container/${container_id}`,
	)

	try {
		const response = await fetch(url.toString(), {
			method: 'PUT',
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

export const DeleteContainer = async (container_id: string, token: string) => {
	const url = new URL(
		`${import.meta.env.VITE_API_URL}/docker/delete-container/${container_id}`,
	)

	try {
		const response = await fetch(url.toString(), {
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

export const OpenTerminal = async (container_id: string) => {
	const { containerTerminals, setContainerTerminals } =
		useContainerStore.getState()
	setContainerTerminals([...containerTerminals, container_id])
}

export const GetContainerFiles = async (
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
			content: await GetContainerFileContent(
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

export const GetContainerFileContent = async (
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

export const SaveContainerFile = async (
	container_id: string,
	name: string,
	parent_path: string,
	content: string,
) => {
	const url = `${import.meta.env.VITE_API_URL}/docker/save-file-content`
	const { token } = useCredentialStore.getState()
	try {
		console.log(
			JSON.stringify({
				container_id: container_id,
				name: name,
				parent_path: parent_path,
				content: content,
			}),
		)
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

export const moveItem = async (
	container_id: string,
	source_path: string,
	dest_path: string,
) => {
	const url = `${import.meta.env.VITE_API_URL}/docker/move-item`
	const { token } = useCredentialStore.getState()
	const data = {
		container_id: container_id,
		source_path: source_path,
		destination_path: dest_path,
	}

	try {
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
	} catch (error) {
		console.error('Error moving item:', error)
	}
}

export const renameItem = async (
	container_id: string,
	item_path: string,
	new_name: string,
) => {
	const container_files = getContainerFiles(container_id)
	const item = container_files.find((file) => file.path === item_path) as
		| IFile
		| IFolder

	const url = `${import.meta.env.VITE_API_URL}/docker/move-item`
	const { token } = useCredentialStore.getState()
	const data = {
		container_id: container_id,
		source_path: item_path,
		destination_path: item.parentPath + '/' + new_name,
	}

	try {
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
			if (file.path === item_path) {
				file.name = new_name
				file.path = item.parentPath + '/' + new_name
			}
		})

		if (item.kind === 'directory') {
			container_files.map((file) => {
				if (file.parentPath === item_path) {
					file.path = item.parentPath + '/' + new_name + '/' + file.name
					file.parentPath = item.parentPath + '/' + new_name
				}
			})
		}

		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)
	} catch (error) {
		console.error('Error moving item:', error)
	}
}

export const createFolder = async (
	container_id: string,
	parent_path: string,
	folder_name: string,
) => {
	const url = `${import.meta.env.VITE_API_URL}/docker/create-folder`
	const data = {
		container_id: container_id,
		folder_path: parent_path + '/' + folder_name,
	}

	try {
		const { token } = useCredentialStore.getState()
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

		const result = await response.json()
		console.log(result)

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
		const url = `${import.meta.env.VITE_API_URL}/docker/create-file`
		const data = {
			container_id: container_id,
			file_path: file_path,
		}
		const { token } = useCredentialStore.getState()

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

		const json = await response.json()
		return json
	} catch (error) {
		console.error('Error creating file:', error)
	}
}

export const deleteFile = async (container_id: string, path: string) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/remove-path`
		const data = {
			container_id: container_id,
			path: path,
		}
		const { token } = useCredentialStore.getState()

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

		let container_files = getContainerFiles(container_id)
		container_files = container_files.filter((file) => file.path !== path)
		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)

		return json
	} catch (error) {
		console.error('Error deleting file:', error)
	}
}

export const deleteFolder = async (container_id: string, path: string) => {
	try {
		const url = `${import.meta.env.VITE_API_URL}/docker/remove-path`
		const data = {
			container_id: container_id,
			path: path,
		}
		const { token } = useCredentialStore.getState()

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

		let container_files = getContainerFiles(container_id)
		container_files = container_files.filter((file) => file.path !== path)
		const { setContainerFiles } = useContainerStore.getState()
		setContainerFiles(container_id, container_files)

		return json
	} catch (error) {
		console.error('Error deleting file:', error)
	}
}
