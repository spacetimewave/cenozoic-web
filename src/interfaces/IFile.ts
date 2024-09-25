import { FileSystemDirectoryHandle, FileSystemFileHandle } from './IFileSystem'
export interface IFile {
	name: string
	path: string
	parentPath: string
	kind: 'directory' | 'file'
	handle: FileSystemFileHandle | FileSystemDirectoryHandle
	content: string
	isSaved: boolean
	isOpen: boolean
}
