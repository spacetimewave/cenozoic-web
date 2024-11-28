import { IFile, IFolder } from '../models/IFileSystem'

export class ContainerService {
	public static BASE_URL: string = import.meta.env.VITE_API_URL

	public static CreateNewContainer = async (token: string) => {
		try {
			const url = `${this.BASE_URL}/docker/create-container`

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

	public static GetUserContainers = async (token: string) => {
		try {
			const url = `${this.BASE_URL}/docker/user-containers`

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

	public static StartContainer = async (
		container_id: string,
		token: string,
	) => {
		try {
			const url = `${this.BASE_URL}/docker/start-container/${container_id}`

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

	public static StopContainer = async (container_id: string, token: string) => {
		try {
			const url = `${this.BASE_URL}/docker/stop-container/${container_id}`

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

	public static DeleteContainer = async (
		container_id: string,
		token: string,
	) => {
		try {
			const url = `${this.BASE_URL}/docker/delete-container/${container_id}`

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

	public static GetContainerFiles = async (
		container_id: string,
		token: string,
	): Promise<(IFile | IFolder)[]> => {
		const url = new URL(`${this.BASE_URL}/docker/filesystem/${container_id}`)

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

	public static GetContainerFolderContent = async (
		container_id: string,
		folder_path: string,
		token: string,
	): Promise<(IFile | IFolder)[]> => {
		const url = new URL(
			`${this.BASE_URL}/docker/filesystem/${container_id}/${btoa(folder_path)}`,
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

	public static GetContainerFileContent = async (
		container_id: string,
		file_path: string,
		token: string,
	): Promise<string> => {
		const url = new URL(
			`${this.BASE_URL}/docker/file-content/${container_id}?file_path=${file_path}`,
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

	public static SaveContainerFile = async (
		container_id: string,
		name: string,
		parent_path: string,
		content: string,
		token: string,
	) => {
		const url = `${this.BASE_URL}/docker/save-file-content`
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

	public static moveItem = async (
		container_id: string,
		source_path: string,
		dest_path: string,
		token: string,
	) => {
		try {
			const url = `${this.BASE_URL}/docker/move-item`
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
		} catch {
			throw new Error('Move Item Error')
		}
	}

	public static renameItem = async (
		container_id: string,
		item: IFile | IFolder,
		new_name: string,
		token: string,
	) => {
		try {
			const url = `${this.BASE_URL}/docker/move-item`
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

	public static createFolder = async (
		container_id: string,
		parent_path: string,
		folder_name: string,
		token: string,
	) => {
		try {
			const url = `${this.BASE_URL}/docker/create-folder`
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

	public static createFile = async (
		container_id: string,
		file_path: string,
		token: string,
	) => {
		try {
			const url = `${this.BASE_URL}/docker/create-file`
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

	public static deleteFile = async (
		container_id: string,
		path: string,
		token: string,
	) => {
		try {
			const url = `${this.BASE_URL}/docker/remove-path`
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

	public static deleteFolder = async (
		container_id: string,
		path: string,
		token: string,
	) => {
		try {
			const url = `${this.BASE_URL}/docker/remove-path`
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
}
