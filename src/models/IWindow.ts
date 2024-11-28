import { FileSystemHandle, FileSystemDirectoryHandle } from './IFileSystem'

export {}

declare global {
	export interface Window {
		showDirectoryPicker: (options?: {
			id?: string
			mode?: 'read' | 'readwrite'
			startIn?:
				| FileSystemHandle
				| 'desktop'
				| 'documents'
				| 'downloads'
				| 'music'
				| 'pictures'
				| 'videos'
		}) => Promise<FileSystemDirectoryHandle>
	}
}
