export interface PermissionStatus {
	name: string
	state: 'granted' | 'denied' | 'prompt'
}

export interface FileSystemHandle {
	name: string
	kind: 'file' | 'directory'

	isSameEntry: (fileSystemHandle: FileSystemHandle) => Promise<boolean>

	queryPermission: (descriptor: {
		mode: 'read' | 'readwrite'
	}) => Promise<PermissionStatus['state']>

	remove: (options?: { recursive: boolean }) => Promise<undefined>

	requestPermission: (descriptor: {
		mode: 'read' | 'readwrite'
	}) => Promise<PermissionStatus['state']>

	move: (name: string) => Promise<undefined> // Warning: It's not supported yet by all browsers
}

export interface FileSystemFileHandle extends FileSystemHandle {
	getFile: () => Promise<File>
	createWritable: (options?: {
		keepExistingData?: boolean
		mode: 'exclusive' | 'siloed'
	}) => Promise<FileSystemWritableFileStream>
}

export interface FileSystemDirectoryHandle extends FileSystemHandle {
	values: () => Promise<FileSystemHandle[]>
	getFileHandle: (
		name: string,
		options?: { create?: boolean },
	) => Promise<FileSystemFileHandle>
	getDirectoryHandle: (
		name: string,
		options?: { create?: boolean },
	) => Promise<FileSystemDirectoryHandle>
}

export interface IFile {
	name: string
	path: string
	parentPath: string | null
	kind: 'file'
	handle: FileSystemFileHandle
	content: string | null
	isSaved: boolean
	isOpen: boolean
	containerId: string | null
}

export interface IFolder {
	name: string
	path: string
	parentPath: string | null
	kind: 'directory'
	handle: FileSystemDirectoryHandle
	content: null
	isSaved: boolean
	isOpen: boolean
	containerId: string | null
}

export interface IFileSystemStore {
	projectFiles: (IFile | IFolder)[]
	setProjectFiles: (files: (IFile | IFolder)[]) => void
}

export interface IFileEditorStore {
	openedFiles: IFile[]
	activeFile: IFile | null
	setOpenedFiles: (files: IFile[]) => void
	setActiveFile: (file: IFile | null) => void
}
