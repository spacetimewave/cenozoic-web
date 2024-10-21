import { create } from 'zustand'
import { IFile, IFolder } from '../interfaces/IFileSystem'

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
}

export const useContainerStore = create<IContainerStore>((set) => ({
	containers: [],
	containerTerminals: [],
	setContainers: (newContainers: Container[]) =>
		set({ containers: newContainers }),
	setContainerTerminals: (containerTerminals: string[]) =>
		set({ containerTerminals: containerTerminals }),
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
