import { IFile } from './IFile'

export interface IFileSystem {
	openedFiles: IFile[]
	activeFile: IFile | null
	projectFiles: IFile[]
	setOpenedFiles: (files: IFile[]) => void
	setActiveFile: (file: IFile | null) => void
	setProjectFiles: (files: IFile[]) => void
}

export interface FileSystemFileHandle {
	getFile: () => Promise<File>
}

export interface FileSystemDirectoryHandle {
	getFileHandle: (
		name: string,
		options?: { create?: boolean },
	) => Promise<FileSystemFileHandle>
	getDirectoryHandle: (
		name: string,
		options?: { create?: boolean },
	) => Promise<FileSystemDirectoryHandle>
	removeEntry: (
		name: string,
		options?: { recursive?: boolean },
	) => Promise<void>
}
