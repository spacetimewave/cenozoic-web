import { FileSystemDirectoryHandle } from './IFileSystem'

export {}

declare global {
	export interface Window {
		showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>
	}
}
