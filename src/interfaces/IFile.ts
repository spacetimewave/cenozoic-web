export interface IFile {
	name: string
	path: string
	parentPath: string
	kind: 'directory' | 'file'
	handle: Object // FileSystemFileHandle | FileSystemDirectoryHandle
	content: string
	isSaved: boolean
	isOpen: boolean
}
