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

	if (!containerFiles) return []
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
	console.log(getContainerFiles(container_id))
	const file = getContainerFiles(container_id).find(
		(file) => file.path === path && file.kind === 'file',
	) as IFile
	const openedFile = openedFiles?.find((file) => file.path === path)
	console.log(file)
	console.log(openedFile)
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
		}

		setOpenedFiles([...openedFiles, file]) // Push the new file
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
		console.log('FILE CONTENT', data)
		return data
	} catch (error) {
		console.error('Error fetching container files:', error)
		throw error
	}
}
