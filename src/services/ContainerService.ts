import { create } from 'zustand'

export interface Container {
	id: string
	container_id: string
	container_name: string
	status: 'stopped' | 'running'
	user_mail: string
}

export interface IContainerStore {
	containers: Container[]
	setContainers: (containers: Container[]) => void
}

export const useContainerStore = create<IContainerStore>((set) => ({
	containers: [],
	setContainers: (newContainers: Container[]) =>
		set({ containers: newContainers }),
}))

export const StartNewContainer = async (token: string) => {
	const url = `${import.meta.env.VITE_API_URL}/docker/start-container`

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

		await GetUserContainers(token)

		const data = await response.json()
		return data
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

		const { setContainers } = useContainerStore.getState()

		const data = await response.json()
		console.log(data.containers)
		setContainers(data.containers)
		return data.containers
	} catch (error) {
		console.error('Error fetching user containers:', error)
		throw error
	}
}
