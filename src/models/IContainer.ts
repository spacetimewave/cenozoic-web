import { IFile, IFolder } from './IFileSystem'

export interface Container {
	id: string
	container_id: string
	container_name: string
	status: 'exited' | 'running' | 'created'
	user_mail: string
	container_files?: (IFile | IFolder)[]
}
